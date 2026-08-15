import { useEffect, useState } from "react";
import { BUBBLE_SETS, EMOJIS } from "../constants/enemyReactions.js";

export default function EnemyReaction({ emoji, bubbleSet, id }) {
  const frames = BUBBLE_SETS[bubbleSet] || BUBBLE_SETS[0] || [];
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (frames.length < 2) return;
    const t = setInterval(() => setFrame((f) => (f + 1) % frames.length), 45);
    return () => clearInterval(t);
  }, [frames.length]);

  const EmojiImg = EMOJIS[emoji];

  return (
    <div className="enemy-reaction" key={id}>
      <img className="reaction-bubble" src={frames[frame]} alt="" />
      {EmojiImg && <img className="reaction-emoji" src={EmojiImg} alt="" />}
    </div>
  );
}