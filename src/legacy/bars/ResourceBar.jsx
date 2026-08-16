import { useEffect, useRef, useState } from "react";
import "./ResourceBar.css";

const STEP_MS = 120;

export default function ResourceBar({
  value,
  max,
  fill,
  tick,
  height = 16,
  vertical = false,
  reverse = false,
  progress = null,
}) {
  const clamped = Math.max(0, Math.min(max, value));
  const continuous = progress !== null;

  const prevValue = useRef(clamped);
  const [solidUnits, setSolidUnits] = useState(clamped);
  const [ghostUnits, setGhostUnits] = useState(clamped);
  const [ghostOn, setGhostOn] = useState(false);
  const [ghostDuration, setGhostDuration] = useState(0);
  const [fillDuration, setFillDuration] = useState(400);

  useEffect(() => {
    const prev = prevValue.current;
    prevValue.current = clamped;

    if (continuous) {
      setSolidUnits(clamped);
      setGhostUnits(clamped);
      setFillDuration(clamped > prev ? 160 : 400);
      return;
    }

    if (clamped > prev) {
      setGhostOn(true);
      setGhostUnits(clamped);
      setFillDuration(90);

      const start = Math.floor(prev) + 1;
      const steps = [];
      for (let u = start; u <= clamped; u += 1) steps.push(u);
      const count = Math.max(1, steps.length);
      setGhostDuration(count * STEP_MS);

      const timers = steps.map((u, idx) =>
        setTimeout(() => setSolidUnits(u), (idx + 1) * STEP_MS)
      );
      timers.push(setTimeout(() => setGhostOn(false), count * STEP_MS + 220));

      return () => timers.forEach(clearTimeout);
    }

    setSolidUnits(clamped);
    setGhostUnits(clamped);
    setGhostOn(false);
    setFillDuration(400);
  }, [clamped, continuous]);

  const solidValue = Math.round(solidUnits);
  const solidPct = max > 0 ? (solidUnits / max) * 100 : 0;

  let ghostPct;
  let ghostVisible;
  if (continuous) {
    const ghostVal = Math.min(max, clamped + progress);
    ghostPct = max > 0 ? (ghostVal / max) * 100 : 0;
    ghostVisible = clamped < max;
  } else {
    ghostPct = max > 0 ? (ghostUnits / max) * 100 : 0;
    ghostVisible = ghostOn;
  }

  const ticks = [];
  for (let i = 0; i < max; i++) {
    ticks.push(
      <span
        key={i}
        className={"resource-tick" + (vertical ? " v" : "")}
        style={{
          ...(vertical
            ? { [reverse ? "top" : "bottom"]: (i / max) * 100 + "%" }
            : { left: (i / max) * 100 + "%" }),
          background: i < solidValue ? tick : "#2a3038",
        }}
      />
    );
  }

  const barClass =
    "resource-bar" +
    (vertical ? " vertical" : "") +
    (reverse ? " reverse" : "");

  return (
    <div
      className={barClass}
      style={vertical ? undefined : { height: height + "px" }}
    >
      <div
        className={"resource-ghost" + (ghostVisible ? " on" : "")}
        style={{
          "--ghost-dur": (continuous ? 120 : ghostDuration) + "ms",
          [vertical ? "height" : "width"]: ghostPct + "%",
          background: fill,
        }}
      />
      <div
        className="resource-fill"
        style={{
          "--fill-dur": fillDuration + "ms",
          [vertical ? "height" : "width"]: solidPct + "%",
          background: fill,
        }}
      />
      {ticks}
    </div>
  );
}