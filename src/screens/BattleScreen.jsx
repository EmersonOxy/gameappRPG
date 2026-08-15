import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Skull,
  User,
  Swords,
  Shield,
  Zap,
  Coins,
  Sparkles,
  RotateCw,
  LogOut,
  Droplets,
  Package,
  Gem,
  X,
  Pause,
  Play,
} from "lucide-react";
import HealthBar from "../components/HealthBar.jsx";
import ResourceBar from "../components/ResourceBar.jsx";
import DiceRoll from "../components/DiceRoll.jsx";
import Coin3D from "../components/Coin3D.jsx";
import VictorianCorner from "../components/ornaments/VictorianCorner.jsx";
import { useGame } from "../context/GameContext.jsx";
import { ITEMS, getItem } from "../constants/items.js";
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

const STAMINA_FILL = "linear-gradient(180deg, #6fb1ff, #357abd)";
const STAMINA_TICK = "#245a8f";
const MANA_FILL = "linear-gradient(180deg, #4dd0c1, #15858a)";
const MANA_TICK = "#0f5c60";

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
    difficulty,
    playerMaxHp,
    playerAtk,
    playerDef,
    playerStaminaMax,
    playerStaminaRegen,
    playerFuryMult,
    playerMana,
    playerManaRegen,
    enemyMaxHp,
    enemyAtk,
    enemyDef,
    enemyMana,
    equippedSkills,
    itemsOwned,
    useItem,
    goldBase,
    goldExtra,
    xpBase,
    xpExtra,
  } = useGame();
  const [playerHp, setPlayerHp] = useState(playerMaxHp);
  const [enemyHp, setEnemyHp] = useState(enemyMaxHp);
  const [playerFury, setPlayerFury] = useState(0);
  const [enemyFury, setEnemyFury] = useState(0);
  const [playerStamina, setPlayerStamina] = useState(playerStaminaMax);
  const [enemyStamina, setEnemyStamina] = useState(ENEMY_STAMINA_MAX);
  const [playerManaCurrent, setPlayerManaCurrent] = useState(playerMana);
  const [playerMaxHpCurrent, setPlayerMaxHpCurrent] = useState(playerMaxHp);
  const [enemyMaxHpCurrent, setEnemyMaxHpCurrent] = useState(enemyMaxHp);
  const [playerShield, setPlayerShield] = useState(0);
  const [enemyStunned, setEnemyStunned] = useState(false);
  const [enemyStunFlash, setEnemyStunFlash] = useState(false);
  const [skillFlash, setSkillFlash] = useState(null);
  const [phase, setPhase] = useState("dice");
  const [playerMoving, setPlayerMoving] = useState(false);
  const [enemyMoving, setEnemyMoving] = useState(false);
  const [playerBlocking, setPlayerBlocking] = useState(false);
  const [enemyBlocking, setEnemyBlocking] = useState(false);
  const [playerMissed, setPlayerMissed] = useState(false);
  const [enemyMissed, setEnemyMissed] = useState(false);
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

  const staminaRegenMs = REGEN_BASE_INTERVAL / playerStaminaRegen;
  const enemyStaminaRegenMs = REGEN_BASE_INTERVAL / ENEMY_STAMINA_REGEN;
  const manaRegenMs = MANA_REGEN_BASE_INTERVAL / playerManaRegen;

  const [staminaProgress, setStaminaProgress] = useState(0);
  const [enemyStaminaProgress, setEnemyStaminaProgress] = useState(0);
  const [manaProgress, setManaProgress] = useState(0);

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
    if (stunned) return "stunned";
    if (enemyFury >= FURY_MAX) return "special";
    const canAttack = enemyStamina >= ATK_COST;
    const canDefend = enemyStamina >= DEF_COST;
    if (canAttack && canDefend) return Math.random() < 0.3 ? "defend" : "attack";
    if (canAttack) return "attack";
    if (canDefend) return "defend";
    return "skip";
  }

  function resolveTurn(playerAction, skill) {
    const stunned = enemyStunned;
    const enemyAction = chooseEnemyAction(stunned);
    setPhase("resolve");
    if (stunned) setEnemyStunned(false);
    const playerAttacks =
      playerAction === "attack" ||
      playerAction === "special" ||
      playerAction === "skill";
    const enemyAttacks = enemyAction === "attack" || enemyAction === "special";
    setPlayerMoving(playerAttacks);
    setEnemyMoving(enemyAttacks);
    setEnemyStunFlash(enemyAction === "stunned");

    const delay = playerAttacks || enemyAttacks ? LUNGE : 300;

    setTimeout(() => {
      let playerDmg = 0;
      let enemyDmg = 0;
      let playerCritDmg = 0;
      let enemyCritDmg = 0;
      let playerMiss = false;
      let enemyMiss = false;
      let skillMiss = false;
      let skillHeal = 0;
      let skillShield = 0;
      let skillStun = false;
      let skillDrainStamina = 0;
      let skillDrainFury = 0;
      const playerSpecial = playerAction === "special";
      const enemySpecial = enemyAction === "special";

      if (skill) {
        const fx = skill.effect;
        if (fx.type === "damage") {
          if (Math.random() < missChance(playerLuck)) {
            skillMiss = true;
          } else {
            let d = rollDamage(playerAtk, enemyDef) * fx.mult;
            if (enemyAction === "defend") d = d / 2;
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
        } else {
          let d = rollDamage(playerAtk, enemyDef);
          if (enemyAction === "defend") d = d / 2;
          enemyDmg = d;
        }
      } else if (playerSpecial) {
        let d = rollDamage(playerAtk, enemyDef) * playerFuryMult;
        if (enemyAction === "defend") d = d / 2;
        enemyCritDmg = d;
      }

      if (enemyAction === "attack") {
        if (Math.random() < missChance(enemyLuck)) {
          enemyMiss = true;
        } else {
          let d = rollDamage(enemyAtk, playerDef);
          if (playerAction === "defend") d = d / 2;
          playerDmg = d;
        }
      } else if (enemySpecial) {
        let d = rollDamage(enemyAtk, playerDef) * ENEMY_SPECIAL_MULT;
        if (playerAction === "defend") d = d / 2;
        playerCritDmg = d;
      }

      let shieldLeft = playerShield;
      if (skill && skill.effect.type === "shield") shieldLeft = skillShield;
      if (playerDmg > 0 && shieldLeft > 0) {
        const absorbed = Math.min(shieldLeft, playerDmg);
        playerDmg -= absorbed;
        shieldLeft -= absorbed;
      }
      setPlayerShield(shieldLeft);

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
        Math.min(newEnemyMaxHp, enemyHp) - enemyDmg - enemyCritCurrentDmg
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
      const newEnemyFury = enemySpecial
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
      setPlayerFury(newPlayerFury);
      setEnemyFury(newEnemyFury);

      const playerCost =
        playerAction === "attack"
          ? ATK_COST
          : playerAction === "defend"
          ? DEF_COST
          : 0;
      const enemyCost =
        enemyAction === "attack"
          ? ATK_COST
          : enemyAction === "defend"
          ? DEF_COST
          : 0;
      setPlayerStamina((s) => Math.max(0, s - playerCost));
      setEnemyStamina((s) =>
        Math.max(0, s - enemyCost - skillDrainStamina)
      );

      if (skill) {
        setPlayerManaCurrent(Math.max(0, playerManaCurrent - skill.manaCost));
      }

      setPlayerBlocking(playerAction === "defend");
      setEnemyBlocking(enemyAction === "defend");
      setPlayerMissed(playerMiss || skillMiss);
      setEnemyMissed(enemyMiss);
      setPlayerCrit(enemySpecial);
      setEnemyCrit(playerSpecial);
      setSkillFlash(skill && !skillMiss ? skill : null);
      if (skillStun) setEnemyStunned(true);

      setTimeout(() => {
        setPlayerBlocking(false);
        setEnemyBlocking(false);
        setPlayerMissed(false);
        setEnemyMissed(false);
        setPlayerCrit(false);
        setEnemyCrit(false);
        setPlayerMoving(false);
        setEnemyMoving(false);
        setEnemyStunFlash(false);
        setSkillFlash(null);

        setTimeout(() => {
          const nextTurn = turnCount + 1;
          setTurnCount(nextTurn);
          if (nextTurn > 0 && nextTurn % CRYSTAL_REFILL_TURNS === 0) {
            setCrystals(CRYSTAL_MAX);
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
              const dmg = fx.base + Math.floor(difficulty / 2);
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
            const goldGain = rollReward(goldBase, goldExtra);
            const xpGain = rollReward(xpBase, xpExtra);
            const gained = addReward(goldGain, xpGain);
            setReward({ gold: goldGain, xp: xpGain });
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
    if (action === "attack" && playerStamina < ATK_COST) return;
    if (action === "defend" && playerStamina < DEF_COST) return;
    if (action === "special" && playerFury < FURY_MAX) return;
    if (action === "skill" && (!skill || playerManaCurrent < skill.manaCost)) {
      return;
    }
    resolveTurn(action, skill);
  }

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
    const progress = { stamina: 0, enemy: 0, mana: 0 };
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
    }, 100);
    return () => clearInterval(id);
  }, [
    staminaRegenMs,
    enemyStaminaRegenMs,
    manaRegenMs,
    playerStaminaMax,
    playerMana,
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
    if (!canAttack && !canDefend && !canSpecial && !canSkill) {
      const t = setTimeout(() => resolveTurn("skip"), 800);
      return () => clearTimeout(t);
    }
  }, [phase, paused, playerStamina, playerFury, playerManaCurrent, equippedSkills]);

  function nextBattle() {
    setBattleId((b) => b + 1);
    setPlayerHit(0);
    setEnemyHit(0);
    setPlayerHp(playerMaxHp);
    setEnemyHp(enemyMaxHp);
    setPlayerMaxHpCurrent(playerMaxHp);
    setEnemyMaxHpCurrent(enemyMaxHp);
    setPlayerFury(0);
    setEnemyFury(0);
    setPlayerStamina(playerStaminaMax);
    setEnemyStamina(ENEMY_STAMINA_MAX);
    setPlayerManaCurrent(playerMana);
    setStaminaProgress(0);
    setEnemyStaminaProgress(0);
    setManaProgress(0);
    setCrystals(CRYSTAL_MAX);
    setTurnCount(0);
    setPendingItems([]);
    setInventoryOpen(false);
    setItemPopup(null);
    setPlayerShield(0);
    setEnemyStunned(false);
    setEnemyStunFlash(false);
    setSkillFlash(null);
    setPlayerMoving(false);
    setEnemyMoving(false);
    setPlayerBlocking(false);
    setEnemyBlocking(false);
    setPlayerMissed(false);
    setEnemyMissed(false);
    setPlayerCrit(false);
    setEnemyCrit(false);
    setRolled(false);
    setRolling(false);
    setDieValue(1);
    setPlayerLuck(null);
    setEnemyLuck(null);
    setTimeLeft(MATCH_TIME);
    setDefeatReason("defeated");
    setReward({ gold: 0, xp: 0 });
    setLeveledUp(false);
    setPhase("dice");
  }

  function surrender() {
    setPaused(false);
    setDefeatReason("surrender");
    const gained = addReward(0, DEFEAT_XP);
    setReward({ gold: 0, xp: DEFEAT_XP });
    setLeveledUp(gained > 0);
    setPhase("defeat");
  }

  const disabled = phase !== "player";
  const canAttack = playerStamina >= ATK_COST;
  const canDefend = playerStamina >= DEF_COST;
  const canSpecial = playerFury >= FURY_MAX;
  const timePct = (timeLeft / MATCH_TIME) * 100;
  const PopupIcon = itemPopup ? itemPopup.icon : null;

  return (
    <div className="battle-screen">
      {/* Corner ornaments — shared victorian frame */}
      <VictorianCorner pos="tl" />
      <VictorianCorner pos="tr" />
      <VictorianCorner pos="bl" />
      <VictorianCorner pos="br" />

      <div className="timer-wrap">
        <div
          className={"timer-fill" + (timePct <= 20 ? " danger" : "")}
          style={{ width: timePct + "%" }}
        />
      </div>
      <div className="battle-divider" />

      {(phase === "dice" || phase === "player") && !paused && (
        <button
          className="pause-button"
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
                className="btn-result primary btn-3d"
                onClick={() => setPaused(false)}
              >
                <Play size={18} /> Continuar
              </button>
              <button className="btn-result" onClick={surrender}>
                <LogOut size={18} /> Sair (derrota)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vertical bars — enemy (top half, espelhado do player) */}
      {/* Left enemy: vida (com fury-pips) + estamina sobreposta */}
      <div className="arena-stack left enemy">
        <div className="vbar-group">
          {/* Estamina: menor, fica por trás/abaixo da barra de vida */}
          <div className="vbar estamina">
            <ResourceBar
              value={enemyStamina}
              max={ENEMY_STAMINA_MAX}
              fill={STAMINA_FILL}
              tick={STAMINA_TICK}
              progress={enemyStaminaProgress}
              vertical
              reverse
            />
          </div>
          {/* Vida: por cima, com segmentos de fúria grudados na lateral */}
          <div className="vbar vida">
            <HealthBar
              key={battleId}
              hp={enemyHp}
              max={enemyMaxHp}
              currentMax={enemyMaxHpCurrent}
              hitKey={enemyHit}
              vertical
              reverse
            />
            {/* Fúria do inimigo: pips finos colados na lateral direita da vida */}
            <div className="fury-pips right">
              {Array.from({ length: FURY_MAX }).map((_, i) => (
                <div
                  key={i}
                  className={"fury-pip" + (i < enemyFury ? " on" : "")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Right enemy: mana (mesmo destaque que HP) */}
      <div className="arena-stack right enemy">
        <div className="vbar mana">
          <ResourceBar
            value={enemyMana}
            max={enemyMana}
            fill={MANA_FILL}
            tick={MANA_TICK}
            vertical
            reverse
          />
        </div>
      </div>

      {/* Vertical bars — player (bottom half) */}
      {/* Left player: vida (com fury-pips) + estamina sobreposta */}
      <div className="arena-stack left player">
        <div className="vbar-group">
          {/* Estamina: menor, fica por trás/abaixo da barra de vida */}
          <div className="vbar estamina">
            <ResourceBar
              value={playerStamina}
              max={playerStaminaMax}
              fill={STAMINA_FILL}
              tick={STAMINA_TICK}
              progress={staminaProgress}
              vertical
            />
          </div>
          {/* Vida: por cima, com segmentos de fúria grudados na lateral */}
          <div className="vbar vida">
            <HealthBar
              key={battleId}
              hp={playerHp}
              max={playerMaxHp}
              currentMax={playerMaxHpCurrent}
              hitKey={playerHit}
              vertical
            />
            {/* Fúria: pips finos colados na lateral direita da vida */}
            <div className="fury-pips right">
              {Array.from({ length: FURY_MAX }).map((_, i) => (
                <div
                  key={i}
                  className={"fury-pip" + (i < playerFury ? " on" : "")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Right player: mana (mesmo destaque que vida, lado direito) */}
      <div className="arena-stack right player">
        <div className="vbar mana">
          <ResourceBar
            value={playerManaCurrent}
            max={playerMana}
            fill={MANA_FILL}
            tick={MANA_TICK}
            progress={manaProgress}
            vertical
          />
        </div>
      </div>

      <div className={"enemy-wrap" + (enemyMoving ? " attacking" : "")}>
        <div className="threat-badge">Ameaça Nível {difficulty}</div>
        <div className="sprite enemy-sprite">
          <Skull size={64} />
          {enemyBlocking && (
            <div className="block-flash">
              <Shield size={52} />
            </div>
          )}
          {enemyMissed && <div className="miss-flash left">Errou!</div>}
          {enemyCrit && <div className="crit-flash left">Crítico!</div>}
          {enemyStunFlash && <div className="stun-flash left">Congelado!</div>}
          {skillFlash && (
            <div
              className={"skill-flash left branch-" + skillFlash.branch}
            >
              {skillFlash.name}!
            </div>
          )}
        </div>
      </div>

      <div
        className={"player-sprite-holder" + (playerMoving ? " attacking" : "")}
      >
        <div className="sprite player-sprite">
          <User size={56} />
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
          {playerCrit && <div className="crit-flash right">Crítico!</div>}
        </div>
      </div>

      <div className="player-wrap">
        {equippedSkills.length > 0 ? (
          <div className="battle-skills">
            {equippedSkills.map((skill) => {
              const SkillIcon = skill.icon;
              const skillDisabled =
                disabled || playerManaCurrent < skill.manaCost;
              return (
                <button
                  key={skill.id}
                  className={
                    "btn-action skill branch-" + skill.branch
                  }
                  onClick={() => handleAction("skill", skill)}
                  disabled={skillDisabled}
                >
                  <SkillIcon size={18} />
                  <span className="skill-btn-name">{skill.name}</span>
                  <span className="skill-cost">
                    <Droplets size={11} />
                    {skill.manaCost}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="battle-skills">
            <button className="btn-action mana" disabled>
              <Droplets size={20} /> Nenhuma habilidade
            </button>
          </div>
        )}
        <div className="battle-actions">
          <button
            className="btn-action attack"
            onClick={() => handleAction("attack")}
            disabled={disabled || !canAttack}
          >
            <Swords size={20} /> Atacar
          </button>
          <button
            className="btn-action defend"
            onClick={() => handleAction("defend")}
            disabled={disabled || !canDefend}
          >
            <Shield size={20} /> Defender
          </button>
          <button
            className="btn-action special"
            onClick={() => handleAction("special")}
            disabled={disabled || !canSpecial}
          >
            <Zap size={20} /> Especial
          </button>
          <button
            className="btn-action bag"
            onClick={() => setInventoryOpen(true)}
            disabled={disabled}
          >
            <Package size={13} /> Mochila
            <span className="bag-crystals">
              <Gem size={7} />
              {crystals}
            </span>
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
                className="bag-close"
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
                const Icon = item.icon;
                const canUse = crystals >= item.crystalCost;
                return (
                  <div className={"bag-item branch-" + item.branch} key={item.id}>
                    <div className={"bag-item-icon branch-" + item.branch}>
                      <Icon size={18} />
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
                      className="bag-use"
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
        <div className="dice-overlay">
          <VictorianCorner pos="tl" />
          <VictorianCorner pos="tr" />
          <VictorianCorner pos="bl" />
          <VictorianCorner pos="br" />
          <div className="rune-divider top" />
          <div className="rune-divider bottom" />

          <div className="dice-header">
            <div className="rune-emblem dice-emblem">
              <div className="rune-emblem-ring" />
              <div className="rune-emblem-ring inner" />
              <span className="rune-emblem-icon">🎲</span>
            </div>
            <h2 className="dice-title">Role o dado</h2>
            <div className="rune-sep">
              <div className="rune-sep-line" />
              <div className="rune-sep-diamond" />
              <div className="rune-sep-line right" />
            </div>
            <p className="dice-subtitle">A sorte define sua chance de errar</p>
          </div>

          <div className="dice-stage">
            <div className="dice-holder">
              <DiceRoll value={dieValue} rolling={rolling} />
            </div>
            <div className={"dice-shadow" + (rolling ? " animating" : "")} />
          </div>

          <div className="dice-footer">
            <div className="luck-slot">
              {rolled && <span className="luck-label">Sorte: {playerLuck}</span>}
            </div>
            {!rolled ? (
              <button className="btn-roll btn-3d" onClick={handleRoll} disabled={rolling}>
                Rolar
              </button>
            ) : (
              <button
                className="btn-roll primary btn-3d"
                onClick={() => setPhase("player")}
              >
                Começar batalha
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "victory" && (
        <div className="result-overlay">
          <VictorianCorner pos="tl" metal="gold" gem="quartz" />
          <VictorianCorner pos="tr" metal="gold" gem="quartz" />
          <VictorianCorner pos="bl" metal="gold" gem="quartz" />
          <VictorianCorner pos="br" metal="gold" gem="quartz" />
          <div className="result-card">
            <div className="result-icon win coin">
              <Coin3D size={96} />
            </div>
            <h2 className="result-title win">Vitória!</h2>
            <div className="rune-sep">
              <div className="rune-sep-line" />
              <div className="rune-sep-diamond" />
              <div className="rune-sep-line right" />
            </div>
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
              <button className="btn-result" onClick={() => navigate("/home")}>
                <LogOut size={18} /> Sair
              </button>
              <button
                className="btn-result primary btn-3d"
                onClick={leveledUp ? () => navigate("/levelup") : nextBattle}
              >
                {leveledUp ? (
                  <>
                    <Sparkles size={18} /> Distribuir pontos
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
          <VictorianCorner pos="tl" metal="gold" gem="quartz" />
          <VictorianCorner pos="tr" metal="gold" gem="quartz" />
          <VictorianCorner pos="bl" metal="gold" gem="quartz" />
          <VictorianCorner pos="br" metal="gold" gem="quartz" />
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
            <div className="rune-sep">
              <div className="rune-sep-line" />
              <div className="rune-sep-diamond" />
              <div className="rune-sep-line right" />
            </div>
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
              <button className="btn-result" onClick={() => navigate("/home")}>
                <LogOut size={18} /> Sair
              </button>
              <button
                className="btn-result primary btn-3d"
                onClick={leveledUp ? () => navigate("/levelup") : nextBattle}
              >
                {leveledUp ? (
                  <>
                    <Sparkles size={18} /> Distribuir pontos
                  </>
                ) : (
                  <>
                    <RotateCw size={18} /> Jogar novamente
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
