import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Skull,
  User,
  Swords,
  Shield,
  Zap,
  Trophy,
  Coins,
  Sparkles,
  RotateCw,
  LogOut,
} from "lucide-react";
import HealthBar from "../components/HealthBar.jsx";
import ResourceBar from "../components/ResourceBar.jsx";
import DiceRoll from "../components/DiceRoll.jsx";
import { useGame } from "../context/GameContext.jsx";
import "./BattleScreen.css";

const MAX_HP = 5;
const PLAYER = { hp: MAX_HP, atk: 2, def: 2 };
const ENEMY = {
  hp: MAX_HP,
  atk: 2,
  def: 2,
  goldBase: 1,
  goldExtra: 2,
  xpBase: 1,
  xpExtra: 2,
};

const FURY_MAX = 5;
const FURY_GAIN = 2;
const STAMINA_MAX = 10;
const STAMINA_REGEN = 2;
const REGEN_BASE_INTERVAL = 4000;
const REGEN_TICK = 1;
const REGEN_INTERVAL = REGEN_BASE_INTERVAL / STAMINA_REGEN;
const ATK_COST = 3;
const DEF_COST = 2;
const SPECIAL_MULT = 2;
const MATCH_TIME = 30;
const DEFEAT_XP = 1;

const STAMINA_FILL = "linear-gradient(180deg, #6fb1ff, #357abd)";
const STAMINA_TICK = "#245a8f";
const FURY_FILL = "linear-gradient(180deg, #ffa94d, #f0751f)";
const FURY_TICK = "#8f4700";

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

const LUNGE = 900;
const HOLD = 400;
const RETURN = 900;

export default function BattleScreen() {
  const navigate = useNavigate();
  const { addReward } = useGame();
  const [playerHp, setPlayerHp] = useState(PLAYER.hp);
  const [enemyHp, setEnemyHp] = useState(ENEMY.hp);
  const [playerFury, setPlayerFury] = useState(0);
  const [enemyFury, setEnemyFury] = useState(0);
  const [playerStamina, setPlayerStamina] = useState(STAMINA_MAX);
  const [enemyStamina, setEnemyStamina] = useState(STAMINA_MAX);
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

  function chooseEnemyAction() {
    if (enemyFury >= FURY_MAX) return "special";
    const canAttack = enemyStamina >= ATK_COST;
    const canDefend = enemyStamina >= DEF_COST;
    if (canAttack && canDefend) return Math.random() < 0.3 ? "defend" : "attack";
    if (canAttack) return "attack";
    if (canDefend) return "defend";
    return "skip";
  }

  function resolveTurn(playerAction) {
    const enemyAction = chooseEnemyAction();
    setPhase("resolve");
    const playerAttacks = playerAction === "attack" || playerAction === "special";
    const enemyAttacks = enemyAction === "attack" || enemyAction === "special";
    setPlayerMoving(playerAttacks);
    setEnemyMoving(enemyAttacks);

    const delay = playerAttacks || enemyAttacks ? LUNGE : 300;

    setTimeout(() => {
      let playerDmg = 0;
      let enemyDmg = 0;
      let playerMiss = false;
      let enemyMiss = false;
      const playerSpecial = playerAction === "special";
      const enemySpecial = enemyAction === "special";

      if (playerAction === "attack") {
        if (Math.random() < missChance(playerLuck)) {
          playerMiss = true;
        } else {
          let d = rollDamage(PLAYER.atk, ENEMY.def);
          if (enemyAction === "defend") d = d / 2;
          enemyDmg = d;
        }
      } else if (playerSpecial) {
        let d = rollDamage(PLAYER.atk, ENEMY.def) * SPECIAL_MULT;
        if (enemyAction === "defend") d = d / 2;
        enemyDmg = d;
      }

      if (enemyAction === "attack") {
        if (Math.random() < missChance(enemyLuck)) {
          enemyMiss = true;
        } else {
          let d = rollDamage(ENEMY.atk, PLAYER.def);
          if (playerAction === "defend") d = d / 2;
          playerDmg = d;
        }
      } else if (enemySpecial) {
        let d = rollDamage(ENEMY.atk, PLAYER.def) * SPECIAL_MULT;
        if (playerAction === "defend") d = d / 2;
        playerDmg = d;
      }

      const newEnemyHp = Math.max(0, enemyHp - enemyDmg);
      const newPlayerHp = Math.max(0, playerHp - playerDmg);
      setEnemyHp(newEnemyHp);
      setPlayerHp(newPlayerHp);
      if (enemyDmg > 0) setEnemyHit(Date.now());
      if (playerDmg > 0) setPlayerHit(Date.now());

      const newPlayerFury = playerSpecial
        ? 0
        : Math.min(FURY_MAX, playerFury + playerDmg * FURY_GAIN);
      const newEnemyFury = enemySpecial
        ? 0
        : Math.min(FURY_MAX, enemyFury + enemyDmg * FURY_GAIN);
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
      setEnemyStamina((s) => Math.max(0, s - enemyCost));

      setPlayerBlocking(playerAction === "defend");
      setEnemyBlocking(enemyAction === "defend");
      setPlayerMissed(playerMiss);
      setEnemyMissed(enemyMiss);
      setPlayerCrit(enemySpecial);
      setEnemyCrit(playerSpecial);

      setTimeout(() => {
        setPlayerBlocking(false);
        setEnemyBlocking(false);
        setPlayerMissed(false);
        setEnemyMissed(false);
        setPlayerCrit(false);
        setEnemyCrit(false);
        setPlayerMoving(false);
        setEnemyMoving(false);

        setTimeout(() => {
          if (newEnemyHp <= 0) {
            const goldGain = rollReward(ENEMY.goldBase, ENEMY.goldExtra);
            const xpGain = rollReward(ENEMY.xpBase, ENEMY.xpExtra);
            addReward(goldGain, xpGain);
            setReward({ gold: goldGain, xp: xpGain });
            setPhase("victory");
          } else if (newPlayerHp <= 0) {
            setDefeatReason("defeated");
            addReward(0, DEFEAT_XP);
            setReward({ gold: 0, xp: DEFEAT_XP });
            setPhase("defeat");
          } else {
            setPhase("player");
          }
        }, RETURN);
      }, HOLD);
    }, delay);
  }

  function handleAction(action) {
    if (phase !== "player") return;
    if (action === "attack" && playerStamina < ATK_COST) return;
    if (action === "defend" && playerStamina < DEF_COST) return;
    if (action === "special" && playerFury < FURY_MAX) return;
    resolveTurn(action);
  }

  useEffect(() => {
    const id = setInterval(() => {
      setPlayerStamina((s) => Math.min(STAMINA_MAX, s + REGEN_TICK));
      setEnemyStamina((s) => Math.min(STAMINA_MAX, s + REGEN_TICK));
    }, REGEN_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const dt = (now - last) / 1000;
      last = now;
      const p = phaseRef.current;
      if (p === "player" || p === "resolve") {
        setTimeLeft((t) => Math.max(0, t - dt));
      }
    }, 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (phase === "player" && timeLeft <= 0) {
      setDefeatReason("timeout");
      addReward(0, DEFEAT_XP);
      setReward({ gold: 0, xp: DEFEAT_XP });
      setPhase("defeat");
    }
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase !== "player") return;
    const canAttack = playerStamina >= ATK_COST;
    const canDefend = playerStamina >= DEF_COST;
    const canSpecial = playerFury >= FURY_MAX;
    if (!canAttack && !canDefend && !canSpecial) {
      const t = setTimeout(() => resolveTurn("skip"), 800);
      return () => clearTimeout(t);
    }
  }, [phase, playerStamina, playerFury]);

  function nextBattle() {
    setPlayerHp(MAX_HP);
    setEnemyHp(MAX_HP);
    setPlayerFury(0);
    setEnemyFury(0);
    setPlayerStamina(STAMINA_MAX);
    setEnemyStamina(STAMINA_MAX);
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
    setPhase("dice");
  }

  const disabled = phase !== "player";
  const canAttack = playerStamina >= ATK_COST;
  const canDefend = playerStamina >= DEF_COST;
  const canSpecial = playerFury >= FURY_MAX;
  const timePct = (timeLeft / MATCH_TIME) * 100;

  return (
    <div className="battle-screen">
      <div className="timer-wrap">
        <div
          className={"timer-fill" + (timePct <= 20 ? " danger" : "")}
          style={{ width: timePct + "%" }}
        />
      </div>
      <div className="battle-divider" />
      <div className={"enemy-wrap" + (enemyMoving ? " attacking" : "")}>
        <div className="enemy-bar">
          <HealthBar hp={enemyHp} max={MAX_HP} hitKey={enemyHit} />
        </div>
        <ResourceBar
          value={enemyStamina}
          max={STAMINA_MAX}
          fill={STAMINA_FILL}
          tick={STAMINA_TICK}
          height={10}
        />
        <ResourceBar
          value={enemyFury}
          max={FURY_MAX}
          fill={FURY_FILL}
          tick={FURY_TICK}
          height={16}
        />
        <div className="sprite enemy-sprite">
          <Skull size={64} />
          {enemyBlocking && (
            <div className="block-flash">
              <Shield size={52} />
            </div>
          )}
          {enemyMissed && <div className="miss-flash">Errou!</div>}
          {enemyCrit && <div className="crit-flash">Crítico!</div>}
        </div>
      </div>

      <div
        className={"player-sprite-holder" + (playerMoving ? " attacking" : "")}
      >
        <div className="sprite player-sprite">
          <User size={56} />
          {playerBlocking && (
            <div className="block-flash">
              <Shield size={52} />
            </div>
          )}
          {playerMissed && <div className="miss-flash">Errou!</div>}
          {playerCrit && <div className="crit-flash">Crítico!</div>}
        </div>
      </div>

      <div className="player-wrap">
        <HealthBar hp={playerHp} max={MAX_HP} hitKey={playerHit} />
        <ResourceBar
          value={playerStamina}
          max={STAMINA_MAX}
          fill={STAMINA_FILL}
          tick={STAMINA_TICK}
          height={10}
        />
        <ResourceBar
          value={playerFury}
          max={FURY_MAX}
          fill={FURY_FILL}
          tick={FURY_TICK}
          height={16}
        />
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
        </div>
      </div>

      {phase === "dice" && (
        <div className="dice-overlay">
          <div className="dice-header">
            <h2 className="dice-title">Role o dado</h2>
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
              <button className="btn-roll" onClick={handleRoll} disabled={rolling}>
                Rolar
              </button>
            ) : (
              <button
                className="btn-roll primary"
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
          <div className="result-card">
            <div className="result-icon win">
              <Trophy size={42} />
            </div>
            <h2 className="result-title win">Vitória!</h2>
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
            <div className="result-actions">
              <button className="btn-result" onClick={() => navigate("/home")}>
                <LogOut size={18} /> Sair
              </button>
              <button className="btn-result primary" onClick={nextBattle}>
                <Swords size={18} /> Próximo combate
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
              {defeatReason === "timeout" ? "Tempo esgotado!" : "Derrota!"}
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
            <div className="result-actions">
              <button className="btn-result" onClick={() => navigate("/home")}>
                <LogOut size={18} /> Sair
              </button>
              <button className="btn-result primary" onClick={nextBattle}>
                <RotateCw size={18} /> Jogar novamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
