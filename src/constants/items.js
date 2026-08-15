import {
  Heart,
  Droplets,
  Zap,
  Flame,
  Bomb,
  Shield,
} from "lucide-react";
import spriteMana from "../assets/sprites/pocao-mana.svg";
import spriteEstamina from "../assets/sprites/pocao-estamina.svg";
import spriteVida from "../assets/sprites/pocao-vida.svg";
import spriteFuria from "../assets/sprites/pocao-furia.svg";
import spriteEscudo from "../assets/sprites/pocao-escudo.svg";
import spriteBomba from "../assets/sprites/bomba.svg";

export const ITEMS = [
  {
    id: "pocao-mana",
    name: "Poção de Mana",
    price: 8,
    crystalCost: 1,
    delay: 1,
    icon: Droplets,
    sprite: spriteMana,
    branch: "mana",
    effect: { type: "mana", amount: 5 },
    description: "Restaura 5 de mana.",
  },
  {
    id: "pocao-estamina",
    name: "Poção de Estamina",
    price: 8,
    crystalCost: 1,
    delay: 1,
    icon: Zap,
    sprite: spriteEstamina,
    branch: "estamina",
    effect: { type: "stamina", amount: 5 },
    description: "Restaura 5 de estamina.",
  },
  {
    id: "pocao-vida",
    name: "Poção de Vida",
    price: 10,
    crystalCost: 2,
    delay: 1,
    icon: Heart,
    sprite: spriteVida,
    branch: "vida",
    effect: { type: "heal", pct: 0.3 },
    description: "Cura 30% da vida máxima.",
  },
  {
    id: "pocao-furia",
    name: "Poção de Fúria",
    price: 12,
    crystalCost: 2,
    delay: 1,
    icon: Flame,
    sprite: spriteFuria,
    branch: "furia",
    effect: { type: "fury", amount: 3 },
    description: "Ganha 3 de fúria.",
  },
  {
    id: "pocao-escudo",
    name: "Poção de Escudo",
    price: 12,
    crystalCost: 3,
    delay: 1,
    icon: Shield,
    sprite: spriteEscudo,
    branch: "escudo",
    effect: { type: "shield", amount: 4 },
    description: "Ganha um escudo que absorve dano.",
  },
  {
    id: "bomba",
    name: "Bomba",
    price: 15,
    crystalCost: 5,
    delay: 2,
    icon: Bomb,
    sprite: spriteBomba,
    branch: "dano",
    effect: { type: "damage", base: 6 },
    description: "Explode após 2 turnos causando dano fixo.",
  },
];

export function getItem(id) {
  return ITEMS.find((i) => i.id === id) || null;
}
