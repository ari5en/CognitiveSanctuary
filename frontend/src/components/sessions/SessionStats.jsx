import React from "react";
import Card from "../ui/Card";

const SessionStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="text-center">
        <p className="text-2xl font-bold text-slate-800">
          {stats.totalSessions}
        </p>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
          Sessions
        </p>
      </Card>
      <Card className="text-center">
        <p className="text-2xl font-bold text-slate-800">
          {stats.avgHours}
        </p>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
          Avg Hours
        </p>
      </Card>
    </div>
  );
};

export default SessionStats;
