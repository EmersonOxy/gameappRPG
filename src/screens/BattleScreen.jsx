import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Skull,
  Shield,
  Coins,
  Sparkles,
  Gem,
  X,
  Pause,
  Crown,
  Check,
  Swords,
  Zap,
  Backpack,
  Play,
  Dices,
} from "lucide-react";
import { useGame } from "../context/GameContext.jsx";
import { ITEMS, getItem } from "../constants/items.js";
import { getElement, getElementalMultiplier } from "../constants/elements.js";
import { getEnemySkill, pickEnemyItem } from "../constants/enemySkills.js";
import "./BattleScreen.css";

const FURY_MAX = 5;
const ENEMY_STAMINA_MAX = 10;
const ENEMY_STAMINA_REGEN = 2;
const REGEN_BASE_INTERVAL = 4000;
const MANA_REGEN_BASE_INTERVAL = 8000;
const ATK_COST = 3;
const DEF_COST = 2;
const ENEMY_SPECIAL_MULT = 2;
const DANGER_MIN = 0.02;
const DANGER_MAX = 0.11;
const HEAL_WINDOW = 650;
const MATCH_TIME = 45;
const DEFEAT_XP = 1;
const CRYSTAL_MAX = 5;
const CRYSTAL_REFILL_TURNS = 2;
const DODGE_FACTOR = 0.03;
const DODGE_SPECIAL_FACTOR = 0.5;
const ENEMY_SKILL_CHANCE = 0.35;
const ENEMY_BOSS_SKILL_CHANCE = 0.55;
const ENEMY_ITEM_CHANCE = 0.45;
const ENEMY_ITEM_COOLDOWN = 4;
const ENEMY_ITEM_HP_PCT = 0.35;
const REACTION_CHANCE = 0.45;

const BAR_COLORS = {
  hp: "#e74c3c",
  stamina: "#6fb1ff",
  mana: "#4dd0c1",
  fury: "#e8a33d",
};

const REACTION_LABELS = {
  stunned: "Congelado",
  special: "Fúria cheia!",
  miss: "Errou!",
  dodge: "Esquivou!",
  defend: "Defendeu",
  heal: "Se curou",
  shield: "Criou escudo",
  crit: "Golpe crítico",
  damage: "Levou dano",
  skip: "Sem ação",
};

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="mini-bar">
      <span className="mini-bar-label">{label}</span>
      <div className="mini-bar-track">
        <div
          className="mini-bar-fill"
          style={{ width: pct + "%", background: color }}
        />
      </div>
      <span className="mini-bar-value">
        {Math.round(value)}/{max}
      </span>
    </div>
  );
}

function rollDamage(atk, def) {
  const baseDamage = Math.max(1, atk - def);
  const multiplier = 0.8 + Math.random() * 0.3;
  return baseDamage * multiplier;
}

function rollReward(base, extra) {
  return base + Math.floor(Math.random() * (extra + 1));
}

function rollDie() {
  return 1 + Math.floor(Math.random() * 6);
}

function missChance(luck) {
  return (6 - luck) * 0.05;
}

function dodgeChance(luck, special) {
  const base = luck * DODGE_FACTOR;
  return special ? base * DODGE_SPECIAL_FACTOR : base;
}

function critCurrentTransfer(critDmg) {
  return Math.round(critDmg * (0.01 + Math.random() * 0.09));
}

const LUNGE = 900;
const HOLD = 400;
const RETURN = 900;

export default function BattleScreen() {
  const navigate = useNavigate();
  const {
    addReward,
    playerMaxHp,
    playerAtk,
    playerDef,
    playerStaminaMax,
    playerStaminaRegen,
    playerFuryMult,
    playerMana,
    playerManaRegen,
    equippedSkills,
    itemsOwned,
    useItem,
    getBattleSetup,
    advanceTutorial,
    advanceMap,
    currentMap,
  } = useGame();
  const [battle, setBattle] = useState(() => getBattleSetup());
  const [playerHp, setPlayerHp] = useState(playerMaxHp);
  const [enemyHp, setEnemyHp] = useState(battle.maxHp);
  const [playerFury, setPlayerFury] = useState(0);
  const [enemyFury, setEnemyFury] = useState(0);
  const [playerStamina, setPlayerStamina] = useState(playerStaminaMax);
  const [enemyStamina, setEnemyStamina] = useState(ENEMY_STAMINA_MAX);
  const [playerManaCurrent, setPlayerManaCurrent] = useState(playerMana);
  const [enemyManaCurrent, setEnemyManaCurrent] = useState(battle.mana);
  const [playerMaxHpCurrent, setPlayerMaxHpCurrent] = useState(playerMaxHp);
  const [enemyMaxHpCurrent, setEnemyMaxHpCurrent] = useState(battle.maxHp);
  const [playerShield, setPlayerShield] = useState(0);
  const [enemyShield, setEnemyShield] = useState(0);
  const [enemyStunned, setEnemyStunned] = useState(false);
  const [playerStunned, setPlayerStunned] = useState(false);
  const [enemyStunFlash, setEnemyStunFlash] = useState(false);
  const [playerStunFlash, setPlayerStunFlash] = useState(false);
  const [skillFlash, setSkillFlash] = useState(null);
  const [enemySkillFlash, setEnemySkillFlash] = useState(null);
  const [enemyItemPopup, setEnemyItemPopup] = useState(null);
  const [enemyItemCooldown, setEnemyItemCooldown] = useState(0);
  const [phase, setPhase] = useState("dice");
  const [playerMoving, setPlayerMoving] = useState(false);
  const [enemyMoving, setEnemyMoving] = useState(false);
  const [playerBlocking, setPlayerBlocking] = useState(false);
  const [enemyBlocking, setEnemyBlocking] = useState(false);
  const [playerMissed, setPlayerMissed] = useState(false);
  const [enemyMissed, setEnemyMissed] = useState(false);
  const [playerDodged, setPlayerDodged] = useState(false);
  const [enemyDodged, setEnemyDodged] = useState(false);
  const [playerCrit, setPlayerCrit] = useState(false);
  const [enemyCrit, setEnemyCrit] = useState(false);
  const [playerHit, setPlayerHit] = useState(0);
  const [enemyHit, setEnemyHit] = useState(0);
  const [playerLuck, setPlayerLuck] = useState(null);
  const [enemyLuck, setEnemyLuck] = useState(null);
  const [dieValue, setDieValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [rolled, setRolled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MATCH_TIME);
  const [defeatReason, setDefeatReason] = useState("defeated");
  const [reward, setReward] = useState({ gold: 0, xp: 0 });
  const [leveledUp, setLeveledUp] = useState(false);
  const [crystals, setCrystals] = useState(CRYSTAL_MAX);
  const [turnCount, setTurnCount] = useState(0);
  const [pendingItems, setPendingItems] = useState([]);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [itemPopup, setItemPopup] = useState(null);
  const [battleId, setBattleId] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hintState, setHintState] = useState("show");
  const [enemyReaction, setEnemyReaction] = useState(null);

  const staminaRegenMs = REGEN_BASE_INTERVAL / playerStaminaRegen;
  const enemyStaminaRegenMs = REGEN_BASE_INTERVAL / ENEMY_STAMINA_REGEN;
  const manaRegenMs = MANA_REGEN_BASE_INTERVAL / playerManaRegen;
  const enemyManaRegenMs = MANA_REGEN_BASE_INTERVAL;

  const [staminaProgress, setStaminaProgress] = useState(0);
  const [enemyStaminaProgress, setEnemyStaminaProgress] = useState(0);
  const [manaProgress, setManaProgress] = useState(0);
  const [enemyManaProgress, setEnemyManaProgress] = useState(0);

  function handleRoll() {
    if (phase !== "dice" || rolling) return;
    const result = rollDie();
    setDieValue(result);
    setPlayerLuck(result);
    setEnemyLuck(rollDie());
    setRolling(true);
    setRolled(false);
    setTimeout(() => {
      setRolling(false);
      setRolled(true);
    }, 2400);
  }

  function chooseEnemyAction(stunned) {
    if (stunned) return { action: "stunned", skill: null, item: null };
    if (enemyFury >= FURY_MAX) {
      return { action: "special", skill: null, item: null };
    }
    const canAttack = enemyStamina >= ATK_COST;
    const canDefend = enemyStamina >= DEF_COST;
    const hpPct = enemyMaxHpCurrent > 0 ? enemyHp / enemyMaxHpCurrent : 1;
    const enemySkills = (battle.enemy.skills || [])
      .map(getEnemySkill)
      .filter(Boolean);
    const affordableSkills = enemySkills.filter(
      (s) => enemyManaCurrent >= s.manaCost
    );

    if (
      battle.enemy.canUseItems &&
      enemyItemCooldown <= 0 &&
      hpPct < ENEMY_ITEM_HP_PCT &&
      Math.random() < ENEMY_ITEM_CHANCE
    ) {
      return { action: "item", skill: null, item: pickEnemyItem() };
    }

    if (affordableSkills.length > 0) {
      const skillChance = battle.isBoss
        ? ENEMY_BOSS_SKILL_CHANCE
        : ENEMY_SKILL_CHANCE;
      if (Math.random() < skillChance) {
        const defensive = affordableSkills.filter(
          (s) =>
            s.effect.type === "shield" || s.effect.type === "heal"
        );
        const offensive = affordableSkills.filter(
          (s) =>
            s.effect.type !== "shield" && s.effect.type !== "heal"
        );
        const pool =
          hpPct < 0.4 && defensive.length > 0
            ? defensive
            : offensive.length > 0
            ? offensive
            : affordableSkills;
        const skill = pool[Math.floor(Math.random() * pool.length)];
        return { action: "skill", skill, item: null };
      }
    }

    if (canAttack && canDefend) {
      return {
        action: Math.random() < 0.3 ? "defend" : "attack",
        skill: null,
        item: null,
      };
    }
    if (canAttack) return { action: "attack", skill: null, item: null };
    if (canDefend) return { action: "defend", skill: null, item: null };
    return { action: "skip", skill: null, item: null };
  }

  function resolveTurn(playerActionIn, skill) {
    let playerAction = playerActionIn;
    const stunned = enemyStunned;
    const playerStunnedNow = playerStunned;
    if (playerStunnedNow) {
      playerAction = "skip";
      setPlayerStunned(false);
    }
    const enemyAction = chooseEnemyAction(stunned);
    setPhase("resolve");
    if (stunned) setEnemyStunned(false);
    const enemySkill =
      enemyAction.action === "skill" ? enemyAction.skill : null;
    const enemyItem = enemyAction.action === "item" ? enemyAction.item : null;
    const playerAttacks =
      playerAction === "attack" ||
      playerAction === "special" ||
      playerAction === "skill";
    const enemyAttacks =
      enemyAction.action === "attack" ||
      enemyAction.action === "special" ||
      (enemySkill && enemySkill.effect.type === "damage");
    setPlayerMoving(playerAttacks);
    setEnemyMoving(enemyAttacks);
    setEnemyStunFlash(enemyAction.action === "stunned");

    const delay = playerAttacks || enemyAttacks ? LUNGE : 300;

    setTimeout(() => {
      let playerDmg = 0;
      let enemyDmg = 0;
      let playerCritDmg = 0;
      let enemyCritDmg = 0;
      let playerMiss = false;
      let enemyMiss = false;
      let playerDodge = false;
      let enemyDodge = false;
      let skillMiss = false;
      let skillHeal = 0;
      let skillShield = 0;
      let skillStun = false;
      let skillDrainStamina = 0;
      let skillDrainFury = 0;
      let enemyHealGain = 0;
      let enemyShieldGain = 0;
      let enemySkillStunPlayer = false;
      let enemyDrainPlayerStamina = 0;
      let enemyFuryGain = 0;
      const playerSpecial = playerAction === "special";
      const enemySpecial = enemyAction.action === "special";

      if (skill) {
        const fx = skill.effect;
        if (fx.type === "damage") {
          if (Math.random() < missChance(playerLuck)) {
            skillMiss = true;
          } else if (Math.random() < dodgeChance(enemyLuck, false)) {
            enemyDodge = true;
          } else {
            let d =
              rollDamage(playerAtk, battle.def) *
              fx.mult *
              getElementalMultiplier(skill.element, battle.enemy.element);
            if (enemyAction.action === "defend") d = d / 2;
            enemyDmg = d;
          }
          if (fx.drainStamina) skillDrainStamina = fx.drainStamina;
          if (fx.drainFury) skillDrainFury = fx.drainFury;
          if (fx.stun) skillStun = true;
        } else if (fx.type === "heal") {
          skillHeal = fx.full
            ? playerMaxHpCurrent
            : fx.base + Math.floor(playerMaxHp * fx.pct);
        } else if (fx.type === "shield") {
          skillShield = fx.base + Math.floor(playerDef * fx.defFactor);
          if (fx.healFlat) skillHeal = fx.healFlat;
        } else if (fx.type === "stun") {
          skillStun = true;
        }
      }

      if (playerAction === "attack") {
        if (Math.random() < missChance(playerLuck)) {
          playerMiss = true;
        } else if (Math.random() < dodgeChance(enemyLuck, false)) {
          enemyDodge = true;
        } else {
          let d = rollDamage(playerAtk, battle.def);
          if (enemyAction.action === "defend") d = d / 2;
          enemyDmg = d;
        }
      } else if (playerSpecial) {
        if (Math.random() < dodgeChance(enemyLuck, true)) {
          enemyDodge = true;
        } else {
          let d = rollDamage(playerAtk, battle.def) * playerFuryMult;
          if (enemyAction.action === "defend") d = d / 2;
          enemyCritDmg = d;
        }
      }

      if (enemySkill) {
        const fx = enemySkill.effect;
        if (fx.type === "damage") {
          if (Math.random() < missChance(enemyLuck)) {
            enemyMiss = true;
          } else if (Math.random() < dodgeChance(playerLuck, false)) {
            playerDodge = true;
          } else {
            let d = rollDamage(battle.atk, playerDef) * fx.mult;
            if (playerAction === "defend") d = d / 2;
            playerDmg = d;
          }
        } else if (fx.type === "shield") {
          enemyShieldGain = fx.base + Math.floor(battle.def * fx.defFactor);
        } else if (fx.type === "heal") {
          enemyHealGain = fx.base + Math.floor(enemyMaxHpCurrent * fx.pct);
        } else if (fx.type === "stun") {
          enemySkillStunPlayer = true;
        }
        if (fx.drainStamina) enemyDrainPlayerStamina = fx.drainStamina;
      } else if (enemyItem) {
        const fx = enemyItem.effect;
        if (fx.type === "heal") {
          enemyHealGain = Math.floor(enemyMaxHpCurrent * fx.pct);
        } else if (fx.type === "shield") {
          enemyShieldGain = fx.amount;
        } else if (fx.type === "fury") {
          enemyFuryGain = fx.amount;
        }
      }

      if (enemyAction.action === "attack") {
        if (Math.random() < missChance(enemyLuck)) {
          enemyMiss = true;
        } else if (Math.random() < dodgeChance(playerLuck, false)) {
          playerDodge = true;
        } else {
          let d = rollDamage(battle.atk, playerDef);
          if (playerAction === "defend") d = d / 2;
          playerDmg = d;
        }
      } else if (enemySpecial) {
        if (Math.random() < dodgeChance(playerLuck, true)) {
          playerDodge = true;
        } else {
          let d = rollDamage(battle.atk, playerDef) * ENEMY_SPECIAL_MULT;
          if (playerAction === "defend") d = d / 2;
          playerCritDmg = d;
        }
      }

      let shieldLeft = playerShield;
      if (skill && skill.effect.type === "shield") shieldLeft = skillShield;
      if (playerDmg > 0 && shieldLeft > 0) {
        const absorbed = Math.min(shieldLeft, playerDmg);
        playerDmg -= absorbed;
        shieldLeft -= absorbed;
      }
      setPlayerShield(shieldLeft);

      let enemyShieldTotal = enemyShield + enemyShieldGain;
      if (enemyDmg > 0 && enemyShieldTotal > 0) {
        const absorbed = Math.min(enemyShieldTotal, enemyDmg);
        enemyDmg -= absorbed;
        enemyShieldTotal -= absorbed;
      }
      setEnemyShield(enemyShieldTotal);

      const newPlayerMaxHp = Math.max(1, playerMaxHpCurrent - playerCritDmg);
      const newEnemyMaxHp = Math.max(1, enemyMaxHpCurrent - enemyCritDmg);

      let playerCritCurrentDmg = 0;
      if (playerCritDmg > 0 && playerHp < newPlayerMaxHp) {
        const ratio = playerMaxHpCurrent > 0 ? playerHp / playerMaxHpCurrent : 0;
        if (ratio >= DANGER_MIN && ratio <= DANGER_MAX) {
          playerCritCurrentDmg = critCurrentTransfer(playerCritDmg);
        }
      }
      let enemyCritCurrentDmg = 0;
      if (enemyCritDmg > 0 && enemyHp < newEnemyMaxHp) {
        const ratio = enemyMaxHpCurrent > 0 ? enemyHp / enemyMaxHpCurrent : 0;
        if (ratio >= DANGER_MIN && ratio <= DANGER_MAX) {
          enemyCritCurrentDmg = critCurrentTransfer(enemyCritDmg);
        }
      }

      const newEnemyHp = Math.max(
        0,
        Math.min(newEnemyMaxHp, enemyHp + enemyHealGain) -
          enemyDmg -
          enemyCritCurrentDmg
      );
      const newPlayerHp = Math.max(
        0,
        Math.min(newPlayerMaxHp, playerHp + skillHeal) -
          playerDmg -
          playerCritCurrentDmg
      );

      setPlayerMaxHpCurrent(newPlayerMaxHp);
      setEnemyMaxHpCurrent(newEnemyMaxHp);
      setEnemyHp(newEnemyHp);
      if (enemyDmg > 0 || enemyCritDmg > 0) setEnemyHit(Date.now());

      const playerDamageTotal = playerDmg + playerCritCurrentDmg;
      if (skillHeal > 0) {
        const healedHp = Math.min(newPlayerMaxHp, playerHp + skillHeal);
        setPlayerHp(healedHp);
        if (playerDamageTotal > 0) {
          setTimeout(() => {
            setPlayerHp(newPlayerHp);
            setPlayerHit(Date.now());
          }, HEAL_WINDOW);
        }
      } else {
        setPlayerHp(newPlayerHp);
        if (playerDamageTotal > 0) setPlayerHit(Date.now());
      }

      const newPlayerFury = playerSpecial
        ? 0
        : Math.min(
            FURY_MAX,
            playerFury + (playerDmg > 0 || playerCritDmg > 0 ? 1 : 0)
          );
      let newEnemyFury = enemySpecial
        ? 0
        : Math.min(
            FURY_MAX,
            Math.max(
              0,
              enemyFury +
                (enemyDmg > 0 || enemyCritDmg > 0 ? 1 : 0) -
                skillDrainFury
            )
          );
      if (enemyFuryGain > 0) {
        newEnemyFury = Math.min(FURY_MAX, newEnemyFury + enemyFuryGain);
      }
      setPlayerFury(newPlayerFury);
      setEnemyFury(newEnemyFury);

      const playerCost =
        playerAction === "attack"
          ? ATK_COST
          : playerAction === "defend"
          ? DEF_COST
          : 0;
      const enemyCost =
        enemyAction.action === "attack"
          ? ATK_COST
          : enemyAction.action === "defend"
          ? DEF_COST
          : 0;
      setPlayerStamina((s) =>
        Math.max(0, s - playerCost - enemyDrainPlayerStamina)
      );
      setEnemyStamina((s) =>
        Math.max(0, s - enemyCost - skillDrainStamina)
      );

      if (skill) {
        setPlayerManaCurrent(Math.max(0, playerManaCurrent - skill.manaCost));
      }
      if (enemySkill) {
        setEnemyManaCurrent((m) => Math.max(0, m - enemySkill.manaCost));
      }

      setPlayerBlocking(playerAction === "defend");
      setEnemyBlocking(enemyAction.action === "defend");
      setPlayerMissed(playerMiss || skillMiss);
      setEnemyMissed(enemyMiss);
      setPlayerDodged(playerDodge);
      setEnemyDodged(enemyDodge);
      setPlayerCrit(enemySpecial);
      setEnemyCrit(playerSpecial);
      setSkillFlash(skill && !skillMiss && !enemyDodge ? skill : null);
      setEnemySkillFlash(
        enemySkill && !enemyMiss && !playerDodge ? enemySkill : null
      );
      if (skillStun) setEnemyStunned(true);
      if (enemySkillStunPlayer) {
        setPlayerStunned(true);
        setPlayerStunFlash(true);
      }
      if (enemyItem) {
        const fx = enemyItem.effect;
        let text = "";
        if (fx.type === "heal") text = `+${enemyHealGain} de vida`;
        else if (fx.type === "shield") text = `+${fx.amount} de escudo`;
        else if (fx.type === "fury") text = `+${fx.amount} de fúria`;
        setEnemyItemPopup({ name: enemyItem.name, text });
      }

      let reaction = null;
      if (enemyAction.action === "stunned") reaction = "stunned";
      else if (enemyAction.action === "special" || enemyFuryGain > 0) {
        reaction = "special";
      } else if (playerMiss || skillMiss) reaction = "miss";
      else if (enemyDodge) reaction = "dodge";
      else if (enemyAction.action === "defend") reaction = "defend";
      else if (enemyHealGain > 0) reaction = "heal";
      else if (enemyShieldGain > 0) reaction = "shield";
      else if (enemyCritDmg > 0) reaction = "crit";
      else if (enemyDmg > 0) reaction = "damage";
      else if (enemyAction.action === "skip") reaction = "skip";
      if (reaction && Math.random() < REACTION_CHANCE) {
        setEnemyReaction({
          label: REACTION_LABELS[reaction],
          id: Date.now(),
        });
      }

      setTimeout(() => {
        setPlayerBlocking(false);
        setEnemyBlocking(false);
        setPlayerMissed(false);
        setEnemyMissed(false);
        setPlayerDodged(false);
        setEnemyDodged(false);
        setPlayerCrit(false);
        setEnemyCrit(false);
        setPlayerMoving(false);
        setEnemyMoving(false);
        setEnemyStunFlash(false);
        setPlayerStunFlash(false);
        setSkillFlash(null);
        setEnemySkillFlash(null);

        setTimeout(() => {
          const nextTurn = turnCount + 1;
          setTurnCount(nextTurn);
          if (nextTurn > 0 && nextTurn % CRYSTAL_REFILL_TURNS === 0) {
            setCrystals(CRYSTAL_MAX);
          }
          if (enemyAction.action === "item") {
            setEnemyItemCooldown(ENEMY_ITEM_COOLDOWN);
          } else {
            setEnemyItemCooldown((c) => Math.max(0, c - 1));
          }

          let eHp = newEnemyHp;
          let pHp = newPlayerHp;
          let popup = null;

          const due = pendingItems.filter((p) => p.activatesAtTurn <= nextTurn);
          const remaining = pendingItems.filter(
            (p) => p.activatesAtTurn > nextTurn
          );
          setPendingItems(remaining);

          due.forEach((p) => {
            const item = getItem(p.itemId);
            if (!item) return;
            const fx = item.effect;
            let text = "";
            if (fx.type === "damage") {
              const dmg = fx.base + Math.floor(battle.threatLevel / 2);
              eHp = Math.max(0, eHp - dmg);
              text = `${dmg} de dano`;
            } else if (fx.type === "heal") {
              const heal = Math.floor(playerMaxHp * fx.pct);
              pHp = Math.min(playerMaxHpRef.current, pHp + heal);
              text = `+${heal} de vida`;
            } else if (fx.type === "mana") {
              setPlayerManaCurrent((m) => Math.min(playerMana, m + fx.amount));
              text = `+${fx.amount} de mana`;
            } else if (fx.type === "stamina") {
              setPlayerStamina((s) => Math.min(playerStaminaMax, s + fx.amount));
              text = `+${fx.amount} de estamina`;
            } else if (fx.type === "fury") {
              setPlayerFury((f) => Math.min(FURY_MAX, f + fx.amount));
              text = `+${fx.amount} de fúria`;
            } else if (fx.type === "shield") {
              setPlayerShield((sh) => sh + fx.amount);
              text = `+${fx.amount} de escudo`;
            }
            popup = {
              name: item.name,
              icon: item.icon,
              branch: item.branch,
              text,
            };
          });

          if (popup) setItemPopup(popup);
          setEnemyHp(eHp);
          setPlayerHp(pHp);

          if (eHp <= 0) {
            const goldGain = rollReward(battle.goldBase, battle.goldExtra);
            const xpGain = rollReward(battle.xpBase, battle.xpExtra);
            const gained = addReward(goldGain, xpGain);
            let advance;
            if (battle.isTutorial) {
              advanceTutorial();
              if (battle.enemy.tipMechanic === "victory") completeHint();
            } else {
              advance = advanceMap(battle.isBoss);
            }
            setReward({
              gold: goldGain,
              xp: xpGain,
              boss: battle.isBoss,
              firstClear: advance ? advance.firstClear : false,
            });
            setLeveledUp(gained > 0);
            setPhase("victory");
          } else if (pHp <= 0) {
            setDefeatReason("defeated");
            const gained = addReward(0, DEFEAT_XP);
            setReward({ gold: 0, xp: DEFEAT_XP });
            setLeveledUp(gained > 0);
            setPhase("defeat");
          } else {
            setPhase("player");
          }
        }, RETURN);
      }, HOLD);
    }, delay);
  }

  function handleAction(action, skill) {
    if (phase !== "player") return;
    if (playerStunned) return;
    if (action === "attack" && playerStamina < ATK_COST) return;
    if (action === "defend" && playerStamina < DEF_COST) return;
    if (action === "special" && playerFury < FURY_MAX) return;
    if (action === "skill" && (!skill || playerManaCurrent < skill.manaCost)) {
      return;
    }
    if (battle.isTutorial && battle.enemy.tipMechanic === action) {
      completeHint();
    }
    resolveTurn(action, skill);
  }

  function completeHint() {
    setHintState((s) => (s === "show" ? "done" : s));
  }

  useEffect(() => {
    if (hintState !== "done") return;
    const t = setTimeout(() => setHintState("gone"), 950);
    return () => clearTimeout(t);
  }, [hintState]);

  function useItemAction(item) {
    if (phase !== "player") return;
    if (!item) return;
    if (crystals < item.crystalCost) return;
    if ((itemsOwned[item.id] || 0) <= 0) return;
    const res = useItem(item.id);
    if (!res.ok) return;
    setCrystals((c) => c - item.crystalCost);
    setPendingItems((p) => [
      ...p,
      {
        itemId: item.id,
        name: item.name,
        icon: item.icon,
        branch: item.branch,
        activatesAtTurn: turnCount + item.delay,
      },
    ]);
    setInventoryOpen(false);
  }

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const playerMaxHpRef = useRef(playerMaxHpCurrent);
  playerMaxHpRef.current = playerMaxHpCurrent;

  useEffect(() => {
    if (!itemPopup) return;
    const t = setTimeout(() => setItemPopup(null), 1800);
    return () => clearTimeout(t);
  }, [itemPopup]);

  useEffect(() => {
    if (!enemyItemPopup) return;
    const t = setTimeout(() => setEnemyItemPopup(null), 1800);
    return () => clearTimeout(t);
  }, [enemyItemPopup]);

  useEffect(() => {
    if (!enemyReaction) return;
    const t = setTimeout(() => setEnemyReaction(null), 1500);
    return () => clearTimeout(t);
  }, [enemyReaction]);

  useEffect(() => {
    const progress = { stamina: 0, enemy: 0, mana: 0, enemyMana: 0 };
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const dt = Math.min((now - last) / 1000, 1);
      last = now;

      if (pausedRef.current) return;

      const p = phaseRef.current;
      if (p === "player" || p === "resolve") {
        setTimeLeft((t) => Math.max(0, t - dt));
      }

      progress.stamina += (dt * 1000) / staminaRegenMs;
      let staminaAdd = 0;
      while (progress.stamina >= 1) {
        progress.stamina -= 1;
        staminaAdd += 1;
      }
      if (staminaAdd > 0) {
        setPlayerStamina((s) => Math.min(playerStaminaMax, s + staminaAdd));
      }
      setStaminaProgress(Math.min(1, progress.stamina));

      progress.enemy += (dt * 1000) / enemyStaminaRegenMs;
      let enemyAdd = 0;
      while (progress.enemy >= 1) {
        progress.enemy -= 1;
        enemyAdd += 1;
      }
      if (enemyAdd > 0) {
        setEnemyStamina((s) => Math.min(ENEMY_STAMINA_MAX, s + enemyAdd));
      }
      setEnemyStaminaProgress(Math.min(1, progress.enemy));

      progress.mana += (dt * 1000) / manaRegenMs;
      let manaAdd = 0;
      while (progress.mana >= 1) {
        progress.mana -= 1;
        manaAdd += 1;
      }
      if (manaAdd > 0) {
        setPlayerManaCurrent((m) => Math.min(playerMana, m + manaAdd));
      }
      setManaProgress(Math.min(1, progress.mana));

      progress.enemyMana += (dt * 1000) / enemyManaRegenMs;
      let enemyManaAdd = 0;
      while (progress.enemyMana >= 1) {
        progress.enemyMana -= 1;
        enemyManaAdd += 1;
      }
      if (enemyManaAdd > 0) {
        setEnemyManaCurrent((m) => Math.min(battle.mana, m + enemyManaAdd));
      }
      setEnemyManaProgress(Math.min(1, progress.enemyMana));
    }, 100);
    return () => clearInterval(id);
  }, [
    staminaRegenMs,
    enemyStaminaRegenMs,
    manaRegenMs,
    enemyManaRegenMs,
    playerStaminaMax,
    playerMana,
    battle.mana,
  ]);

  useEffect(() => {
    if (phase === "player" && timeLeft <= 0) {
      setDefeatReason("timeout");
      const gained = addReward(0, DEFEAT_XP);
      setReward({ gold: 0, xp: DEFEAT_XP });
      setLeveledUp(gained > 0);
      setPhase("defeat");
    }
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase !== "player" || paused) return;
    const canAttack = playerStamina >= ATK_COST;
    const canDefend = playerStamina >= DEF_COST;
    const canSpecial = playerFury >= FURY_MAX;
    const canSkill = equippedSkills.some(
      (s) => playerManaCurrent >= s.manaCost
    );
    if (
      playerStunned ||
      (!canAttack && !canDefend && !canSpecial && !canSkill)
    ) {
      const t = setTimeout(() => resolveTurn("skip"), 800);
      return () => clearTimeout(t);
    }
  }, [
    phase,
    paused,
    playerStunned,
    playerStamina,
    playerFury,
    playerManaCurrent,
    equippedSkills,
  ]);

  function nextBattle() {
    const next = getBattleSetup();
    setBattle(next);
    setBattleId((b) => b + 1);
    setPlayerHit(0);
    setEnemyHit(0);
    setPlayerHp(playerMaxHp);
    setEnemyHp(next.maxHp);
    setPlayerMaxHpCurrent(playerMaxHp);
    setEnemyMaxHpCurrent(next.maxHp);
    setPlayerFury(0);
    setEnemyFury(0);
    setPlayerStamina(playerStaminaMax);
    setEnemyStamina(ENEMY_STAMINA_MAX);
    setPlayerManaCurrent(playerMana);
    setEnemyManaCurrent(next.mana);
    setStaminaProgress(0);
    setEnemyStaminaProgress(0);
    setManaProgress(0);
    setEnemyManaProgress(0);
    setCrystals(CRYSTAL_MAX);
    setTurnCount(0);
    setPendingItems([]);
    setInventoryOpen(false);
    setItemPopup(null);
    setEnemyItemPopup(null);
    setPlayerShield(0);
    setEnemyShield(0);
    setEnemyStunned(false);
    setPlayerStunned(false);
    setEnemyStunFlash(false);
    setPlayerStunFlash(false);
    setSkillFlash(null);
    setEnemySkillFlash(null);
    setEnemyItemCooldown(0);
    setEnemyReaction(null);
    setPlayerMoving(false);
    setEnemyMoving(false);
    setPlayerBlocking(false);
    setEnemyBlocking(false);
    setPlayerMissed(false);
    setEnemyMissed(false);
    setPlayerDodged(false);
    setEnemyDodged(false);
    setPlayerCrit(false);
    setEnemyCrit(false);
    setRolled(false);
    setRolling(false);
    setDieValue(1);
    setPlayerLuck(null);
    setEnemyLuck(null);
    setTimeLeft(MATCH_TIME);
    setDefeatReason("defeated");
    setReward({ gold: 0, xp: 0, boss: false, firstClear: false });
    setLeveledUp(false);
    setPhase("dice");
    setHintState("show");
  }

  function surrender() {
    setPaused(false);
    setDefeatReason("surrender");
    const gained = addReward(0, DEFEAT_XP);
    setReward({ gold: 0, xp: DEFEAT_XP });
    setLeveledUp(gained > 0);
    setPhase("defeat");
  }

  const disabled = phase !== "player" || playerStunned;
  const canAttack = playerStamina >= ATK_COST;
  const canDefend = playerStamina >= DEF_COST;
  const canSpecial = playerFury >= FURY_MAX;
  const timePct = (timeLeft / MATCH_TIME) * 100;
  const PopupIcon = itemPopup ? itemPopup.icon : null;
  const EnemyElement = getElement(battle.enemy.element);
  const EnemyElementIcon = EnemyElement.icon;

  return (
    <div className="battle-screen">
      <div className="timer-wrap">
        <div
          className={"timer-fill" + (timePct <= 20 ? " danger" : "")}
          style={{ width: timePct + "%" }}
        />
      </div>
      <div className="battle-divider" />

      {battle.isTutorial && hintState !== "gone" && !paused && phase !== "defeat" && (
        <div className={"hint-box" + (hintState === "done" ? " done" : "")}>
          <span className="hint-check">
            <Check size={13} />
          </span>
          <span className="hint-text">{battle.enemy.tip}</span>
          <button
            type="button"
            onClick={() => setHintState("gone")}
            aria-label="Fechar dica"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {(phase === "dice" || phase === "player") && !paused && (
        <button
          type="button"
          className="pause-btn"
          onClick={() => setPaused(true)}
          aria-label="Pausar batalha"
        >
          <Pause size={18} />
        </button>
      )}

      {paused && (
        <div className="pause-overlay">
          <div className="pause-card">
            <div className="pause-icon">
              <Pause size={26} />
            </div>
            <h2 className="pause-title">Pausa</h2>
            <p className="pause-sub">A batalha está pausada</p>
            <div className="pause-actions">
              <button
                type="button"
                onClick={() => setPaused(false)}
                aria-label="Continuar"
              >
                <Play size={18} /> Continuar
              </button>
              <button
                type="button"
                onClick={surrender}
                aria-label="Sair (derrota)"
              >
                <X size={18} /> Sair (derrota)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enemy HUD — vida, estamina, mana e fúria em barras simples */}
      <div className="battle-hud enemy">
        <MiniBar
          label="Vida"
          value={enemyHp}
          max={enemyMaxHpCurrent}
          color={BAR_COLORS.hp}
        />
        <MiniBar
          label="Estamina"
          value={enemyStamina}
          max={ENEMY_STAMINA_MAX}
          color={BAR_COLORS.stamina}
        />
        <MiniBar
          label="Mana"
          value={enemyManaCurrent}
          max={battle.mana}
          color={BAR_COLORS.mana}
        />
        <MiniBar
          label="Fúria"
          value={enemyFury}
          max={FURY_MAX}
          color={BAR_COLORS.fury}
        />
        {enemyShield > 0 && (
          <span className="hud-shield">
            <Shield size={12} /> Escudo {Math.ceil(enemyShield)}
          </span>
        )}
      </div>

      <div className={"enemy-wrap" + (enemyMoving ? " attacking" : "")}>
        <div className={"threat-badge" + (battle.isBoss ? " boss" : "")}>
          {battle.isBoss && <Crown size={11} />}
          {battle.isBoss ? "Chefe · " : ""}Ameaça Nível {battle.threatLevel}
        </div>
        <div className="sprite enemy-sprite">
          {enemyShield > 0 && (
            <div className="shield-badge">
              <Shield size={13} />
              {Math.ceil(enemyShield)}
            </div>
          )}
          {enemyBlocking && (
            <div className="block-flash">
              <Shield size={52} />
            </div>
          )}
          {enemyMissed && <div className="miss-flash left">Errou!</div>}
          {enemyDodged && <div className="dodge-flash left">Esquivou!</div>}
          {enemyCrit && <div className="crit-flash left">Crítico!</div>}
          {enemyStunFlash && <div className="stun-flash left">Congelado!</div>}
          {skillFlash && (
            <div
              className={"skill-flash left branch-" + skillFlash.branch}
            >
              {skillFlash.name}!
            </div>
          )}
          {enemySkillFlash && (
            <div
              className={"skill-flash left element-" + enemySkillFlash.element}
            >
              {enemySkillFlash.name}!
            </div>
          )}
          {enemyReaction && (
            <div className="enemy-reaction" key={enemyReaction.id}>
              {enemyReaction.label}
            </div>
          )}
        </div>
        <div className="enemy-name-row">
          <div className="enemy-name">{battle.enemy.name}</div>
          <span className={"enemy-element element-" + battle.enemy.element}>
            <EnemyElementIcon size={11} /> {EnemyElement.label}
          </span>
          {enemyLuck && <span className="enemy-luck">Sorte {enemyLuck}</span>}
        </div>
        {enemyItemPopup && (
          <div className="enemy-item-popup">
            <span className="enemy-item-popup-name">{enemyItemPopup.name}</span>
            <span className="enemy-item-popup-effect">
              {enemyItemPopup.text}
            </span>
          </div>
        )}
      </div>

      <div
        className={"player-sprite-holder" + (playerMoving ? " attacking" : "")}
      >
        <div className="sprite player-sprite">
          {playerShield > 0 && (
            <div className="shield-badge">
              <Shield size={13} />
              {Math.ceil(playerShield)}
            </div>
          )}
          {playerBlocking && (
            <div className="block-flash">
              <Shield size={52} />
            </div>
          )}
          {playerMissed && <div className="miss-flash right">Errou!</div>}
          {playerDodged && <div className="dodge-flash right">Esquivou!</div>}
          {playerCrit && <div className="crit-flash right">Crítico!</div>}
          {playerStunFlash && <div className="stun-flash right">Congelado!</div>}
        </div>
      </div>

      {/* Player HUD — vida, estamina, mana e fúria em barras simples */}
      <div className="battle-hud player">
        <MiniBar
          label="Vida"
          value={playerHp}
          max={playerMaxHpCurrent}
          color={BAR_COLORS.hp}
        />
        <MiniBar
          label="Estamina"
          value={playerStamina}
          max={playerStaminaMax}
          color={BAR_COLORS.stamina}
        />
        <MiniBar
          label="Mana"
          value={playerManaCurrent}
          max={playerMana}
          color={BAR_COLORS.mana}
        />
        <MiniBar
          label="Fúria"
          value={playerFury}
          max={FURY_MAX}
          color={BAR_COLORS.fury}
        />
        {playerShield > 0 && (
          <span className="hud-shield">
            <Shield size={12} /> Escudo {Math.ceil(playerShield)}
          </span>
        )}
      </div>

      <div className="player-wrap">
        {equippedSkills.length > 0 ? (
          <div className="battle-skills">
            {equippedSkills.map((skill) => {
              const SkillIcon = skill.icon;
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => handleAction("skill", skill)}
                  disabled={disabled || playerManaCurrent < skill.manaCost}
                  aria-label={skill.name}
                >
                  {SkillIcon && <SkillIcon size={18} />}
                  {skill.name}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="battle-skills">
            <button
              type="button"
              disabled
              aria-label="Nenhuma habilidade"
            >
              Nenhuma habilidade
            </button>
          </div>
        )}
        <div className="battle-actions">
          <button
            type="button"
            onClick={() => handleAction("attack")}
            disabled={disabled || !canAttack}
            aria-label="Atacar"
          >
            <Swords size={18} /> Atacar
          </button>
          <button
            type="button"
            onClick={() => handleAction("defend")}
            disabled={disabled || !canDefend}
            aria-label="Defender"
          >
            <Shield size={18} /> Defender
          </button>
          <button
            type="button"
            onClick={() => handleAction("special")}
            disabled={disabled || !canSpecial}
            aria-label="Especial"
          >
            <Zap size={18} /> Especial
          </button>
          <button
            type="button"
            onClick={() => setInventoryOpen(true)}
            disabled={disabled}
            aria-label="Mochila"
          >
            <Backpack size={18} /> Mochila
          </button>
        </div>
      </div>

      {pendingItems.length > 0 && (
        <div className="pending-items">
          {pendingItems.map((p, i) => {
            const PIcon = p.icon;
            const turns = Math.max(0, p.activatesAtTurn - turnCount);
            return (
              <div className={"pending-chip branch-" + p.branch} key={i}>
                <PIcon size={13} />
                <span className="pending-name">{p.name}</span>
                <span className="pending-count">{turns}</span>
              </div>
            );
          })}
        </div>
      )}

      {itemPopup && PopupIcon && (
        <div className={"item-popup branch-" + itemPopup.branch}>
          <PopupIcon size={22} />
          <div className="item-popup-text">
            <span className="item-popup-name">{itemPopup.name}</span>
            <span className="item-popup-effect">{itemPopup.text}</span>
          </div>
        </div>
      )}

      {inventoryOpen && (
        <div className="bag-overlay">
          <div className="bag-panel">
            <div className="bag-head">
              <h3 className="bag-title">Mochila</h3>
              <button
                type="button"
                onClick={() => setInventoryOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="bag-crystals-row">
              <div className="crystal-pips">
                {Array.from({ length: CRYSTAL_MAX }).map((_, i) => (
                  <Gem
                    key={i}
                    size={16}
                    className={"pip" + (i < crystals ? " full" : "")}
                  />
                ))}
              </div>
              <span className="bag-crystals-note">recarrega a cada 2 turnos</span>
            </div>

            <div className="bag-list">
              {ITEMS.map((item) => {
                const qty = itemsOwned[item.id] || 0;
                if (qty <= 0) return null;
                const canUse = crystals >= item.crystalCost;
                const ItemIcon = item.icon;
                return (
                  <div className={"bag-item branch-" + item.branch} key={item.id}>
                    <div className="bag-item-icon">
                      <ItemIcon size={20} />
                    </div>
                    <div className="bag-item-info">
                      <span className="bag-item-name">
                        {item.name} <span className="bag-qty">x{qty}</span>
                      </span>
                      <span className="bag-item-desc">{item.description}</span>
                      <span className="bag-item-delay">
                        ativa em {item.delay} turno{item.delay > 1 ? "s" : ""}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => useItemAction(item)}
                      disabled={!canUse}
                    >
                      <Gem size={12} /> {item.crystalCost}
                    </button>
                  </div>
                );
              })}
              {ITEMS.every((item) => (itemsOwned[item.id] || 0) <= 0) && (
                <p className="bag-empty">
                  Nenhum item na mochila. Compre na loja.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {phase === "dice" && (
        <div className="dice-panel">
          <div className="dice-head">
            <Dices size={28} />
            <h2 className="dice-title">Role o dado</h2>
          </div>
          <p className="dice-subtitle">
            A sorte define sua chance de errar e esquivar
          </p>
          <div className="dice-value">
            {rolling ? (
              <span className="dice-rolling">…</span>
            ) : rolled ? (
              <span className="dice-number">{dieValue}</span>
            ) : (
              <span className="dice-wait">?</span>
            )}
          </div>
          {rolled && <span className="luck-label">Sorte: {playerLuck}</span>}
          <div className="dice-actions">
            {!rolled ? (
              <button
                type="button"
                onClick={handleRoll}
                disabled={rolling}
              >
                Rolar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPhase("player")}
                aria-label="Começar batalha"
              >
                <Play size={18} /> Batalhar!
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "victory" && (
        <div className="result-overlay">
          <div className="result-card">
            <div className="result-icon win">
              <Coins size={40} />
            </div>
            <h2 className="result-title win">
              {reward.boss ? "Chefe Derrotado!" : "Vitória!"}
            </h2>
            <p className="result-subtitle">
              {reward.boss ? `${currentMap.name} concluída` : "Recompensas"}
            </p>
            <div className="reward-row">
              <div className="reward-chip gold">
                <Coins size={18} />
                <span>+{reward.gold}</span>
              </div>
              <div className="reward-chip xp">
                <Sparkles size={18} />
                <span>+{reward.xp} XP</span>
              </div>
            </div>
            {reward.firstClear && (
              <div className="levelup-chip">
                <Crown size={16} /> Bônus de chefe: +3 pontos de status
              </div>
            )}
            {leveledUp && (
              <div className="levelup-chip">
                <Sparkles size={16} /> Novo nível! Pontos de status disponíveis
              </div>
            )}
            <div className="result-actions">
              <button
                type="button"
                onClick={() => navigate("/home")}
                aria-label="Sair"
              >
                <X size={18} /> Sair
              </button>
              <button
                type="button"
                onClick={
                  leveledUp
                    ? () => navigate("/levelup")
                    : reward.boss
                    ? () => navigate("/home/map")
                    : nextBattle
                }
                aria-label={
                  leveledUp
                    ? "Distribuir pontos"
                    : reward.boss
                    ? "Voltar ao mapa"
                    : "Próximo combate"
                }
              >
                {leveledUp ? (
                  <>
                    <Sparkles size={18} /> Distribuir pontos
                  </>
                ) : reward.boss ? (
                  <>
                    <Crown size={18} /> Voltar ao mapa
                  </>
                ) : (
                  <>
                    <Swords size={18} /> Próximo combate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "defeat" && (
        <div className="result-overlay">
          <div className="result-card">
            <div className="result-icon lose">
              <Skull size={42} />
            </div>
            <h2 className="result-title lose">
              {defeatReason === "timeout"
                ? "Tempo esgotado!"
                : defeatReason === "surrender"
                ? "Você desistiu!"
                : "Derrota!"}
            </h2>
            <p className="result-subtitle">Recompensas</p>
            <div className="reward-row">
              <div className="reward-chip gold">
                <Coins size={18} />
                <span>+{reward.gold}</span>
              </div>
              <div className="reward-chip xp">
                <Sparkles size={18} />
                <span>+{reward.xp} XP</span>
              </div>
            </div>
            {leveledUp && (
              <div className="levelup-chip">
                <Sparkles size={16} /> Novo nível! Pontos de status disponíveis
              </div>
            )}
            <div className="result-actions">
              <button
                type="button"
                onClick={() => navigate("/home")}
                aria-label="Sair"
              >
                <X size={18} /> Sair
              </button>
              <button
                type="button"
                onClick={leveledUp ? () => navigate("/levelup") : nextBattle}
                aria-label={
                  leveledUp ? "Distribuir pontos" : "Jogar novamente"
                }
              >
                {leveledUp ? (
                  <>
                    <Sparkles size={18} /> Distribuir pontos
                  </>
                ) : (
                  <>
                    <Swords size={18} /> Jogar novamente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}