import { getEnemy } from "./enemies.js";

export const BOSS_REWARD_MULT = 3;
export const BOSS_STAT_POINTS = 3;

export const MAPS = [
  {
    id: "campos-sombrios",
    name: "Campos Sombrios",
    tagline: "Cemitério enevoado na fronteira do reino.",
    baseLevel: 1,
    minLevel: 1,
    maxLevel: 4,
    fightsToBoss: 3,
    zoneGoldMult: 1.0,
    zoneXpMult: 2.0,
    enemyPool: ["lobo-espectral", "esqueleto-guardiao"],
    boss: "cavaleiro-cripta",
  },
  {
    id: "floresta-congelada",
    name: "Floresta Congelada",
    tagline: "Bosque tomado por gelo eterno e cristais de neve.",
    baseLevel: 4,
    minLevel: 4,
    maxLevel: 7,
    fightsToBoss: 4,
    zoneGoldMult: 1.8,
    zoneXpMult: 2.2,
    enemyPool: ["golem-gelo", "arpia-glacial"],
    boss: "senhor-geada",
  },
  {
    id: "fortaleza-infernal",
    name: "Fortaleza Infernal",
    tagline: "Cidadela vulcânica sob uma coroa de fogo.",
    baseLevel: 7,
    minLevel: 7,
    maxLevel: 10,
    fightsToBoss: 5,
    zoneGoldMult: 2.6,
    zoneXpMult: 3.0,
    enemyPool: ["diabrete-igneo", "bruto-magma"],
    boss: "rei-demonio",
  },
];

export function getMap(id) {
  return MAPS.find((m) => m.id === id) || null;
}

export function getMapIndex(id) {
  return MAPS.findIndex((m) => m.id === id);
}

export function pickNormalEnemy(map) {
  if (!map || map.enemyPool.length === 0) return null;
  const id = map.enemyPool[Math.floor(Math.random() * map.enemyPool.length)];
  return getEnemy(id);
}

function roundHalfUp(n) {
  return Math.round(n);
}

export function computeEnemyStats(enemy, map, isBoss) {
  const z = map.baseLevel;
  const baseHp = 5 + Math.floor((z - 1) / 2) + Math.floor((z - 1) / 3);
  const baseAtk = 2 + Math.floor((z - 1) / 2);
  const baseDef = 2 + Math.floor((z - 1) / 2);
  const baseMana = 4 + Math.floor((z - 1) / 2) * 2;

  const maxHp = Math.max(1, roundHalfUp(baseHp * enemy.hpMult));
  const atk = Math.max(1, roundHalfUp(baseAtk * enemy.atkMult));
  const def = Math.max(1, roundHalfUp(baseDef * enemy.defMult));
  const mana = Math.max(2, roundHalfUp(baseMana * enemy.manaMult));

  const rewardMult = isBoss ? BOSS_REWARD_MULT : 1;
  const goldBase = roundHalfUp(
    (1 + Math.floor((z - 1) / 2)) * map.zoneGoldMult * rewardMult
  );
  const goldExtra = roundHalfUp(
    (2 + Math.floor((z - 1) / 2)) * map.zoneGoldMult * rewardMult
  );
  const xpBase = roundHalfUp(
    (1 + Math.floor((z - 1) / 3)) * map.zoneXpMult * rewardMult
  );
  const xpExtra = roundHalfUp(
    (2 + Math.floor((z - 1) / 3)) * map.zoneXpMult * rewardMult
  );

  const threatLevel = Math.round(map.baseLevel * (isBoss ? 1.5 : 1));

  return {
    maxHp,
    atk,
    def,
    mana,
    goldBase,
    goldExtra,
    xpBase,
    xpExtra,
    threatLevel,
  };
}
