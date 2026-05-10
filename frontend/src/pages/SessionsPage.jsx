import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Square, Coffee, CheckCircle2, Plus, ArrowLeft,
  Clock, AlertCircle, Loader2, SkipForward, Timer,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { completeSession, getSessionsByUser, getTasksBySession, updateTask } from "../services/api";

// ── Constants ─────────────────────────────────────────────────────────────────
const Phase = { Idle: "IDLE", Focus: "FOCUS", BreakPrompt: "BREAK_PROMPT", Break: "BREAK", Evaluation: "EVALUATION", Result: "RESULT" };

const MOOD_OPTIONS = [
  { id: 1, emoji: "😊", label: "Happy" },
  { id: 2, emoji: "😐", label: "Neutral" },
  { id: 3, emoji: "😟", label: "Tired" },
  { id: 4, emoji: "🤯", label: "Exhausted" },
];

const ADD_TIME_OPTIONS = [
  { focusMin: 15, breakMin: 5,   label: "+15 min focus / +5 min break" },
  { focusMin: 10, breakMin: 2.5, label: "+10 min focus / +2.5 min break" },
  { focusMin: 5,  breakMin: 0,   label: "+5 min focus / no extra break" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ── Modals ────────────────────────────────────────────────────────────────────
const ModalBase = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
  >
    <motion.div
      initial={{ scale: 0.92, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.92, y: 20, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
    >
      {children}
    </motion.div>
  </motion.div>
);

const ConfirmExitModal = ({ onConfirm, onCancel }) => (
  <ModalBase>
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
        <AlertCircle size={32} className="text-rose-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-800">End this session?</h2>
      <p className="text-sm text-slate-500">Your progress will be saved and burnout will be evaluated.</p>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">Keep Going</button>
        <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors">End Session</button>
      </div>
    </div>
  </ModalBase>
);

const SkipBreakModal = ({ onConfirm, onCancel }) => (
  <ModalBase>
    <div className="text-center space-y-4">
      <div className="text-5xl">☕</div>
      <h2 className="text-xl font-bold text-slate-800">Skip your break?</h2>
      <p className="text-sm text-slate-500">Skipping breaks increases burnout risk. This will be recorded.</p>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-sanctuary-900 text-white text-sm font-semibold hover:bg-sanctuary-800 transition-colors">Take Break</button>
        <button onClick={onConfirm} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 transition-colors">Skip Anyway</button>
      </div>
    </div>
  </ModalBase>
);

const MoodModal = ({ onSubmit, isSubmitting }) => {
  const [mood, setMood] = useState(2);
  return (
    <ModalBase>
      <h2 className="text-xl font-bold text-slate-800 mb-2">How did the session feel? 🎉</h2>
      <p className="text-sm text-slate-500 mb-6">This helps calibrate your burnout score.</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {MOOD_OPTIONS.map(m => (
          <button
            key={m.id}
            onClick={() => setMood(m.id)}
            className={`flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 transition-all ${
              mood === m.id ? "border-sanctuary-600 bg-sanctuary-50" : "border-slate-100 hover:border-slate-200"
            }`}
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className="text-xs font-semibold text-slate-600">{m.label}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => onSubmit(mood)}
        disabled={isSubmitting}
        className="w-full py-3.5 bg-sanctuary-900 text-white font-semibold rounded-xl hover:bg-sanctuary-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
        {isSubmitting ? "Saving…" : "Save & See Results →"}
      </button>
    </ModalBase>
  );
};

const ResultScreen = ({ score, level, config, onContinue }) => {
  const emoji = score <= 25 ? "😄" : score <= 50 ? "🙂" : score <= 75 ? "😐" : "😫";
  const color = score <= 25 ? "text-emerald-600" : score <= 50 ? "text-sky-600" : score <= 75 ? "text-amber-600" : "text-rose-600";
  const desc  = score <= 25 ? "Great work! You're in excellent shape." : score <= 50 ? "Moderate fatigue. Keep rest consistent." : score <= 75 ? "Noticeable fatigue. Breaks are important." : "High burnout risk. Recovery mode activated.";
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-sm w-full text-center space-y-6">
        <div className="text-7xl">{emoji}</div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Burnout Result</p>
          <p className={`text-5xl font-bold ${color}`}>{score}%</p>
          <p className={`text-lg font-semibold ${color} mt-1`}>{level}</p>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
        {config && (
          <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Next Session (adapted)</p>
            <p className="text-xs text-slate-600">Focus: <strong>{config.focusDuration} min</strong></p>
            <p className="text-xs text-slate-600">Break every: <strong>{config.breakInterval} min</strong></p>
            <p className="text-xs text-slate-600">Break duration: <strong>{config.breakDuration} min</strong></p>
          </div>
        )}
        <button onClick={onContinue} className="w-full py-3.5 bg-sanctuary-900 text-white font-semibold rounded-xl hover:bg-sanctuary-800 transition-colors">
          Back to Dashboard →
        </button>
      </div>
    </motion.div>
  );
};

// ── Timer Ring ────────────────────────────────────────────────────────────────
const TimerRing = ({ secondsLeft, totalSeconds, isFocus }) => {
  const pct = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const r = 90;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const color = isFocus ? "#15803d" : "#0284c7";

  return (
    <div className="relative w-56 h-56 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="100" cy="100" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-light text-slate-800 tabular-nums tracking-tight">{fmt(secondsLeft)}</span>
        <span className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color }}>{isFocus ? "Focus" : "Break"}</span>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const SessionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession]         = useState(null);
  const [tasks, setTasks]             = useState([]);
  const [phase, setPhase]             = useState(Phase.Idle);
  const [isRunning, setIsRunning]     = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [focusElapsed, setFocusElapsed] = useState(0);
  const [breaksSkipped, setBreaksSkipped] = useState(0);
  const [sessionStart, setSessionStart]   = useState(null);
  const [addedBreakSecs, setAddedBreakSecs] = useState(0);

  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showSkipBreak, setShowSkipBreak]     = useState(false);
  const [showMood, setShowMood]               = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [resultData, setResultData]           = useState(null);

  const [loadError, setLoadError] = useState("");

  const sessionIdFromUrl = useMemo(() => {
    const p = new URLSearchParams(location.search).get("sessionId");
    const n = Number(p);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [location.search]);

  // Derived
  const focusSecs  = useMemo(() => Math.max(60, Math.round((session?.plannedFocusDuration || session?.planned_focus_duration || 45) * 60)), [session]);
  const breakSecs  = useMemo(() => Math.max(60, Math.round(((session?.plannedBreakDuration || session?.planned_break_duration || 10) * 60) + addedBreakSecs)), [session, addedBreakSecs]);

  // Load session
  useEffect(() => {
    (async () => {
      try {
        const sessions = await getSessionsByUser(1);
        let target = sessionIdFromUrl ? sessions.find(s => (s.sessionId || s.session_id) === sessionIdFromUrl) : null;
        if (!target) target = sessions.find(s => s.status === "Planned") || sessions[0];
        if (!target) { setLoadError("No planned sessions. Generate one on the Schedule page."); return; }
        setSession(target);
        setPhase(Phase.Idle);
        const sid = target.sessionId || target.session_id;
        const t = await getTasksBySession(sid).catch(() => []);
        setTasks(t);
      } catch {
        setLoadError("Unable to load session.");
      }
    })();
  }, [sessionIdFromUrl]);

  // Countdown
  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft(p => {
        if (p <= 1) { clearInterval(id); return 0; }
        return p - 1;
      });
      if (phase === Phase.Focus) setFocusElapsed(p => p + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, secondsLeft, phase]);

  // Phase transitions on timer expire
  useEffect(() => {
    if (secondsLeft !== 0) return;
    if (phase === Phase.Focus) { setIsRunning(false); setPhase(Phase.BreakPrompt); }
    if (phase === Phase.Break) { setIsRunning(false); startFocus(); }
  }, [secondsLeft, phase]);

  const startFocus = useCallback(() => {
    setPhase(Phase.Focus);
    setSecondsLeft(focusSecs);
    setTotalSeconds(focusSecs);
    setIsRunning(true);
    if (!sessionStart) setSessionStart(new Date().toISOString());
  }, [focusSecs, sessionStart]);

  const handlePlay = () => {
    if (phase === Phase.Idle) { startFocus(); return; }
    setIsRunning(r => !r);
  };

  const handleTakeBreak = () => {
    setPhase(Phase.Break);
    setSecondsLeft(breakSecs);
    setTotalSeconds(breakSecs);
    setIsRunning(true);
  };

  const handleSkipBreakConfirm = () => {
    setShowSkipBreak(false);
    setBreaksSkipped(p => p + 1);
    startFocus();
  };

  const handleAddTime = (opt) => {
    setSecondsLeft(p => p + opt.focusMin * 60);
    setTotalSeconds(p => p + opt.focusMin * 60);
    setAddedBreakSecs(p => p + opt.breakMin * 60);
  };

  const handleExitConfirm = () => {
    setShowConfirmExit(false);
    setIsRunning(false);
    setPhase(Phase.Evaluation);
    setShowMood(true);
  };

  const handleMoodSubmit = async (mood) => {
    setIsSubmitting(true);
    try {
      const endTime      = new Date().toISOString();
      const studyDuration = +(focusElapsed / 60).toFixed(2);
      const sid = session.sessionId || session.session_id;
      const data = await completeSession(sid, {
        startTime:     sessionStart || endTime,
        endTime,
        studyDuration,
        mood,
        breaksSkipped,
      });
      setResultData({
        score:  data.burnoutScore ?? 0,
        level:  data.burnoutLevel ?? "Stable",
        config: data.adaptiveConfig,
      });
      setShowMood(false);
      setPhase(Phase.Result);
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleTaskToggle = async (task) => {
    const newStatus = task.status === "Completed" ? "Pending" : "Completed";
    await updateTask(task.taskId || task.task_id, { title: task.title, estimatedTime: task.estimatedTime || task.estimated_time || 30, status: newStatus });
    const sid = session.sessionId || session.session_id;
    const updated = await getTasksBySession(sid).catch(() => tasks);
    setTasks(updated);
  };

  const handleContinue = () => {
    sessionStorage.setItem("cs_adapting", "1");
    navigate("/dashboard");
  };

  // Result screen
  if (phase === Phase.Result && resultData) {
    return <ResultScreen {...resultData} onContinue={handleContinue} />;
  }

  const isFocusPhase = phase === Phase.Focus;
  const isBreakPhase = phase === Phase.Break;
  const isActiveTimer = isFocusPhase || isBreakPhase;
  const canAddTime = isFocusPhase;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Modals */}
      <AnimatePresence>
        {showConfirmExit && <ConfirmExitModal onConfirm={handleExitConfirm} onCancel={() => setShowConfirmExit(false)} />}
        {showSkipBreak  && <SkipBreakModal   onConfirm={handleSkipBreakConfirm} onCancel={() => setShowSkipBreak(false)} />}
        {showMood       && <MoodModal onSubmit={handleMoodSubmit} isSubmitting={isSubmitting} />}
      </AnimatePresence>

      {/* Break overlay — disables navigation feeling */}
      {isBreakPhase && (
        <div className="fixed inset-0 z-30 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500 animate-pulse" />
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <span className="bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
              🔒 Break in progress — rest and recharge
            </span>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <button onClick={() => navigate("/schedule")} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
          <ArrowLeft size={18} /> Back to Schedule
        </button>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Timer size={14} /> Session Runtime
        </div>
        <button
          onClick={() => setShowConfirmExit(true)}
          disabled={isBreakPhase}
          className="flex items-center gap-2 text-rose-500 hover:text-rose-700 text-sm font-medium transition-colors disabled:opacity-30"
        >
          <Square size={16} /> Exit Session
        </button>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-8 pb-10 gap-8">
        {loadError ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-card">
            <p className="text-slate-500">{loadError}</p>
            <button onClick={() => navigate("/schedule")} className="mt-4 px-6 py-2 bg-sanctuary-900 text-white rounded-xl text-sm">Go to Schedule</button>
          </div>
        ) : !session ? (
          <Loader2 size={32} className="animate-spin text-slate-400" />
        ) : (
          <div className="w-full max-w-4xl flex gap-8 items-start">

            {/* Center: Timer */}
            <div className="flex-1 flex flex-col items-center gap-6">
              {/* Phase label */}
              <AnimatePresence mode="wait">
                <motion.div key={phase} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="text-center">
                  {phase === Phase.Idle       && <p className="text-slate-400 text-sm font-medium">Press Play to start your focus session</p>}
                  {phase === Phase.BreakPrompt && <p className="text-emerald-600 text-sm font-semibold">Focus block complete! Time for a break?</p>}
                  {isFocusPhase              && <p className="text-sanctuary-700 text-sm font-semibold">Deep focus mode — stay in the zone</p>}
                  {isBreakPhase              && <p className="text-sky-600 text-sm font-semibold">Take a real break — step away from the screen</p>}
                </motion.div>
              </AnimatePresence>

              {/* Timer ring */}
              {phase === Phase.BreakPrompt ? (
                <div className="flex flex-col items-center gap-5">
                  <div className="w-40 h-40 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center">
                    <Coffee size={48} className="text-emerald-500" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleTakeBreak} className="px-6 py-3 bg-emerald-600 text-white rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2">
                      <Coffee size={16} /> Take Break
                    </button>
                    <button onClick={() => setShowSkipBreak(true)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-full text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2">
                      <SkipForward size={16} /> Skip
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <TimerRing secondsLeft={secondsLeft} totalSeconds={totalSeconds || focusSecs} isFocus={!isBreakPhase} />

                  {/* Play/Pause */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePlay}
                      disabled={isBreakPhase}
                      className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-50 ${
                        isRunning
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-sanctuary-900 text-white hover:bg-sanctuary-800"
                      }`}
                    >
                      {isRunning ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
                    </button>
                  </div>

                  {/* Add time */}
                  {canAddTime && isRunning && (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Add Time</p>
                      <div className="flex gap-2 flex-wrap justify-center">
                        {ADD_TIME_OPTIONS.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleAddTime(opt)}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                          >
                            +{opt.focusMin}m
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Stats strip */}
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Focused</p>
                  <p className="text-sm font-semibold text-slate-700">{fmt(focusElapsed)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Breaks Skipped</p>
                  <p className="text-sm font-semibold text-slate-700">{breaksSkipped}</p>
                </div>
              </div>
            </div>

            {/* Right sidebar: tasks */}
            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Task Checklist</p>
                {tasks.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No tasks in this session.</p>
                ) : (
                  <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {tasks.map((task, i) => (
                      <li key={task.taskId || task.task_id || i}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          task.status === "Completed" ? "bg-slate-50 border-transparent opacity-60" : "bg-white border-slate-100 hover:border-sanctuary-200"
                        }`}
                        onClick={() => handleTaskToggle(task)}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border flex-shrink-0 transition-colors ${
                          task.status === "Completed" ? "bg-sanctuary-600 border-sanctuary-600 text-white" : "border-slate-300"
                        }`}>
                          {task.status === "Completed" && <CheckCircle2 size={12} />}
                        </div>
                        <span className={`text-sm ${task.status === "Completed" ? "line-through text-slate-400" : "text-slate-700"}`}>{task.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default SessionsPage;
