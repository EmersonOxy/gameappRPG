import { createContext, useContext, useEffect, useState } from "react";
import { STATS, INITIAL_STATS, POINTS_PER_LEVEL } from "../constants/stats.js";
import { SKILLS, getSkill } from "../constants/skills.js";
import { ITEMS } from "../constants/items.js";
import { ORES } from "../constants/ores.js";
import {
  EQUIPMENT_SLOTS,
  SLOT_UNLOCK,
  upgradeCost,
  getEquipmentItem,
  getEquipmentPool,
  passiveValue,
} from "../constants/equipment.js";
import {
  MAPS,
  getMap,
  getMapIndex,
  pickNormalEnemy,
  computeEnemyStats,
  BOSS_STAT_POINTS,
} from "../constants/maps.js";
import { getEnemy, getTutorialEnemy } from "../constants/enemies.js";

const STORAGE_KEY = "gameapprpg:progress";
const TUTORIAL_STEPS = 5;

function xpToNext(level) {
  return 8 + (level - 1) * 4;
}

function levelFromTotalXp(totalXp) {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpToNext(level)) {
    remaining -= xpToNext(level);
    level++;
  }
  return { level, xp: remaining };
}

const VALID_SKILL_IDS = new Set(SKILLS.map((s) => s.id));
const VALID_MAP_IDS = new Set(MAPS.map((m) => m.id));

function sanitizeSkills(list) {
  if (!Array.isArray(list)) return [];
  return list.filter((id) => VALID_SKILL_IDS.has(id));
}

function sanitizeItems(obj) {
  const result = {};
  if (obj && typeof obj === "object") {
    for (const id of Object.keys(obj)) {
      if (ITEMS.some((i) => i.id === id)) {
        const n = Math.floor(Number(obj[id]));
        if (n > 0) result[id] = n;
      }
    }
  }
  return result;
}

function sanitizeClearedMaps(list) {
  if (!Array.isArray(list)) return [];
  return list.filter((id) => VALID_MAP_IDS.has(id));
}

function sanitizeMapProgress(obj) {
  const result = {};
  if (obj && typeof obj === "object") {
    for (const id of Object.keys(obj)) {
      if (VALID_MAP_IDS.has(id)) {
        const n = Math.floor(Number(obj[id]));
        if (n > 0) result[id] = n;
      }
    }
  }
  return result;
}

function sanitizeOres(obj) {
  const result = { ferro: 0, raro: 0 };
  if (obj && typeof obj === "object") {
    for (const id of Object.keys(ORES)) {
      const n = Math.floor(Number(obj[id]));
      if (n > 0) result[id] = n;
    }
  }
  return result;
}

function sanitizeEquipment(obj) {
  const result = {};
  if (obj && typeof obj === "object") {
    for (const slot of Object.keys(obj)) {
      const s = Number(slot);
      if (!Number.isInteger(s) || s < 0 || s >= EQUIPMENT_SLOTS) continue;
      const entry = obj[slot];
      if (!entry || typeof entry !== "object") continue;
      if (!getEquipmentItem(entry.itemId)) continue;
      const level = Math.max(1, Math.floor(Number(entry.level)) || 1);
      result[s] = { itemId: entry.itemId, level };
    }
  }
  return result;
}

function sanitizeUnlockedSlots(list) {
  const set = new Set([0]);
  if (Array.isArray(list)) {
    for (const n of list.map(Number)) {
      if (Number.isInteger(n) && n >= 0 && n < EQUIPMENT_SLOTS) set.add(n);
    }
  }
  return [...set].sort((a, b) => a - b);
}

function defaultProgress() {
  return {
    gold: 0,
    totalXp: 0,
    stats: { ...INITIAL_STATS },
    statPoints: 0,
    skillsOwned: [],
    skillsEquipped: [],
    itemsOwned: {},
    currentMapId: MAPS[0].id,
    clearedMaps: [],
    mapProgress: {},
    tutorialStep: 0,
    ores: { ferro: 0, raro: 0 },
    equipment: {},
    unlockedSlots: [0],
  };
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const data = JSON.parse(raw);
    const stats = { ...INITIAL_STATS };
    if (data.stats) {
      for (const s of STATS) {
        stats[s.key] = Number(data.stats[s.key]) || 1;
      }
    }
    const totalXp = Number(data.totalXp) || 0;
    let statPoints = Number(data.statPoints) || 0;
    if (!data.stats && data.statPoints == null) {
      const { level } = levelFromTotalXp(totalXp);
      statPoints = (level - 1) * POINTS_PER_LEVEL;
    }
    const skillsOwned = sanitizeSkills(data.skillsOwned);
    let skillsEquipped = sanitizeSkills(data.skillsEquipped);
    if (skillsEquipped.length === 0 && data.skillEquipped) {
      skillsEquipped = sanitizeSkills([data.skillEquipped]);
    }
    skillsEquipped = skillsEquipped.filter((id) => skillsOwned.includes(id));
    const itemsOwned = sanitizeItems(data.itemsOwned);
    const currentMapId = VALID_MAP_IDS.has(data.currentMapId)
      ? data.currentMapId
      : MAPS[0].id;
    let tutorialStep = Math.floor(Number(data.tutorialStep));
    if (!Number.isFinite(tutorialStep) || tutorialStep < 0) {
      tutorialStep = TUTORIAL_STEPS;
    }
    if (tutorialStep > TUTORIAL_STEPS) tutorialStep = TUTORIAL_STEPS;
    return {
      gold: Number(data.gold) || 0,
      totalXp,
      stats,
      statPoints,
      skillsOwned,
      skillsEquipped,
      itemsOwned,
      currentMapId,
      clearedMaps: sanitizeClearedMaps(data.clearedMaps),
      mapProgress: sanitizeMapProgress(data.mapProgress),
      tutorialStep,
      ores: sanitizeOres(data.ores),
      equipment: sanitizeEquipment(data.equipment),
      unlockedSlots: sanitizeUnlockedSlots(data.unlockedSlots),
    };
  } catch {
    return defaultProgress();
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [initial] = useState(loadProgress);
  const [gold, setGold] = useState(initial.gold);
  const [totalXp, setTotalXp] = useState(initial.totalXp);
  const [stats, setStats] = useState(initial.stats);
  const [statPoints, setStatPoints] = useState(initial.statPoints);
  const [skillsOwned, setSkillsOwned] = useState(initial.skillsOwned);
  const [skillsEquipped, setSkillsEquipped] = useState(initial.skillsEquipped);
  const [itemsOwned, setItemsOwned] = useState(initial.itemsOwned);
  const [currentMapId, setCurrentMapId] = useState(initial.currentMapId);
  const [clearedMaps, setClearedMaps] = useState(initial.clearedMaps);
  const [mapProgress, setMapProgress] = useState(initial.mapProgress);
  const [tutorialStep, setTutorialStep] = useState(initial.tutorialStep);
  const [ores, setOres] = useState(initial.ores);
  const [equipment, setEquipment] = useState(initial.equipment);
  const [unlockedSlots, setUnlockedSlots] = useState(initial.unlockedSlots);

  const hasProgress =
    totalXp > 0 ||
    gold > 0 ||
    statPoints > 0 ||
    skillsOwned.length > 0 ||
    Object.keys(itemsOwned).length > 0 ||
    clearedMaps.length > 0 ||
    Object.keys(mapProgress).length > 0 ||
    ores.ferro > 0 ||
    ores.raro > 0 ||
    Object.keys(equipment).length > 0 ||
    unlockedSlots.length > 1;

  function resetProgress() {
    setGold(0);
    setTotalXp(0);
    setStats({ ...INITIAL_STATS });
    setStatPoints(0);
    setSkillsOwned([]);
    setSkillsEquipped([]);
    setItemsOwned({});
    setCurrentMapId(MAPS[0].id);
    setClearedMaps([]);
    setMapProgress({});
    setTutorialStep(0);
    setOres({ ferro: 0, raro: 0 });
    setEquipment({});
    setUnlockedSlots([0]);
  }

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        gold,
        totalXp,
        stats,
        statPoints,
        skillsOwned,
        skillsEquipped,
        itemsOwned,
        currentMapId,
        clearedMaps,
        mapProgress,
        tutorialStep,
        ores,
        equipment,
        unlockedSlots,
      })
    );
  }, [
    gold,
    totalXp,
    stats,
    statPoints,
    skillsOwned,
    skillsEquipped,
    itemsOwned,
    currentMapId,
    clearedMaps,
    mapProgress,
    tutorialStep,
    ores,
    equipment,
    unlockedSlots,
  ]);

  const passive = { atk: 0, hp: 0, hpPct: 0, def: 0, mana: 0, regen: 0, fury: 0, gold: 0 };
  for (const slot of Object.keys(equipment)) {
    const entry = equipment[slot];
    const item = getEquipmentItem(entry.itemId);
    if (!item) continue;
    const v = passiveValue(item, entry.level);
    passive[item.effect.type] = (passive[item.effect.type] || 0) + v;
  }

  function addReward(goldGain, xpGain) {
    const nextTotalXp = totalXp + xpGain;
    const before = levelFromTotalXp(totalXp).level;
    const after = levelFromTotalXp(nextTotalXp).level;
    const gained = Math.max(0, after - before);
    setGold((g) => g + Math.round(goldGain * (1 + passive.gold / 100)));
    setTotalXp(nextTotalXp);
    if (gained > 0) {
      setStatPoints((p) => p + gained * POINTS_PER_LEVEL);
    }
    return gained;
  }

  function upgradeStat(key) {
    if (statPoints <= 0) return;
    setStats((s) => ({ ...s, [key]: s[key] + 1 }));
    setStatPoints((p) => Math.max(0, p - 1));
  }

  function buySkill(id) {
    const skill = getSkill(id);
    if (!skill) return { ok: false, reason: "invalid" };
    if (skillsOwned.includes(id)) return { ok: false, reason: "owned" };
    if (skill.parent && !skillsOwned.includes(skill.parent)) {
      return { ok: false, reason: "parent" };
    }
    if (level < skill.levelReq) return { ok: false, reason: "level" };
    if (gold < skill.goldCost) return { ok: false, reason: "gold" };
    setGold((g) => g - skill.goldCost);
    setSkillsOwned((o) => [...o, id]);
    return { ok: true };
  }

  function toggleSkill(id) {
    if (!skillsOwned.includes(id)) return { ok: false };
    setSkillsEquipped((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    return { ok: true };
  }

  function buyItem(id) {
    const item = ITEMS.find((i) => i.id === id);
    if (!item) return { ok: false, reason: "invalid" };
    if (gold < item.price) return { ok: false, reason: "gold" };
    setGold((g) => g - item.price);
    setItemsOwned((o) => ({ ...o, [id]: (o[id] || 0) + 1 }));
    return { ok: true };
  }

  function useItem(id) {
    const count = itemsOwned[id] || 0;
    if (count <= 0) return { ok: false };
    setItemsOwned((o) => {
      const next = { ...o };
      if (next[id] <= 1) delete next[id];
      else next[id] -= 1;
      return next;
    });
    return { ok: true };
  }

  function addOre(type) {
    if (!ORES[type]) return false;
    setOres((o) => ({ ...o, [type]: o[type] + 1 }));
    return true;
  }

  function firstFreeSlot() {
    for (let i = 0; i < EQUIPMENT_SLOTS; i++) {
      if (unlockedSlots.includes(i) && !equipment[i]) return i;
    }
    return -1;
  }

  function discoverFromOre(type) {
    const ore = ORES[type];
    if (!ore) return { ok: false, reason: "invalid" };
    if ((ores[type] || 0) <= 0) return { ok: false, reason: "ore" };
    if (gold < ore.discoverCost) return { ok: false, reason: "gold" };
    const slot = firstFreeSlot();
    if (slot < 0) return { ok: false, reason: "full" };
    const pool = getEquipmentPool(type);
    const item = pool[Math.floor(Math.random() * pool.length)];
    setOres((o) => ({ ...o, [type]: o[type] - 1 }));
    setGold((g) => g - ore.discoverCost);
    setEquipment((eq) => ({ ...eq, [slot]: { itemId: item.id, level: 1 } }));
    return { ok: true, item, slot };
  }

  function unlockSlot(index) {
    const req = SLOT_UNLOCK[index];
    if (!req) return { ok: false, reason: "invalid" };
    if (unlockedSlots.includes(index)) return { ok: false, reason: "unlocked" };
    if (level < req.level) return { ok: false, reason: "level" };
    if (gold < req.gold) return { ok: false, reason: "gold" };
    setGold((g) => g - req.gold);
    setUnlockedSlots((s) => [...s, index].sort((a, b) => a - b));
    return { ok: true };
  }

  function upgradeEquipment(slot) {
    const entry = equipment[slot];
    if (!entry) return { ok: false, reason: "empty" };
    const cost = upgradeCost(entry.level);
    if (gold < cost) return { ok: false, reason: "gold" };
    setGold((g) => g - cost);
    setEquipment((eq) => ({
      ...eq,
      [slot]: { ...eq[slot], level: eq[slot].level + 1 },
    }));
    return { ok: true };
  }

  const { level, xp } = levelFromTotalXp(totalXp);
  const xpPerLevel = xpToNext(level);

  const playerMaxHp = Math.floor(
    (stats.vida * 5 + passive.hp) * (1 + passive.hpPct / 100)
  );
  const playerAtk = stats.forca + 1 + passive.atk;
  const playerDef = stats.defesa + 1 + passive.def;
  const playerStaminaMax = 8 + stats.estamina * 2;
  const playerStaminaRegen = 1 + stats.regen + passive.regen;
  const playerFuryMult = 2 + (stats.furia - 1) * 0.5 + passive.fury;
  const playerMana = 4 + stats.mana * 4 + passive.mana;
  const playerManaRegen = stats.regenmana + passive.regen;

  const currentMap = getMap(currentMapId) || MAPS[0];
  const currentMapIndex = getMapIndex(currentMap.id);

  function isMapUnlocked(mapId) {
    const idx = getMapIndex(mapId);
    if (idx <= 0) return true;
    const prev = MAPS[idx - 1].id;
    return clearedMaps.includes(prev);
  }

  function selectMap(mapId) {
    if (!getMap(mapId)) return false;
    if (!isMapUnlocked(mapId)) return false;
    setCurrentMapId(mapId);
    return true;
  }

  function getMapWins(mapId) {
    return mapProgress[mapId] || 0;
  }

  function getBattleSetup() {
    if (tutorialStep < TUTORIAL_STEPS) {
      const enemy = getTutorialEnemy(tutorialStep);
      return {
        enemy,
        isBoss: false,
        isTutorial: true,
        ...enemy.stats,
        threatLevel: 1,
      };
    }
    const wins = getMapWins(currentMap.id);
    const isBoss = wins >= currentMap.fightsToBoss;
    const enemy = isBoss
      ? getEnemy(currentMap.boss)
      : pickNormalEnemy(currentMap);
    const safeEnemy = enemy || pickNormalEnemy(currentMap) || getEnemy(currentMap.boss);
    const statsResult = computeEnemyStats(safeEnemy, currentMap, isBoss);
    return { enemy: safeEnemy, isBoss, ...statsResult };
  }

  function advanceTutorial() {
    setTutorialStep((s) => Math.min(TUTORIAL_STEPS, s + 1));
  }

  function advanceMap(wonBoss) {
    if (wonBoss) {
      const alreadyCleared = clearedMaps.includes(currentMap.id);
      if (!alreadyCleared) {
        setClearedMaps((prev) => [...prev, currentMap.id]);
        setStatPoints((p) => p + BOSS_STAT_POINTS);
      }
      setMapProgress((prev) => {
        const next = { ...prev };
        delete next[currentMap.id];
        return next;
      });
      return { firstClear: !alreadyCleared };
    }
    setMapProgress((prev) => ({
      ...prev,
      [currentMap.id]: (prev[currentMap.id] || 0) + 1,
    }));
    return { firstClear: false };
  }

  const equippedSkills = skillsEquipped
    .map((id) => getSkill(id))
    .filter(Boolean);

  return (
    <GameContext.Provider
      value={{
        gold,
        xp,
        level,
        xpPerLevel,
        totalXp,
        stats,
        statPoints,
        hasProgress,
        resetProgress,
        addReward,
        upgradeStat,
        skillsOwned,
        skillsEquipped,
        equippedSkills,
        buySkill,
        toggleSkill,
        itemsOwned,
        buyItem,
        useItem,
        ores,
        addOre,
        equipment,
        unlockedSlots,
        discoverFromOre,
        unlockSlot,
        upgradeEquipment,
        playerMaxHp,
        playerAtk,
        playerDef,
        playerStaminaMax,
        playerStaminaRegen,
        playerFuryMult,
        playerMana,
        playerManaRegen,
        currentMap,
        currentMapIndex,
        clearedMaps,
        mapProgress,
        isMapUnlocked,
        selectMap,
        getMapWins,
        getBattleSetup,
        advanceTutorial,
        advanceMap,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
