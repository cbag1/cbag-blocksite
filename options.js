const ENABLED_KEY = "enabled";
const GROUPS_KEY = "siteGroups";
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_LABELS = {
  0: "Dim",
  1: "Lun",
  2: "Mar",
  3: "Mer",
  4: "Jeu",
  5: "Ven",
  6: "Sam"
};

const { createId, normalizePattern, normalizeInterval, normalizeDays, sanitizeGroups, splitCsv } = window.BlocksiteShared;

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
  sep.textContent = "a";

  const endInput = document.createElement("input");
  endInput.type = "time";
  endInput.className = "interval-end";
  endInput.value = endValue;

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove-interval-btn";
  removeButton.textContent = "Retirer";

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
    return ["Tous les jours"];
  }

  return normalized.map((day) => WEEKDAY_LABELS[day] || String(day));
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
  if (selectedCategoryLabel) selectedCategoryLabel.textContent = "Categorie selectionnee: -";
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
    empty.textContent = "Aucun groupe configure.";
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
    toggleText.textContent = "Actif";
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
    editButton.textContent = "Modifier";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "danger";
    removeButton.dataset.groupId = group.id;
    removeButton.dataset.action = "remove";
    removeButton.textContent = "Supprimer";

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
    setStatus("Au moins un intervalle est invalide. Utilise des heures valides.", "error");
    return;
  }

  if (days.length === 0) {
    setStatus("Selectionne au moins un jour de blocage.", "error");
    return;
  }

  const created = await addGroup(groupNameInput.value, groupSitesInput.value, intervals, days);
  if (!created) {
    setStatus("Verifie le nom du groupe et au moins un site valide.", "error");
    return;
  }

  groupNameInput.value = "";
  groupSitesInput.value = "";
  resetIntervalRows(intervalRows);
  setStatus("Groupe ajoute a la liste de blocage.", "ok");
  closeAddModal();
  await loadState();
});

editGroupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const { intervals, hasInvalid } = collectIntervalsFromRows(editIntervalRows);
  const days = collectSelectedDays(editDaysPicker);
  if (hasInvalid) {
    setStatus("Au moins un intervalle est invalide dans la modification.", "error");
    return;
  }

  if (days.length === 0) {
    setStatus("Selectionne au moins un jour pour ce groupe.", "error");
    return;
  }

  const updated = await updateGroup(editingGroupId.value, editGroupNameInput.value, editGroupSitesInput.value, intervals, days);
  if (!updated) {
    setStatus("Impossible de modifier ce groupe.", "error");
    return;
  }

  setStatus("Groupe modifie avec succes.", "ok");
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

  const label = CATEGORY_PRESETS[categoryKey]?.name || "Categorie";
  if (selectedCategoryLabel) {
    selectedCategoryLabel.textContent = `Categorie selectionnee: ${label}`;
  }
  setStatus(`Definis les intervalles puis valide la categorie ${label}.`);
});

addCategoryIntervalBtn?.addEventListener("click", () => {
  categoryIntervalRows?.appendChild(createIntervalRow(categoryIntervalRows));
});

confirmCategoryBtn?.addEventListener("click", async () => {
  if (!selectedCategoryKey) {
    setStatus("Selectionne d'abord une categorie.", "error");
    return;
  }

  const { intervals, hasInvalid } = collectIntervalsFromRows(categoryIntervalRows);
  const days = collectSelectedDays(categoryDaysPicker);
  if (hasInvalid) {
    setStatus("Au moins un intervalle de categorie est invalide.", "error");
    return;
  }

  if (days.length === 0) {
    setStatus("Selectionne au moins un jour pour cette categorie.", "error");
    return;
  }

  const created = await addPresetCategory(selectedCategoryKey, intervals, days);
  if (!created) {
    setStatus("Impossible d'ajouter cette categorie.", "error");
    return;
  }

  const label = CATEGORY_PRESETS[selectedCategoryKey]?.name || "Categorie";
  setStatus(`Categorie ajoutee: ${label}`, "ok");
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
      setStatus("Groupe introuvable.", "error");
      return;
    }

    openEditModal(group);
    return;
  }

  if (action === "remove") {
    const confirmed = window.confirm("Supprimer ce groupe de blocage ?");
    if (!confirmed) return;

    await removeGroup(groupId);
    setStatus("Groupe supprime.", "ok");
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
  setStatus(target.checked ? "Groupe active." : "Groupe desactive.");
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes[ENABLED_KEY] || changes[GROUPS_KEY]) {
    loadState().catch((error) => console.error("Failed to reload options state", error));
  }
});

loadState().catch((error) => console.error("Failed to load options", error));
