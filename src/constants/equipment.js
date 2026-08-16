import {
  Swords,
  Heart,
  Shield,
  Coins,
  Droplets,
  Gem,
  Flame,
  Waves,
  Sparkles,
} from "lucide-react";

export const EQUIPMENT_SLOTS = 4;

export const SLOT_UNLOCK = {
  1: { level: 3, gold: 100 },
  2: { level: 5, gold: 250 },
  3: { level: 8, gold: 600 },
};

export const COMMON_ITEMS = [
  {
    id: "amuleto-forca",
    name: "Amuleto de Força",
    icon: Swords,
    effect: { type: "atk", base: 1, step: 1 },
    description: "Aumenta o ataque.",
  },
  {
    id: "pedra-vitalidade",
    name: "Pedra de Vitalidade",
    icon: Heart,
    effect: { type: "hp", base: 5, step: 5 },
    description: "Aumenta a vida máxima.",
  },
  {
    id: "talisma-defesa",
    name: "Talismã de Defesa",
    icon: Shield,
    effect: { type: "def", base: 1, step: 1 },
    description: "Aumenta a defesa.",
  },
  {
    id: "anel-mineiro",
    name: "Anel do Mineiro",
    icon: Coins,
    effect: { type: "gold", base: 10, step: 10 },
    description: "Ganha mais ouro nas vitórias.",
  },
  {
    id: "charm-mana",
    name: "Charm de Mana",
    icon: Droplets,
    effect: { type: "mana", base: 2, step: 2 },
    description: "Aumenta a mana máxima.",
  },
];

export const RARE_ITEMS = [
  {
    id: "coracao-cristal",
    name: "Coração de Cristal",
    icon: Gem,
    effect: { type: "hpPct", base: 10, step: 10 },
    description: "Aumenta a vida máxima em porcentagem.",
  },
  {
    id: "brasa-eterna",
    name: "Brasa Eterna",
    icon: Flame,
    effect: { type: "fury", base: 0.5, step: 0.5 },
    description: "Aumenta o multiplicador de fúria.",
  },
  {
    id: "fonte-arcaica",
    name: "Fonte Arcaica",
    icon: Waves,
    effect: { type: "regen", base: 1, step: 1 },
    description: "Acelera a regeneração de estamina e mana.",
  },
  {
    id: "prisma-ouro",
    name: "Prisma de Ouro",
    icon: Sparkles,
    effect: { type: "gold", base: 25, step: 25 },
    description: "Ganha muito mais ouro nas vitórias.",
  },
];

export const ALL_ITEMS = COMMON_ITEMS.concat(RARE_ITEMS);

export function getEquipmentItem(id) {
  return ALL_ITEMS.find((i) => i.id === id) || null;
}

export function getEquipmentPool(oreId) {
  return oreId === "raro" ? RARE_ITEMS : COMMON_ITEMS;
}

export function upgradeCost(level) {
  return 40 * level;
}

export function passiveValue(item, level) {
  return item.effect.base + item.effect.step * (level - 1);
}

export function passiveLabel(item, level) {
  const v = passiveValue(item, level);
  switch (item.effect.type) {
    case "atk":
      return `+${v} Ataque`;
    case "hp":
      return `+${v} Vida máxima`;
    case "hpPct":
      return `+${v}% Vida máxima`;
    case "def":
      return `+${v} Defesa`;
    case "mana":
      return `+${v} Mana`;
    case "regen":
      return `+${v} Regeneração (estamina e mana)`;
    case "fury":
      return `+${v} Fúria (multiplicador)`;
    case "gold":
      return `+${v}% Ouro nas vitórias`;
    default:
      return item.description;
  }
}