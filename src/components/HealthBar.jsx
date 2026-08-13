import { useEffect, useRef, useState } from "react";
import "./HealthBar.css";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export default function HealthBar({ hp, max, hitKey }) {
  const [shaking, setShaking] = useState(false);
  const [recentHp, setRecentHp] = useState(null);
  const prevHp = usePrevious(hp);

  useEffect(() => {
    if (!hitKey) return;
    setShaking(true);
    const t = setTimeout(() => setShaking(false), 400);
    return () => clearTimeout(t);
  }, [hitKey]);

  useEffect(() => {
    if (!hitKey) return;
    if (prevHp == null || hp >= prevHp) return;
    setRecentHp(prevHp);
    const t1 = setTimeout(() => setRecentHp(hp), 800);
    const t2 = setTimeout(() => setRecentHp(null), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [hitKey]);

  const fillPct = (hp / max) * 100;
  const recentWidth =
    recentHp != null ? Math.max(0, ((recentHp - hp) / max) * 100) : 0;

  const ticks = [];
  for (let i = 0; i < max; i++) {
    ticks.push(
      <span
        key={i}
        className={"tick " + (i < hp ? "filled" : "empty")}
        style={{ left: (i / max) * 100 + "%" }}
      />
    );
  }

  return (
    <div className={"health-shake" + (shaking ? " shake" : "")}>
      <div className="health-bar">
        {recentHp != null && (
          <div
            className="health-recent"
            style={{ left: fillPct + "%", width: recentWidth + "%" }}
          />
        )}
        <div className="health-fill" style={{ width: fillPct + "%" }} />
        {ticks}
      </div>
    </div>
  );
}
