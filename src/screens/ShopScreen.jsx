import { useRef, useState } from "react";
import { Coins, Gem, Clock } from "lucide-react";
import { useGame } from "../context/GameContext.jsx";
import { ITEMS } from "../constants/items.js";
import "./ShopScreen.css";

export default function ShopScreen() {
  const { gold, itemsOwned, buyItem } = useGame();
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }

  function handleBuy(item) {
    const res = buyItem(item.id);
    if (res.ok) {
      showToast(`${item.name} comprada!`);
    } else if (res.reason === "gold") {
      showToast(`Ouro insuficiente — faltam ${item.price - gold} de ouro.`);
    }
  }

  return (
    <div className="shop-view">
      <div className="shop-header">
        <h2 className="shop-title">Loja</h2>
        <span className="shop-sub">Compre itens para usar na batalha</span>
        <div className="shop-gold">
          <Coins size={14} />
          <span>{gold} de ouro</span>
        </div>
      </div>

      <div className="shop-list">
        {ITEMS.map((item) => {
          const owned = itemsOwned[item.id] || 0;
          return (
            <div className={"shop-card branch-" + item.branch} key={item.id}>
              <div className={"shop-icon branch-" + item.branch}>
                <img src={item.sprite} alt={item.name} />
              </div>
              <div className="shop-info">
                <span className="shop-name">{item.name}</span>
                <span className="shop-desc">{item.description}</span>
                <div className="shop-costs">
                  <span className="shop-cost gold">
                    <Coins size={12} /> {item.price}
                  </span>
                  <span className="shop-cost crystal">
                    <Gem size={12} /> {item.crystalCost} cristais
                  </span>
                  <span className="shop-cost delay">
                    <Clock size={12} /> ativa em {item.delay} turno
                    {item.delay > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="shop-side">
                {owned > 0 && <span className="shop-owned">x{owned}</span>}
                <button
                  className="shop-buy btn-3d"
                  onClick={() => handleBuy(item)}
                  disabled={gold < item.price}
                >
                  <Coins size={14} /> Comprar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {toast && <div className="shop-toast">{toast}</div>}
    </div>
  );
}
