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
  Droplets,
} from "lucide-react";
import HealthBar from "../components/HealthBar.jsx";
import ResourceBar from "../components/ResourceBar.jsx";
import DiceRoll from "../components/DiceRoll.jsx";
import { useGame } from "../context/GameContext.jsx";
import "./BattleScreen.css";

const FURY_MAX = 5;
const FURY_GAIN = 2;
const ENEMY_STAMINA_MAX = 10;
const ENEMY_STAMINA_REGEN = 2;
const REGEN_BASE_INTERVAL = 4000;
const MANA_REGEN_BASE_INTERVAL = 12000;
const REGEN_TICK = 1;
const ATK_COST = 3;
const DEF_COST = 2;
const ENEMY_SPECIAL_MULT = 2;
const MATCH_TIME = 30;
const DEFEAT_XP = 1;

const STAMINA_FILL = "linear-gradient(180deg, #6fb1ff, #357abd)";
const STAMINA_TICK = "#245a8f";
const FURY_FILL = "linear-gradient(180deg, #ffa94d, #f0751f)";
const FURY_TICK = "#8f4700";
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
            ? playerMaxHp
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
        enemyDmg = d;
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
        playerDmg = d;
      }

      let shieldLeft = playerShield;
      if (skill && skill.effect.type === "shield") shieldLeft = skillShield;
      if (playerDmg > 0 && shieldLeft > 0) {
        const absorbed = Math.min(shieldLeft, playerDmg);
        playerDmg -= absorbed;
        shieldLeft -= absorbed;
      }
      setPlayerShield(shieldLeft);

      const newEnemyHp = Math.max(0, enemyHp - enemyDmg);
      const newPlayerHp = Math.max(
        0,
        Math.min(playerMaxHp, playerHp + skillHeal) - playerDmg
      );
      setEnemyHp(newEnemyHp);
      setPlayerHp(newPlayerHp);
      if (enemyDmg > 0) setEnemyHit(Date.now());
      if (playerDmg > 0) setPlayerHit(Date.now());

      const newPlayerFury = playerSpecial
        ? 0
        : Math.min(FURY_MAX, playerFury + playerDmg * FURY_GAIN);
      const newEnemyFury = enemySpecial
        ? 0
        : Math.min(
            FURY_MAX,
            Math.max(0, enemyFury + enemyDmg * FURY_GAIN - skillDrainFury)
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
          if (newEnemyHp <= 0) {
            const goldGain = rollReward(goldBase, goldExtra);
            const xpGain = rollReward(xpBase, xpExtra);
            const gained = addReward(goldGain, xpGain);
            setReward({ gold: goldGain, xp: xpGain });
            setLeveledUp(gained > 0);
            setPhase("victory");
          } else if (newPlayerHp <= 0) {
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

  useEffect(() => {
    const playerId = setInterval(() => {
      setPlayerStamina((s) => Math.min(playerStaminaMax, s + REGEN_TICK));
    }, REGEN_BASE_INTERVAL / playerStaminaRegen);
    const enemyId = setInterval(() => {
      setEnemyStamina((s) => Math.min(ENEMY_STAMINA_MAX, s + REGEN_TICK));
    }, REGEN_BASE_INTERVAL / ENEMY_STAMINA_REGEN);
    const manaId = setInterval(() => {
      setPlayerManaCurrent((m) => Math.min(playerMana, m + REGEN_TICK));
    }, MANA_REGEN_BASE_INTERVAL / playerManaRegen);
    return () => {
      clearInterval(playerId);
      clearInterval(enemyId);
      clearInterval(manaId);
    };
  }, [playerStaminaMax, playerStaminaRegen, playerMana, playerManaRegen]);

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
      const gained = addReward(0, DEFEAT_XP);
      setReward({ gold: 0, xp: DEFEAT_XP });
      setLeveledUp(gained > 0);
      setPhase("defeat");
    }
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase !== "player") return;
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
  }, [phase, playerStamina, playerFury, playerManaCurrent, equippedSkills]);

  function nextBattle() {
    setPlayerHp(playerMaxHp);
    setEnemyHp(enemyMaxHp);
    setPlayerFury(0);
    setEnemyFury(0);
    setPlayerStamina(playerStaminaMax);
    setEnemyStamina(ENEMY_STAMINA_MAX);
    setPlayerManaCurrent(playerMana);
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

  const disabled = phase !== "player";
  const canAttack = playerStamina >= ATK_COST;
  const canDefend = playerStamina >= DEF_COST;
  const canSpecial = playerFury >= FURY_MAX;
  const timePct = (timeLeft / MATCH_TIME) * 100;

  return (
    <div className="battle-screen">
      {/* Corner ornaments — shared runic frame */}
      <div className="rune-corner tl" />
      <div className="rune-corner tr" />
      <div className="rune-corner bl" />
      <div className="rune-corner br" />

      <div className="timer-wrap">
        <div
          className={"timer-fill" + (timePct <= 20 ? " danger" : "")}
          style={{ width: timePct + "%" }}
        />
      </div>
      <div className="battle-divider" />

      {/* Vertical bars — enemy (top half, mirrored) */}
      <div className="arena-stack left enemy">
        <div className="vbar furia">
          <ResourceBar
            value={enemyFury}
            max={FURY_MAX}
            fill={FURY_FILL}
            tick={FURY_TICK}
            vertical
            reverse
          />
        </div>
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
      <div className="arena-stack right enemy">
        <div className="vbar vida">
          <HealthBar
            hp={enemyHp}
            max={enemyMaxHp}
            hitKey={enemyHit}
            vertical
            reverse
          />
        </div>
        <div className="vbar estamina">
          <ResourceBar
            value={enemyStamina}
            max={ENEMY_STAMINA_MAX}
            fill={STAMINA_FILL}
            tick={STAMINA_TICK}
            vertical
            reverse
          />
        </div>
      </div>

      {/* Vertical bars — player (bottom half) */}
      <div className="arena-stack left player">
        <div className="vbar vida">
          <HealthBar hp={playerHp} max={playerMaxHp} hitKey={playerHit} vertical />
        </div>
        <div className="vbar estamina">
          <ResourceBar
            value={playerStamina}
            max={playerStaminaMax}
            fill={STAMINA_FILL}
            tick={STAMINA_TICK}
            vertical
          />
        </div>
      </div>
      <div className="arena-stack right player">
        <div className="vbar furia">
          <ResourceBar
            value={playerFury}
            max={FURY_MAX}
            fill={FURY_FILL}
            tick={FURY_TICK}
            vertical
          />
        </div>
        <div className="vbar mana">
          <ResourceBar
            value={playerManaCurrent}
            max={playerMana}
            fill={MANA_FILL}
            tick={MANA_TICK}
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
      </div>

      {phase === "dice" && (
        <div className="dice-overlay">
          <div className="rune-corner tl" />
          <div className="rune-corner tr" />
          <div className="rune-corner bl" />
          <div className="rune-corner br" />
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
          <div className="rune-corner tl" />
          <div className="rune-corner tr" />
          <div className="rune-corner bl" />
          <div className="rune-corner br" />
          <div className="result-card">
            <div className="result-icon win">
              <Trophy size={42} />
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
                className="btn-result primary"
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
          <div className="rune-corner tl" />
          <div className="rune-corner tr" />
          <div className="rune-corner bl" />
          <div className="rune-corner br" />
          <div className="result-card">
            <div className="result-icon lose">
              <Skull size={42} />
            </div>
            <h2 className="result-title lose">
              {defeatReason === "timeout" ? "Tempo esgotado!" : "Derrota!"}
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
                className="btn-result primary"
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
