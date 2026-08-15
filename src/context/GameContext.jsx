import { createContext, useContext, useEffect, useState } from "react";
import { STATS, INITIAL_STATS, POINTS_PER_LEVEL } from "../constants/stats.js";
import { SKILLS, getSkill } from "../constants/skills.js";
import { ITEMS } from "../constants/items.js";
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

  const hasProgress =
    totalXp > 0 ||
    gold > 0 ||
    statPoints > 0 ||
    skillsOwned.length > 0 ||
    Object.keys(itemsOwned).length > 0 ||
    clearedMaps.length > 0 ||
    Object.keys(mapProgress).length > 0;

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
  ]);

  function addReward(goldGain, xpGain) {
    const nextTotalXp = totalXp + xpGain;
    const before = levelFromTotalXp(totalXp).level;
    const after = levelFromTotalXp(nextTotalXp).level;
    const gained = Math.max(0, after - before);
    setGold((g) => g + goldGain);
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

  const { level, xp } = levelFromTotalXp(totalXp);
  const xpPerLevel = xpToNext(level);

  const playerMaxHp = stats.vida * 5;
  const playerAtk = stats.forca + 1;
  const playerDef = stats.defesa + 1;
  const playerStaminaMax = 8 + stats.estamina * 2;
  const playerStaminaRegen = 1 + stats.regen;
  const playerFuryMult = 2 + (stats.furia - 1) * 0.5;
  const playerMana = 4 + stats.mana * 4;
  const playerManaRegen = stats.regenmana;

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
