import { useNavigate } from "react-router-dom";
import { Swords, Sparkles, Shield, Flame, Zap, MapPin, Trophy, Crown } from "lucide-react";
import { useGame } from "../context/GameContext.jsx";
import "./InicioView.css";

export default function InicioView() {
  const navigate = useNavigate();
  const { gold, xp, level, playerAtk, playerDef, statPoints, currentMap } =
    useGame();

  return (
    <div className="inicio-view">
      {/* Banner Heroico Superior */}
      <div className="inicio-banner">
        <div className="banner-glow-orb" />
        <div className="inicio-banner-text">
          <div className="banner-badge">
            <Crown size={14} className="banner-crown" />
            <span>Lobby do Campeão</span>
          </div>
          <h2 className="inicio-banner-title">Pronto para a Batalha?</h2>
          <p className="inicio-banner-sub">
            Monstros e tesouros aguardam seus passos nas masmorras.
          </p>
        </div>
      </div>

      {/* Grade de Atributos do Herói com Visual de Joias/Runas */}
      <div className="inicio-stats-grid">
        <div className="inicio-stat-card">
          <div className="stat-card-icon-wrap level-icon">
            <Trophy size={16} />
          </div>
          <span className="inicio-stat-value">{level}</span>
          <span className="inicio-stat-label">Nível</span>
        </div>

        <div className="inicio-stat-card">
          <div className="stat-card-icon-wrap gold-icon">
            <Zap size={16} />
          </div>
          <span className="inicio-stat-value">{gold}</span>
          <span className="inicio-stat-label">Ouro</span>
        </div>

        <div className="inicio-stat-card">
          <div className="stat-card-icon-wrap xp-icon">
            <Sparkles size={16} />
          </div>
          <span className="inicio-stat-value">{xp}</span>
          <span className="inicio-stat-label">XP</span>
        </div>

        <div className="inicio-stat-card">
          <div className="stat-card-icon-wrap atk-icon">
            <Flame size={16} />
          </div>
          <span className="inicio-stat-value">{playerAtk}</span>
          <span className="inicio-stat-label">Ataque</span>
        </div>

        <div className="inicio-stat-card">
          <div className="stat-card-icon-wrap def-icon">
            <Shield size={16} />
          </div>
          <span className="inicio-stat-value">{playerDef}</span>
          <span className="inicio-stat-label">Defesa</span>
        </div>
      </div>

      {/* Área Central de Ação — O Grande Botão de Batalhar */}
      <div className="inicio-action-area">
        {/* Seletor Rápido da Região Atual */}
        <div className="region-badge-wrap" onClick={() => navigate("/home/map")}>
          <div className="region-badge">
            <MapPin size={14} className="region-icon" />
            <span className="region-name">{currentMap.name}</span>
            <span className="region-level">Nv. {currentMap.minLevel}–{currentMap.maxLevel}</span>
          </div>
        </div>

        {/* Botão Gigante de BATALHAR (Estilo Clash Royale) */}
        <button
          type="button"
          className="btn-battle-giant"
          onClick={() => navigate("/battle")}
        >
          <div className="battle-btn-inner">
            <Swords size={32} className="battle-swords-icon" />
            <div className="battle-btn-texts">
              <span className="battle-btn-title">BATALHAR</span>
              <span className="battle-btn-subtitle">Entrar na Arena</span>
            </div>
          </div>
        </button>

        {/* Botão de Evolução / Pontos de Atributos */}
        {statPoints > 0 && (
          <button
            type="button"
            className="btn-levelup-pulse"
            onClick={() => navigate("/levelup")}
          >
            <Sparkles size={18} className="sparkle-anim" />
            <span>Distribuir {statPoints} {statPoints === 1 ? "Ponto" : "Pontos"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
