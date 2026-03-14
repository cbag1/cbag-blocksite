const params = new URLSearchParams(window.location.search);

const blockedUrl = params.get("blocked") || "inconnue";
const matchedRule = params.get("rule") || "inconnue";
const matchedGroup = params.get("group") || "inconnu";

const { tryGetHostname } = window.BlocksiteShared;

const blockedHost = tryGetHostname(blockedUrl);
const nowText = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short"
}).format(new Date());

document.getElementById("blockedUrl").textContent = blockedUrl;
document.getElementById("matchedRule").textContent = matchedRule;
document.getElementById("matchedGroup").textContent = matchedGroup;
document.getElementById("blockedAt").textContent = nowText;

if (blockedHost) {
  document.getElementById("introText").textContent = `L'acces a ${blockedHost} est actuellement bloque.`;
}

document.getElementById("backBtn").addEventListener("click", () => {
  if (window.history.length <= 1) {
    window.location.href = "about:blank";
    return;
  }

  history.back();
});

document.getElementById("homeBtn").addEventListener("click", async () => {
  if (typeof chrome !== "undefined" && chrome.tabs?.create) {
    await chrome.tabs.create({});
    return;
  }

  window.open("about:blank", "_blank", "noopener,noreferrer");
});

document.getElementById("settingsBtn").addEventListener("click", async () => {
  if (typeof chrome !== "undefined" && chrome.runtime?.openOptionsPage) {
    await chrome.runtime.openOptionsPage();
    return;
  }

  window.location.href = "options.html";
});
