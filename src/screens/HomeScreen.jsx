import { Routes, Route } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import Placeholder from "../components/Placeholder.jsx";
import InicioView from "./InicioView.jsx";
import SkillTreeScreen from "./SkillTreeScreen.jsx";
import { useGame } from "../context/GameContext.jsx";
import "./HomeScreen.css";

const PLAYER_NAME = "Aventureiro";

export default function HomeScreen() {
  const { gold, xp, level, xpPerLevel } = useGame();
  const initials = PLAYER_NAME.slice(0, 1).toUpperCase();

  return (
    <div className="home-screen">
      <header className="top-bar">
        <div className="top-bar-main">
          <div className="player-info">
            <div className="avatar">{initials}</div>
            <div className="player-text">
              <span className="player-name">{PLAYER_NAME}</span>
              <span className="player-level">Nível {level}</span>
            </div>
          </div>
          <div className="currency">
            <span className="currency-item gold">
              <span className="dot gold-dot" /> {gold}
            </span>
          </div>
        </div>
        <div className="xp-track">
          <div
            className="xp-fill"
            style={{ width: `${(xp / xpPerLevel) * 100}%` }}
          />
        </div>
      </header>

      <main className="home-content">
        <Routes>
          <Route index element={<InicioView />} />
          <Route path="skills" element={<SkillTreeScreen />} />
          <Route path="shop" element={<Placeholder title="Loja" />} />
          <Route path="profile" element={<Placeholder title="Perfil" />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
}
