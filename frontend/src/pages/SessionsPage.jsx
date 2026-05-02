import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, LayoutGrid } from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

import { createSession, getSessionsByUser, getTasksByUser, addTaskToSession, updateSessionTimes, saveBurnoutRecord, getActiveSession, updateTask } from "../services/api";
import SessionTimer from "../components/sessions/SessionTimer";

// Sessions Components
import SessionHeader from "../components/sessions/SessionHeader";
import NumberInput from "../components/sessions/NumberInput";
import MentalStateSelector from "../components/sessions/MentalStateSelector";
import BurnoutPrediction from "../components/sessions/BurnoutPrediction";
import TriviaCard from "../components/sessions/TriviaCard";
import SessionStats from "../components/sessions/SessionStats";
import RecentSessions from "../components/sessions/RecentSessions";
import TaskSelector from "../components/sessions/TaskSelector";

const defaultSessionData = {
  title: "Configure Session",
  subtitle:
    "Personalize your deep work environment for maximum cognitive efficiency.",
  defaults: { studyHours: 2, breaksSkipped: 0, mentalState: "Happy" },
  mentalStates: [
    { id: "Happy", emoji: "😊", label: "Happy" },
    { id: "Neutral", emoji: "😐", label: "Neutral" },
    { id: "Tired", emoji: "😟", label: "Tired" },
    { id: "Exhausted", emoji: "🤯", label: "Exhausted" },
  ],
  burnoutPrediction: {
    riskLevel: "Low",
    riskPercent: 12,
    recommendation:
      "Your current energy levels are optimal. Consider a 50-minute Pomodoro cycle to maintain this momentum.",
    cognitiveLoad: "Normal",
    estimatedRecovery: "15 min",
  },
  trivia: "Drinking 250ml of water every 60 minutes improves focus by 14%.",
  stats: { totalSessions: 142, avgHours: 4.8 },
};

const SessionsPage = () => {
  const [studyHours, setStudyHours] = useState(
    defaultSessionData.defaults.studyHours
  );
  const [breaksSkipped, setBreaksSkipped] = useState(
    defaultSessionData.defaults.breaksSkipped
  );
  const [mentalState, setMentalState] = useState(
    defaultSessionData.defaults.mentalState
  );

  const [recentSessions, setRecentSessions] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  const [isActiveSession, setIsActiveSession] = useState(false);
  const [activeSessionData, setActiveSessionData] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [resumedSecondsLeft, setResumedSecondsLeft] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const [sessions, tasks, active] = await Promise.all([
          getSessionsByUser(1),
          getTasksByUser(1).catch(() => []),
          getActiveSession(1).catch(() => null),
        ]);

        if (isMounted) {
          setRecentSessions(sessions);
          setAvailableTasks(tasks.filter((t) => t.status !== "Completed"));

          if (active) {
            const start = new Date(active.startTime || active.start_time);
            const now = new Date();
            const elapsedSeconds = Math.floor((now - start) / 1000);
            const targetMinutes = active.studyDuration || active.study_duration || 120;
            const targetSeconds = targetMinutes * 60;
            const remaining = Math.max(0, targetSeconds - elapsedSeconds);

            setActiveSessionData(active);
            setSessionStartTime(active.startTime || active.start_time);
            setStudyHours(targetMinutes / 60);
            setResumedSecondsLeft(remaining);
            setIsActiveSession(true);

            const activeTasks = tasks.filter(t => (t.sessionId || t.session_id) === active.sessionId);
            if (activeTasks.length > 0) {
              setSelectedTaskIds(activeTasks.map(t => t.taskId || t.task_id));
            }
          }
        }
      } catch (err) {
        if (isMounted) setError("Unable to load session data.");
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTask = (taskId) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleStartSession = async () => {
    setError("");
    setMessage("");

    try {
      const session = await createSession({
        userId: 1,
        breakCount: breaksSkipped,
      });

      if (selectedTaskIds.length > 0) {
        await Promise.all(
          selectedTaskIds.map((taskId) => {
            const task = availableTasks.find(
              (t) => (t.taskId || t.task_id) === taskId
            );

            if (!task) return null;

            return addTaskToSession(session.sessionId, {
              title: task.title,
              estimatedTime: task.estimatedTime || task.estimated_time || 30,
              status: "InProgress",
            });
          })
        );
      }

      const now = new Date().toISOString();
      await updateSessionTimes(session.sessionId, {
        startTime: now,
        endTime: now,
        studyDuration: studyHours * 60,
      });

      setRecentSessions((prev) => [session, ...prev]);
      setActiveSessionData(session);
      setSessionStartTime(now);
      setResumedSecondsLeft(null);
      setIsActiveSession(true);
    } catch (err) {
      setError("Unable to start the session.");
    }
  };

  const handleToggleTaskInSession = async (task) => {
    try {
      const newStatus = task.status === "Completed" ? "InProgress" : "Completed";
      await updateTask(task.taskId || task.task_id, { 
        title: task.title, 
        estimatedTime: task.estimatedTime || task.estimated_time, 
        status: newStatus 
      });
      
      const tasks = await getTasksByUser(1);
      setAvailableTasks(tasks);
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const handleEndSession = async ({ completed, duration }) => {
    try {
      const endTime = new Date().toISOString();

      await updateSessionTimes(activeSessionData.sessionId, {
        startTime: sessionStartTime,
        endTime: endTime,
        studyDuration: duration,
      });

      const scoreMap = {
        Happy: 20,
        Neutral: 50,
        Tired: 80,
        Exhausted: 100,
      };

      await saveBurnoutRecord({
        sessionId: activeSessionData.sessionId,
        score: scoreMap[mentalState] || 50,
      });

      setIsActiveSession(false);
      setActiveSessionData(null);
      setSelectedTaskIds([]);

      setMessage("Session completed and recorded. Recovery advised.");

      const sessions = await getSessionsByUser(1);
      setRecentSessions(sessions);
    } catch (err) {
      setError("Session ended but failed to save record.");
      setIsActiveSession(false);
    }
  };

  const activeTasks = availableTasks.filter(t => selectedTaskIds.includes(t.taskId || t.task_id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      <SessionHeader
        title={defaultSessionData.title}
        subtitle={defaultSessionData.subtitle}
        message={message}
        error={error}
      />

      <div className="flex gap-6 items-start">
        {/* LEFT SIDE */}
        <div className="flex-1 min-w-0">
          {isActiveSession ? (
            <SessionTimer
              initialMinutes={studyHours * 60}
              resumedSecondsLeft={resumedSecondsLeft}
              tasks={activeTasks}
              onEnd={handleEndSession}
              onTaskToggle={handleToggleTaskInSession}
            />
          ) : (
            <Card className="space-y-7">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Study Hours
                  </label>

                  <NumberInput
                    icon={<Clock size={16} />}
                    value={studyHours}
                    onChange={setStudyHours}
                    min={1}
                    max={12}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Breaks Skipped
                  </label>

                  <NumberInput
                    icon={<LayoutGrid size={16} />}
                    value={breaksSkipped}
                    onChange={setBreaksSkipped}
                    min={0}
                    max={10}
                  />
                </div>
              </div>

              <MentalStateSelector
                mentalStates={defaultSessionData.mentalStates}
                currentMood={mentalState}
                onChange={setMentalState}
              />

              <TaskSelector
                tasks={availableTasks}
                selectedIds={selectedTaskIds}
                onToggle={toggleTask}
              />

              <Button
                variant="solid"
                size="lg"
                fullWidth
                className="py-4 text-base font-semibold rounded-xl"
                onClick={handleStartSession}
              >
                ▶ Start Session
              </Button>
            </Card>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-72 flex-shrink-0 space-y-4">
          <BurnoutPrediction
            prediction={defaultSessionData.burnoutPrediction}
          />

          <TriviaCard trivia={defaultSessionData.trivia} />

          <SessionStats stats={defaultSessionData.stats} />

          <RecentSessions sessions={recentSessions} />
        </div>
      </div>
    </motion.div>
  );
};

export default SessionsPage;