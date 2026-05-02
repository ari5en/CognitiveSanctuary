import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { getPlannerByUser, getSessionsByUser, getTasksByUser, addTaskToSession, createSession } from "../services/api";

// Schedule Components
import ScheduleHeader from "../components/schedule/ScheduleHeader";
import AlertBanner from "../components/schedule/AlertBanner";
import PriorityFocus from "../components/schedule/PriorityFocus";
import RestMode from "../components/schedule/RestMode";
import FocusResilience from "../components/schedule/FocusResilience";
import DailyReflection from "../components/schedule/DailyReflection";

const defaultScheduleData = {
  title: "Adaptive Scheduling",
  description: "System analysis complete. Based on your cognitive load patterns, we've optimized your schedule for peak focus and recovery.",
  alert: { load: 75, message: "System suggests a lighter workload today to prevent burnout." },
  priorityTasks: [
    { id: 1, title: "Calculus Homework", subject: "MATH", subjectColor: "green", duration: "45 mins", icon: "sigma" },
    { id: 2, title: "Biology Review", subject: "SCIENCE", subjectColor: "green", duration: "30 mins", icon: "microscope" },
  ],
  restModeTasks: [
    { id: 3, title: "History Essay Draft", deferredTo: "DEFERRED TO TOMORROW", priority: "Priority: Low", icon: "book-open" },
  ],
  focusResilience: { score: 82, label: "Optimal", description: "Your neural endurance is high in the mornings." },
  dailyReflection: { quote: '"The mind is not a vessel to be filled, but a fire to be kindled."', label: "DAILY REFLECTION" },
};

const SchedulePage = () => {
  const [scheduleData, setScheduleData] = useState(defaultScheduleData);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [planner, sessions, tasks] = await Promise.all([
          getPlannerByUser(1).catch(() => null),
          getSessionsByUser(1),
          getTasksByUser(1).catch(() => []),
        ]);

        if (!isMounted) return;

        const load = planner?.recommendedLoad ?? Math.min(100, 50 + sessions.length * 10);

        // Map real tasks to the UI format
        const mappedTasks = tasks.map((t, idx) => ({
          id: t.taskId || idx,
          title: t.title,
          subject: "FOCUS", 
          subjectColor: "green",
          duration: `${t.estimatedTime} mins`,
          icon: "sigma",
        }));

        setScheduleData((prev) => ({
          ...prev,
          priorityTasks: mappedTasks.length > 0 ? mappedTasks : prev.priorityTasks,
          alert: {
            ...prev.alert,
            load,
            message: tasks.length > 0 
              ? `Synced ${tasks.length} tasks from your neural patterns.` 
              : prev.alert.message,
          },
        }));
      } catch (err) {
        if (isMounted) setError("Unable to load schedule data.");
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleAddTask = async (title) => {
    setError(""); // Clear previous errors
    try {
      let sessions = await getSessionsByUser(1);
      let sessionId;
      
      if (!sessions || sessions.length === 0) {
        const newSession = await createSession({ userId: 1, breakCount: 0 });
        sessionId = newSession.sessionId;
      } else {
        sessionId = sessions[0].sessionId;
      }

      if (!sessionId) throw new Error("Could not determine session ID");

      await addTaskToSession(sessionId, {
        title,
        estimatedTime: 30,
        status: "Pending"
      });

      // Refresh tasks immediately
      const updatedTasks = await getTasksByUser(1);
      const mappedTasks = updatedTasks.map((t, idx) => ({
        id: t.taskId || t.task_id || idx,
        title: t.title,
        subject: "FOCUS", 
        subjectColor: "green",
        duration: `${t.estimatedTime || t.estimated_time || 30} mins`,
        icon: "sigma",
      }));
      
      setScheduleData(prev => ({ 
        ...prev, 
        priorityTasks: mappedTasks 
      }));
      
      setError(""); // Success
    } catch (err) {
      console.error("Error adding task:", err);
      setError("Failed to add task. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      <ScheduleHeader 
        title={scheduleData.title} 
        description={scheduleData.description} 
        error={error} 
      />

      <div className="flex gap-6">
        {/* LEFT CONTENT */}
        <div className="flex-1 min-w-0 space-y-5">
          <AlertBanner 
            load={scheduleData.alert.load} 
            message={scheduleData.alert.message} 
          />
          
          <PriorityFocus tasks={scheduleData.priorityTasks} onAddTask={handleAddTask} />

          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 border-t border-dashed border-slate-200" />
          </div>

          <RestMode tasks={scheduleData.restModeTasks} />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-72 flex-shrink-0 space-y-5">
          <FocusResilience resilience={scheduleData.focusResilience} />
          <DailyReflection reflection={scheduleData.dailyReflection} />
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-12 h-12 bg-sanctuary-900 text-white rounded-full shadow-lg flex items-center justify-center z-20 transition-transform hover:scale-105 active:scale-95">
        <Plus size={20} />
      </button>
    </motion.div>
  );
};

export default SchedulePage;
