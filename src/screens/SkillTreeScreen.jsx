import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, Coins, Droplets, Lock, Maximize2, X } from "lucide-react";
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

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
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

  const viewportRef = useRef(null);
  const viewRef = useRef({ scale: 1, x: 0, y: 0 });
  const pointersRef = useRef(new Map());
  const gestureRef = useRef(null);
  const interactedRef = useRef(false);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [grabbing, setGrabbing] = useState(false);

  function updateView(fn) {
    setView((prev) => {
      const next = fn(prev);
      viewRef.current = next;
      return next;
    });
  }

  function fitView() {
    const el = viewportRef.current;
    if (!el) return;
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    const scale = clamp(Math.min(vw / 640, vh / 960) * 0.96, 0.3, 1);
    const next = {
      scale,
      x: (vw - 640 * scale) / 2,
      y: (vh - 960 * scale) / 2,
    };
    viewRef.current = next;
    setView(next);
  }

  useLayoutEffect(() => {
    fitView();
    const onResize = () => {
      if (!interactedRef.current) fitView();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      interactedRef.current = true;
      const v = viewRef.current;
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const scale = clamp(v.scale * factor, 0.3, 2.5);
      const wx = (px - v.x) / v.scale;
      const wy = (py - v.y) / v.scale;
      updateView(() => ({ scale, x: px - wx * scale, y: py - wy * scale }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function onPointerDown(e) {
    if (e.button !== 0) return;
    pointersRef.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      captured: false,
    });
    if (pointersRef.current.size === 2) {
      const [p1, p2] = [...pointersRef.current.values()];
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const rect = viewportRef.current.getBoundingClientRect();
      gestureRef.current = {
        mode: "pinch",
        startScale: viewRef.current.scale,
        startDist: dist,
        startMid: { x: mid.x - rect.left, y: mid.y - rect.top },
        startX: viewRef.current.x,
        startY: viewRef.current.y,
      };
    }
  }

  function onPointerMove(e) {
    const map = pointersRef.current;
    const ptr = map.get(e.pointerId);
    if (!ptr) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const moved = Math.hypot(e.clientX - ptr.x, e.clientY - ptr.y);

    if (!ptr.captured && moved > 6) {
      ptr.captured = true;
      viewportRef.current.setPointerCapture(e.pointerId);
      setGrabbing(true);
      interactedRef.current = true;
      if (map.size === 1) {
        gestureRef.current = {
          mode: "pan",
          startX: viewRef.current.x,
          startY: viewRef.current.y,
          lastX: e.clientX,
          lastY: e.clientY,
        };
      } else {
        const [p1, p2] = [...map.values()];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        gestureRef.current = {
          mode: "pinch",
          startScale: viewRef.current.scale,
          startDist: dist,
          startMid: { x: mid.x - rect.left, y: mid.y - rect.top },
          startX: viewRef.current.x,
          startY: viewRef.current.y,
        };
      }
    }

    ptr.x = e.clientX;
    ptr.y = e.clientY;
    if (!ptr.captured) return;

    const g = gestureRef.current;
    if (!g) return;

    if (g.mode === "pan") {
      updateView(() => ({
        scale: viewRef.current.scale,
        x: g.startX + (e.clientX - g.lastX),
        y: g.startY + (e.clientY - g.lastY),
      }));
    } else {
      const [p1, p2] = [...map.values()];
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const mid = {
        x: (p1.x + p2.x) / 2 - rect.left,
        y: (p1.y + p2.y) / 2 - rect.top,
      };
      const scale = clamp(g.startScale * (dist / g.startDist), 0.3, 2.5);
      const wx = (g.startMid.x - g.startX) / g.startScale;
      const wy = (g.startMid.y - g.startY) / g.startScale;
      updateView(() => ({ scale, x: mid.x - wx * scale, y: mid.y - wy * scale }));
    }
  }

  function endPointer(e) {
    const map = pointersRef.current;
    const ptr = map.get(e.pointerId);
    map.delete(e.pointerId);
    if (ptr && ptr.captured) {
      try {
        viewportRef.current.releasePointerCapture(e.pointerId);
      } catch (_) {}
      setGrabbing(false);
    }
    if (map.size === 1) {
      const [p] = [...map.values()];
      gestureRef.current = {
        mode: "pan",
        startX: viewRef.current.x,
        startY: viewRef.current.y,
        lastX: p.x,
        lastY: p.y,
      };
    } else if (map.size === 0) {
      gestureRef.current = null;
    }
  }

  function onDoubleClick(e) {
    interactedRef.current = true;
    const rect = viewportRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const v = viewRef.current;
    const scale = clamp(v.scale * 1.6, 0.3, 2.5);
    const wx = (px - v.x) / v.scale;
    const wy = (py - v.y) / v.scale;
    updateView(() => ({ scale, x: px - wx * scale, y: py - wy * scale }));
  }

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

      <div
        className={"tree-viewport" + (grabbing ? " grabbing" : "")}
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onDoubleClick={onDoubleClick}
      >
        <div
          className="tree-stage"
          style={{
            transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
          }}
        >
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
                {skills.map((skill, i) => {
                  const prev = i === 0 ? CENTER : cfg.stubs[i - 1].attach;
                  const end = cfg.stubs[i].attach;
                  const on = skillsOwned.includes(skill.id);
                  return (
                    <path
                      key={skill.id}
                      d={smoothPath([prev, end])}
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
        <button
          className="tree-fit"
          onClick={fitView}
          aria-label="Ajustar árvore na tela"
          title="Ajustar na tela"
        >
          <Maximize2 size={14} />
        </button>
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