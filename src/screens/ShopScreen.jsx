import { useRef, useState } from "react";
import { Coins, Gem, Clock, Lock, X } from "lucide-react";
import { useGame } from "../context/GameContext.jsx";
import { ITEMS } from "../constants/items.js";
import { ORES } from "../constants/ores.js";
import {
  EQUIPMENT_SLOTS,
  SLOT_UNLOCK,
  getEquipmentItem,
  upgradeCost,
  passiveLabel,
} from "../constants/equipment.js";
import "./ShopScreen.css";

export default function ShopScreen() {
  const {
    gold,
    level,
    itemsOwned,
    buyItem,
    ores,
    equipment,
    unlockedSlots,
    discoverFromOre,
    unlockSlot,
    upgradeEquipment,
  } = useGame();
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [revealed, setRevealed] = useState(null);
  const toastTimer = useRef(null);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  function handleBuy(item) {
    const res = buyItem(item.id);
    if (res.ok) {
      showToast(`${item.name} comprada!`);
    } else if (res.reason === "gold") {
      showToast(`Ouro insuficiente — faltam ${item.price - gold} de ouro.`);
    }
  }

  function handleDiscover() {
    const type = confirm;
    const ore = ORES[type];
    setConfirm(null);
    const res = discoverFromOre(type);
    if (res.ok) {
      setRevealed({ item: res.item, slot: res.slot });
    } else if (res.reason === "gold") {
      showToast(
        `Ouro insuficiente — faltam ${ore.discoverCost - gold} de ouro.`
      );
    } else if (res.reason === "ore") {
      showToast("Você não tem esse minério.");
    } else if (res.reason === "full") {
      showToast("Inventário cheio — libere um slot primeiro.");
    }
  }

  function handleUnlock(index) {
    const req = SLOT_UNLOCK[index];
    const res = unlockSlot(index);
    if (res.ok) {
      showToast("Slot liberado!");
    } else if (res.reason === "level") {
      showToast(`Requer nível ${req.level}.`);
    } else if (res.reason === "gold") {
      showToast(`Ouro insuficiente — faltam ${req.gold - gold} de ouro.`);
    }
  }

  function handleUpgrade(index) {
    const entry = equipment[index];
    const res = upgradeEquipment(index);
    if (res.ok) {
      showToast("Item melhorado!");
    } else if (res.reason === "gold" && entry) {
      const cost = upgradeCost(entry.level);
      showToast(`Ouro insuficiente — faltam ${cost - gold} de ouro.`);
    }
  }

  const freeSlot = unlockedSlots.find((s) => !equipment[s]);

  const RevealModal = () => {
    const item = revealed.item;
    const ItemIcon = item.icon;
    return (
      <div className="shop-modal-overlay" onClick={() => setRevealed(null)}>
        <div className="shop-modal" onClick={(e) => e.stopPropagation()}>
          <button
            className="modal-close"
            type="button"
            onClick={() => setRevealed(null)}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
          <div className="modal-title">Você encontrou:</div>
          <div className="reveal-item">
            <ItemIcon size={26} />
            <span className="reveal-name">{item.name}</span>
            <span className="reveal-passive">{passiveLabel(item, 1)}</span>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => setRevealed(null)}>
              Equipado no slot {revealed.slot + 1}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="shop-view">
      <div className="shop-header">
        <h2 className="shop-title">Loja</h2>
        <span className="shop-sub">
          Inventário no topo, itens de batalha embaixo
        </span>
        <div className="shop-gold">
          <Coins size={14} />
          <span>{gold} de ouro</span>
        </div>
      </div>

      <section className="inv-section">
        <h3 className="inv-title">Inventário</h3>

        <div className="inv-ores">
          {Object.keys(ORES).map((type) => {
            const ore = ORES[type];
            const count = ores[type] || 0;
            const OreIcon = ore.icon;
            const canDiscover = count > 0 && gold >= ore.discoverCost && freeSlot != null;
            return (
              <div className={"inv-ore-card rarity-" + type} key={type}>
                <OreIcon size={18} />
                <span className="inv-ore-name">{ore.name}</span>
                <span className="inv-ore-count">x{count}</span>
                <span className="inv-ore-rarity">{ore.rarityLabel}</span>
                <button
                  type="button"
                  onClick={() => setConfirm(type)}
                  disabled={!canDiscover}
                >
                  Descobrir ({ore.discoverCost} ouro)
                </button>
              </div>
            );
          })}
        </div>

        <div className="inv-slots">
          {Array.from({ length: EQUIPMENT_SLOTS }).map((_, i) => {
            const entry = equipment[i];
            const unlocked = unlockedSlots.includes(i);
            if (entry) {
              const item = getEquipmentItem(entry.itemId);
              const ItemIcon = item.icon;
              const cost = upgradeCost(entry.level);
              return (
                <div className="inv-slot filled" key={i}>
                  <ItemIcon size={20} />
                  <span className="slot-name">{item.name}</span>
                  <span className="slot-passive">
                    {passiveLabel(item, entry.level)}
                  </span>
                  <span className="slot-level">Nível {entry.level}</span>
                  <button
                    type="button"
                    onClick={() => handleUpgrade(i)}
                    disabled={gold < cost}
                  >
                    Melhorar ({cost} ouro)
                  </button>
                </div>
              );
            }
            if (unlocked) {
              return (
                <div className="inv-slot empty" key={i}>
                  <span className="slot-name">Vazio</span>
                  <span className="slot-passive">
                    Descubra um item com um minério
                  </span>
                </div>
              );
            }
            const req = SLOT_UNLOCK[i];
            return (
              <div className="inv-slot locked" key={i}>
                <Lock size={18} />
                <span className="slot-name">Bloqueado</span>
                <span className="slot-passive">
                  Nível {req.level} · {req.gold} ouro
                </span>
                <button
                  type="button"
                  onClick={() => handleUnlock(i)}
                  disabled={level < req.level || gold < req.gold}
                >
                  Desbloquear
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <div className="shop-header shop-lower-head">
        <h3 className="shop-title">Itens de Batalha</h3>
        <span className="shop-sub">Compre itens para usar na batalha</span>
      </div>

      <div className="shop-list">
        {ITEMS.map((item) => {
          const owned = itemsOwned[item.id] || 0;
          return (
            <div className={"shop-card branch-" + item.branch} key={item.id}>
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
                  type="button"
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

      {confirm && (
        <div className="shop-modal-overlay" onClick={() => setConfirm(null)}>
          <div className="shop-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              type="button"
              onClick={() => setConfirm(null)}
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
            <div className="modal-title">Descobrir item</div>
            <p className="modal-desc">
              Gastar {ORES[confirm].discoverCost} de ouro e 1{" "}
              {ORES[confirm].name} para revelar um item equipável{" "}
              {ORES[confirm].rarityLabel} aleatório?
            </p>
            <div className="modal-actions">
              <button type="button" onClick={() => setConfirm(null)}>
                Cancelar
              </button>
              <button type="button" onClick={handleDiscover}>
                Descobrir
              </button>
            </div>
          </div>
        </div>
      )}

      {revealed && <RevealModal />}

      {toast && <div className="shop-toast">{toast}</div>}
    </div>
  );
}