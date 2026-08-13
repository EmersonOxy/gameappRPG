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
  const [recentCells, setRecentCells] = useState([]);
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
    const lost = [];
    for (let i = hp; i < prevHp; i++) lost.push(i);
    setRecentCells(lost);
    const t = setTimeout(() => setRecentCells([]), 700);
    return () => clearTimeout(t);
  }, [hitKey]);

  const cells = Array.from({ length: max }, (_, i) => {
    let cls = "cell";
    if (i < hp) cls += " filled";
    else if (recentCells.includes(i)) cls += " recent";
    else cls += " empty";
    return <div key={i} className={cls} />;
  });

  return <div className={"health-bar" + (shaking ? " shake" : "")}>{cells}</div>;
}
