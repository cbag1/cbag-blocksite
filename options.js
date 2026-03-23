const ENABLED_KEY = "enabled";
const GROUPS_KEY = "siteGroups";
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_LABEL_KEYS = {
  0: "weekday.sun",
  1: "weekday.mon",
  2: "weekday.tue",
  3: "weekday.wed",
  4: "weekday.thu",
  5: "weekday.fri",
  6: "weekday.sat"
};

const { createId, normalizePattern, normalizeInterval, normalizeDays, sanitizeGroups, splitCsv, createI18n, applyI18nToDocument } = window.BlocksiteShared;

const messages = {
  fr: {
    "options.documentTitle": "Configuration CBag Site Blocker",
    "common.ready": "Pret.",
    "common.cancel": "Annuler",
    "common.close": "Fermer",
    "common.save": "Enregistrer",
    "weekday.mon": "Lun",
    "weekday.tue": "Mar",
    "weekday.wed": "Mer",
    "weekday.thu": "Jeu",
    "weekday.fri": "Ven",
    "weekday.sat": "Sam",
    "weekday.sun": "Dim",
    "options.title": "Configuration du blocage",
    "options.subtitle": "Cree des groupes de sites, definis des plages horaires, et applique un blocage automatique sans attendre un rechargement.",
    "options.globalProtection": "Protection globale active",
    "options.statsAria": "Resume detaille des regles",
    "options.stats.groups": "Groupes",
    "options.stats.sites": "Sites",
    "options.stats.active": "Actifs",
    "options.button.addGroup": "+ Ajouter un groupe de blocage",
    "options.groupsConfigured": "Groupes configures",
    "options.modal.add.title": "Ajouter un groupe de blocage",
    "options.modal.add.hint": "Choisis une categorie predefinie ou cree un groupe personnalise avec tes propres sites et horaires.",
    "options.modal.add.byCategory": "Ajouter par categorie",
    "options.category.social.title": "Social",
    "options.category.social.sub": "Facebook, Instagram, TikTok, X...",
    "options.category.adult.title": "Adulte",
    "options.category.adult.sub": "Sites adultes frequents",
    "options.category.news.title": "Actualites",
    "options.category.news.sub": "Presse et medias en ligne",
    "options.category.selected.none": "Categorie selectionnee: -",
    "options.category.selected": "Categorie selectionnee: {{label}}",
    "options.days.legend": "Jours de blocage",
    "options.button.addInterval": "+ Ajouter un intervalle",
    "options.button.addCategory": "Ajouter la categorie",
    "options.category.help": "Sans intervalle: blocage 24h/24 pour cette categorie. Avec intervalle: activation automatique a l'heure definie.",
    "options.modal.add.custom": "Ajouter un groupe personnalise",
    "options.field.groupName": "Nom du groupe",
    "options.field.sites": "Sites (separes par virgule)",
    "options.field.intervals": "Intervalles",
    "options.placeholder.groupName": "Ex: Reseaux sociaux",
    "options.placeholder.sites": "facebook.com, instagram.com, *.tiktok.com",
    "options.group.help": "Sans intervalle: blocage 24h/24 pour ce groupe. Les nouveaux horaires sont appliques automatiquement toutes les minutes.",
    "options.button.addToList": "Ajouter a la liste de blocage",
    "options.modal.edit.title": "Modifier un groupe",
    "options.modal.edit.hint": "Mets a jour les sites et les intervalles de ce groupe. Les changements sont pris en compte immediatement.",
    "options.edit.help": "Sans intervalle: blocage 24h/24 pour ce groupe. Avec intervalle: blocage actif uniquement pendant les plages configurees.",
    "options.interval.to": "a",
    "options.interval.remove": "Retirer",
    "options.days.all": "Tous les jours",
    "options.group.active": "Actif",
    "options.group.edit": "Modifier",
    "options.group.remove": "Supprimer",
    "options.empty": "Aucun groupe configure.",
    "options.category.defaultName": "Categorie",
    "options.status.invalidInterval": "Au moins un intervalle est invalide. Utilise des heures valides.",
    "options.status.selectDay": "Selectionne au moins un jour de blocage.",
    "options.status.verifyNameSite": "Verifie le nom du groupe et au moins un site valide.",
    "options.status.groupAdded": "Groupe ajoute a la liste de blocage.",
    "options.status.invalidEditInterval": "Au moins un intervalle est invalide dans la modification.",
    "options.status.selectDayForGroup": "Selectionne au moins un jour pour ce groupe.",
    "options.status.unableEditGroup": "Impossible de modifier ce groupe.",
    "options.status.groupUpdated": "Groupe modifie avec succes.",
    "options.status.setupCategory": "Definis les intervalles puis valide la categorie {{label}}.",
    "options.status.selectCategoryFirst": "Selectionne d'abord une categorie.",
    "options.status.invalidCategoryInterval": "Au moins un intervalle de categorie est invalide.",
    "options.status.selectDayForCategory": "Selectionne au moins un jour pour cette categorie.",
    "options.status.unableAddCategory": "Impossible d'ajouter cette categorie.",
    "options.status.categoryAdded": "Categorie ajoutee: {{label}}",
    "options.status.groupNotFound": "Groupe introuvable.",
    "options.confirm.deleteGroup": "Supprimer ce groupe de blocage ?",
    "options.status.groupDeleted": "Groupe supprime.",
    "options.status.groupEnabled": "Groupe active.",
    "options.status.groupDisabled": "Groupe desactive."
  },
  en: {
    "options.documentTitle": "CBag Site Blocker settings",
    "common.ready": "Ready.",
    "common.cancel": "Cancel",
    "common.close": "Close",
    "common.save": "Save",
    "weekday.mon": "Mon",
    "weekday.tue": "Tue",
    "weekday.wed": "Wed",
    "weekday.thu": "Thu",
    "weekday.fri": "Fri",
    "weekday.sat": "Sat",
    "weekday.sun": "Sun",
    "options.title": "Blocking settings",
    "options.subtitle": "Create site groups, define time ranges, and apply automatic blocking without waiting for a reload.",
    "options.globalProtection": "Global protection enabled",
    "options.statsAria": "Detailed rules summary",
    "options.stats.groups": "Groups",
    "options.stats.sites": "Sites",
    "options.stats.active": "Active",
    "options.button.addGroup": "+ Add a blocking group",
    "options.groupsConfigured": "Configured groups",
    "options.modal.add.title": "Add a blocking group",
    "options.modal.add.hint": "Choose a predefined category or create a custom group with your own sites and schedules.",
    "options.modal.add.byCategory": "Add by category",
    "options.category.social.title": "Social",
    "options.category.social.sub": "Facebook, Instagram, TikTok, X...",
    "options.category.adult.title": "Adult",
    "options.category.adult.sub": "Common adult sites",
    "options.category.news.title": "News",
    "options.category.news.sub": "Online press and media",
    "options.category.selected.none": "Selected category: -",
    "options.category.selected": "Selected category: {{label}}",
    "options.days.legend": "Blocking days",
    "options.button.addInterval": "+ Add interval",
    "options.button.addCategory": "Add category",
    "options.category.help": "No interval: 24/7 blocking for this category. With interval: automatic activation at the defined time.",
    "options.modal.add.custom": "Add a custom group",
    "options.field.groupName": "Group name",
    "options.field.sites": "Sites (comma-separated)",
    "options.field.intervals": "Intervals",
    "options.placeholder.groupName": "E.g. Social networks",
    "options.placeholder.sites": "facebook.com, instagram.com, *.tiktok.com",
    "options.group.help": "No interval: 24/7 blocking for this group. New schedules are applied automatically every minute.",
    "options.button.addToList": "Add to block list",
    "options.modal.edit.title": "Edit group",
    "options.modal.edit.hint": "Update this group's sites and intervals. Changes are applied immediately.",
    "options.edit.help": "No interval: 24/7 blocking for this group. With interval: blocking active only during configured ranges.",
    "options.interval.to": "to",
    "options.interval.remove": "Remove",
    "options.days.all": "Every day",
    "options.group.active": "Active",
    "options.group.edit": "Edit",
    "options.group.remove": "Delete",
    "options.empty": "No configured group.",
    "options.category.defaultName": "Category",
    "options.status.invalidInterval": "At least one interval is invalid. Use valid times.",
    "options.status.selectDay": "Select at least one blocking day.",
    "options.status.verifyNameSite": "Check the group name and at least one valid site.",
    "options.status.groupAdded": "Group added to block list.",
    "options.status.invalidEditInterval": "At least one interval is invalid in the edit form.",
    "options.status.selectDayForGroup": "Select at least one day for this group.",
    "options.status.unableEditGroup": "Unable to edit this group.",
    "options.status.groupUpdated": "Group updated successfully.",
    "options.status.setupCategory": "Define intervals then confirm category {{label}}.",
    "options.status.selectCategoryFirst": "Select a category first.",
    "options.status.invalidCategoryInterval": "At least one category interval is invalid.",
    "options.status.selectDayForCategory": "Select at least one day for this category.",
    "options.status.unableAddCategory": "Unable to add this category.",
    "options.status.categoryAdded": "Category added: {{label}}",
    "options.status.groupNotFound": "Group not found.",
    "options.confirm.deleteGroup": "Delete this blocking group?",
    "options.status.groupDeleted": "Group deleted.",
    "options.status.groupEnabled": "Group enabled.",
    "options.status.groupDisabled": "Group disabled."
  }
};

const i18n = createI18n(messages, { fallbackLocale: "fr", supportedLocales: ["fr", "en"] });
const t = i18n.t;

document.documentElement.lang = i18n.locale;
document.title = t("options.documentTitle");
applyI18nToDocument(t);

const enabledToggle = document.getElementById("enabledToggle");
const groupsList = document.getElementById("groupsList");
const groupsCount = document.getElementById("groupsCount");
const sitesCount = document.getElementById("sitesCount");
const activeGroupsCount = document.getElementById("activeGroupsCount");

const groupForm = document.getElementById("groupForm");
const groupNameInput = document.getElementById("groupNameInput");
const groupSitesInput = document.getElementById("groupSitesInput");
const intervalRows = document.getElementById("intervalRows");
const addDaysPicker = document.getElementById("addDaysPicker");
const addIntervalBtn = document.getElementById("addIntervalBtn");

const pageStatus = document.getElementById("pageStatus");

const categoryGrid = document.getElementById("categoryGrid");
const categoryConfig = document.getElementById("categoryConfig");
const selectedCategoryLabel = document.getElementById("selectedCategoryLabel");
const categoryIntervalRows = document.getElementById("categoryIntervalRows");
const categoryDaysPicker = document.getElementById("categoryDaysPicker");
const addCategoryIntervalBtn = document.getElementById("addCategoryIntervalBtn");
const confirmCategoryBtn = document.getElementById("confirmCategoryBtn");

const openAddModalBtn = document.getElementById("openAddModalBtn");
const addModal = document.getElementById("addModal");
const closeAddModalBtn = document.getElementById("closeAddModalBtn");
const cancelAddModalBtn = document.getElementById("cancelAddModalBtn");

const editModal = document.getElementById("editModal");
const closeEditModalBtn = document.getElementById("closeEditModalBtn");
const cancelEditModalBtn = document.getElementById("cancelEditModalBtn");
const editGroupForm = document.getElementById("editGroupForm");
const editingGroupId = document.getElementById("editingGroupId");
const editGroupNameInput = document.getElementById("editGroupNameInput");
const editGroupSitesInput = document.getElementById("editGroupSitesInput");
const editIntervalRows = document.getElementById("editIntervalRows");
const editDaysPicker = document.getElementById("editDaysPicker");
const addEditIntervalBtn = document.getElementById("addEditIntervalBtn");

let selectedCategoryKey = "";

const CATEGORY_PRESETS = {
  social: {
    name: "Social",
    patterns: ["facebook.com", "instagram.com", "tiktok.com", "x.com", "reddit.com", "snapchat.com"]
  },
  adult: {
    name: "Adulte",
    patterns: ["pornhub.com", "xvideos.com", "xhamster.com", "xnxx.com", "redtube.com"]
  },
  news: {
    name: "Actualites",
    patterns: ["lemonde.fr", "lefigaro.fr", "20minutes.fr", "bfmtv.com", "franceinfo.fr"]
  }
};

function createIntervalRow(container, startValue = "", endValue = "") {
  const row = document.createElement("div");
  row.className = "interval-row";

  const startInput = document.createElement("input");
  startInput.type = "time";
  startInput.className = "interval-start";
  startInput.value = startValue;

  const sep = document.createElement("span");
  sep.className = "interval-sep";
  sep.textContent = t("options.interval.to");

  const endInput = document.createElement("input");
  endInput.type = "time";
  endInput.className = "interval-end";
  endInput.value = endValue;

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove-interval-btn";
  removeButton.textContent = t("options.interval.remove");

  removeButton.addEventListener("click", () => {
    row.remove();
    if (container && container.children.length === 0) {
      container.appendChild(createIntervalRow(container));
    }
  });

  row.append(startInput, sep, endInput, removeButton);
  return row;
}

function resetIntervalRows(container) {
  if (!container) return;
  container.textContent = "";
  container.appendChild(createIntervalRow(container));
}

function fillIntervalRows(container, intervals) {
  if (!container) return;
  container.textContent = "";

  if (!Array.isArray(intervals) || intervals.length === 0) {
    container.appendChild(createIntervalRow(container));
    return;
  }

  for (const interval of intervals) {
    const [start = "", end = ""] = String(interval).split("-");
    container.appendChild(createIntervalRow(container, start, end));
  }
}

function collectIntervalsFromRows(container) {
  if (!container) return { intervals: [], hasInvalid: false };

  const rows = container.querySelectorAll(".interval-row");
  const intervals = [];
  let hasInvalid = false;

  for (const row of rows) {
    const start = row.querySelector(".interval-start")?.value || "";
    const end = row.querySelector(".interval-end")?.value || "";

    if (!start && !end) continue;

    const normalized = normalizeInterval(`${start}-${end}`);
    if (!normalized) {
      hasInvalid = true;
      continue;
    }

    intervals.push(normalized);
  }

  return {
    intervals: Array.from(new Set(intervals)),
    hasInvalid
  };
}

function setStatus(message, tone = "neutral") {
  if (!pageStatus) return;
  pageStatus.textContent = message;
  pageStatus.classList.remove("ok", "error");
  if (tone === "ok") pageStatus.classList.add("ok");
  if (tone === "error") pageStatus.classList.add("error");
}

function collectSelectedDays(container) {
  if (!container) return [];

  const checks = container.querySelectorAll('input[type="checkbox"]');
  const selected = Array.from(checks)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => Number(checkbox.value));

  return normalizeDays(selected);
}

function setSelectedDays(container, days) {
  if (!container) return;

  const checks = container.querySelectorAll('input[type="checkbox"]');
  const normalized = normalizeDays(days);
  const targetDays = normalized.length ? normalized : WEEKDAY_ORDER;

  for (const checkbox of checks) {
    checkbox.checked = targetDays.includes(Number(checkbox.value));
  }
}

function formatDays(days) {
  const normalized = normalizeDays(days);
  if (normalized.length === 0 || normalized.length === 7) {
    return [t("options.days.all")];
  }

  return normalized.map((day) => t(WEEKDAY_LABEL_KEYS[day] || ""));
}

function isModalOpen() {
  const addOpen = Boolean(addModal && !addModal.classList.contains("hidden"));
  const editOpen = Boolean(editModal && !editModal.classList.contains("hidden"));
  return addOpen || editOpen;
}

function openAddModal() {
  if (!addModal) return;
  addModal.classList.remove("hidden");
  addModal.setAttribute("aria-hidden", "false");

  if (intervalRows && intervalRows.children.length === 0) {
    intervalRows.appendChild(createIntervalRow(intervalRows));
  }

  selectedCategoryKey = "";
  if (categoryConfig) categoryConfig.classList.add("hidden");
  if (selectedCategoryLabel) selectedCategoryLabel.textContent = t("options.category.selected.none");
  resetIntervalRows(categoryIntervalRows);
  setSelectedDays(categoryDaysPicker, WEEKDAY_ORDER);
  setSelectedDays(addDaysPicker, WEEKDAY_ORDER);

  const buttons = categoryGrid?.querySelectorAll(".category-btn") || [];
  for (const button of buttons) {
    button.classList.remove("selected");
  }

  groupNameInput?.focus();
}

function closeAddModal() {
  if (!addModal) return;
  addModal.classList.add("hidden");
  addModal.setAttribute("aria-hidden", "true");
  groupForm?.reset();
  resetIntervalRows(intervalRows);
  setSelectedDays(addDaysPicker, WEEKDAY_ORDER);
  setSelectedDays(categoryDaysPicker, WEEKDAY_ORDER);
}

function openEditModal(group) {
  if (!editModal || !group) return;

  editingGroupId.value = group.id;
  editGroupNameInput.value = group.name;
  editGroupSitesInput.value = group.patterns.join(", ");
  fillIntervalRows(editIntervalRows, group.intervals);
  setSelectedDays(editDaysPicker, group.days);

  editModal.classList.remove("hidden");
  editModal.setAttribute("aria-hidden", "false");
  editGroupNameInput?.focus();
}

function closeEditModal() {
  if (!editModal) return;
  editModal.classList.add("hidden");
  editModal.setAttribute("aria-hidden", "true");
  editGroupForm?.reset();
  resetIntervalRows(editIntervalRows);
  setSelectedDays(editDaysPicker, WEEKDAY_ORDER);
}

function renderStats(groups) {
  if (groupsCount) groupsCount.textContent = String(groups.length);

  if (sitesCount) {
    const totalSites = groups.reduce((sum, group) => sum + group.patterns.length, 0);
    sitesCount.textContent = String(totalSites);
  }

  if (activeGroupsCount) {
    const totalActive = groups.filter((group) => group.enabled).length;
    activeGroupsCount.textContent = String(totalActive);
  }
}

function renderGroups(groups) {
  groupsList.textContent = "";

  if (!groups.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = t("options.empty");
    groupsList.appendChild(empty);
    return;
  }

  for (const group of groups) {
    const li = document.createElement("li");
    li.className = "group";

    const head = document.createElement("div");
    head.className = "group-head";

    const title = document.createElement("h3");
    title.textContent = group.name;

    const toggleLabel = document.createElement("label");
    toggleLabel.className = "toggle";
    const groupToggle = document.createElement("input");
    groupToggle.type = "checkbox";
    groupToggle.checked = group.enabled;
    groupToggle.dataset.groupId = group.id;
    groupToggle.dataset.action = "toggle";

    const toggleText = document.createElement("span");
    toggleText.textContent = t("options.group.active");
    toggleLabel.append(groupToggle, toggleText);

    head.append(title, toggleLabel);

    const sites = document.createElement("div");
    sites.className = "chips";
    for (const pattern of group.patterns) {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = pattern;
      sites.appendChild(chip);
    }

    const intervals = document.createElement("div");
    intervals.className = "chips";
    if (group.intervals.length === 0) {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = "24h/24";
      intervals.appendChild(chip);
    } else {
      for (const interval of group.intervals) {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = interval;
        intervals.appendChild(chip);
      }
    }

    const days = document.createElement("div");
    days.className = "chips";
    for (const dayLabel of formatDays(group.days)) {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = dayLabel;
      days.appendChild(chip);
    }

    const actions = document.createElement("div");
    actions.className = "actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-btn";
    editButton.dataset.groupId = group.id;
    editButton.dataset.action = "edit";
    editButton.textContent = t("options.group.edit");

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "danger";
    removeButton.dataset.groupId = group.id;
    removeButton.dataset.action = "remove";
    removeButton.textContent = t("options.group.remove");

    actions.append(editButton, removeButton);

    li.append(head, sites, intervals, days, actions);
    groupsList.appendChild(li);
  }
}

async function loadState() {
  const data = await chrome.storage.local.get({
    [ENABLED_KEY]: true,
    [GROUPS_KEY]: []
  });

  const groups = sanitizeGroups(data[GROUPS_KEY]);
  enabledToggle.checked = Boolean(data[ENABLED_KEY]);
  renderGroups(groups);
  renderStats(groups);
  renderCategoryState(groups);

  if (groups.length !== (Array.isArray(data[GROUPS_KEY]) ? data[GROUPS_KEY].length : 0)) {
    await chrome.storage.local.set({ [GROUPS_KEY]: groups });
  }
}

function renderCategoryState(groups) {
  if (!categoryGrid) return;

  const categoryButtons = categoryGrid.querySelectorAll(".category-btn");
  for (const button of categoryButtons) {
    const key = button.dataset.category;
    const preset = key ? CATEGORY_PRESETS[key] : null;
    if (!preset) continue;

    const alreadyAdded = groups.some((group) => group.name === preset.name);
    button.classList.toggle("added", alreadyAdded);
    button.setAttribute("aria-pressed", alreadyAdded ? "true" : "false");
  }
}

async function addGroup(name, sitesCsv, intervals, days) {
  const nameValue = name.trim();
  const patterns = splitCsv(sitesCsv).map(normalizePattern).filter(Boolean);

  if (!nameValue || patterns.length === 0) return false;

  const data = await chrome.storage.local.get({ [GROUPS_KEY]: [] });
  const groups = sanitizeGroups(data[GROUPS_KEY]);

  const nextGroup = {
    id: createId(),
    name: nameValue,
    enabled: true,
    patterns: Array.from(new Set(patterns)),
    intervals: Array.from(new Set(Array.isArray(intervals) ? intervals : [])),
    days: normalizeDays(days)
  };

  await chrome.storage.local.set({ [GROUPS_KEY]: [...groups, nextGroup] });
  return true;
}

async function updateGroup(groupId, name, sitesCsv, intervals, days) {
  const nameValue = name.trim();
  const patterns = splitCsv(sitesCsv).map(normalizePattern).filter(Boolean);

  if (!groupId || !nameValue || patterns.length === 0) return false;

  const data = await chrome.storage.local.get({ [GROUPS_KEY]: [] });
  const groups = sanitizeGroups(data[GROUPS_KEY]);

  let found = false;
  const next = groups.map((group) => {
    if (group.id !== groupId) return group;
    found = true;

    return {
      ...group,
      name: nameValue,
      patterns: Array.from(new Set(patterns)),
      intervals: Array.from(new Set(Array.isArray(intervals) ? intervals : [])),
      days: normalizeDays(days)
    };
  });

  if (!found) return false;

  await chrome.storage.local.set({ [GROUPS_KEY]: next });
  return true;
}

async function addPresetCategory(categoryKey, intervals = [], days = []) {
  const preset = CATEGORY_PRESETS[categoryKey];
  if (!preset) return false;

  const data = await chrome.storage.local.get({ [GROUPS_KEY]: [] });
  const groups = sanitizeGroups(data[GROUPS_KEY]);

  const existingIndex = groups.findIndex((group) => group.name === preset.name);
  if (existingIndex === -1) {
    groups.push({
      id: createId(),
      name: preset.name,
      enabled: true,
      patterns: Array.from(new Set(preset.patterns.map(normalizePattern).filter(Boolean))),
      intervals: Array.from(new Set(intervals)),
      days: normalizeDays(days)
    });
  } else {
    const mergedPatterns = Array.from(
      new Set([...groups[existingIndex].patterns, ...preset.patterns.map(normalizePattern).filter(Boolean)])
    );

    groups[existingIndex] = {
      ...groups[existingIndex],
      enabled: true,
      patterns: mergedPatterns,
      intervals: Array.from(new Set(intervals)),
      days: normalizeDays(days)
    };
  }

  await chrome.storage.local.set({ [GROUPS_KEY]: groups });
  return true;
}

async function removeGroup(groupId) {
  const data = await chrome.storage.local.get({ [GROUPS_KEY]: [] });
  const groups = sanitizeGroups(data[GROUPS_KEY]);
  const next = groups.filter((group) => group.id !== groupId);
  await chrome.storage.local.set({ [GROUPS_KEY]: next });
}

async function toggleGroup(groupId, enabled) {
  const data = await chrome.storage.local.get({ [GROUPS_KEY]: [] });
  const groups = sanitizeGroups(data[GROUPS_KEY]);
  const next = groups.map((group) => (group.id === groupId ? { ...group, enabled } : group));
  await chrome.storage.local.set({ [GROUPS_KEY]: next });
}

enabledToggle?.addEventListener("change", async () => {
  await chrome.storage.local.set({ [ENABLED_KEY]: enabledToggle.checked });
});

groupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const { intervals, hasInvalid } = collectIntervalsFromRows(intervalRows);
  const days = collectSelectedDays(addDaysPicker);
  if (hasInvalid) {
    setStatus(t("options.status.invalidInterval"), "error");
    return;
  }

  if (days.length === 0) {
    setStatus(t("options.status.selectDay"), "error");
    return;
  }

  const created = await addGroup(groupNameInput.value, groupSitesInput.value, intervals, days);
  if (!created) {
    setStatus(t("options.status.verifyNameSite"), "error");
    return;
  }

  groupNameInput.value = "";
  groupSitesInput.value = "";
  resetIntervalRows(intervalRows);
  setStatus(t("options.status.groupAdded"), "ok");
  closeAddModal();
  await loadState();
});

editGroupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const { intervals, hasInvalid } = collectIntervalsFromRows(editIntervalRows);
  const days = collectSelectedDays(editDaysPicker);
  if (hasInvalid) {
    setStatus(t("options.status.invalidEditInterval"), "error");
    return;
  }

  if (days.length === 0) {
    setStatus(t("options.status.selectDayForGroup"), "error");
    return;
  }

  const updated = await updateGroup(editingGroupId.value, editGroupNameInput.value, editGroupSitesInput.value, intervals, days);
  if (!updated) {
    setStatus(t("options.status.unableEditGroup"), "error");
    return;
  }

  setStatus(t("options.status.groupUpdated"), "ok");
  closeEditModal();
  await loadState();
});

addIntervalBtn?.addEventListener("click", () => {
  intervalRows?.appendChild(createIntervalRow(intervalRows));
});

addEditIntervalBtn?.addEventListener("click", () => {
  editIntervalRows?.appendChild(createIntervalRow(editIntervalRows));
});

categoryGrid?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const button = target.closest("button.category-btn");
  if (!button) return;

  const categoryKey = button.dataset.category;
  if (!categoryKey) return;

  selectedCategoryKey = categoryKey;
  const buttons = categoryGrid.querySelectorAll(".category-btn");
  for (const item of buttons) {
    item.classList.toggle("selected", item === button);
  }

  if (categoryConfig) categoryConfig.classList.remove("hidden");
  resetIntervalRows(categoryIntervalRows);

  const label = CATEGORY_PRESETS[categoryKey]?.name || t("options.category.defaultName");
  if (selectedCategoryLabel) {
    selectedCategoryLabel.textContent = t("options.category.selected", { label });
  }
  setStatus(t("options.status.setupCategory", { label }));
});

addCategoryIntervalBtn?.addEventListener("click", () => {
  categoryIntervalRows?.appendChild(createIntervalRow(categoryIntervalRows));
});

confirmCategoryBtn?.addEventListener("click", async () => {
  if (!selectedCategoryKey) {
    setStatus(t("options.status.selectCategoryFirst"), "error");
    return;
  }

  const { intervals, hasInvalid } = collectIntervalsFromRows(categoryIntervalRows);
  const days = collectSelectedDays(categoryDaysPicker);
  if (hasInvalid) {
    setStatus(t("options.status.invalidCategoryInterval"), "error");
    return;
  }

  if (days.length === 0) {
    setStatus(t("options.status.selectDayForCategory"), "error");
    return;
  }

  const created = await addPresetCategory(selectedCategoryKey, intervals, days);
  if (!created) {
    setStatus(t("options.status.unableAddCategory"), "error");
    return;
  }

  const label = CATEGORY_PRESETS[selectedCategoryKey]?.name || t("options.category.defaultName");
  setStatus(t("options.status.categoryAdded", { label }), "ok");
  closeAddModal();
  await loadState();
});

openAddModalBtn?.addEventListener("click", () => {
  openAddModal();
});

closeAddModalBtn?.addEventListener("click", () => {
  closeAddModal();
});

cancelAddModalBtn?.addEventListener("click", () => {
  closeAddModal();
});

closeEditModalBtn?.addEventListener("click", () => {
  closeEditModal();
});

cancelEditModalBtn?.addEventListener("click", () => {
  closeEditModal();
});

addModal?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.dataset.closeModal === "true") {
    closeAddModal();
  }
});

editModal?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.dataset.closeEditModal === "true") {
    closeEditModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isModalOpen()) {
    closeAddModal();
    closeEditModal();
  }
});

if (intervalRows && intervalRows.children.length === 0) {
  intervalRows.appendChild(createIntervalRow(intervalRows));
}

if (categoryIntervalRows && categoryIntervalRows.children.length === 0) {
  categoryIntervalRows.appendChild(createIntervalRow(categoryIntervalRows));
}

if (editIntervalRows && editIntervalRows.children.length === 0) {
  editIntervalRows.appendChild(createIntervalRow(editIntervalRows));
}

setSelectedDays(addDaysPicker, WEEKDAY_ORDER);
setSelectedDays(editDaysPicker, WEEKDAY_ORDER);
setSelectedDays(categoryDaysPicker, WEEKDAY_ORDER);

groupsList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const action = target.dataset.action;
  const groupId = target.dataset.groupId;
  if (!action || !groupId) return;

  if (action === "edit") {
    const data = await chrome.storage.local.get({ [GROUPS_KEY]: [] });
    const groups = sanitizeGroups(data[GROUPS_KEY]);
    const group = groups.find((item) => item.id === groupId);
    if (!group) {
      setStatus(t("options.status.groupNotFound"), "error");
      return;
    }

    openEditModal(group);
    return;
  }

  if (action === "remove") {
    const confirmed = window.confirm(t("options.confirm.deleteGroup"));
    if (!confirmed) return;

    await removeGroup(groupId);
    setStatus(t("options.status.groupDeleted"), "ok");
    await loadState();
  }
});

groupsList?.addEventListener("change", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;

  const action = target.dataset.action;
  const groupId = target.dataset.groupId;
  if (action !== "toggle" || !groupId) return;

  await toggleGroup(groupId, target.checked);
  setStatus(target.checked ? t("options.status.groupEnabled") : t("options.status.groupDisabled"));
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes[ENABLED_KEY] || changes[GROUPS_KEY]) {
    loadState().catch((error) => console.error("Failed to reload options state", error));
  }
});

loadState().catch((error) => console.error("Failed to load options", error));
