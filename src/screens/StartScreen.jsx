import { useNavigate } from "react-router-dom";
import { Swords, Play, RotateCcw, Shield, Sparkles } from "lucide-react";
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

      {/* Rodapé Visível com Destaque Super Suave */}
      <footer className="start-footer">
        <div className="footer-pill">
          <Sparkles size={13} className="footer-icon" />
          <span className="footer-text">Versão 1.0 • RPG Tático Mobile</span>
        </div>
      </footer>
    </div>
  );
}
