import { Routes, Route, Navigate } from "react-router-dom";
import { Coins, User, Sparkles } from "lucide-react";
import BottomNav from "../components/BottomNav.jsx";
import InicioView from "./InicioView.jsx";
import SkillTreeScreen from "./SkillTreeScreen.jsx";
import ShopScreen from "./ShopScreen.jsx";
import MapScreen from "./MapScreen.jsx";
import MineScreen from "./MineScreen.jsx";
import { useGame } from "../context/GameContext.jsx";
import "./HomeScreen.css";

const PLAYER_NAME = "Aventureiro";

export default function HomeScreen() {
  const { gold, xp, level, xpPerLevel } = useGame();
  const xpPercentage = Math.min(100, Math.max(0, (xp / xpPerLevel) * 100));

  return (
    <div className="home-screen">
      {/* Barra de Status Superior (TopBar) Estilo Clash Royale / LoR */}
      <header className="top-bar">
        <div className="top-bar-main">
          {/* Avatar e Nível do Jogador */}
          <div className="player-info">
            <div className="player-avatar-badge">
              <User size={18} className="player-avatar-icon" />
              <span className="level-bubble">{level}</span>
            </div>
            <div className="player-text">
              <span className="player-name">{PLAYER_NAME}</span>
              <div className="player-xp-counter">
                <Sparkles size={11} className="xp-sparkle" />
                <span>{xp} / {xpPerLevel} XP</span>
              </div>
            </div>
          </div>

          {/* Contador de Ouro com Moeda 3D */}
          <div className="currency-pill">
            <div className="coin-icon-wrap">
              <Coins size={16} className="coin-icon" />
            </div>
            <span className="currency-value">{gold.toLocaleString()}</span>
          </div>
        </div>

        {/* Barra de Progresso de Nível com Shimmer */}
        <div className="xp-track-container">
          <div className="xp-track">
            <div
              className="xp-fill"
              style={{ width: `${xpPercentage}%` }}
            >
              <div className="xp-shimmer" />
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo da Tela Selecionada */}
      <main className="home-content">
        <Routes>
          <Route index element={<InicioView />} />
          <Route path="map" element={<MapScreen />} />
          <Route path="skills" element={<SkillTreeScreen />} />
          <Route path="shop" element={<ShopScreen />} />
          <Route path="mine" element={<MineScreen />} />
          <Route path="profile" element={<Navigate to="/home/mine" replace />} />
        </Routes>
      </main>

      {/* Barra de Navegação Inferior */}
      <BottomNav />
    </div>
  );
}
