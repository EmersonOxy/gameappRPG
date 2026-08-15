import { useEffect, useRef, useState } from "react";
import "./HealthBar.css";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export default function HealthBar({
  hp,
  max,
  currentMax = max,
  hitKey,
  vertical = false,
  reverse = false,
}) {
  const [shaking, setShaking] = useState(false);
  const [healOn, setHealOn] = useState(false);
  const [ghostPct, setGhostPct] = useState((hp / max) * 100);
  const [recentHp, setRecentHp] = useState(null);
  const prevHp = usePrevious(hp);

  useEffect(() => {
    if (!hitKey) return;
    setShaking(true);
    const t = setTimeout(() => setShaking(false), 400);
    return () => clearTimeout(t);
  }, [hitKey]);

  // Cura: prévia verde preenche antes, vermelho cobre depois
  useEffect(() => {
    setGhostPct((hp / max) * 100);
    if (prevHp == null || hp <= prevHp) {
      setHealOn(false);
      return;
    }
    setHealOn(true);
    const t = setTimeout(() => setHealOn(false), 900);
    return () => clearTimeout(t);
  }, [hp, prevHp, max]);

  // Dano na vida atual: barra branca veloz mostrando o pedaço perdido
  useEffect(() => {
    if (prevHp == null || hp >= prevHp) return;
    setRecentHp(prevHp);
    const t1 = setTimeout(() => setRecentHp(hp), 150);
    const t2 = setTimeout(() => setRecentHp(null), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [hp, prevHp, max]);

  const fillPct = (hp / max) * 100;
  const maxPct = (currentMax / max) * 100;
  const recentPct =
    recentHp != null ? Math.max(0, ((recentHp - hp) / max) * 100) : 0;

  const ticks = [];
  for (let i = 0; i < max; i++) {
    ticks.push(
      <span
        key={i}
        className={
          "tick " + (i < hp ? "filled" : "empty") + (vertical ? " v" : "")
        }
        style={
          vertical
            ? { [reverse ? "top" : "bottom"]: (i / max) * 100 + "%" }
            : { left: (i / max) * 100 + "%" }
        }
      />
    );
  }

  const barClass =
    "health-bar" + (vertical ? " vertical" : "") + (reverse ? " reverse" : "");

  return (
    <div
      className={
        "health-shake" +
        (vertical ? " vertical" : "") +
        (shaking ? " shake" : "")
      }
    >
      <div className={barClass}>
        <div
          className="health-max"
          style={vertical ? { height: maxPct + "%" } : { width: maxPct + "%" }}
        />
        <div
          className={"health-heal-ghost" + (healOn ? " on" : "")}
          style={
            vertical ? { height: ghostPct + "%" } : { width: ghostPct + "%" }
          }
        />
        <div
          className="health-fill"
          style={vertical ? { height: fillPct + "%" } : { width: fillPct + "%" }}
        />
        {recentHp != null && (
          <div
            className="health-recent"
            style={
              vertical
                ? {
                    [reverse ? "top" : "bottom"]: fillPct + "%",
                    height: recentPct + "%",
                  }
                : { left: fillPct + "%", width: recentPct + "%" }
            }
          />
        )}
        {ticks}
      </div>
    </div>
  );
}
