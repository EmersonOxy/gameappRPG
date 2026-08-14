import {
  Heart,
  Shield,
  Zap,
  RotateCw,
  Flame,
  Swords,
  Droplets,
  Waves,
} from "lucide-react";

export const POINTS_PER_LEVEL = 1;

export const STATS = [
  {
    key: "vida",
    label: "Vida",
    description: "Quantidade de vida total",
    effect: "+5 de vida por ponto",
    icon: Heart,
  },
  {
    key: "defesa",
    label: "Defesa",
    description: "O quanto a defesa será efetiva",
    effect: "+1 de defesa por ponto",
    icon: Shield,
  },
  {
    key: "estamina",
    label: "Estamina total",
    description: "Reserva total de estamina",
    effect: "+2 de estamina por ponto",
    icon: Zap,
  },
  {
    key: "regen",
    label: "Regeneração",
    description: "Velocidade que a estamina é preenchida",
    effect: "+1 de regeneração por ponto",
    icon: RotateCw,
  },
  {
    key: "furia",
    label: "Fúria",
    description: "Quantidade de dano da fúria",
    effect: "+25% de dano da fúria por ponto",
    icon: Flame,
  },
  {
    key: "forca",
    label: "Força",
    description: "Quantidade de dano base",
    effect: "+1 de dano por ponto",
    icon: Swords,
  },
  {
    key: "mana",
    label: "Mana",
    description: "Quantidade de mana base",
    effect: "+4 de mana por ponto",
    icon: Droplets,
  },
  {
    key: "regenmana",
    label: "Regen. de Mana",
    description: "Velocidade que a mana é restaurada",
    effect: "+1 de regeneração de mana por ponto",
    icon: Waves,
  },
];

export const INITIAL_STATS = Object.fromEntries(STATS.map((s) => [s.key, 1]));
