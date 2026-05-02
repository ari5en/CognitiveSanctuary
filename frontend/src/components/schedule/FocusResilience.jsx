import React from "react";
import Card from "../ui/Card";

const FocusResilience = ({ resilience }) => {
  return (
    <Card>
      <p className="text-xs font-bold text-sanctuary-700 uppercase tracking-widest mb-1">
        Focus Resilience
      </p>
      <div className="flex items-end gap-2 mb-3">
        <span className="text-4xl font-bold text-slate-800">
          {resilience.score}%
        </span>
        <span className="text-sm text-slate-500 pb-1">
          {resilience.label}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-sanctuary-700 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${resilience.score}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">
        {resilience.description}
      </p>
    </Card>
  );
};

export default FocusResilience;
