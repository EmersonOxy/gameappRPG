import { Routes, Route } from "react-router-dom";
import StartScreen from "./screens/StartScreen.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import BattleScreen from "./screens/BattleScreen.jsx";
import LevelUpScreen from "./screens/LevelUpScreen.jsx";

export default function App() {
  return (
    <div className="app-frame">
      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/home/*" element={<HomeScreen />} />
        <Route path="/battle" element={<BattleScreen />} />
        <Route path="/levelup" element={<LevelUpScreen />} />
      </Routes>
    </div>
  );
}
