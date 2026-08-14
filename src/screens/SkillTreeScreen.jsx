import { useEffect, useRef, useState } from "react";
import { Lock, Coins, Droplets, Check } from "lucide-react";
import { useGame } from "../context/GameContext.jsx";
import {
  SKILLS,
  SKILL_BRANCHES,
  getSkill,
  getBranchSkills,
} from "../constants/skills.js";
import "./SkillTreeScreen.css";

export default function SkillTreeScreen() {
  const {
    gold,
    level,
    playerMana,
    skillsOwned,
    skillEquipped,
    equippedSkill,
    buySkill,
    equipSkill,
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

  const selected = SKILLS.find((s) => s.id === selectedId) || null;
  const SelectedIcon = selected ? selected.icon : null;
  const EquippedIcon = equippedSkill ? equippedSkill.icon : null;

  function nodeState(skill) {
    if (skillsOwned.includes(skill.id)) {
      return skillEquipped === skill.id ? "equipped" : "owned";
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

  function handleEquip() {
    if (!selected) return;
    equipSkill(selected.id);
    showToast("Habilidade equipada!");
  }

  return (
    <div className="skill-tree-view">
      <div className="skill-tree-header">
        <h2 className="skill-tree-title">Habilidades</h2>
        <span className="skill-tree-sub">Compre com ouro e equipe 1 por batalha</span>
        {EquippedIcon && equippedSkill ? (
          <div className={"equipped-chip branch-" + equippedSkill.branch}>
            <EquippedIcon size={14} />
            <span>Equipada: {equippedSkill.name}</span>
          </div>
        ) : (
          <div className="equipped-chip empty">
            <span>Nenhuma habilidade equipada</span>
          </div>
        )}
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
              <div className="branch-row">
                {skills.map((skill, i) => {
                  const state = nodeState(skill);
                  const NodeIcon =
                    state === "locked" || state === "locked-level"
                      ? Lock
                      : skill.icon;
                  return (
                    <div className="branch-node-wrap" key={skill.id}>
                      {i > 0 && (
                        <div
                          className={
                            "branch-connector" +
                            (skillsOwned.includes(skill.id) ? " on" : "")
                          }
                        />
                      )}
                      <button
                        className={
                          "skill-node " +
                          state +
                          (selectedId === skill.id ? " selected" : "")
                        }
                        onClick={() => setSelectedId(skill.id)}
                      >
                        <NodeIcon size={20} />
                        <span className="node-name">{skill.name}</span>
                        <span className="node-chip">
                          {state === "equipped"
                            ? "Equipada"
                            : state === "owned"
                            ? "Pronta"
                            : state === "locked" || state === "locked-level"
                            ? lockReason(skill)
                            : skill.goldCost + " ouro"}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="skill-detail">
        {selected && SelectedIcon ? (
          <>
            <div className="detail-head">
              <div className={"detail-icon branch-" + selected.branch}>
                <SelectedIcon size={22} />
              </div>
              <div className="detail-title">
                <span className="detail-name">{selected.name}</span>
                <span className="detail-branch">
                  Ramo {SKILL_BRANCHES[selected.branch].label} · Nv {selected.levelReq}
                </span>
              </div>
              {skillsOwned.includes(selected.id) && (
                <span
                  className={
                    "detail-own-chip" +
                    (skillEquipped === selected.id ? " equipped" : "")
                  }
                >
                  {skillEquipped === selected.id ? "Equipada" : "Comprada"}
                </span>
              )}
            </div>
            <p className="detail-desc">{selected.description}</p>
            <div className="detail-costs">
              <span className="cost-chip gold">
                <Coins size={13} /> {selected.goldCost} ouro
              </span>
              <span className="cost-chip mana">
                <Droplets size={13} /> {selected.manaCost} de mana
              </span>
            </div>
            {selected.parent && (
              <span
                className={
                  "detail-req" + (skillsOwned.includes(selected.parent) ? " ok" : "")
                }
              >
                Requer: {getSkill(selected.parent).name}
                {skillsOwned.includes(selected.parent) ? " ✓" : ""}
              </span>
            )}
            {!skillsOwned.includes(selected.id) && level < selected.levelReq && (
              <span className="detail-req">
                Requer nível {selected.levelReq} (você está no {level})
              </span>
            )}
            {skillsOwned.includes(selected.id) && playerMana < selected.manaCost && (
              <span className="detail-warn">
                Sua mana: {playerMana} — insuficiente
              </span>
            )}
            <div className="detail-actions">
              {skillsOwned.includes(selected.id) ? (
                skillEquipped === selected.id ? (
                  <button className="btn-detail disabled" disabled>
                    <Check size={16} /> Equipada
                  </button>
                ) : (
                  <button className="btn-detail primary" onClick={handleEquip}>
                    Equipar
                  </button>
                )
              ) : nodeState(selected) === "locked" ||
                nodeState(selected) === "locked-level" ? (
                <button className="btn-detail disabled" disabled>
                  <Lock size={16} /> {lockReason(selected)}
                </button>
              ) : (
                <button className="btn-detail primary" onClick={handleBuy}>
                  <Coins size={16} /> Comprar por {selected.goldCost}
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="detail-hint">Toque em uma habilidade para ver os detalhes</p>
        )}
      </div>

      {toast && <div className="skill-toast">{toast}</div>}
    </div>
  );
}
