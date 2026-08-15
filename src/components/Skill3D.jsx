import { Lock } from "lucide-react";
import "./Skill3D.css";

const SLICES = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];
const GEM_SKILLS = new Set(["congelar", "era-glacial", "zero-absoluto"]);

function Orb({ children }) {
  return (
    <div className="s3d-orb">
      {SLICES.map((a) => (
        <div key={a} className="s3d-slice" style={{ "--sa": `${a}deg` }} />
      ))}
      <div className="s3d-face">{children}</div>
      <div className="s3d-face back">{children}</div>
    </div>
  );
}

function Gem({ children }) {
  return (
    <div className="s3d-gem">
      <span className="s3d-gem-icon">{children}</span>
    </div>
  );
}

function Dots({ n, cls }) {
  return (
    <div className={cls}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={`${cls}-dot`} style={{ "--di": i }} />
      ))}
    </div>
  );
}

function Rays({ n }) {
  return (
    <div className="s3d-rays">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="s3d-ray" style={{ "--ri": i }} />
      ))}
    </div>
  );
}

function Flames({ n }) {
  return (
    <div className="s3d-flames">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="s3d-flame" style={{ "--fi": i }} />
      ))}
    </div>
  );
}

function Accessories({ id }) {
  switch (id) {
    case "brasa":
      return <Dots n={3} cls="s3d-sparks" />;
    case "explosao":
      return (
        <>
          <span className="s3d-fuse" />
          <span className="s3d-fusespark" />
        </>
      );
    case "meteoro":
      return <span className="s3d-tail" />;
    case "apocalipse":
      return (
        <>
          <Flames n={4} />
          <span className="s3d-ring" />
        </>
      );
    case "bencao":
      return <span className="s3d-halo" />;
    case "escudo-divino":
      return (
        <>
          <Rays n={4} />
          <span className="s3d-shield" />
          <span className="s3d-shield back" />
        </>
      );
    case "milagre":
      return <Rays n={8} />;
    case "lanca-gelo":
      return <span className="s3d-spike" />;
    case "congelar":
      return <Dots n={2} cls="s3d-frost" />;
    case "era-glacial":
      return (
        <>
          <span className="s3d-mini left" />
          <span className="s3d-mini right" />
          <Dots n={4} cls="s3d-frost" />
        </>
      );
    case "zero-absoluto":
      return (
        <>
          <span className="s3d-mist" />
          <span className="s3d-mist two" />
          <Dots n={3} cls="s3d-frost" />
        </>
      );
    default:
      return null;
  }
}

function Lock3D({ size }) {
  return (
    <div className="s3d-lock" style={{ "--s3d-size": `${size}px` }}>
      <div className="s3d-lock-anchor">
        <div className="s3d-lock-box">
          <div className="s3d-lock-face front">
            <Lock size={Math.round(size * 0.3)} />
          </div>
          <div className="s3d-lock-face top" />
          <div className="s3d-lock-face side" />
        </div>
      </div>
      <span className="s3d-lock-shackle" />
    </div>
  );
}

export default function Skill3D({ skill, size = 56, locked = false }) {
  if (locked) return <Lock3D size={size} />;
  const Icon = skill.icon;
  const gem = GEM_SKILLS.has(skill.id);
  const iconSize = Math.round(size * (gem ? 0.26 : 0.3));
  return (
    <div
      className={"skill3d skill-" + skill.id}
      style={{ "--s3d-size": `${size}px` }}
    >
      <div className="s3d-spin">
        {gem ? (
          <Gem>
            <Icon size={iconSize} />
          </Gem>
        ) : (
          <Orb>
            <Icon size={iconSize} />
          </Orb>
        )}
        <Accessories id={skill.id} />
      </div>
    </div>
  );
}