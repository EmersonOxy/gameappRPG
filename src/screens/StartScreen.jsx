import { useNavigate } from "react-router-dom";
import { Swords, Play, RotateCcw, Shield } from "lucide-react";
import { useGame } from "../context/GameContext.jsx";
import "./StartScreen.css";

export default function StartScreen() {
  const navigate = useNavigate();
  const { hasProgress, resetProgress } = useGame();

  function handleNewGame() {
    resetProgress();
    navigate("/home");
  }

  function handleContinue() {
    navigate("/home");
  }

  return (
    <div className="start-screen">
      {/* Cabeçalho */}
      <header className="start-header">
        <div className="start-header-icon">
          <Shield size={32} />
        </div>
        <h1 className="start-title">Crônicas de Heróis</h1>
        <p className="start-subtitle">RPG Tático por Turnos</p>
      </header>

      {/* Conteúdo Central com Botões Planos */}
      <main className="start-main">
        <div className="start-menu">
          {hasProgress && (
            <button
              type="button"
              className="start-btn btn-primary"
              onClick={handleContinue}
            >
              <RotateCcw size={18} />
              <span>Continuar Jornada</span>
            </button>
          )}

          <button
            type="button"
            className={`start-btn ${hasProgress ? "btn-secondary" : "btn-primary"}`}
            onClick={handleNewGame}
          >
            {hasProgress ? <Play size={18} /> : <Swords size={18} />}
            <span>Novo Jogo</span>
          </button>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="start-footer">
        <span>Versão 1.0 • RPG Tático</span>
      </footer>
    </div>
  );
}
