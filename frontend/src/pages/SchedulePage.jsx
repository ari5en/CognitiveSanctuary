import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { getPlannerByUser, getSessionsByUser } from "../services/api";

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
        const [planner, sessions] = await Promise.all([
          getPlannerByUser(1).catch(() => null),
          getSessionsByUser(1),
        ]);

        if (!isMounted) return;

        const load = planner?.recommendedLoad ?? Math.min(100, 50 + sessions.length * 10);

        setScheduleData((prev) => ({
          ...prev,
          alert: {
            ...prev.alert,
            load,
            message: sessions.length > 0 
              ? `${sessions.length} sessions synced from backend.` 
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
          
          <PriorityFocus tasks={scheduleData.priorityTasks} />

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
