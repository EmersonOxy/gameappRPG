import { Mountain, Gem } from "lucide-react";

export const ORES = {
  ferro: {
    id: "ferro",
    name: "Minério de Ferro",
    icon: Mountain,
    rarityLabel: "Comum",
    discoverCost: 100,
  },
  raro: {
    id: "raro",
    name: "Cristal Raro",
    icon: Gem,
    rarityLabel: "Raro",
    discoverCost: 250,
  },
};

export const ORE_CHANCE = {
  ferro: 0.07,
  raro: 0.008,
};

export const MAX_ORES_ON_SCREEN = 4;
export const ORE_TTL_MS = 60000;