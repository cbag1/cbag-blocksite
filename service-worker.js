importScripts("shared.js");

const ENABLED_KEY = "enabled";
const GROUPS_KEY = "siteGroups";
const LEGACY_PATTERNS_KEY = "blockedPatterns";
const LEGACY_INTERVALS_KEY = "activeIntervals";

const {
  createId,
  normalizePattern,
  hostMatchesPattern,
  normalizeInterval,
  isBlockingActiveNow,
  sanitizeGroups,
  tryGetHostname
} = globalThis.BlocksiteShared;

const blockedPage = chrome.runtime.getURL("blocked.html");

function buildRedirectUrl(targetUrl, match) {
  const intervalsParam = match.group.intervals.length ? match.group.intervals.join(",") : "";

  return (
    `${blockedPage}?blocked=${encodeURIComponent(targetUrl)}` +
    `&rule=${encodeURIComponent(match.matchedPattern)}` +
    `&group=${encodeURIComponent(match.group.name)}` +
    (intervalsParam ? `&intervals=${encodeURIComponent(intervalsParam)}` : "")
  );
}

function findBlockingGroup(url, groups) {
  const hostname = tryGetHostname(url);
  if (!hostname) return null;

  for (const group of groups) {
    if (!group.enabled) continue;

    const matchedPattern = group.patterns.find((pattern) => hostMatchesPattern(hostname, pattern));
    if (!matchedPattern) continue;
    if (!isBlockingActiveNow(group.intervals, group.days)) continue;

    return {
      group,
      matchedPattern
    };
  }

  return null;
}

async function getSettings() {
  const data = await chrome.storage.local.get({
    [ENABLED_KEY]: true,
    [GROUPS_KEY]: []
  });

  return {
    enabled: Boolean(data[ENABLED_KEY]),
    groups: sanitizeGroups(data[GROUPS_KEY])
  };
}

async function migrateLegacyDataIfNeeded() {
  const data = await chrome.storage.local.get({
    [GROUPS_KEY]: [],
    [LEGACY_PATTERNS_KEY]: [],
    [LEGACY_INTERVALS_KEY]: []
  });

  const groups = sanitizeGroups(data[GROUPS_KEY]);
  if (groups.length > 0) {
    if (groups.length !== data[GROUPS_KEY].length) {
      await chrome.storage.local.set({ [GROUPS_KEY]: groups });
    }
    return;
  }

  const legacyPatterns = Array.isArray(data[LEGACY_PATTERNS_KEY])
    ? Array.from(new Set(data[LEGACY_PATTERNS_KEY].map(normalizePattern).filter(Boolean)))
    : [];

  const legacyIntervals = Array.isArray(data[LEGACY_INTERVALS_KEY])
    ? Array.from(new Set(data[LEGACY_INTERVALS_KEY].map(normalizeInterval).filter(Boolean)))
    : [];

  if (!legacyPatterns.length) return;

  const migratedGroup = {
    id: createId(),
    name: "Groupe migre",
    enabled: true,
    patterns: legacyPatterns,
    intervals: legacyIntervals
  };

  await chrome.storage.local.set({ [GROUPS_KEY]: [migratedGroup] });
}

async function handleNavigation(details) {
  if (details.frameId !== 0) return;
  if (!details.url || details.url.startsWith(blockedPage)) return;
  if (!/^https?:/i.test(details.url)) return;

  const { enabled, groups } = await getSettings();
  if (!enabled || !groups.length) return;

  const match = findBlockingGroup(details.url, groups);
  if (!match) return;

  const redirectUrl = buildRedirectUrl(details.url, match);

  await chrome.tabs.update(details.tabId, { url: redirectUrl });
}

async function bootstrapStorage() {
  const initial = await chrome.storage.local.get([ENABLED_KEY, GROUPS_KEY]);
  const updates = {};

  if (typeof initial[ENABLED_KEY] !== "boolean") {
    updates[ENABLED_KEY] = true;
  }

  if (!Array.isArray(initial[GROUPS_KEY])) {
    updates[GROUPS_KEY] = [];
  }

  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
  }

  await migrateLegacyDataIfNeeded();
}

chrome.runtime.onInstalled.addListener(() => {
  bootstrapStorage().catch((error) => {
    console.error("Storage bootstrap failed", error);
  });
});

bootstrapStorage().catch((error) => {
  console.error("Initial bootstrap failed", error);
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  handleNavigation(details).catch((error) => {
    console.error("Navigation handler failed", error);
  });
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  handleNavigation(details).catch((error) => {
    console.error("History navigation handler failed", error);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  handleNavigation({ tabId, frameId: 0, url: tab.url }).catch((error) => {
    console.error("Tab update handler failed", error);
  });
});

async function checkAndRedirectAllTabs() {
  const { enabled, groups } = await getSettings();
  if (!enabled || !groups.length) return;

  const tabs = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
  for (const tab of tabs) {
    if (!tab.url || tab.url.startsWith(blockedPage)) continue;

    const match = findBlockingGroup(tab.url, groups);
    if (!match) continue;

    const redirectUrl = buildRedirectUrl(tab.url, match);

    chrome.tabs.update(tab.id, { url: redirectUrl }).catch(() => {});
  }
}

function scheduleCheckAndRedirectAllTabs() {
  checkAndRedirectAllTabs().catch((error) => {
    console.error("Automatic tab check failed", error);
  });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (!changes[ENABLED_KEY] && !changes[GROUPS_KEY]) return;

  scheduleCheckAndRedirectAllTabs();
});

chrome.tabs.onActivated.addListener(() => {
  scheduleCheckAndRedirectAllTabs();
});

const INTERVAL_ALARM = "intervalCheck";

chrome.alarms.create(INTERVAL_ALARM, { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === INTERVAL_ALARM) {
    scheduleCheckAndRedirectAllTabs();
  }
});

scheduleCheckAndRedirectAllTabs();
