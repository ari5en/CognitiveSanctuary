import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, LayoutGrid, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

import {
  createSession,
  getSessionsByUser,
  getTasksByUser,
  addTaskToSession,
  updateSessionTimes,
  saveBurnoutRecord,
  updateTask,
} from "../services/api";
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
  defaults: { studyHours: 2 },
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

// ─── Evaluation Modal ────────────────────────────────────────────────────────
const EvaluationModal = ({ mentalStates, onSubmit, isSubmitting }) => {
  const [mood, setMood] = useState("Happy");
  const [breaksSkipped, setBreaksSkipped] = useState(0);

  return (
    <AnimatePresence>
      <motion.div
        key="eval-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      >
        <motion.div
          key="eval-card"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
        >
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Session Complete 🎉</h2>
            <p className="text-sm text-slate-500 mt-1">
              How did the session go? This helps us calculate your burnout risk.
            </p>
          </div>

          {/* Mood */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              How are you feeling?
            </label>
            <MentalStateSelector
              mentalStates={mentalStates}
              currentMood={mood}
              onChange={setMood}
            />
          </div>

          {/* Breaks Skipped */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
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

          {/* Submit */}
          <Button
            variant="solid"
            size="lg"
            fullWidth
            className="py-4 text-base font-semibold rounded-xl"
            onClick={() => onSubmit({ mood, breaksSkipped })}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Save & View Dashboard →"}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const SessionsPage = () => {
  const navigate = useNavigate();

  const [studyHours, setStudyHours] = useState(
    defaultSessionData.defaults.studyHours
  );

  const [recentSessions, setRecentSessions] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  const [isActiveSession, setIsActiveSession] = useState(false);
  const [activeSessionData, setActiveSessionData] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Evaluation modal state
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const [sessions, tasks] = await Promise.all([
          getSessionsByUser(1),
          getTasksByUser(1).catch(() => []),
        ]);

        if (isMounted) {
          setRecentSessions(sessions);
          setAvailableTasks(tasks.filter((t) => t.status !== "Completed"));
        }
      } catch (err) {
        if (isMounted) setError("Unable to load session data.");
      }
    };

    loadInitialData();
    return () => { isMounted = false; };
  }, []);

  const toggleTask = (taskId) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  // ── EXECUTE: Start Session ──────────────────────────────────────────────
  const handleStartSession = async () => {
    if (selectedTaskIds.length === 0) {
      setError("Please select at least one task to focus on.");
      return;
    }
    setError("");
    setMessage("");

    try {
      const session = await createSession({ userId: 1, breakCount: 0 });

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

      setRecentSessions((prev) => [session, ...prev]);
      setActiveSessionData(session);
      setSessionStartTime(new Date().toISOString());
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
        status: newStatus,
      });
      const tasks = await getTasksByUser(1);
      setAvailableTasks(tasks);
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  // ── End Session → open Evaluation Modal (DO NOT save yet) ──────────────
  const handleEndSession = ({ completed, duration }) => {
    setSessionDuration(duration);
    setIsActiveSession(false);
    setShowEvalModal(true); // ← Open modal, not save
  };

  // ── EVALUATE: Submit Evaluation → save → REFLECT: navigate to dashboard ─
  const handleSubmitEvaluation = async ({ mood, breaksSkipped }) => {
    setIsSubmittingEval(true);
    try {
      const endTime = new Date().toISOString();

      await updateSessionTimes(activeSessionData.sessionId, {
        startTime: sessionStartTime,
        endTime,
        studyDuration: sessionDuration,
      });

      const scoreMap = {
        Happy: 20,
        Neutral: 50,
        Tired: 80,
        Exhausted: 100,
      };

      await saveBurnoutRecord({
        sessionId: activeSessionData.sessionId,
        score: scoreMap[mood] ?? 50,
      });

      // REFLECT: route to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to save evaluation. Please try again.");
      setIsSubmittingEval(false);
      setShowEvalModal(false);
    }
  };

  const activeTasks = availableTasks.filter((t) =>
    selectedTaskIds.includes(t.taskId || t.task_id)
  );

  return (
    <>
      {/* ── Evaluation Modal (EVALUATE phase) ── */}
      {showEvalModal && (
        <EvaluationModal
          mentalStates={defaultSessionData.mentalStates}
          onSubmit={handleSubmitEvaluation}
          isSubmitting={isSubmittingEval}
        />
      )}

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
                tasks={activeTasks}
                onEnd={handleEndSession}
                onTaskToggle={handleToggleTaskInSession}
              />
            ) : (
              <Card className="space-y-7">
                {/* Study Hours */}
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

                {/* Task Selector */}
                <TaskSelector
                  tasks={availableTasks}
                  selectedIds={selectedTaskIds}
                  onToggle={toggleTask}
                />

                {/* Start Session */}
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
    </>
  );
};

export default SessionsPage;