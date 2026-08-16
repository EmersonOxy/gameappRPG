import { Flame, Cog, BookOpen } from "lucide-react";

export const TYPE_WEAK_MULT = 2;
export const TYPE_RESIST_MULT = 0.5;

export const ENEMY_TYPES = {
  infernal: {
    key: "infernal",
    label: "Infernal",
    icon: Flame,
    weakTo: "sagrado",
    strongVs: "sombrio",
    color: "#ff6b4a",
  },
  mecanico: {
    key: "mecanico",
    label: "Mecânico",
    icon: Cog,
    weakTo: "magico",
    strongVs: "sagrado",
    color: "#9db8c4",
  },
  sabio: {
    key: "sabio",
    label: "Sábio",
    icon: BookOpen,
    weakTo: "sombrio",
    strongVs: "magico",
    color: "#b39df0",
  },
};

export function getEnemyType(key) {
  return ENEMY_TYPES[key] || null;
}

export function getTypeMultiplier(skillBranch, enemyTypeKey) {
  const t = getEnemyType(enemyTypeKey);
  if (!t || !skillBranch) return 1;
  if (t.weakTo === skillBranch) return TYPE_WEAK_MULT;
  if (t.strongVs === skillBranch) return TYPE_RESIST_MULT;
  return 1;
}