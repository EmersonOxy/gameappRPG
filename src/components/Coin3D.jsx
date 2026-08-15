import "./Coin3D.css";

const EDGE_SEGMENTS = 16;

export default function Coin3D({ size = 96, className = "" }) {
  const thickness = Math.max(6, Math.round(size * 0.1));

  return (
    <div
      className={"coin-scene" + (className ? " " + className : "")}
      style={{ width: size, height: size }}
    >
      <div
        className="coin"
        style={{
          "--coin-radius": `${size / 2}px`,
          "--coin-thickness": `${thickness}px`,
        }}
      >
        <div className="coin-face coin-front">
          <span className="coin-emblem gem" />
        </div>
        <div className="coin-face coin-back">
          <span className="coin-emblem rune" />
        </div>
        {Array.from({ length: EDGE_SEGMENTS }).map((_, i) => (
          <div key={i} className="coin-edge" style={{ "--ei": i }} />
        ))}
      </div>
    </div>
  );
}
