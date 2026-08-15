import { forwardRef } from "react";
import "./Cube3D.css";

const Cube3D = forwardRef(function Cube3D(
  {
    faces,
    size = 96,
    width,
    height,
    depth,
    className = "",
    sceneClassName = "",
    spinning = false,
    style,
    transition,
  },
  ref
) {
  const w = width ?? size;
  const h = height ?? size;
  const d = depth ?? size;
  const single = Array.isArray(faces) && faces.length === 6 ? null : faces;
  const list = single
    ? Array.from({ length: 6 }, (_, i) => ({ key: i, node: single }))
    : faces.map((node, i) => ({ key: i, node }));

  return (
    <div
      className={
        "cube-scene" +
        (spinning ? " spinning" : "") +
        (sceneClassName ? " " + sceneClassName : "")
      }
      style={{ width: w, height: h, "--cube-size": `${Math.max(w, h)}px`, "--cube-depth": `${d}px` }}
    >
      <div
        ref={ref}
        className={"cube3d" + (className ? " " + className : "")}
        style={{ ...style, transition }}
      >
        {list.map(({ key, node }) => (
          <div key={key} className={`cube3d-face cube3d-face-${key}`}>
            {node}
          </div>
        ))}
      </div>
    </div>
  );
});

export default Cube3D;