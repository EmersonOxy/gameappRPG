import { useEffect, useRef, useState } from "react";
import "./ResourceBar.css";

export default function ResourceBar({ value, max, fill, tick, height = 16 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const prevValue = useRef(value);
  const [solid, setSolid] = useState(pct);
  const [ghost, setGhost] = useState(pct);
  const [ghostOn, setGhostOn] = useState(false);

  useEffect(() => {
    const prev = prevValue.current;
    prevValue.current = value;

    if (value > prev) {
      setGhostOn(true);
      setGhost(pct);
      const t1 = setTimeout(() => setSolid(pct), 150);
      const t2 = setTimeout(() => setGhostOn(false), 560);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    setSolid(pct);
    setGhost(pct);
    setGhostOn(false);
  }, [value, pct]);

  const solidValue = Math.round((solid / 100) * max);
  const ticks = [];
  for (let i = 0; i < max; i++) {
    ticks.push(
      <span
        key={i}
        className="resource-tick"
        style={{
          left: (i / max) * 100 + "%",
          background: i < solidValue ? tick : "#2a3038",
        }}
      />
    );
  }

  return (
    <div className="resource-bar" style={{ height: height + "px" }}>
      <div
        className={"resource-ghost" + (ghostOn ? " on" : "")}
        style={{ width: ghost + "%", background: fill }}
      />
      <div
        className="resource-fill"
        style={{ width: solid + "%", background: fill }}
      />
      {ticks}
    </div>
  );
}
