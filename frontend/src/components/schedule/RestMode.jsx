import React from "react";
import { Moon, BookOpen } from "lucide-react";
import Card from "../ui/Card";

const taskIconMap = {
  "book-open": <BookOpen size={20} className="text-slate-400" />,
};

const RestMode = ({ tasks }) => {
  return (
    <div className="space-y-3">
      <div className="mb-3 flex items-center gap-2">
        <Moon size={17} className="text-slate-500" />
        <h2 className="font-semibold text-slate-600 text-sm">
          Shifted to 'Rest Mode'
        </h2>
      </div>
      <Card padding={false} className="overflow-hidden">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-4 px-5 py-4 opacity-50 grayscale"
          >
            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
              {taskIconMap[task.icon]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-700 text-sm">
                {task.title}
              </p>
              <p className="text-xs text-slate-400 uppercase tracking-wide mt-0.5">
                {task.deferredTo}
              </p>
            </div>
            <span className="text-xs text-slate-400">{task.priority}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default RestMode;
