import { useEffect, useRef, useState } from "react";
import { Check, Coins, Droplets, Lock, X } from "lucide-react";
import { useGame } from "../context/GameContext.jsx";
import {
  SKILL_BRANCHES,
  getSkill,
  getBranchSkills,
} from "../constants/skills.js";
import { getElement } from "../constants/elements.js";
import Skill3D from "../components/Skill3D.jsx";
import "./SkillTreeScreen.css";

function rootPath(a, b) {
  const mx = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
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

      <div className="skill-branches">
        {Object.values(SKILL_BRANCHES).map((branch) => {
          const skills = getBranchSkills(branch.key);
          return (
            <div className={"skill-branch branch-" + branch.key} key={branch.key}>
              <div className="branch-header">
                <span className="branch-title">{branch.label}</span>
                <span className="branch-tag">{branch.tagline}</span>
              </div>
              <div className="branch-roots">
                <div className="root-stage">
                  <svg
                    className="root-lines"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    {skills.slice(0, -1).map((skill, i) => {
                      const next = skills[i + 1];
                      return (
                        <path
                          key={skill.id}
                          d={rootPath(skill, next)}
                          className={
                            "root-line" +
                            (skillsOwned.includes(next.id) ? " on" : "")
                          }
                        />
                      );
                    })}
                  </svg>
                  {skills.map((skill) => {
                    const state = nodeState(skill);
                    const locked =
                      state === "locked" || state === "locked-level";
                    const NodeElementIcon = getElement(skill.element).icon;
                    return (
                      <button
                        key={skill.id}
                        className={
                          "skill-node " +
                          state +
                          (selectedId === skill.id ? " selected" : "")
                        }
                        style={{
                          left: skill.x + "%",
                          top: skill.y + "%",
                          "--node-rot": skill.rot + "deg",
                        }}
                        onClick={() => setSelectedId(skill.id)}
                      >
                        <Skill3D skill={skill} size={54} locked={locked} />
                        <span className="node-name">{skill.name}</span>
                        <span
                          className={"node-element element-" + skill.element}
                          title={getElement(skill.element).label}
                        >
                          <NodeElementIcon size={9} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
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
            <div className={"modal-art branch-" + selected.branch}>
              <Skill3D skill={selected} size={124} locked={selectedLocked} />
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