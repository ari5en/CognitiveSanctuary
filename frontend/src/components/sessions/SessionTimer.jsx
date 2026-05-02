import React, { useState, useEffect } from "react";
import { Play, Pause, Square, CheckCircle } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";

const SessionTimer = ({ initialMinutes, tasks, onEnd, onTaskToggle }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      clearInterval(interval);
      onEnd({ completed: true, duration: initialMinutes });
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, initialMinutes, onEnd]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progress = ((initialMinutes * 60 - secondsLeft) / (initialMinutes * 60)) * 100;

  return (
    <Card className="flex flex-col items-center justify-center py-12 space-y-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 h-1 bg-sanctuary-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
      
      <div className="text-center space-y-2">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Deep Work in Progress</h3>
        <div className="text-7xl font-light text-slate-800 tracking-tighter tabular-nums">
          {formatTime(secondsLeft)}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsActive(!isActive)}
          title={isActive ? "Pause" : "Resume"}
          className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
        >
          {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>
        
        <Button 
          variant="solid" 
          className="px-8 rounded-full h-14 shadow-md" 
          onClick={() => {
            onEnd({ completed: false, duration: Math.floor((initialMinutes * 60 - secondsLeft) / 60) });
          }}
        >
          <Square size={18} className="mr-2" />
          End Session
        </Button>
      </div>

      {/* ACTIVE TASKS LIST */}
      {tasks && tasks.length > 0 && (
        <div className="w-full max-w-sm pt-6 border-t border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Active Focus Tasks</p>
          <div className="space-y-2">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  task.status === "Completed" 
                    ? "bg-slate-50 border-transparent opacity-60" 
                    : "bg-white border-slate-100 shadow-sm"
                }`}
              >
                <button 
                  onClick={() => onTaskToggle(task)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                    task.status === "Completed"
                      ? "bg-sanctuary-600 border-sanctuary-600 text-white"
                      : "border-slate-200 text-transparent hover:border-sanctuary-300"
                  }`}
                >
                  <CheckCircle size={14} />
                </button>
                <span className={`text-sm font-medium ${task.status === "Completed" ? "line-through text-slate-400" : "text-slate-700"}`}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <CheckCircle size={12} />
          {isActive ? "Focus Mode Active" : "Session Paused"}
        </div>
      </div>
    </Card>
  );
};

export default SessionTimer;
