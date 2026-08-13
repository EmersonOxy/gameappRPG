import "./DiceRoll.css";

const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export default function DiceRoll({ value, rolling }) {
  const pips = PIPS[value] || PIPS[1];
  return (
    <div className={"dice" + (rolling ? " rolling" : "")}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="pip-slot">
          {pips.includes(i) && <span className="pip" />}
        </div>
      ))}
    </div>
  );
}
