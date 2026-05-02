import React from "react";
import Badge from "../ui/Badge";

const Milestones = ({ milestones }) => {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800">Upcoming Milestones</h3>
        <button className="text-xs text-sanctuary-700 font-bold hover:underline">
          View All
        </button>
      </div>
      <div className="space-y-3">
        {milestones.map((m) => (
          <div
            key={m.id}
            className={`p-4 bg-white border-l-4 ${m.borderColor} rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-bold text-slate-800 text-sm">{m.title}</p>
              <Badge color={m.badgeColor}>{m.badge}</Badge>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {m.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Milestones;
