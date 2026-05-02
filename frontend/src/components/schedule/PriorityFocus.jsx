import React from "react";
import { Clock, Sigma, Microscope } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const taskIconMap = {
  sigma: <Sigma size={20} className="text-sanctuary-800" />,
  microscope: <Microscope size={20} className="text-sanctuary-800" />,
};

const PriorityFocus = ({ tasks }) => {
  return (
    <Card padding={false} className="overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Priority Focus</h2>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
          {tasks.length} Active Today
        </span>
      </div>
      <div className="divide-y divide-slate-50">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
          >
            <div className="w-11 h-11 bg-sanctuary-100 rounded-xl flex items-center justify-center flex-shrink-0">
              {taskIconMap[task.icon]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm">
                {task.title}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <Badge color={task.subjectColor}>{task.subject}</Badge>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={12} />
                  {task.duration}
                </span>
              </div>
            </div>
            <Button variant="solid" size="sm" className="flex-shrink-0">
              Start Focus
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PriorityFocus;
