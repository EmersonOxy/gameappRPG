import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight, Sparkles } from "lucide-react";
import { useGame } from "../context/GameContext.jsx";
import { STATS } from "../constants/stats.js";
import "./LevelUpScreen.css";

export default function LevelUpScreen() {
  const navigate = useNavigate();
  const { level, stats, statPoints, upgradeStat } = useGame();

  return (
    <div className="levelup-screen">
      <div className="levelup-content">
        <div className="levelup-emblem">
          <Sparkles size={28} />
        </div>

        <h2 className="levelup-title">Subiu de nível!</h2>
        <span className="levelup-level">Nível {level}</span>

        <p className="levelup-subtitle">Distribua seus pontos de status</p>

        <div className="levelup-points">
          <span className={"points-count" + (statPoints > 0 ? " active" : "")}>
            {statPoints}
          </span>
          <span className="points-label">pontos restantes</span>
        </div>

        <div className="stat-list">
          {STATS.map(({ key, label, description, effect, icon: Icon }) => (
            <div className="stat-row" key={key}>
              <div className="stat-icon">
                <Icon size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-name">{label}</span>
                <span className="stat-desc">{description}</span>
                <span className="stat-effect">{effect}</span>
              </div>
              <div className="stat-side">
                <span className="stat-level">Nv {stats[key]}</span>
                <button
                  type="button"
                  onClick={() => upgradeStat(key)}
                  disabled={statPoints <= 0}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate("/home/map")}
          disabled={statPoints > 0}
        >
          <ArrowRight size={18} />
          Continuar
        </button>
        {statPoints > 0 && (
          <span className="levelup-hint">
            Gaste todos os pontos para continuar
          </span>
        )}
      </div>
    </div>
  );
}
