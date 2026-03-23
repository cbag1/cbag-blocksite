const params = new URLSearchParams(window.location.search);

const blockedUrl = params.get("blocked") || "inconnue";
const matchedRule = params.get("rule") || "inconnue";
const matchedGroup = params.get("group") || "inconnu";
const intervalsParam = params.get("intervals") || ""; // Format: "09:00-17:00,20:00-22:00"

const { tryGetHostname, normalizeInterval, isNowInInterval } = window.BlocksiteShared;

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
  document.getElementById("introText").textContent = `L'accès à ${blockedHost} est actuellement bloqué.`;
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
