import { useNavigate } from "react-router-dom";
import { Swords, RotateCw, Sparkles, Shield } from "lucide-react";
import { useGame } from "../context/GameContext.jsx";
import "./StartScreen.css";

export default function StartScreen() {
  const navigate = useNavigate();
  const { hasProgress, resetProgress } = useGame();

  function handleNewGame() {
    resetProgress();
    navigate("/home");
  }

  return (
    <div className="start-screen">
      {/* Luzes de fundo atmosféricas */}
      <div className="start-ambient-glow" />

      <div className="start-content">
        {/* Brasão / Emblema Heroico */}
        <div className="start-emblem-wrap">
          <div className="start-emblem">
            <Shield className="emblem-shield" size={48} />
            <Swords className="emblem-swords" size={32} />
          </div>
          <div className="emblem-sparkles">
            <Sparkles size={16} />
          </div>
        </div>

        {/* Logo do Jogo com Tipografia Lendária */}
        <div className="game-logo">
          <span className="game-overtitle">CRÔNICAS DE</span>
          <h1 className="game-title">HERÓIS</h1>
          <div className="title-divider">
            <span className="divider-diamond">◆</span>
          </div>
          <span className="game-subtitle">ARENA & TÁTICAS</span>
        </div>

        <p className="game-tagline">
          Forje seu destino em batalhas por turnos épicas
        </p>

        {/* Menu de Entrada com Botões Imponentes */}
        <div className="start-menu">
          {hasProgress && (
            <button
              type="button"
              className="btn-continue"
              onClick={() => navigate("/home")}
            >
              <RotateCw size={19} className="btn-icon" />
              <span>Continuar Jornada</span>
            </button>
          )}
          <button
            type="button"
            className="btn-new-game"
            onClick={handleNewGame}
          >
            <Swords size={20} className="btn-icon" />
            <span>Novo Jogo</span>
          </button>
        </div>

        <div className="start-footer-badge">
          <span>Versão 1.0 • RPG Mobile</span>
        </div>
      </div>
    </div>
  );
}
