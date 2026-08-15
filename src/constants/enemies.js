import loboEspectral from "../assets/sprites/lobo-espectral.svg";
import esqueletoGuardiao from "../assets/sprites/esqueleto-guardiao.svg";
import cavaleiroCripta from "../assets/sprites/cavaleiro-cripta.svg";
import golemGelo from "../assets/sprites/golem-gelo.svg";
import arpiaGlacial from "../assets/sprites/arpia-glacial.svg";
import senhorGeada from "../assets/sprites/senhor-geada.svg";
import diabreteIgneo from "../assets/sprites/diabrete-igneo.svg";
import brutoMagma from "../assets/sprites/bruto-magma.svg";
import reiDemonio from "../assets/sprites/rei-demonio.svg";

export const ENEMIES = [
  {
    id: "lobo-espectral",
    name: "Lobo Espectral",
    personality: "Rápido e frágil: morde antes de morrer.",
    sprite: loboEspectral,
    hpMult: 0.8,
    atkMult: 1.0,
    defMult: 0.6,
    manaMult: 0.5,
  },
  {
    id: "esqueleto-guardiao",
    name: "Esqueleto Guardião",
    personality: "Lento e ossudo: aguenta muito, bate pouco.",
    sprite: esqueletoGuardiao,
    hpMult: 1.4,
    atkMult: 0.7,
    defMult: 1.0,
    manaMult: 0.5,
  },
  {
    id: "cavaleiro-cripta",
    name: "Cavaleiro da Cripta",
    boss: true,
    personality: "Guardião final do cemitério, armadura forjada em ossos.",
    sprite: cavaleiroCripta,
    hpMult: 2.0,
    atkMult: 1.4,
    defMult: 1.3,
    manaMult: 1.0,
  },
  {
    id: "golem-gelo",
    name: "Golem de Gelo",
    personality: "Muralha viva: defesa alta, passos lentos.",
    sprite: golemGelo,
    hpMult: 1.4,
    atkMult: 0.9,
    defMult: 1.3,
    manaMult: 1.2,
  },
  {
    id: "arpia-glacial",
    name: "Arpia Glacial",
    personality: "Veloz e cortante: difícil de acertar.",
    sprite: arpiaGlacial,
    hpMult: 0.8,
    atkMult: 1.3,
    defMult: 0.8,
    manaMult: 1.3,
  },
  {
    id: "senhor-geada",
    name: "Senhor da Geada",
    boss: true,
    personality: "A fúria do inverno encarnada.",
    sprite: senhorGeada,
    hpMult: 2.1,
    atkMult: 1.5,
    defMult: 1.3,
    manaMult: 1.6,
  },
  {
    id: "diabrete-igneo",
    name: "Diabrete Ígneo",
    personality: "Pequeno e incendiário: muito dano, corpo frágil.",
    sprite: diabreteIgneo,
    hpMult: 0.9,
    atkMult: 1.4,
    defMult: 0.9,
    manaMult: 1.3,
  },
  {
    id: "bruto-magma",
    name: "Bruto de Magma",
    personality: "Colosso lento de pedra e fogo.",
    sprite: brutoMagma,
    hpMult: 1.5,
    atkMult: 1.1,
    defMult: 1.2,
    manaMult: 1.0,
  },
  {
    id: "rei-demonio",
    name: "Rei Demônio",
    boss: true,
    personality: "Senhor da fortaleza, coroa de brasas.",
    sprite: reiDemonio,
    hpMult: 2.0,
    atkMult: 1.6,
    defMult: 1.2,
    manaMult: 1.8,
  },
];

export function getEnemy(id) {
  return ENEMIES.find((e) => e.id === id) || null;
}
