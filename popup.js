const GROUPS_KEY = "siteGroups";
const QUICK_GROUP_NAME = "Blocage rapide";

const { createId, normalizePattern, sanitizeGroups, tryGetHostname, hostMatchesPattern } = window.BlocksiteShared;

const siteLabel = document.getElementById("siteLabel");
const siteHint = document.getElementById("siteHint");
const status = document.getElementById("status");
const blockSiteBtn = document.getElementById("blockSiteBtn");
const openOptionsBtn = document.getElementById("openOptionsBtn");

let currentHostname = "";

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

  currentHostname = normalizePattern(tryGetHostname(url));
  if (!currentHostname) {
    siteLabel.textContent = "Site actuel: non compatible (chrome://, fichier local, etc.)";
    blockSiteBtn.disabled = true;
    blockSiteBtn.textContent = "Bloquer le site";
    if (siteHint) siteHint.textContent = "Seules les pages web classiques peuvent etre ajoutees.";
    setStatus("Impossible de bloquer cette page.", true);
    return;
  }

  siteLabel.textContent = `Site actuel: ${currentHostname}`;
  const data = await chrome.storage.local.get({ [GROUPS_KEY]: [] });
  const groups = sanitizeGroups(data[GROUPS_KEY]);
  const existingMatch = getExistingMatch(groups, currentHostname);

  blockSiteBtn.disabled = Boolean(existingMatch);
  blockSiteBtn.textContent = existingMatch ? "Deja bloque" : "Bloquer le site";
  if (siteHint) {
    siteHint.textContent = existingMatch
      ? `Le site correspond deja au groupe ${existingMatch.group.name}.`
      : "Le blocage rapide l'ajoutera au groupe dedie Blocage rapide.";
  }
  setStatus("Pret.");
}

async function quickBlockCurrentSite() {
  if (!currentHostname) {
    setStatus("Aucun site valide detecte.", true);
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
  if (siteHint) siteHint.textContent = `Ajoute au groupe ${QUICK_GROUP_NAME}.`;
  blockSiteBtn.disabled = true;
  blockSiteBtn.textContent = "Deja bloque";
  setStatus(`Ajoute a "${QUICK_GROUP_NAME}": ${currentHostname}`);
}

blockSiteBtn?.addEventListener("click", () => {
  quickBlockCurrentSite().catch((error) => {
    console.error("Quick block failed", error);
    setStatus("Erreur pendant le blocage rapide.", true);
  });
});

openOptionsBtn?.addEventListener("click", async () => {
  await chrome.runtime.openOptionsPage();
});

loadCurrentSite().catch((error) => {
  console.error("Popup init failed", error);
  setStatus("Erreur de chargement du popup.", true);
});
