import React from "react";

// Apple-style emoji image URLs (using Apple emoji CDN via emojicdn.elk.sh)
// Each key is the emoji codepoint for a recognizable Apple emoticon
const APPLE_EMOJI_URL = (codepoint) =>
  `https://emojicdn.elk.sh/${encodeURIComponent(codepoint)}?style=apple`;

const LEVELS = [
  {
    max: 25,
    codepoint: "😄",
    label: "Healthy",
    color: "#22c55e",
    desc: "You're in great shape. Keep up the good work!",
  },
  {
    max: 50,
    codepoint: "🙂",
    label: "Moderate",
    color: "#38bdf8",
    desc: "Mild fatigue detected. Breaks are helping.",
  },
  {
    max: 75,
    codepoint: "😐",
    label: "Fatigue",
    color: "#f59e0b",
    desc: "Noticeable fatigue. Breaks are important.",
  },
  {
    max: 100,
    codepoint: "😫",
    label: "Burnout Risk",
    color: "#f43f5e",
    desc: "High burnout detected. Recovery is recommended.",
  },
];

const getLevel = (score) =>
  LEVELS.find((l) => score <= l.max) || LEVELS[LEVELS.length - 1];

/**
 * @param {{ score: number, dark?: boolean, desc?: string }} props
 */
const BurnoutEmojiIndicator = ({ score, dark = false, desc }) => {
  const level = getLevel(score ?? 0);
  const pct = Math.round(Math.min(100, Math.max(0, score ?? 0)));
  const emojiSrc = APPLE_EMOJI_URL(level.codepoint);
  const description = desc || level.desc;

  if (dark) {
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Apple emoji image */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <img
            src={emojiSrc}
            alt={level.label}
            width={52}
            height={52}
            style={{ imageRendering: "crisp-edges" }}
            draggable={false}
          />
        </div>

        {/* Score + label */}
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: level.color }}>
            {pct}%
          </p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: level.color }}>
            {level.label}
          </p>
        </div>

        {/* Bar */}
        <div
          className="w-full max-w-[130px] h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: level.color }}
          />
        </div>

        {/* Description */}
        <p
          className="text-center text-[11px] leading-relaxed mt-1"
          style={{ color: "#9ca3af" }}
        >
          {description}
        </p>
      </div>
    );
  }

  // Light card version
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center ring-4 ring-white shadow-inner"
        style={{ background: "#f3f4f6" }}
      >
        <img
          src={emojiSrc}
          alt={level.label}
          width={52}
          height={52}
          style={{ imageRendering: "crisp-edges" }}
          draggable={false}
        />
      </div>
      <div className="text-center">
        <p className="text-xl font-bold" style={{ color: level.color }}>
          {pct}%
        </p>
        <p className="text-sm font-semibold mt-0.5" style={{ color: level.color }}>
          {level.label}
        </p>
      </div>
      <div className="w-full max-w-[130px] h-2 bg-white rounded-full overflow-hidden ring-1 ring-slate-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: level.color }}
        />
      </div>
      <p className="text-center text-[11px] leading-relaxed mt-1" style={{ color: "#6b7280" }}>
        {description}
      </p>
    </div>
  );
};

export default BurnoutEmojiIndicator;
