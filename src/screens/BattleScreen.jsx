import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skull, User, Swords, Shield } from "lucide-react";
import HealthBar from "../components/HealthBar.jsx";
import { useGame } from "../context/GameContext.jsx";
import "./BattleScreen.css";

const MAX_HP = 10;
const PLAYER = { hp: MAX_HP, atk: 2, def: 2 };
const ENEMY = { hp: MAX_HP, atk: 2, def: 2 };

const LUNGE = 900;
const HOLD = 400;
const RETURN = 900;

export default function BattleScreen() {
  const navigate = useNavigate();
  const { addReward } = useGame();
  const [playerHp, setPlayerHp] = useState(PLAYER.hp);
  const [enemyHp, setEnemyHp] = useState(ENEMY.hp);
  const [phase, setPhase] = useState("player");
  const [playerMoving, setPlayerMoving] = useState(false);
  const [enemyMoving, setEnemyMoving] = useState(false);
  const [playerBlocking, setPlayerBlocking] = useState(false);
  const [enemyBlocking, setEnemyBlocking] = useState(false);
  const [playerHit, setPlayerHit] = useState(0);
  const [enemyHit, setEnemyHit] = useState(0);

  function handleAction(action) {
    if (phase !== "player") return;

    const enemyAction = Math.random() < 0.3 ? "defend" : "attack";
    setPhase("resolve");
    setPlayerMoving(action === "attack");
    setEnemyMoving(enemyAction === "attack");

    const delay = action === "attack" || enemyAction === "attack" ? LUNGE : 300;

    setTimeout(() => {
      let playerDmg = 0;
      let enemyDmg = 0;

      if (action === "attack") {
        let d = Math.max(1, PLAYER.atk - ENEMY.def);
        if (enemyAction === "defend") d = Math.max(0, Math.floor(d / 2));
        enemyDmg = d;
      }
      if (enemyAction === "attack") {
        let d = Math.max(1, ENEMY.atk - PLAYER.def);
        if (action === "defend") d = Math.max(0, Math.floor(d / 2));
        playerDmg = d;
      }

      const newEnemyHp = Math.max(0, enemyHp - enemyDmg);
      const newPlayerHp = Math.max(0, playerHp - playerDmg);
      setEnemyHp(newEnemyHp);
      setPlayerHp(newPlayerHp);
      if (enemyDmg > 0) setEnemyHit(Date.now());
      if (playerDmg > 0) setPlayerHit(Date.now());

      setPlayerBlocking(action === "defend");
      setEnemyBlocking(enemyAction === "defend");

      setTimeout(() => {
        setPlayerBlocking(false);
        setEnemyBlocking(false);
        setPlayerMoving(false);
        setEnemyMoving(false);

        setTimeout(() => {
          if (newEnemyHp <= 0) {
            addReward(1, 1);
            setPhase("victory");
          } else if (newPlayerHp <= 0) {
            setPhase("defeat");
          } else {
            setPhase("player");
          }
        }, RETURN);
      }, HOLD);
    }, delay);
  }

  function nextBattle() {
    setPlayerHp(MAX_HP);
    setEnemyHp(MAX_HP);
    setPlayerMoving(false);
    setEnemyMoving(false);
    setPlayerBlocking(false);
    setEnemyBlocking(false);
    setPhase("player");
  }

  const disabled = phase !== "player";

  return (
    <div className="battle-screen">
      <div className={"enemy-wrap" + (enemyMoving ? " attacking" : "")}>
        <div className="enemy-bar">
          <HealthBar hp={enemyHp} max={MAX_HP} hitKey={enemyHit} />
        </div>
        <div className="sprite enemy-sprite">
          <Skull size={64} />
          {enemyBlocking && (
            <div className="block-flash">
              <Shield size={52} />
            </div>
          )}
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
        </div>
      </div>

      <div className="player-wrap">
        <HealthBar hp={playerHp} max={MAX_HP} hitKey={playerHit} />
        <div className="battle-actions">
          <button
            className="btn-action attack"
            onClick={() => handleAction("attack")}
            disabled={disabled}
          >
            <Swords size={20} /> Atacar
          </button>
          <button
            className="btn-action defend"
            onClick={() => handleAction("defend")}
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
