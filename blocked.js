const params = new URLSearchParams(window.location.search);

const { tryGetHostname, createI18n, applyI18nToDocument } = window.BlocksiteShared;

const messages = {
  fr: {
    "blocked.documentTitle": "Site bloque",
    "blocked.title": "Acces temporairement bloque",
    "blocked.introDefault": "Cette page correspond a une regle active de ta liste de blocage (groupe + horaire).",
    "blocked.introHost": "L'acces a {{host}} est actuellement bloque.",
    "blocked.timerLabel": "Deblocage dans",
    "blocked.label.domain": "📍 Domaine",
    "blocked.label.group": "📋 Groupe",
    "blocked.label.time": "⏰ Heure",
    "blocked.label.rule": "🎯 Regle",
    "blocked.encouragement.title": "💪 Continue comme ca !",
    "blocked.encouragement.body": " Respirer et prendre du recul est une bonne decision. Utilise ce temps pour une activite plus constructive.",
    "blocked.tips.title": "Que faire maintenant ?",
    "blocked.tips.item1": "Retourner a la page precedente pour reprendre une navigation utile",
    "blocked.tips.item2": "Ouvrir un nouvel onglet avec un site non bloque",
    "blocked.tips.item3": "Ajuster les regles et les horaires dans la configuration",
    "blocked.button.back": "Retour",
    "blocked.button.home": "Aller sur un nouvel onglet",
    "blocked.button.settings": "Modifier les regles",
    "blocked.footer": "ℹ️ Le blocage se met a jour automatiquement selon tes horaires.",
    "blocked.unknown.f": "inconnue",
    "blocked.unknown.m": "inconnu"
  },
  en: {
    "blocked.documentTitle": "Blocked site",
    "blocked.title": "Access temporarily blocked",
    "blocked.introDefault": "This page matches an active blocking rule from your list (group + schedule).",
    "blocked.introHost": "Access to {{host}} is currently blocked.",
    "blocked.timerLabel": "Unblock in",
    "blocked.label.domain": "📍 Domain",
    "blocked.label.group": "📋 Group",
    "blocked.label.time": "⏰ Time",
    "blocked.label.rule": "🎯 Rule",
    "blocked.encouragement.title": "💪 Keep it up!",
    "blocked.encouragement.body": " Taking a breath and stepping back is a good decision. Use this time for a more constructive activity.",
    "blocked.tips.title": "What can you do now?",
    "blocked.tips.item1": "Go back to the previous page to resume useful browsing",
    "blocked.tips.item2": "Open a new tab with an unblocked site",
    "blocked.tips.item3": "Adjust rules and schedules in settings",
    "blocked.button.back": "Go back",
    "blocked.button.home": "Open a new tab",
    "blocked.button.settings": "Edit rules",
    "blocked.footer": "ℹ️ Blocking updates automatically according to your schedule.",
    "blocked.unknown.f": "unknown",
    "blocked.unknown.m": "unknown"
  }
};

const i18n = createI18n(messages, { fallbackLocale: "fr", supportedLocales: ["fr", "en"] });
const t = i18n.t;

document.documentElement.lang = i18n.locale;
document.title = t("blocked.documentTitle");
applyI18nToDocument(t);

const blockedUrl = params.get("blocked") || t("blocked.unknown.f");
const matchedRule = params.get("rule") || t("blocked.unknown.f");
const matchedGroup = params.get("group") || t("blocked.unknown.m");
const intervalsParam = params.get("intervals") || ""; // Format: "09:00-17:00,20:00-22:00"

const blockedHost = tryGetHostname(blockedUrl);
const nowText = i18n.formatDateTime(new Date());

document.getElementById("blockedUrl").textContent = blockedUrl;
document.getElementById("matchedRule").textContent = matchedRule;
document.getElementById("matchedGroup").textContent = matchedGroup;
document.getElementById("blockedAt").textContent = nowText;

if (blockedHost) {
  document.getElementById("introText").textContent = t("blocked.introHost", { host: blockedHost });
}

// Afficher le message de motivation
const encouragementSection = document.getElementById("encouragementSection");
if (encouragementSection) {
  encouragementSection.classList.remove("hidden");
}

// Fonction pour formater les secondes en HH:MM:SS
function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Fonction pour calculer le temps restant avant la fin du blocage
function calculateTimeUntilUnblock() {
  if (!intervalsParam) return null;

  const intervals = intervalsParam.split(",").filter(Boolean);
  const now = new Date();
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  // Chercher l'intervalle actif et son temps de fin
  for (const interval of intervals) {
    const [start, end] = interval.trim().split("-");
    if (!start || !end) continue;

    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);
    const startSeconds = startHour * 3600 + startMin * 60;
    const endSeconds = endHour * 3600 + endMin * 60;

    let isActive = false;
    let secondsUntilEnd = 0;

    if (startSeconds < endSeconds) {
      // Intervalle normal (ex: 09:00-17:00)
      if (currentSeconds >= startSeconds && currentSeconds < endSeconds) {
        isActive = true;
        secondsUntilEnd = endSeconds - currentSeconds;
      }
    } else {
      // Intervalle qui traverse minuit (ex: 20:00-06:00)
      if (currentSeconds >= startSeconds || currentSeconds < endSeconds) {
        isActive = true;
        if (currentSeconds >= startSeconds) {
          // Avant minuit
          secondsUntilEnd = (24 * 3600) - currentSeconds + endSeconds;
        } else {
          // Après minuit
          secondsUntilEnd = endSeconds - currentSeconds;
        }
      }
    }

    if (isActive && secondsUntilEnd > 0) {
      return secondsUntilEnd;
    }
  }

  return null;
}

// Mettre à jour le timer
function updateTimer() {
  const timerSection = document.getElementById("timerSection");
  const timerValue = document.getElementById("timerValue");

  if (!timerSection || !timerValue) return;

  const secondsLeft = calculateTimeUntilUnblock();

  if (secondsLeft !== null && secondsLeft > 0) {
    timerSection.classList.remove("hidden");
    timerValue.textContent = formatTime(secondsLeft);
  } else {
    timerSection.classList.add("hidden");
  }
}

// Mise à jour initiale et périodique du timer (chaque seconde)
updateTimer();
setInterval(updateTimer, 1000);

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
