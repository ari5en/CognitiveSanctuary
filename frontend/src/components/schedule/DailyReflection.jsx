import React from "react";

const DailyReflection = ({ reflection }) => {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{ minHeight: 220 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 70% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 30% 70%, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        className="relative p-6 flex flex-col justify-end h-full"
        style={{ minHeight: 220 }}
      >
        <div className="text-5xl text-sanctuary-400 font-serif leading-none mb-2 opacity-70">
          "
        </div>
        <p className="text-white text-base font-semibold leading-snug">
          {reflection.quote}
        </p>
        <p className="text-slate-400 text-xs uppercase tracking-widest mt-3">
          {reflection.label}
        </p>
      </div>
    </div>
  );
};

export default DailyReflection;
