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
    const t = setTimeout(() => setRecentHp(null), 900);
    return () => clearTimeout(t);
  }, [hitKey]);

  const fillPct = (hp / max) * 100;
  const recentLeft = fillPct;
  const recentWidth = recentHp != null ? ((recentHp - hp) / max) * 100 : 0;

  const ticks = [];
  for (let i = 1; i < max; i++) {
    ticks.push(
      <span key={i} className="tick" style={{ left: (i / max) * 100 + "%" }} />
    );
  }

  return (
    <div className={"health-shake" + (shaking ? " shake" : "")}>
      <div className="health-bar">
        <div className="health-fill" style={{ width: fillPct + "%" }} />
        {recentHp != null && recentWidth > 0 && (
          <div
            className="health-recent"
            style={{ left: recentLeft + "%", width: recentWidth + "%" }}
          />
        )}
        {ticks}
      </div>
    </div>
  );
}
