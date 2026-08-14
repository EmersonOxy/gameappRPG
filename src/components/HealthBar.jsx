import { useEffect, useRef, useState } from "react";
import "./HealthBar.css";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export default function HealthBar({ hp, max, hitKey, vertical = false, reverse = false }) {
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
        className={"tick " + (i < hp ? "filled" : "empty") + (vertical ? " v" : "")}
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
        {recentHp != null && (
          <div
            className="health-recent"
            style={
              vertical
                ? {
                    [reverse ? "top" : "bottom"]: fillPct + "%",
                    height: recentWidth + "%",
                  }
                : { left: fillPct + "%", width: recentWidth + "%" }
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
