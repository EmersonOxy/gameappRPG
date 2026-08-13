import { useEffect, useRef } from "react";
import "./DiceRoll.css";

const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const FACE_ROTATION = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 0, y: 180 },
};

const FACES = [
  { name: "front", value: 1 },
  { name: "back", value: 6 },
  { name: "right", value: 3 },
  { name: "left", value: 4 },
  { name: "top", value: 2 },
  { name: "bottom", value: 5 },
];

export default function DiceRoll({ value, rolling }) {
  const cubeRef = useRef(null);

  useEffect(() => {
    if (!rolling) return;
    const cube = cubeRef.current;
    if (!cube) return;

    const startX = Math.floor(Math.random() * 4) * 90;
    const startY = Math.floor(Math.random() * 4) * 90;
    const rot = FACE_ROTATION[value] || FACE_ROTATION[1];

    cube.style.transition = "none";
    cube.style.transform = `rotateX(${startX}deg) rotateY(${startY}deg)`;
    void cube.offsetHeight;

    cube.style.transition = "transform 1.2s cubic-bezier(0.15, 0.75, 0.3, 1)";
    cube.style.transform = `rotateX(${rot.x + 1080}deg) rotateY(${rot.y + 720}deg)`;
  }, [rolling, value]);

  return (
    <div className={"dice-scene" + (rolling ? " throwing" : "")}>
      <div ref={cubeRef} className="dice-cube">
        {FACES.map((face) => (
          <div key={face.name} className={`dice-face face-${face.name}`}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="pip-slot">
                {PIPS[face.value].includes(i) && <span className="pip" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
