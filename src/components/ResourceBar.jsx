import "./ResourceBar.css";

export default function ResourceBar({ value, max, fill, tick, height = 16 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const ticks = [];
  for (let i = 0; i < max; i++) {
    ticks.push(
      <span
        key={i}
        className="resource-tick"
        style={{
          left: (i / max) * 100 + "%",
          background: i < value ? tick : "#2a3038",
        }}
      />
    );
  }

  return (
    <div className="resource-bar" style={{ height: height + "px" }}>
      <div
        className="resource-fill"
        style={{ width: pct + "%", background: fill }}
      />
      {ticks}
    </div>
  );
}
