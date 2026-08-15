import {
  Wind,
  Mountain,
  Shield,
  Snowflake,
  Waves,
  Flame,
  FlameKindling,
} from "lucide-react";

export const ENEMY_SKILLS = [
  {
    id: "rajada-cortante",
    name: "Rajada Cortante",
    element: "vendaval",
    manaCost: 3,
    icon: Wind,
    effect: { type: "damage", mult: 1.4 },
    description: "Vendaval afiado que corta o alvo.",
  },
  {
    id: "queda-de-rocha",
    name: "Queda de Rocha",
    element: "rocha",
    manaCost: 4,
    icon: Mountain,
    effect: { type: "damage", mult: 1.6 },
    description: "Escombro de pedra esmaga o alvo.",
  },
  {
    id: "pele-de-pedra",
    name: "Pele de Pedra",
    element: "rocha",
    manaCost: 3,
    icon: Shield,
    effect: { type: "shield", base: 3, defFactor: 0.5 },
    description: "Barreira pétrea absorve o próximo dano.",
  },
  {
    id: "jato-congelante",
    name: "Jato Congelante",
    element: "mare",
    manaCost: 4,
    icon: Snowflake,
    effect: { type: "damage", mult: 1.5, drainStamina: 2 },
    description: "Maré gelada fere e drena estamina.",
  },
  {
    id: "onda-congelante",
    name: "Onda Congelante",
    element: "mare",
    manaCost: 6,
    icon: Waves,
    effect: { type: "stun" },
    description: "Congela o aventureiro por um turno.",
  },
  {
    id: "bola-de-fogo",
    name: "Bola de Fogo",
    element: "magma",
    manaCost: 4,
    icon: Flame,
    effect: { type: "damage", mult: 1.8 },
    description: "Orbe de magma que queima o alvo.",
  },
  {
    id: "erupcao",
    name: "Erupção",
    element: "magma",
    manaCost: 7,
    icon: FlameKindling,
    effect: { type: "damage", mult: 2.4 },
    description: "O solo explode em chamas.",
  },
];

export const ENEMY_ITEMS = [
  {
    id: "e-item-vida",
    name: "Poção de Vida",
    effect: { type: "heal", pct: 0.3 },
    weight: 0.5,
  },
  {
    id: "e-item-escudo",
    name: "Poção de Escudo",
    effect: { type: "shield", amount: 4 },
    weight: 0.3,
  },
  {
    id: "e-item-furia",
    name: "Poção de Fúria",
    effect: { type: "fury", amount: 3 },
    weight: 0.2,
  },
];

export function getEnemySkill(id) {
  return ENEMY_SKILLS.find((s) => s.id === id) || null;
}

export function pickEnemyItem() {
  const total = ENEMY_ITEMS.reduce((sum, i) => sum + i.weight, 0);
  let roll = Math.random() * total;
  for (const item of ENEMY_ITEMS) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return ENEMY_ITEMS[0];
}