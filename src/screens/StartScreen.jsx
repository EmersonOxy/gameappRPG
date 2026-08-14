import { useNavigate } from "react-router-dom";
import { Sword } from "lucide-react";
import "./StartScreen.css";

export default function StartScreen() {
  const navigate = useNavigate();

  return (
    <div className="start-screen">
      {/* Corner ornaments */}
      <div className="start-corner tl" />
      <div className="start-corner tr" />
      <div className="start-corner bl" />
      <div className="start-corner br" />

      {/* Horizontal dividers */}
      <div className="start-divider top" />
      <div className="start-divider bottom" />

      <div className="start-content">
        {/* Animated emblem */}
        <div className="start-emblem">
          <div className="start-emblem-ring" />
          <div className="start-emblem-ring inner" />
          <span className="start-emblem-icon">⚔️</span>
        </div>

        {/* Title */}
        <div className="game-logo">
          <h1 className="game-title">GAMEAPP</h1>
          <span className="game-subtitle">RPG</span>
        </div>

        {/* Metallic separator */}
        <div className="start-sep">
          <div className="start-sep-line" />
          <div className="start-sep-diamond" />
          <div className="start-sep-line right" />
        </div>

        <p className="game-tagline">Sua aventura começa aqui</p>

        <button className="btn-start" onClick={() => navigate("/home")}>
          <Sword size={18} />
          Iniciar
        </button>
      </div>
    </div>
  );
}
