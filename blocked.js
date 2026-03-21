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

// Fonction pour formater les minutes en HH:MM
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

// Fonction pour calculer le temps restant avant la fin du blocage
function calculateTimeUntilUnblock() {
  if (!intervalsParam) return null;

  const intervals = intervalsParam.split(",").filter(Boolean);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentDay = now.getDay();

  // Chercher l'intervalle actif et son temps de fin
  for (const interval of intervals) {
    const [start, end] = interval.trim().split("-");
    if (!start || !end) continue;

    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    let isActive = false;
    let minutesUntilEnd = 0;

    if (startMinutes < endMinutes) {
      // Intervalle normal (ex: 09:00-17:00)
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        isActive = true;
        minutesUntilEnd = endMinutes - currentMinutes;
      }
    } else {
      // Intervalle qui traverse minuit (ex: 20:00-06:00)
      if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
        isActive = true;
        if (currentMinutes >= startMinutes) {
          // Avant minuit
          minutesUntilEnd = (24 * 60) - currentMinutes + endMinutes;
        } else {
          // Après minuit
          minutesUntilEnd = endMinutes - currentMinutes;
        }
      }
    }

    if (isActive && minutesUntilEnd > 0) {
      return minutesUntilEnd;
    }
  }

  return null;
}

// Mettre à jour le timer
function updateTimer() {
  const timerSection = document.getElementById("timerSection");
  const timerValue = document.getElementById("timerValue");

  if (!timerSection || !timerValue) return;

  const minutesLeft = calculateTimeUntilUnblock();

  if (minutesLeft !== null && minutesLeft > 0) {
    timerSection.classList.remove("hidden");
    timerValue.textContent = formatTime(minutesLeft);
  } else {
    timerSection.classList.add("hidden");
  }
}

// Mise à jour initiale et périodique du timer (toutes les 10 secondes)
updateTimer();
setInterval(updateTimer, 10000);

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
