import { createContext, useContext, useState } from "react";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [gold, setGold] = useState(0);
  const [xp, setXp] = useState(0);

  function addReward(goldGain, xpGain) {
    setGold((g) => g + goldGain);
    setXp((x) => x + xpGain);
  }

  return (
    <GameContext.Provider value={{ gold, xp, addReward }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
