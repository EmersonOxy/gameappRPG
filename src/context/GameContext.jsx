import { createContext, useContext, useEffect, useState } from "react";
import { STATS, INITIAL_STATS, POINTS_PER_LEVEL } from "../constants/stats.js";
import { SKILLS, getSkill } from "../constants/skills.js";
import { ITEMS } from "../constants/items.js";

const STORAGE_KEY = "gameapprpg:progress";

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

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        gold: 0,
        totalXp: 0,
        stats: { ...INITIAL_STATS },
        statPoints: 0,
        skillsOwned: [],
        skillsEquipped: [],
        itemsOwned: {},
      };
    }
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
    return {
      gold: Number(data.gold) || 0,
      totalXp,
      stats,
      statPoints,
      skillsOwned,
      skillsEquipped,
      itemsOwned,
    };
  } catch {
    return {
      gold: 0,
      totalXp: 0,
      stats: { ...INITIAL_STATS },
      statPoints: 0,
      skillsOwned: [],
      skillsEquipped: [],
      itemsOwned: {},
    };
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

  const hasProgress =
    totalXp > 0 ||
    gold > 0 ||
    statPoints > 0 ||
    skillsOwned.length > 0 ||
    Object.keys(itemsOwned).length > 0;

  function resetProgress() {
    setGold(0);
    setTotalXp(0);
    setStats({ ...INITIAL_STATS });
    setStatPoints(0);
    setSkillsOwned([]);
    setSkillsEquipped([]);
    setItemsOwned({});
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
      })
    );
  }, [gold, totalXp, stats, statPoints, skillsOwned, skillsEquipped, itemsOwned]);

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

  const enemyMaxHp =
    5 + Math.floor((level - 1) / 2) + Math.floor((level - 1) / 3);
  const enemyAtk = 2 + Math.floor((level - 1) / 2);
  const enemyDef = 2 + Math.floor((level - 1) / 2);
  const enemyMana = 4 + Math.floor((level - 1) / 2) * 2;

  const goldBase = 1 + Math.floor((level - 1) / 2);
  const goldExtra = 2 + Math.floor((level - 1) / 2);
  const xpBase = 1 + Math.floor((level - 1) / 3);
  const xpExtra = 2 + Math.floor((level - 1) / 3);

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
        difficulty: level,
        playerMaxHp,
        playerAtk,
        playerDef,
        playerStaminaMax,
        playerStaminaRegen,
        playerFuryMult,
        playerMana,
        playerManaRegen,
        enemyMaxHp,
        enemyAtk,
        enemyDef,
        enemyMana,
        goldBase,
        goldExtra,
        xpBase,
        xpExtra,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
