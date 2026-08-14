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
      <div className="rune-corner tl" />
      <div className="rune-corner tr" />
      <div className="rune-corner bl" />
      <div className="rune-corner br" />
      <div className="rune-divider top" />
      <div className="rune-divider bottom" />

      <div className="levelup-content">
        <div className="levelup-emblem">
          <div className="rune-emblem-ring" />
          <div className="rune-emblem-ring inner" />
          <span className="rune-emblem-icon">
            <Sparkles size={30} />
          </span>
        </div>

        <h2 className="levelup-title">Subiu de nível!</h2>
        <span className="levelup-level">Nível {level}</span>

        <div className="rune-sep">
          <div className="rune-sep-line" />
          <div className="rune-sep-diamond" />
          <div className="rune-sep-line right" />
        </div>

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
                  className="stat-up"
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
          className="btn-continue"
          onClick={() => navigate("/battle")}
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
