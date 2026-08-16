import { useNavigate } from "react-router-dom";
import { Swords, Crown, Trophy } from "lucide-react";
import { useGame } from "../context/GameContext.jsx";
import { MAPS } from "../constants/maps.js";
import { getEnemy } from "../constants/enemies.js";
import "./MapScreen.css";

export default function MapScreen() {
  const navigate = useNavigate();
  const { clearedMaps, isMapUnlocked, selectMap, getMapWins, level } = useGame();

  function handleSelect(map) {
    if (!isMapUnlocked(map.id)) return;
    selectMap(map.id);
    navigate("/battle");
  }

  return (
    <div className="map-view">
      <div className="map-header">
        <h2 className="map-title">Mapa</h2>
        <span className="map-sub">Vença o chefe de uma região para abrir a próxima</span>
      </div>

      <div className="map-list">
        {MAPS.map((map, idx) => {
          const unlocked = isMapUnlocked(map.id);
          const cleared = clearedMaps.includes(map.id);
          const wins = getMapWins(map.id);
          const bossReady = unlocked && !cleared && wins >= map.fightsToBoss;
          const boss = getEnemy(map.boss);
          const prevMap = idx > 0 ? MAPS[idx - 1] : null;

          const state = !unlocked
            ? "locked"
            : cleared
            ? "cleared"
            : bossReady
            ? "boss"
            : "open";

          return (
            <button
              key={map.id}
              className={"map-card " + state}
              onClick={() => handleSelect(map)}
              disabled={!unlocked}
            >
              <div className="map-card-body">
                <div className="map-card-head">
                  <span className="map-card-name">{map.name}</span>
                  <span className="map-card-level">
                    Nv. {map.minLevel}–{map.maxLevel}
                  </span>
                </div>
                <span className="map-card-tag">{map.tagline}</span>

                <div className="map-card-enemies">
                  {map.enemyPool.map((eid) => {
                    const e = getEnemy(eid);
                    return (
                      <span className="map-enemy" key={eid}>
                        <em>{e.name}</em>
                      </span>
                    );
                  })}
                  {boss && (
                    <span className="map-enemy boss">
                      <Crown size={10} />
                      <em>{boss.name}</em>
                    </span>
                  )}
                </div>

                {state === "locked" ? (
                  <span className="map-card-status">
                    <Lock size={12} /> Derrote o chefe de «{prevMap?.name}»
                  </span>
                ) : state === "cleared" ? (
                  <span className="map-card-status cleared">
                    <Trophy size={12} /> Chefe derrotado
                  </span>
                ) : state === "boss" ? (
                  <span className="map-card-status boss">
                    <Crown size={12} /> Chefe pronto para a batalha!
                  </span>
                ) : (
                  <span className="map-card-status">
                    <Swords size={12} /> {wins}/{map.fightsToBoss} vitórias até o chefe
                  </span>
                )}
              </div>

              {state === "open" || state === "boss" || state === "cleared" ? (
                <span className="map-card-go">
                  {state === "cleared" ? "Repetir" : "Batalhar"}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="map-footer">
        <span className="map-footer-note">
          Seu nível: {level} — regiões mais fortes dão mais ouro e XP
        </span>
      </div>
    </div>
  );
}
