import React from "react";
import { CalendarCheck2, PlayCircle } from "lucide-react";
import Card from "../ui/Card";

const quickActionIconMap = {
  "calendar-check": <CalendarCheck2 size={22} className="text-slate-600" />,
  "play-circle": <PlayCircle size={22} className="text-slate-600" />,
};

const QuickActions = ({ quickActions, onAction }) => {
  return (
    <div className="w-80">
      <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <Card
            key={action.id}
            padding={false}
            onClick={() => onAction && onAction(action.id)}
            className="p-4 flex flex-col items-center justify-center gap-3 hover:bg-sanctuary-50 hover:border-sanctuary-200 cursor-pointer transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
              {quickActionIconMap[action.icon]}
            </div>
            <p className="text-xs font-bold text-slate-600 tracking-wide">
              {action.label}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
