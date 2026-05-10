import React from "react";
import Card from "../ui/Card";

const LEVELS = [
  { max: 25,  emoji: "😄", label: "Healthy",      bg: "bg-emerald-50",  text: "text-emerald-700", ring: "ring-emerald-200" },
  { max: 50,  emoji: "🙂", label: "Moderate",     bg: "bg-sky-50",      text: "text-sky-700",     ring: "ring-sky-200"     },
  { max: 75,  emoji: "😐", label: "Fatigue",      bg: "bg-amber-50",    text: "text-amber-700",   ring: "ring-amber-200"   },
  { max: 100, emoji: "😫", label: "Burnout Risk", bg: "bg-rose-50",     text: "text-rose-700",    ring: "ring-rose-200"    },
];

const getLevel = (score) => LEVELS.find(l => score <= l.max) || LEVELS[LEVELS.length - 1];

/**
 * @param {{ score: number }} props
 */
const BurnoutEmojiIndicator = ({ score }) => {
  const level = getLevel(score ?? 0);
  const pct = Math.min(100, Math.max(0, score ?? 0));

  return (
    <Card className={`flex flex-col items-center justify-center py-7 gap-4 ${level.bg}`}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Burnout Level</p>

      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-inner ring-4 ${level.ring} bg-white`}>
        {level.emoji}
      </div>

      <div className="text-center">
        <p className={`text-2xl font-bold ${level.text}`}>{pct}%</p>
        <p className={`text-sm font-semibold ${level.text} mt-0.5`}>{level.label}</p>
      </div>

      {/* Mini bar */}
      <div className="w-full max-w-[140px] h-2 bg-white rounded-full overflow-hidden ring-1 ring-slate-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pct <= 25 ? "#16a34a" : pct <= 50 ? "#0284c7" : pct <= 75 ? "#d97706" : "#e11d48",
          }}
        />
      </div>
    </Card>
  );
};

export default BurnoutEmojiIndicator;
