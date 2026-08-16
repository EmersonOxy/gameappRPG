import { useEffect, useRef, useState } from "react";
import { Pickaxe, Mountain, Gem } from "lucide-react";
import { useGame } from "../context/GameContext.jsx";
import {
  ORES,
  ORE_CHANCE,
  MAX_ORES_ON_SCREEN,
  ORE_TTL_MS,
} from "../constants/ores.js";
import "./MineScreen.css";

export default function MineScreen() {
  const { ores, addOre } = useGame();
  const [popups, setPopups] = useState([]);
  const [toast, setToast] = useState(null);
  const timersRef = useRef(new Map());
  const idRef = useRef(0);
  const toastTimer = useRef(null);

  useEffect(
    () => () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      clearTimeout(toastTimer.current);
    },
    []
  );

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }

  function spawnOre(type) {
    const id = ++idRef.current;
    const x = 4 + Math.random() * 72;
    const y = 12 + Math.random() * 50;
    setPopups((prev) => [...prev, { id, x, y, type }]);
    timersRef.current.set(
      id,
      setTimeout(() => {
        timersRef.current.delete(id);
        setPopups((prev) => prev.filter((p) => p.id !== id));
      }, ORE_TTL_MS)
    );
  }

  function handleMine() {
    if (popups.length >= MAX_ORES_ON_SCREEN) return;
    const r = Math.random();
    if (r < ORE_CHANCE.raro) {
      spawnOre("raro");
    } else if (r < ORE_CHANCE.raro + ORE_CHANCE.ferro) {
      spawnOre("ferro");
    }
  }

  function collect(popup) {
    clearTimeout(timersRef.current.get(popup.id));
    timersRef.current.delete(popup.id);
    setPopups((prev) => prev.filter((p) => p.id !== popup.id));
    addOre(popup.type);
    showToast(`+1 ${ORES[popup.type].name}`);
  }

  return (
    <div className="mine-view">
      <div className="mine-header">
        <h2 className="mine-title">Mina</h2>
        <span className="mine-sub">
          Clique para minerar. Pegue os minérios que aparecerem na tela.
        </span>
        <div className="mine-ores">
          {Object.keys(ORES).map((type) => {
            const ore = ORES[type];
            const OreIcon = ore.icon;
            return (
              <span className={"mine-chip rarity-" + type} key={type}>
                <OreIcon size={14} />
                {ore.name}: {ores[type] || 0}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mine-play">
        <button type="button" className="mine-btn" onClick={handleMine}>
          <Pickaxe size={34} />
          <span>Minerar</span>
        </button>

        {popups.map((p) => {
          const ore = ORES[p.type];
          const OreIcon = ore.icon;
          return (
            <button
              type="button"
              key={p.id}
              className={"ore-pop rarity-" + p.type}
              style={{ left: p.x + "%", top: p.y + "%" }}
              onClick={() => collect(p)}
              aria-label={"Coletar " + ore.name}
            >
              <OreIcon size={22} />
            </button>
          );
        })}
      </div>

      {toast && <div className="mine-toast">{toast}</div>}
    </div>
  );
}