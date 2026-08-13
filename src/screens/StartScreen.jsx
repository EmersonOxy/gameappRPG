import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import "./StartScreen.css";

export default function StartScreen() {
  const navigate = useNavigate();

  return (
    <div className="start-screen">
      <div className="start-content">
        <div className="game-logo">
          <h1 className="game-title">GAMEAPP</h1>
          <span className="game-subtitle">RPG</span>
        </div>
        <p className="game-tagline">Sua aventura começa aqui</p>
        <button className="btn-start" onClick={() => navigate("/home")}>
          <Play size={22} fill="currentColor" />
          Iniciar
        </button>
      </div>
    </div>
  );
}
