import dor from "../assets/ui/emojis/Dor.png";
import surpreso from "../assets/ui/emojis/Surpreso.png";
import chateado from "../assets/ui/emojis/Chateado.png";
import bobo from "../assets/ui/emojis/Bobo.png";
import confuso from "../assets/ui/emojis/Confuso.png";
import feliz from "../assets/ui/emojis/Feliz.png";
import alegre from "../assets/ui/emojis/Alegre.png";
import raivoso from "../assets/ui/emojis/Raivoso.png";
import congelado from "../assets/ui/emojis/Congelado.png";
import triste from "../assets/ui/emojis/Triste.png";

export const EMOJIS = {
  dor,
  surpreso,
  chateado,
  bobo,
  confuso,
  feliz,
  alegre,
  raivoso,
  congelado,
  triste,
};

export const REACTION_EMOJI = {
  stunned: "congelado",
  special: "raivoso",
  miss: "confuso",
  dodge: "bobo",
  defend: "chateado",
  heal: "feliz",
  shield: "alegre",
  crit: "surpreso",
  damage: "dor",
  skip: "triste",
};

const bubbleFiles = import.meta.glob(
  "../assets/ui/emojis/bubble_white_*.png",
  { eager: true, import: "default" }
);

const grouped = [[], [], []];
for (const [path, url] of Object.entries(bubbleFiles)) {
  const m = path.match(/bubble_white_(\d+)_(\d+)\.png$/);
  if (!m) continue;
  const setIdx = parseInt(m[1], 10) - 1;
  const frame = parseInt(m[2], 10);
  if (setIdx < grouped.length) grouped[setIdx].push({ frame, url });
}

export const BUBBLE_SETS = grouped
  .map((set) =>
    set
      .sort((a, b) => a.frame - b.frame)
      .map((f) => f.url)
  )
  .filter((set) => set.length > 0);