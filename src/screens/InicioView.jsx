import { useNavigate } from "react-router-dom";
import { Swords, Sparkles } from "lucide-react";
import { useGame } from "../context/GameContext.jsx";
import "./InicioView.css";

export default function InicioView() {
  const navigate = useNavigate();
  const { gold, xp, level, playerAtk, playerDef, statPoints, currentMap } =
    useGame();

  return (
    <div className="inicio-view">
      {/* Hero banner */}
      <div className="inicio-banner">
        <div className="inicio-torch left" />
        <div className="inicio-torch right" />
        <div className="inicio-banner-text">
          <div className="inicio-banner-title">Bem-vindo, Aventureiro</div>
          <div className="inicio-banner-sub">Pronto para a batalha?</div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="inicio-stats">
        <div className="inicio-stat">
          <span className="inicio-stat-value">{level}</span>
          <span className="inicio-stat-label">Nível</span>
        </div>
        <div className="inicio-stat">
          <span className="inicio-stat-value">{gold}</span>
          <span className="inicio-stat-label">Ouro</span>
        </div>
        <div className="inicio-stat">
          <span className="inicio-stat-value">{xp}</span>
          <span className="inicio-stat-label">XP</span>
        </div>
        <div className="inicio-stat">
          <span className="inicio-stat-value">{playerAtk}</span>
          <span className="inicio-stat-label">Ataque</span>
        </div>
        <div className="inicio-stat">
          <span className="inicio-stat-value">{playerDef}</span>
          <span className="inicio-stat-label">Defesa</span>
        </div>
      </div>

      {/* Action area */}
      <div className="inicio-action">
        <div className="inicio-section-title">
          <div className="inicio-section-line" />
          <span className="inicio-section-text">Combate</span>
          <div className="inicio-section-line right" />
        </div>

        <button type="button" onClick={() => navigate("/home/map")}>
          <Swords size={22} />
          Batalhar
        </button>

        {statPoints > 0 && (
          <button type="button" onClick={() => navigate("/levelup")}>
            <Sparkles size={16} />
            Distribuir pontos ({statPoints})
          </button>
        )}

        <span className="inicio-threat">
          Região · {currentMap.name} · Nv. {currentMap.minLevel}–{currentMap.maxLevel}
        </span>
      </div>
    </div>
  );
}
