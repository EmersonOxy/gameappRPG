import { useEffect, useState } from "react";
import "./HealthBar.css";

export default function HealthBar({ hp, max, hitKey }) {
  const [shaking, setShaking] = useState(false);
  const pct = Math.max(0, Math.min(100, (hp / max) * 100));

  useEffect(() => {
    if (!hitKey) return;
    setShaking(true);
    const t = setTimeout(() => setShaking(false), 400);
    return () => clearTimeout(t);
  }, [hitKey]);

  return (
    <div className={"health-bar" + (shaking ? " shake" : "")}>
      <div className="health-fill" style={{ width: pct + "%" }} />
    </div>
  );
}
