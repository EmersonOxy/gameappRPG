import { createContext, useContext, useEffect, useState } from "react";

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
    if (!raw) return { gold: 0, totalXp: 0 };
    const data = JSON.parse(raw);
    return {
      gold: Number(data.gold) || 0,
      totalXp: Number(data.totalXp) || 0,
    };
  } catch {
    return { gold: 0, totalXp: 0 };
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [initial] = useState(loadProgress);
  const [gold, setGold] = useState(initial.gold);
  const [totalXp, setTotalXp] = useState(initial.totalXp);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ gold, totalXp }));
  }, [gold, totalXp]);

  function addReward(goldGain, xpGain) {
    setGold((g) => g + goldGain);
    setTotalXp((x) => x + xpGain);
  }

  const { level, xp } = levelFromTotalXp(totalXp);
  const xpPerLevel = xpToNext(level);

  const playerMaxHp = 5 + Math.floor((level - 1) / 2);
  const playerAtk = 2 + Math.floor((level - 1) / 2);
  const playerDef = 2 + Math.floor((level - 1) / 2);

  const enemyMaxHp =
    5 + Math.floor((level - 1) / 2) + Math.floor((level - 1) / 3);
  const enemyAtk = 2 + Math.floor((level - 1) / 2);
  const enemyDef = 2 + Math.floor((level - 1) / 2);

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
        addReward,
        difficulty: level,
        playerMaxHp,
        playerAtk,
        playerDef,
        enemyMaxHp,
        enemyAtk,
        enemyDef,
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
