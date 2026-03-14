(function (global) {
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

  function isBlockingActiveNow(intervals, now = new Date()) {
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

        if (!patterns.length) return null;

        return { id, name, enabled, patterns, intervals };
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
    createId,
    normalizePattern,
    hostMatchesPattern,
    tryGetHostname,
    isValidTime,
    normalizeInterval,
    isBlockingActiveNow,
    sanitizeGroups,
    splitCsv
  };
})(globalThis);