import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Square } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

import { completeSession, getSessionsByUser } from "../services/api";

// Sessions Components
import SessionHeader from "../components/sessions/SessionHeader";
import MentalStateSelector from "../components/sessions/MentalStateSelector";

const defaultSessionData = {
  title: "Session Execution",
  subtitle: "Follow the adaptive focus and break cycle for this study session.",
  mentalStates: [
    { id: 1, emoji: "😊", label: "Happy" },
    { id: 2, emoji: "😐", label: "Neutral" },
    { id: 3, emoji: "😟", label: "Tired" },
    { id: 4, emoji: "🤯", label: "Exhausted" },
  ],
};

const Phase = {
  Focus: "FOCUS",
  BreakPrompt: "BREAK_PROMPT",
  Break: "BREAK",
  Evaluation: "EVALUATION",
};

const formatTime = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const FocusTimer = ({ secondsLeft, totalSeconds, onEnd }) => {
  const progress =
    totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  return (
    <Card className="flex flex-col items-center justify-center py-12 space-y-6 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 h-1 bg-sanctuary-500 transition-all duration-1000"
        style={{ width: `${progress}%` }}
      />
      <div className="text-center space-y-2">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
          Focus Session
        </h3>
        <div className="text-7xl font-light text-slate-800 tracking-tighter tabular-nums">
          {formatTime(secondsLeft)}
        </div>
      </div>
      <Button
        variant="solid"
        className="px-8 rounded-full h-14 shadow-md"
        onClick={onEnd}
      >
        <Square size={18} className="mr-2" />
        End Session
      </Button>
    </Card>
  );
};

const BreakTimer = ({ secondsLeft, totalSeconds, onEnd }) => {
  const progress =
    totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  return (
    <Card className="flex flex-col items-center justify-center py-12 space-y-6 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-1000"
        style={{ width: `${progress}%` }}
      />
      <div className="text-center space-y-2">
        <h3 className="text-emerald-600 text-xs font-bold uppercase tracking-[0.2em]">
          Break Time
        </h3>
        <div className="text-7xl font-light text-slate-800 tracking-tighter tabular-nums">
          {formatTime(secondsLeft)}
        </div>
      </div>
      <Button
        variant="outline"
        className="px-8 rounded-full h-14"
        onClick={onEnd}
      >
        <Square size={18} className="mr-2" />
        End Session
      </Button>
    </Card>
  );
};

const BreakPrompt = ({ onTakeBreak, onSkipBreak, onEnd }) => {
  return (
    <Card className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
          Break Prompt
        </h3>
        <div className="text-3xl font-semibold text-slate-800">
          Take a short recovery break?
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="solid"
          className="px-6 rounded-full h-12"
          onClick={onTakeBreak}
        >
          <Coffee size={16} className="mr-2" />
          Take Break
        </Button>
        <Button
          variant="outline"
          className="px-6 rounded-full h-12"
          onClick={onSkipBreak}
        >
          Skip Break
        </Button>
        <Button
          variant="ghost"
          className="px-6 rounded-full h-12"
          onClick={onEnd}
        >
          End Session
        </Button>
      </div>
    </Card>
  );
};

// ─── Evaluation Modal ────────────────────────────────────────────────────────
const EvaluationModal = ({ mentalStates, onSubmit, isSubmitting }) => {
  const [mood, setMood] = useState(2);

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
            <h2 className="text-xl font-bold text-slate-800">
              Session Complete 🎉
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              How did the session go? This helps us calculate your burnout risk.
            </p>
          </div>

          <div className="mb-8">
            <MentalStateSelector
              mentalStates={mentalStates}
              currentMood={mood}
              onChange={setMood}
            />
          </div>

          {/* Submit */}
          <Button
            variant="solid"
            size="lg"
            fullWidth
            className="py-4 text-base font-semibold rounded-xl"
            onClick={() => onSubmit({ mood })}
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
  const location = useLocation();

  const [session, setSession] = useState(null);
  const [phase, setPhase] = useState(Phase.Focus);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [focusElapsedSeconds, setFocusElapsedSeconds] = useState(0);
  const [breaksSkipped, setBreaksSkipped] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Evaluation modal state
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sessionIdFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get("sessionId");
    const parsed = raw ? Number(raw) : null;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [location.search]);

  const focusSeconds = Math.max(
    1,
    Math.round(
      (session?.plannedFocusDuration || session?.planned_focus_duration || 45) *
        60,
    ),
  );
  const breakSeconds = Math.max(
    1,
    Math.round(
      (session?.plannedBreakDuration || session?.planned_break_duration || 10) *
        60,
    ),
  );

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const sessions = await getSessionsByUser(1);
        if (!isMounted) return;

        let target = null;
        if (sessionIdFromUrl) {
          target = sessions.find(
            (s) => (s.sessionId || s.session_id) === sessionIdFromUrl,
          );
        }

        if (!target) {
          target = sessions.find((s) => s.status === "Planned") || sessions[0];
        }

        if (!target) {
          setError(
            "No planned sessions available. Generate one on the Schedule page.",
          );
          return;
        }

        setSession(target);
        setPhase(Phase.Focus);
        setSecondsLeft(
          Math.round(
            (target.plannedFocusDuration ||
              target.planned_focus_duration ||
              45) * 60,
          ),
        );
        setFocusElapsedSeconds(0);
        setBreaksSkipped(0);
        setSessionStartTime(new Date().toISOString());
        setMessage("Session marked InProgress locally.");
      } catch (err) {
        if (isMounted) setError("Unable to load session data.");
      }
    };

    loadSession();
    return () => {
      isMounted = false;
    };
  }, [sessionIdFromUrl]);

  useEffect(() => {
    if (!session) return;
    if (phase !== Phase.Focus && phase !== Phase.Break) return;

    if (secondsLeft <= 0) {
      if (phase === Phase.Focus) {
        setPhase(Phase.BreakPrompt);
      } else {
        setPhase(Phase.Focus);
        setSecondsLeft(focusSeconds);
      }
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
      if (phase === Phase.Focus) {
        setFocusElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, phase, secondsLeft, focusSeconds]);

  const handleEndSession = () => {
    setPhase(Phase.Evaluation);
    setShowEvalModal(true);
  };

  const handleTakeBreak = () => {
    setPhase(Phase.Break);
    setSecondsLeft(breakSeconds);
  };

  const handleSkipBreak = () => {
    setBreaksSkipped((prev) => prev + 1);
    setPhase(Phase.Focus);
    setSecondsLeft(focusSeconds);
  };

  const handleSubmitEvaluation = async ({ mood }) => {
    setIsSubmittingEval(true);
    try {
      const endTime = new Date().toISOString();
      const studyDuration = Number((focusElapsedSeconds / 60).toFixed(2));

      await completeSession(session.sessionId || session.session_id, {
        startTime: sessionStartTime || endTime,
        endTime,
        studyDuration,
        mood,
        breaksSkipped,
      });

      navigate("/dashboard");
    } catch (err) {
      setError("Failed to complete session. Please try again.");
      setIsSubmittingEval(false);
      setShowEvalModal(false);
    }
  };

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
          <div className="flex-1 min-w-0">
            {!session ? (
              <Card className="py-12 text-center text-slate-500">
                {error || "Loading session…"}
              </Card>
            ) : phase === Phase.Focus ? (
              <FocusTimer
                secondsLeft={secondsLeft}
                totalSeconds={focusSeconds}
                onEnd={handleEndSession}
              />
            ) : phase === Phase.BreakPrompt ? (
              <BreakPrompt
                onTakeBreak={handleTakeBreak}
                onSkipBreak={handleSkipBreak}
                onEnd={handleEndSession}
              />
            ) : phase === Phase.Break ? (
              <BreakTimer
                secondsLeft={secondsLeft}
                totalSeconds={breakSeconds}
                onEnd={handleEndSession}
              />
            ) : (
              <Card className="py-12 text-center text-slate-500">
                Session evaluation in progress…
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default SessionsPage;
