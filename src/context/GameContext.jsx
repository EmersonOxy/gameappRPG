import { createContext, useContext, useEffect, useState } from "react";
import { STATS, INITIAL_STATS, POINTS_PER_LEVEL } from "../constants/stats.js";

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

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { gold: 0, totalXp: 0, stats: { ...INITIAL_STATS }, statPoints: 0 };
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
    return {
      gold: Number(data.gold) || 0,
      totalXp,
      stats,
      statPoints,
    };
  } catch {
    return { gold: 0, totalXp: 0, stats: { ...INITIAL_STATS }, statPoints: 0 };
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [initial] = useState(loadProgress);
  const [gold, setGold] = useState(initial.gold);
  const [totalXp, setTotalXp] = useState(initial.totalXp);
  const [stats, setStats] = useState(initial.stats);
  const [statPoints, setStatPoints] = useState(initial.statPoints);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ gold, totalXp, stats, statPoints })
    );
  }, [gold, totalXp, stats, statPoints]);

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

  const { level, xp } = levelFromTotalXp(totalXp);
  const xpPerLevel = xpToNext(level);

  const playerMaxHp = stats.vida * 5;
  const playerAtk = stats.forca + 1;
  const playerDef = stats.defesa + 1;
  const playerStaminaMax = 8 + stats.estamina * 2;
  const playerStaminaRegen = 1 + stats.regen;
  const playerFuryMult = 2 + (stats.furia - 1) * 0.5;
  const playerMana = 4 + stats.mana * 4;

  const enemyMaxHp =
    5 + Math.floor((level - 1) / 2) + Math.floor((level - 1) / 3);
  const enemyAtk = 2 + Math.floor((level - 1) / 2);
  const enemyDef = 2 + Math.floor((level - 1) / 2);
  const enemyMana = 4 + Math.floor((level - 1) / 2) * 2;

  const goldBase = 1 + Math.floor((level - 1) / 2);
  const goldExtra = 2 + Math.floor((level - 1) / 2);
  const xpBase = 1 + Math.floor((level - 1) / 3);
  const xpExtra = 2 + Math.floor((level - 1) / 3);

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
        addReward,
        upgradeStat,
        difficulty: level,
        playerMaxHp,
        playerAtk,
        playerDef,
        playerStaminaMax,
        playerStaminaRegen,
        playerFuryMult,
        playerMana,
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
