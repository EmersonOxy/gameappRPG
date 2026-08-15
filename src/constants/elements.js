import { Flame, Mountain, Waves, Wind } from "lucide-react";

export const ELEMENT_MULT = 1.5;
export const ELEMENT_WEAK_MULT = 0.75;

export const ELEMENTS = {
  magma: {
    key: "magma",
    label: "Magma",
    icon: Flame,
    beats: "vendaval",
    color: "#ff8a5c",
  },
  rocha: {
    key: "rocha",
    label: "Rocha",
    icon: Mountain,
    beats: "mare",
    color: "#d8b48a",
  },
  mare: {
    key: "mare",
    label: "Maré",
    icon: Waves,
    beats: "magma",
    color: "#7ec8ff",
  },
  vendaval: {
    key: "vendaval",
    label: "Vendaval",
    icon: Wind,
    beats: "rocha",
    color: "#9de8d2",
  },
};

export function getElement(key) {
  return ELEMENTS[key] || null;
}

export function getElementalMultiplier(atkElement, defElement) {
  if (!atkElement || !defElement) return 1;
  if (atkElement === defElement) return 1;
  const attacker = getElement(atkElement);
  const defender = getElement(defElement);
  if (!attacker || !defender) return 1;
  if (attacker.beats === defElement) return ELEMENT_MULT;
  if (defender.beats === atkElement) return ELEMENT_WEAK_MULT;
  return 1;
}