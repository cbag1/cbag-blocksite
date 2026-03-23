const GROUPS_KEY = "siteGroups";
const QUICK_GROUP_NAME = "Blocage rapide";

const { createId, normalizePattern, sanitizeGroups, tryGetHostname, hostMatchesPattern, createI18n, applyI18nToDocument } = window.BlocksiteShared;

const messages = {
  fr: {
    "popup.documentTitle": "CBag Site Blocker",
    "common.ready": "Pret.",
    "popup.brandSub": "Blocage rapide du site courant avec synchronisation automatique des horaires",
    "popup.site.loading": "Site actuel: chargement...",
    "popup.hint.checking": "Verification des regles et des intervalles actifs en cours...",
    "popup.button.block": "Bloquer le site",
    "popup.button.openOptions": "Ouvrir la configuration detaillee",
    "popup.site.extension": "Site actuel: page d'extension",
    "popup.hint.extensionNotAvailable": "Le blocage rapide n'est pas disponible sur les pages d'extension.",
    "popup.status.notApplicable": "Blocage non applicable sur cette page.",
    "popup.site.unsupported": "Site actuel: non compatible (chrome://, fichier local, etc.)",
    "popup.hint.onlyWebPages": "Seules les pages web classiques peuvent etre ajoutees.",
    "popup.status.unableBlock": "Impossible de bloquer cette page.",
    "popup.site.current": "Site actuel: {{host}}",
    "popup.button.alreadyBlocked": "Deja bloque",
    "popup.hint.alreadyMatches": "Le site correspond deja au groupe {{group}}.",
    "popup.hint.willBeAdded": "Le blocage rapide l'ajoutera au groupe dedie Blocage rapide.",
    "popup.status.noValidSite": "Aucun site valide detecte.",
    "popup.hint.addedToGroup": "Ajoute au groupe {{group}}.",
    "popup.status.added": "Ajoute a \"{{group}}\": {{host}}",
    "popup.error.quickBlock": "Erreur pendant le blocage rapide.",
    "popup.error.load": "Erreur de chargement du popup."
  },
  en: {
    "popup.documentTitle": "CBag Site Blocker",
    "common.ready": "Ready.",
    "popup.brandSub": "Quickly block the current site with automatic schedule syncing",
    "popup.site.loading": "Current site: loading...",
    "popup.hint.checking": "Checking rules and active time ranges...",
    "popup.button.block": "Block site",
    "popup.button.openOptions": "Open detailed settings",
    "popup.site.extension": "Current site: extension page",
    "popup.hint.extensionNotAvailable": "Quick blocking is not available on extension pages.",
    "popup.status.notApplicable": "Blocking is not applicable on this page.",
    "popup.site.unsupported": "Current site: unsupported (chrome://, local file, etc.)",
    "popup.hint.onlyWebPages": "Only regular web pages can be added.",
    "popup.status.unableBlock": "Unable to block this page.",
    "popup.site.current": "Current site: {{host}}",
    "popup.button.alreadyBlocked": "Already blocked",
    "popup.hint.alreadyMatches": "This site already matches group {{group}}.",
    "popup.hint.willBeAdded": "Quick block will add it to the dedicated Quick Block group.",
    "popup.status.noValidSite": "No valid site detected.",
    "popup.hint.addedToGroup": "Added to group {{group}}.",
    "popup.status.added": "Added to \"{{group}}\": {{host}}",
    "popup.error.quickBlock": "Error during quick block.",
    "popup.error.load": "Popup loading error."
  }
};

const i18n = createI18n(messages, { fallbackLocale: "fr", supportedLocales: ["fr", "en"] });
const t = i18n.t;

document.documentElement.lang = i18n.locale;
document.title = t("popup.documentTitle");
applyI18nToDocument(t);

const siteLabel = document.getElementById("siteLabel");
const siteHint = document.getElementById("siteHint");
const status = document.getElementById("status");
const blockSiteBtn = document.getElementById("blockSiteBtn");
const openOptionsBtn = document.getElementById("openOptionsBtn");

let currentHostname = "";

function isExtensionPage(url) {
  if (!url) return false;

  try {
    const protocol = new URL(url).protocol;
    return protocol === "chrome-extension:" || protocol === "moz-extension:";
  } catch {
    return false;
  }
}

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function getExistingMatch(groups, hostname) {
  for (const group of groups) {
    if (!group.enabled) continue;

    const matchedPattern = group.patterns.find((pattern) => hostMatchesPattern(hostname, pattern));
    if (matchedPattern) {
      return { group, matchedPattern };
    }
  }

  return null;
}

async function loadCurrentSite() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  const url = activeTab?.url || "";

  if (isExtensionPage(url)) {
    currentHostname = "";
    siteLabel.textContent = t("popup.site.extension");
    blockSiteBtn.hidden = true;
    blockSiteBtn.disabled = true;
    if (siteHint) siteHint.textContent = t("popup.hint.extensionNotAvailable");
    setStatus(t("popup.status.notApplicable"));
    return;
  }

  blockSiteBtn.hidden = false;

  currentHostname = normalizePattern(tryGetHostname(url));
  if (!currentHostname) {
    siteLabel.textContent = t("popup.site.unsupported");
    blockSiteBtn.disabled = true;
    blockSiteBtn.textContent = t("popup.button.block");
    if (siteHint) siteHint.textContent = t("popup.hint.onlyWebPages");
    setStatus(t("popup.status.unableBlock"), true);
    return;
  }

  siteLabel.textContent = t("popup.site.current", { host: currentHostname });
  const data = await chrome.storage.local.get({ [GROUPS_KEY]: [] });
  const groups = sanitizeGroups(data[GROUPS_KEY]);
  const existingMatch = getExistingMatch(groups, currentHostname);

  blockSiteBtn.disabled = Boolean(existingMatch);
  blockSiteBtn.textContent = existingMatch ? t("popup.button.alreadyBlocked") : t("popup.button.block");
  if (siteHint) {
    siteHint.textContent = existingMatch
      ? t("popup.hint.alreadyMatches", { group: existingMatch.group.name })
      : t("popup.hint.willBeAdded");
  }
  setStatus(t("common.ready"));
}

async function quickBlockCurrentSite() {
  if (!currentHostname) {
    setStatus(t("popup.status.noValidSite"), true);
    return;
  }

  const data = await chrome.storage.local.get({ [GROUPS_KEY]: [] });
  const groups = sanitizeGroups(data[GROUPS_KEY]);

  const quickIndex = groups.findIndex((group) => group.name === QUICK_GROUP_NAME);
  if (quickIndex === -1) {
    groups.push({
      id: createId(),
      name: QUICK_GROUP_NAME,
      enabled: true,
      patterns: [currentHostname],
      intervals: []
    });
  } else {
    const merged = Array.from(new Set([...groups[quickIndex].patterns, currentHostname]));
    groups[quickIndex] = {
      ...groups[quickIndex],
      enabled: true,
      patterns: merged
    };
  }

  await chrome.storage.local.set({ [GROUPS_KEY]: groups });
  if (siteHint) siteHint.textContent = t("popup.hint.addedToGroup", { group: QUICK_GROUP_NAME });
  blockSiteBtn.disabled = true;
  blockSiteBtn.textContent = t("popup.button.alreadyBlocked");
  setStatus(t("popup.status.added", { group: QUICK_GROUP_NAME, host: currentHostname }));
}

blockSiteBtn?.addEventListener("click", () => {
  quickBlockCurrentSite().catch((error) => {
    console.error("Quick block failed", error);
    setStatus(t("popup.error.quickBlock"), true);
  });
});

openOptionsBtn?.addEventListener("click", async () => {
  await chrome.runtime.openOptionsPage();
});

loadCurrentSite().catch((error) => {
  console.error("Popup init failed", error);
  setStatus(t("popup.error.load"), true);
});
