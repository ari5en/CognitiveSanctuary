import React from "react";

const MentalStateSelector = ({ mentalStates, currentMood, onChange }) => {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
        Current Mental State
      </label>
      <div className="grid grid-cols-4 gap-3">
        {mentalStates.map((state) => {
          const isActive = currentMood === state.id;
          return (
            <button
              key={state.id}
              onClick={() => onChange(state.id)}
              className={[
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 transform hover:scale-105 active:scale-95",
                isActive
                  ? "border-sanctuary-600 bg-sanctuary-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              ].join(" ")}
            >
              <span className="text-2xl">{state.emoji}</span>
              <span
                className={`text-xs font-semibold ${
                  isActive ? "text-sanctuary-800" : "text-slate-500"
                }`}
              >
                {state.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MentalStateSelector;
