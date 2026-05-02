import React from "react";
import { Clock, Sigma, Microscope, Trash2, Edit2 } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const taskIconMap = {
  sigma: <Sigma size={20} className="text-sanctuary-800" />,
  microscope: <Microscope size={20} className="text-sanctuary-800" />,
};

const PriorityFocus = ({ tasks, onAddTask, onEditTask, onDeleteTask }) => {
  const [newTitle, setNewTitle] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onAddTask(newTitle);
      setNewTitle("");
    }
  };

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Priority Focus</h2>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Quick Add Task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sanctuary-500"
          />
          <button type="submit" className="text-xs bg-sanctuary-900 text-white px-3 py-1.5 rounded-lg hover:bg-sanctuary-800 transition-colors">
            Add
          </button>
        </form>
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
            <div className="flex gap-2">
              <button 
                onClick={() => onEditTask(task)}
                className="p-2 text-slate-400 hover:text-sanctuary-600 transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => onDeleteTask(task.id)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
              <Button variant="solid" size="sm" className="flex-shrink-0">
                Start Focus
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PriorityFocus;
