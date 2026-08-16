import { useEffect, useRef, useState } from "react";
import "./HealthBar.css";

const TICK_MS = 120;

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
  const [displayHp, setDisplayHp] = useState(hp);
  const [whiteHp, setWhiteHp] = useState(hp);
  const [healTarget, setHealTarget] = useState(null);

  const prevHp = usePrevious(hp);

  const stepTimer = useRef(null);
  const displayRef = useRef(displayHp);
  displayRef.current = displayHp;
  const whiteRef = useRef(whiteHp);
  whiteRef.current = whiteHp;

  function stepTo(setter, from, to, onDone) {
    if (stepTimer.current) clearInterval(stepTimer.current);
    if (from === to) {
      setter(to);
      if (onDone) onDone();
      return;
    }
    let current = from;
    const dir = to > from ? 1 : -1;
    stepTimer.current = setInterval(() => {
      current += dir;
      const reached = (dir > 0 && current >= to) || (dir < 0 && current <= to);
      if (reached) current = to;
      setter(current);
      if (reached) {
        clearInterval(stepTimer.current);
        stepTimer.current = null;
        if (onDone) onDone();
      }
    }, TICK_MS);
  }

  useEffect(() => {
    if (!hitKey) return;
    setShaking(true);
    const t = setTimeout(() => setShaking(false), 400);
    return () => clearTimeout(t);
  }, [hitKey]);

  useEffect(() => {
    return () => {
      if (stepTimer.current) clearInterval(stepTimer.current);
    };
  }, []);

  useEffect(() => {
    if (prevHp == null || hp === prevHp) return;
    if (hp < prevHp) {
      setHealTarget(null);
      setDisplayHp(hp);
      stepTo(setWhiteHp, whiteRef.current, hp);
    } else {
      setHealTarget(hp);
      setWhiteHp(hp);
      stepTo(setDisplayHp, displayRef.current, hp, () => setHealTarget(null));
    }
  }, [hp, prevHp]);

  const fillPct = (Math.min(displayHp, currentMax) / max) * 100;
  const whitePct = (Math.min(whiteHp, currentMax) / max) * 100;
  const maxPct = (currentMax / max) * 100;
  const healPct =
    healTarget != null ? (Math.min(healTarget, currentMax) / max) * 100 : null;

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
          className="health-recent"
          style={
            vertical ? { height: whitePct + "%" } : { width: whitePct + "%" }
          }
        />
        {healPct != null && (
          <div
            className="health-heal-ghost"
            style={
              vertical ? { height: healPct + "%" } : { width: healPct + "%" }
            }
          />
        )}
        <div
          className="health-fill"
          style={vertical ? { height: fillPct + "%" } : { width: fillPct + "%" }}
        />
        {ticks}
      </div>
    </div>
  );
}