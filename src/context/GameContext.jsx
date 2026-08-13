import { createContext, useContext, useState } from "react";

const XP_PER_LEVEL = 10;

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [gold, setGold] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  function addReward(goldGain, xpGain) {
    setGold((g) => g + goldGain);
    setTotalXp((x) => x + xpGain);
  }

  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xp = totalXp % XP_PER_LEVEL;

  return (
    <GameContext.Provider
      value={{ gold, xp, level, xpPerLevel: XP_PER_LEVEL, addReward }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
