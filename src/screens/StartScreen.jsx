import { useNavigate } from "react-router-dom";
import { Sword, RotateCw } from "lucide-react";
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
      <div className="start-content">
        {/* Title */}
        <div className="game-logo">
          <h1 className="game-title">GAMEAPP</h1>
          <span className="game-subtitle">RPG</span>
        </div>

        <p className="game-tagline">Sua aventura começa aqui</p>

        <div className="start-menu">
          {hasProgress && (
            <button type="button" onClick={() => navigate("/home")}>
              <RotateCw size={18} />
              Continuar
            </button>
          )}
          <button type="button" onClick={handleNewGame}>
            <Sword size={18} />
            Novo Jogo
          </button>
        </div>
      </div>
    </div>
  );
}
