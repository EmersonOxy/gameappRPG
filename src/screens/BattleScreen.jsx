import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skull, User, Swords, Shield } from "lucide-react";
import HealthBar from "../components/HealthBar.jsx";
import "./BattleScreen.css";

const MAX_HP = 10;
const PLAYER = { hp: MAX_HP, atk: 2, def: 2 };
const ENEMY = { hp: MAX_HP, atk: 2, def: 2 };

const PLAYER_LUNGE = 500;
const PLAYER_RETURN = 500;
const ENEMY_PAUSE = 600;
const ENEMY_LUNGE = 1000;
const ENEMY_HOLD = 700;
const ENEMY_RETURN = 1000;
const ENEMY_DEFEND_DELAY = 900;

export default function BattleScreen() {
  const navigate = useNavigate();
  const [playerHp, setPlayerHp] = useState(PLAYER.hp);
  const [enemyHp, setEnemyHp] = useState(ENEMY.hp);
  const [defending, setDefending] = useState(false);
  const [enemyDefending, setEnemyDefending] = useState(false);
  const [phase, setPhase] = useState("player");
  const [playerMoving, setPlayerMoving] = useState(false);
  const [enemyMoving, setEnemyMoving] = useState(false);
  const [playerHit, setPlayerHit] = useState(0);
  const [enemyHit, setEnemyHit] = useState(0);

  function handleAttack() {
    if (phase !== "player") return;
    setPhase("playerAttack");
    setPlayerMoving(true);

    setTimeout(() => {
      let dmg = Math.max(1, PLAYER.atk - ENEMY.def);
      if (enemyDefending) dmg = Math.max(0, Math.floor(dmg / 2));
      const newEnemyHp = enemyHp - dmg;
      setEnemyHp(Math.max(0, newEnemyHp));
      if (dmg > 0) setEnemyHit(Date.now());
      setEnemyDefending(false);

      setTimeout(() => {
        setPlayerMoving(false);
        if (newEnemyHp <= 0) {
          setPhase("victory");
        } else {
          runEnemyTurn(false);
        }
      }, PLAYER_RETURN);
    }, PLAYER_LUNGE);
  }

  function handleDefend() {
    if (phase !== "player") return;
    runEnemyTurn(true);
  }

  function runEnemyTurn(willDefend) {
    setDefending(willDefend);
    setPhase("enemy");

    if (Math.random() < 0.3) {
      setEnemyDefending(true);
      setTimeout(() => {
        setDefending(false);
        setPhase("player");
      }, ENEMY_DEFEND_DELAY);
      return;
    }

    setTimeout(() => {
      setEnemyMoving(true);

      setTimeout(() => {
        let dmg = Math.max(1, ENEMY.atk - PLAYER.def);
        if (willDefend) dmg = Math.max(0, Math.floor(dmg / 2));
        const newPlayerHp = Math.max(0, playerHp - dmg);
        setPlayerHp(newPlayerHp);
        if (dmg > 0) setPlayerHit(Date.now());

        setTimeout(() => {
          setEnemyMoving(false);
          setTimeout(() => {
            setDefending(false);
            if (newPlayerHp <= 0) {
              setPhase("defeat");
            } else {
              setPhase("player");
            }
          }, ENEMY_RETURN);
        }, ENEMY_HOLD);
      }, ENEMY_LUNGE);
    }, ENEMY_PAUSE);
  }

  function nextBattle() {
    setPlayerHp(MAX_HP);
    setEnemyHp(MAX_HP);
    setDefending(false);
    setEnemyDefending(false);
    setPlayerMoving(false);
    setEnemyMoving(false);
    setPhase("player");
  }

  const disabled = phase !== "player";

  return (
    <div className="battle-screen">
      <div className={"enemy-wrap" + (enemyMoving ? " attacking" : "")}>
        <div className="enemy-bar-diagonal">
          <HealthBar hp={enemyHp} max={MAX_HP} hitKey={enemyHit} />
        </div>
        <div className="sprite enemy-sprite">
          <Skull size={64} />
        </div>
        {enemyDefending && (
          <div className="defending-badge">
            <Shield size={14} /> Defendendo
          </div>
        )}
      </div>

      <div className="player-wrap">
        <div
          className={"sprite player-sprite" + (playerMoving ? " attacking" : "")}
        >
          <User size={56} />
        </div>
        {defending && (
          <div className="defending-badge">
            <Shield size={14} /> Defendendo
          </div>
        )}
        <HealthBar hp={playerHp} max={MAX_HP} hitKey={playerHit} />
        <div className="battle-actions">
          <button
            className="btn-action attack"
            onClick={handleAttack}
            disabled={disabled}
          >
            <Swords size={20} /> Atacar
          </button>
          <button
            className="btn-action defend"
            onClick={handleDefend}
            disabled={disabled}
          >
            <Shield size={20} /> Defender
          </button>
        </div>
      </div>

      {phase === "victory" && (
        <div className="result-overlay">
          <h2 className="result-title win">Vitória!</h2>
          <div className="result-actions">
            <button className="btn-result" onClick={() => navigate("/home")}>
              Sair
            </button>
            <button className="btn-result primary" onClick={nextBattle}>
              Próximo combate
            </button>
          </div>
        </div>
      )}

      {phase === "defeat" && (
        <div className="result-overlay">
          <h2 className="result-title lose">Derrota!</h2>
          <div className="result-actions">
            <button className="btn-result primary" onClick={() => navigate("/home")}>
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
