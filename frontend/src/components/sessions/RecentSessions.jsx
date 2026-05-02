import React from "react";
import Card from "../ui/Card";

const RecentSessions = ({ sessions }) => {
  return (
    <Card className="space-y-3">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
        Recent Backend Sessions
      </p>
      <div className="space-y-2 max-h-40 overflow-auto pr-1">
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-400">
            No backend sessions yet.
          </p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.sessionId}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
            >
              <span className="text-sm text-slate-700">
                Session #{session.sessionId}
              </span>
              <span className="text-xs text-slate-400">
                Breaks: {session.breakCount}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default RecentSessions;
