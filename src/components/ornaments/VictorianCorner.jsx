export default function VictorianCorner({ pos = "tl", metal = "silver", gem = "emerald" }) {
  const bright = metal === "gold" ? "var(--gold-bright)" : "var(--silver-bright)";
  const mid = metal === "gold" ? "var(--gold-2)" : "var(--silver)";
  const gemFill =
    gem === "emerald"
      ? "var(--emerald-glass)"
      : gem === "quartz"
      ? "var(--quartz-glass)"
      : null;
  const gemStroke =
    gem === "emerald"
      ? "var(--emerald-bright)"
      : gem === "quartz"
      ? "var(--quartz-bright)"
      : null;

  return (
    <span className={"vic-corner " + pos} aria-hidden="true">
      <svg viewBox="0 0 72 72" fill="none">
        <path
          d="M72 5 H8 Q5 5 5 8 V72"
          stroke={bright}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M72 13 H15 Q12 13 12 16 V72"
          stroke={mid}
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M72 5 C64 5 60 11 60 19 C60 23 57 25 51 25"
          stroke={bright}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M5 72 C5 64 11 60 19 60 C23 60 25 57 25 51"
          stroke={bright}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {gemFill && (
          <>
            <path
              d="M24 12 L31 19 L24 26 L17 19 Z"
              fill={gemFill}
              stroke={gemStroke}
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
            <path
              d="M24 12 L26.5 14.5 L24 17 L21.5 14.5 Z"
              fill="rgba(255,255,255,0.55)"
            />
          </>
        )}
      </svg>
    </span>
  );
}
