import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skull, User, Swords, Shield } from "lucide-react";
import HealthBar from "../components/HealthBar.jsx";
import "./BattleScreen.css";

const MAX_HP = 10;
const PLAYER = { hp: MAX_HP, atk: 2, def: 2 };
const ENEMY = { hp: MAX_HP, atk: 2, def: 2 };

export default function BattleScreen() {
  const navigate = useNavigate();
  const [playerHp, setPlayerHp] = useState(PLAYER.hp);
  const [enemyHp, setEnemyHp] = useState(ENEMY.hp);
  const [defending, setDefending] = useState(false);
  const [phase, setPhase] = useState("player");
  const [enemyMoving, setEnemyMoving] = useState(false);
  const [playerHit, setPlayerHit] = useState(0);
  const [enemyHit, setEnemyHit] = useState(0);

  function handleAttack() {
    if (phase !== "player") return;
    const dmg = Math.max(1, PLAYER.atk - ENEMY.def);
    const newEnemyHp = enemyHp - dmg;
    setEnemyHp(Math.max(0, newEnemyHp));
    setEnemyHit(Date.now());
    if (newEnemyHp <= 0) {
      setPhase("victory");
      return;
    }
    runEnemyTurn(false);
  }

  function handleDefend() {
    if (phase !== "player") return;
    runEnemyTurn(true);
  }

  function runEnemyTurn(willDefend) {
    setDefending(willDefend);
    setPhase("enemy");

    setTimeout(() => {
      setEnemyMoving(true);

      setTimeout(() => {
        let dmg = Math.max(1, ENEMY.atk - PLAYER.def);
        if (willDefend) dmg = Math.max(0, Math.floor(dmg / 2));
        const newPlayerHp = Math.max(0, playerHp - dmg);
        setPlayerHp(newPlayerHp);
        setPlayerHit(Date.now());

        setTimeout(() => {
          setEnemyMoving(false);
          setDefending(false);
          if (newPlayerHp <= 0) {
            setPhase("defeat");
          } else {
            setPhase("player");
          }
        }, 700);
      }, 1000);
    }, 600);
  }

  function nextBattle() {
    setPlayerHp(MAX_HP);
    setEnemyHp(MAX_HP);
    setDefending(false);
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
      </div>

      <div className="player-wrap">
        <div className="sprite player-sprite">
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
