import { useEffect, useRef, useState } from "react";
import { Check, Coins, Droplets, Lock, X } from "lucide-react";
import { useGame } from "../context/GameContext.jsx";
import {
  SKILL_BRANCHES,
  getSkill,
  getBranchSkills,
} from "../constants/skills.js";
import { getElement } from "../constants/elements.js";
import "./SkillTreeScreen.css";

const CENTER = { x: 320, y: 480 };

const TREE = {
  sombrio: {
    color: "#ff9d8a",
    labelPos: { x: 200, y: 452 },
    path: [
      { x: 310, y: 462 },
      { x: 252, y: 408 },
      { x: 198, y: 330 },
      { x: 150, y: 238 },
      { x: 112, y: 152 },
    ],
    stubs: [
      { node: { x: 215, y: 380 }, attach: { x: 252, y: 408 } },
      { node: { x: 166, y: 318 }, attach: { x: 198, y: 330 } },
      { node: { x: 120, y: 226 }, attach: { x: 150, y: 238 } },
      { node: { x: 84, y: 144 }, attach: { x: 112, y: 152 } },
    ],
  },
  sagrado: {
    color: "#8ff5e4",
    labelPos: { x: 440, y: 452 },
    path: [
      { x: 330, y: 462 },
      { x: 388, y: 408 },
      { x: 442, y: 330 },
      { x: 490, y: 238 },
      { x: 528, y: 152 },
    ],
    stubs: [
      { node: { x: 425, y: 380 }, attach: { x: 388, y: 408 } },
      { node: { x: 474, y: 318 }, attach: { x: 442, y: 330 } },
      { node: { x: 520, y: 226 }, attach: { x: 490, y: 238 } },
      { node: { x: 556, y: 144 }, attach: { x: 528, y: 152 } },
    ],
  },
  magico: {
    color: "#9cc7ff",
    labelPos: { x: 270, y: 552 },
    path: [
      { x: 330, y: 498 },
      { x: 352, y: 580 },
      { x: 388, y: 668 },
      { x: 432, y: 764 },
      { x: 470, y: 868 },
    ],
    stubs: [
      { node: { x: 384, y: 572 }, attach: { x: 352, y: 580 } },
      { node: { x: 422, y: 660 }, attach: { x: 388, y: 668 } },
      { node: { x: 468, y: 754 }, attach: { x: 432, y: 764 } },
      { node: { x: 504, y: 858 }, attach: { x: 470, y: 868 } },
    ],
  },
};

function smoothPath(points) {
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const mx = (a.x + b.x) / 2;
    d += ` C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  }
  return d;
}

function pct(v, max) {
  return (v / max) * 100 + "%";
}

export default function SkillTreeScreen() {
  const {
    gold,
    level,
    playerMana,
    skillsOwned,
    skillsEquipped,
    equippedSkills,
    buySkill,
    toggleSkill,
  } = useGame();
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }

  const selected = getSkill(selectedId);
  const SelectedIcon = selected ? selected.icon : null;
  const ElementIcon = selected ? getElement(selected.element).icon : null;

  function nodeState(skill) {
    if (skillsOwned.includes(skill.id)) {
      return skillsEquipped.includes(skill.id) ? "equipped" : "owned";
    }
    if (skill.parent && !skillsOwned.includes(skill.parent)) return "locked";
    if (level < skill.levelReq) return "locked-level";
    return "available";
  }

  function lockReason(skill) {
    if (skill.parent && !skillsOwned.includes(skill.parent)) {
      const parent = getSkill(skill.parent);
      return parent ? `Requer «${parent.name}»` : "Bloqueada";
    }
    return `Nv ${skill.levelReq}`;
  }

  function handleBuy() {
    if (!selected) return;
    const res = buySkill(selected.id);
    if (res.ok) {
      showToast("Habilidade adquirida!");
    } else if (res.reason === "gold") {
      showToast(`Ouro insuficiente — faltam ${selected.goldCost - gold} de ouro.`);
    } else if (res.reason === "level") {
      showToast(`Requer nível ${selected.levelReq} para comprar.`);
    } else if (res.reason === "parent") {
      const parent = getSkill(selected.parent);
      showToast(`Desbloqueie «${parent ? parent.name : "a anterior"}» primeiro.`);
    }
  }

  function handleToggle() {
    if (!selected) return;
    const on = skillsEquipped.includes(selected.id);
    toggleSkill(selected.id);
    showToast(on ? "Habilidade removida da seleção!" : "Habilidade selecionada!");
  }

  const selectedLocked =
    selected &&
    (nodeState(selected) === "locked" || nodeState(selected) === "locked-level");

  return (
    <div className="skill-tree-view">
      <div className="skill-tree-header">
        <h2 className="skill-tree-title">Habilidades</h2>
        <span className="skill-tree-sub">
          Compre com ouro e selecione para a batalha
        </span>
        <div
          className={
            "equipped-chip" + (equippedSkills.length === 0 ? " empty" : "")
          }
        >
          {equippedSkills.length > 0 ? (
            <>
              <Check size={11} />
              <span>Selecionadas: {equippedSkills.length}</span>
              <span className="equipped-dots">
                {equippedSkills.map((s) => (
                  <span
                    key={s.id}
                    className={"equipped-dot branch-" + s.branch}
                  />
                ))}
              </span>
            </>
          ) : (
            <span>Nenhuma habilidade selecionada</span>
          )}
        </div>
      </div>

      <div className="tree-canvas">
        <svg
          className="tree-svg"
          viewBox="0 0 640 960"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <circle className="center-ring" cx={CENTER.x} cy={CENTER.y} r={34} />
          <circle className="center-core" cx={CENTER.x} cy={CENTER.y} r={13} />

          {Object.entries(TREE).map(([key, cfg]) => {
            const skills = getBranchSkills(key);
            return (
              <g key={key} className={"tree-branch branch-" + key}>
                {cfg.path.map((p, i) => {
                  const seg = [i === 0 ? CENTER : cfg.path[i - 1], p];
                  const on = skillsOwned.includes(skills[i].id);
                  return (
                    <path
                      key={i}
                      d={smoothPath(seg)}
                      className={"branch-path" + (on ? " on" : "")}
                    />
                  );
                })}
                {cfg.stubs.map((s, i) => (
                  <line
                    key={i}
                    x1={s.attach.x}
                    y1={s.attach.y}
                    x2={s.node.x}
                    y2={s.node.y}
                    className={
                      "stub-line" +
                      (skillsOwned.includes(skills[i].id) ? " on" : "")
                    }
                  />
                ))}
                <text
                  className="branch-label"
                  x={cfg.labelPos.x}
                  y={cfg.labelPos.y}
                  textAnchor="middle"
                >
                  {SKILL_BRANCHES[key].label}
                </text>
              </g>
            );
          })}
        </svg>

        {Object.entries(TREE).map(([key, cfg]) => {
          const skills = getBranchSkills(key);
          return skills.map((skill, i) => {
            const state = nodeState(skill);
            const keystone = i === skills.length - 1;
            const pos = cfg.stubs[i].node;
            const NodeIcon = skill.icon;
            const NodeElementIcon = getElement(skill.element).icon;
            return (
              <button
                key={skill.id}
                className={
                  "skill-node branch-" +
                  key +
                  " " +
                  state +
                  (keystone ? " keystone" : "") +
                  (selectedId === skill.id ? " selected" : "")
                }
                style={{ left: pct(pos.x, 640), top: pct(pos.y, 960) }}
                onClick={() => setSelectedId(skill.id)}
              >
                <span className="node-icon">
                  <NodeIcon size={keystone ? 26 : 19} />
                  {state === "equipped" && (
                    <span className="node-check">
                      <Check size={9} />
                    </span>
                  )}
                </span>
                <span className="node-name">{skill.name}</span>
                <span
                  className={"node-element element-" + skill.element}
                  title={getElement(skill.element).label}
                >
                  <NodeElementIcon size={8} />
                </span>
              </button>
            );
          });
        })}
      </div>

      {selected && (
        <div
          className="skill-modal-overlay"
          onClick={() => setSelectedId(null)}
        >
          <div className="skill-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedId(null)}
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
            <div
              className={
                "modal-art branch-" +
                selected.branch +
                (selectedLocked ? " locked" : "")
              }
            >
              <span className="modal-badge">
                {SelectedIcon && <SelectedIcon size={54} />}
              </span>
            </div>
            <div className="modal-title">
              <span className="modal-name">{selected.name}</span>
              <span className="modal-meta">
                {SKILL_BRANCHES[selected.branch].label} ·{" "}
                {getElement(selected.element).label} · Nv {selected.levelReq}
              </span>
            </div>
            <p className="modal-desc">{selected.description}</p>
            <div className="modal-costs">
              <span className="cost-chip gold">
                <Coins size={13} /> {selected.goldCost} ouro
              </span>
              <span className="cost-chip mana">
                <Droplets size={13} /> {selected.manaCost} de mana
              </span>
              <span
                className={"cost-chip element element-" + selected.element}
              >
                <ElementIcon size={13} /> {getElement(selected.element).label}
              </span>
            </div>
            {selected.parent && (
              <span
                className={
                  "modal-req" +
                  (skillsOwned.includes(selected.parent) ? " ok" : "")
                }
              >
                Requer: {getSkill(selected.parent).name}
                {skillsOwned.includes(selected.parent) ? " ✓" : ""}
              </span>
            )}
            {!skillsOwned.includes(selected.id) && level < selected.levelReq && (
              <span className="modal-req">
                Requer nível {selected.levelReq} (você está no {level})
              </span>
            )}
            {skillsOwned.includes(selected.id) &&
              playerMana < selected.manaCost && (
                <span className="modal-warn">
                  Sua mana: {playerMana} — insuficiente
                </span>
              )}
            <div className="modal-actions">
              {skillsOwned.includes(selected.id) ? (
                skillsEquipped.includes(selected.id) ? (
                  <button className="btn-modal" onClick={handleToggle}>
                    <Check size={16} /> Remover seleção
                  </button>
                ) : (
                  <button
                    className="btn-modal primary btn-3d"
                    onClick={handleToggle}
                  >
                    Selecionar
                  </button>
                )
              ) : selectedLocked ? (
                <button className="btn-modal disabled" disabled>
                  <Lock size={16} /> {lockReason(selected)}
                </button>
              ) : (
                <button
                  className="btn-modal primary btn-3d"
                  onClick={handleBuy}
                >
                  <Coins size={16} /> Comprar por {selected.goldCost}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <div className="skill-toast">{toast}</div>}
    </div>
  );
}