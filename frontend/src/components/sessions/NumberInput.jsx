import React from "react";
import { Minus, Plus } from "lucide-react";

const NumberInput = ({ icon, value, onChange, min = 0, max = 24 }) => (
  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
    <span className="text-slate-400">{icon}</span>
    <button
      onClick={() => onChange(Math.max(min, value - 1))}
      className="text-slate-400 hover:text-slate-700 transition-colors"
    >
      <Minus size={14} />
    </button>
    <span className="text-xl font-semibold text-slate-800 w-6 text-center">
      {value}
    </span>
    <button
      onClick={() => onChange(Math.min(max, value + 1))}
      className="text-slate-400 hover:text-slate-700 transition-colors"
    >
      <Plus size={14} />
    </button>
  </div>
);

export default NumberInput;
