import { useNavigate } from "react-router-dom";
import { Swords, RotateCcw, Shield, Sparkles } from "lucide-react";
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
      <div className="start-container">
        {/* Ícone Especial / Emblema Flat */}
        <div className="start-badge">
          <Shield size={44} className="badge-shield" />
          <Swords size={26} className="badge-swords" />
        </div>

        {/* Título e Subtítulo Planos */}
        <div className="start-header">
          <span className="start-tag">RPG TÁTICO</span>
          <h1 className="start-title">Crônicas de Heróis</h1>
          <p className="start-description">
            Enfrente desafios, evolua suas habilidades e domine a arena em combates por turnos.
          </p>
        </div>

        {/* Botões Planos de Ação */}
        <div className="start-actions">
          {hasProgress && (
            <button
              type="button"
              className="btn-flat-continue"
              onClick={() => navigate("/home")}
            >
              <RotateCcw size={20} />
              <span>Continuar Partida</span>
            </button>
          )}

          <button
            type="button"
            className="btn-flat-new"
            onClick={handleNewGame}
          >
            <Sparkles size={20} />
            <span>Novo Jogo</span>
          </button>
        </div>

        {/* Rodapé Informativo */}
        <div className="start-footer">
          <span>Versão 1.0 • Interface Flat</span>
        </div>
      </div>
    </div>
  );
}
