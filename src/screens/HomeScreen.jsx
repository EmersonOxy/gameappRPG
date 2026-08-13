import { Routes, Route } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import Placeholder from "../components/Placeholder.jsx";
import InicioView from "./InicioView.jsx";
import "./HomeScreen.css";

export default function HomeScreen() {
  return (
    <div className="home-screen">
      <header className="top-bar">
        <div className="player-info">
          <div className="avatar" />
          <div className="player-text">
            <span className="player-name">Aventureiro</span>
            <span className="player-level">Nível 1</span>
          </div>
        </div>
        <div className="currency">
          <span className="currency-item gold">
            <span className="dot gold-dot" /> 0
          </span>
          <span className="currency-item gems">
            <span className="dot gem-dot" /> 0
          </span>
        </div>
      </header>

      <main className="home-content">
        <Routes>
          <Route index element={<InicioView />} />
          <Route path="cards" element={<Placeholder title="Cartas" />} />
          <Route path="shop" element={<Placeholder title="Loja" />} />
          <Route path="profile" element={<Placeholder title="Perfil" />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
}
