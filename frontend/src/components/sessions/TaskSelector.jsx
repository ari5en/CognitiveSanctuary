import React from "react";
import { CheckSquare, Square } from "lucide-react";

const TaskSelector = ({ tasks, selectedIds, onToggle }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
        Attach Tasks to Session
      </label>
      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {tasks.map((task) => {
          const isSelected = selectedIds.includes(task.taskId || task.task_id);
          return (
            <button
              key={task.taskId || task.task_id}
              onClick={() => onToggle(task.taskId || task.task_id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                isSelected
                  ? "bg-sanctuary-50 border-sanctuary-200 text-sanctuary-900 shadow-sm"
                  : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
              }`}
            >
              {isSelected ? (
                <CheckSquare size={18} className="text-sanctuary-600" />
              ) : (
                <Square size={18} className="text-slate-300" />
              )}
              <span className="text-sm font-medium">{task.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TaskSelector;
