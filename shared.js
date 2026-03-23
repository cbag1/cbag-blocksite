(function (global) {
  function detectLocale(supportedLocales = ["fr", "en"], fallback = "fr") {
    const requested =
      (typeof navigator !== "undefined" && Array.isArray(navigator.languages) && navigator.languages.length
        ? navigator.languages
        : [typeof navigator !== "undefined" ? navigator.language : ""])
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

    const normalizedSupported = supportedLocales.map((locale) => String(locale).toLowerCase());
    for (const locale of requested) {
      if (normalizedSupported.includes(locale)) return locale;

      const base = locale.split("-")[0];
      if (normalizedSupported.includes(base)) return base;
    }

    return fallback;
  }

  function interpolate(template, params = {}) {
    return String(template).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
      return Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : "";
    });
  }

  function createI18n(messages, options = {}) {
    const fallbackLocale = options.fallbackLocale || "fr";
    const supportedLocales = options.supportedLocales || Object.keys(messages || {});
    const locale = detectLocale(supportedLocales, fallbackLocale);

    function t(key, params = {}) {
      const localeDict = messages?.[locale] || {};
      const fallbackDict = messages?.[fallbackLocale] || {};
      const value = Object.prototype.hasOwnProperty.call(localeDict, key)
        ? localeDict[key]
        : fallbackDict[key] || key;

      return interpolate(value, params);
    }

    function formatDateTime(date, optionsArg = { dateStyle: "short", timeStyle: "short" }) {
      return new Intl.DateTimeFormat(locale, optionsArg).format(date);
    }

    return { locale, t, formatDateTime };
  }

  function applyI18nToDocument(t, root = document) {
    if (!root || typeof root.querySelectorAll !== "function") return;

    const textNodes = root.querySelectorAll("[data-i18n]");
    for (const node of textNodes) {
      node.textContent = t(node.dataset.i18n || "");
    }

    const placeholderNodes = root.querySelectorAll("[data-i18n-placeholder]");
    for (const node of placeholderNodes) {
      node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder || ""));
    }

    const titleNodes = root.querySelectorAll("[data-i18n-title]");
    for (const node of titleNodes) {
      node.setAttribute("title", t(node.dataset.i18nTitle || ""));
    }

    const ariaNodes = root.querySelectorAll("[data-i18n-aria-label]");
    for (const node of ariaNodes) {
      node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel || ""));
    }
  }

  function createId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    return `g-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function normalizePattern(input) {
    if (!input) return "";

    let value = String(input).trim().toLowerCase();
    value = value.replace(/^https?:\/\//, "");
    value = value.replace(/^www\./, "");
    value = value.split("/")[0];
    value = value.replace(/:\d+$/, "");

    if (!value) return "";

    if (value.startsWith("*.")) {
      value = `*.${value.slice(2).replace(/^\.+/, "")}`;
    }

    return value;
  }

  function hostMatchesPattern(hostname, pattern) {
    if (!hostname || !pattern) return false;

    if (pattern.startsWith("*.")) {
      const base = pattern.slice(2);
      return hostname === base || hostname.endsWith(`.${base}`);
    }

    return hostname === pattern || hostname.endsWith(`.${pattern}`);
  }

  function tryGetHostname(url) {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return "";
    }
  }

  function isValidTime(value) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
  }

  function normalizeInterval(raw) {
    if (!raw || typeof raw !== "string") return "";

    const parts = raw.trim().split("-");
    if (parts.length !== 2) return "";

    const start = parts[0].trim();
    const end = parts[1].trim();
    if (!isValidTime(start) || !isValidTime(end) || start === end) return "";

    return `${start}-${end}`;
  }

  function toMinutes(value) {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function isNowInInterval(interval, nowMinutes) {
    const [start, end] = interval.split("-");
    const startMinutes = toMinutes(start);
    const endMinutes = toMinutes(end);

    if (startMinutes < endMinutes) {
      return nowMinutes >= startMinutes && nowMinutes < endMinutes;
    }

    return nowMinutes >= startMinutes || nowMinutes < endMinutes;
  }

  function normalizeDays(rawDays) {
    if (!Array.isArray(rawDays)) return [];

    const unique = Array.from(
      new Set(
        rawDays
          .map((day) => Number(day))
          .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      )
    );

    const dayOrder = [1, 2, 3, 4, 5, 6, 0];
    return unique.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
  }

  function isBlockingActiveNow(intervals, days = [], now = new Date()) {
    const normalizedDays = normalizeDays(days);
    if (normalizedDays.length && !normalizedDays.includes(now.getDay())) {
      return false;
    }

    if (!intervals.length) return true;

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return intervals.some((interval) => isNowInInterval(interval, nowMinutes));
  }

  function sanitizeGroups(rawGroups) {
    if (!Array.isArray(rawGroups)) return [];

    return rawGroups
      .map((group) => {
        const id = typeof group?.id === "string" && group.id.trim() ? group.id.trim() : createId();
        const name = typeof group?.name === "string" && group.name.trim() ? group.name.trim() : "Groupe";
        const enabled = group?.enabled !== false;
        const patterns = Array.isArray(group?.patterns)
          ? Array.from(new Set(group.patterns.map(normalizePattern).filter(Boolean)))
          : [];
        const intervals = Array.isArray(group?.intervals)
          ? Array.from(new Set(group.intervals.map(normalizeInterval).filter(Boolean)))
          : [];
        const days = normalizeDays(group?.days);

        if (!patterns.length) return null;

        return { id, name, enabled, patterns, intervals, days };
      })
      .filter(Boolean);
  }

  function splitCsv(value) {
    return String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  global.BlocksiteShared = {
    detectLocale,
    createI18n,
    applyI18nToDocument,
    createId,
    normalizePattern,
    hostMatchesPattern,
    tryGetHostname,
    isValidTime,
    normalizeInterval,
    normalizeDays,
    isBlockingActiveNow,
    sanitizeGroups,
    splitCsv
  };
})(globalThis);