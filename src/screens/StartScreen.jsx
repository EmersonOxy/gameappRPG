import { useNavigate } from "react-router-dom";
import { Sword } from "lucide-react";
import VictorianCorner from "../components/ornaments/VictorianCorner.jsx";
import "./StartScreen.css";

export default function StartScreen() {
  const navigate = useNavigate();

  return (
    <div className="start-screen">
      {/* Corner ornaments */}
      <VictorianCorner pos="tl" metal="gold" gem="quartz" />
      <VictorianCorner pos="tr" metal="gold" gem="quartz" />
      <VictorianCorner pos="bl" metal="gold" gem="quartz" />
      <VictorianCorner pos="br" metal="gold" gem="quartz" />

      {/* Horizontal dividers */}
      <div className="rune-divider top" />
      <div className="rune-divider bottom" />

      <div className="start-content">
        {/* Animated emblem */}
        <div className="rune-emblem">
          <div className="rune-emblem-ring" />
          <div className="rune-emblem-ring inner" />
          <span className="rune-emblem-icon">⚔️</span>
        </div>

        {/* Title */}
        <div className="game-logo">
          <h1 className="game-title">GAMEAPP</h1>
          <span className="game-subtitle">RPG</span>
        </div>

        {/* Metallic separator */}
        <div className="rune-sep">
          <div className="rune-sep-line" />
          <div className="rune-sep-diamond" />
          <div className="rune-sep-line right" />
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
