import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Square, Coffee, CheckCircle2, ArrowLeft,
  AlertCircle, Loader2, SkipForward, Timer,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { completeSession, getSessionsByUser, getTasksBySession, updateTask } from "../services/api";

// ── Constants ─────────────────────────────────────────────────────────────────
const Phase = { Idle: "IDLE", Focus: "FOCUS", BreakPrompt: "BREAK_PROMPT", Break: "BREAK", Evaluation: "EVALUATION", Result: "RESULT" };

// Apple-style emoji via CDN
const appleEmoji = (cp) => `https://emojicdn.elk.sh/${encodeURIComponent(cp)}?style=apple`;

const MOOD_OPTIONS = [
  { id: 1, codepoint: "😊", label: "Happy" },
  { id: 2, codepoint: "😐", label: "Neutral" },
  { id: 3, codepoint: "😟", label: "Tired" },
  { id: 4, codepoint: "🤯", label: "Exhausted" },
];

const ADD_TIME_OPTIONS = [
  { focusMin: 15, breakMin: 5,   label: "+15 min" },
  { focusMin: 10, breakMin: 2.5, label: "+10 min" },
  { focusMin: 5,  breakMin: 0,   label: "+5 min"  },
];

const RESULT_LEVELS = [
  { max: 25,  codepoint: "😄", color: "#22c55e", desc: "Great work! You're in excellent shape."      },
  { max: 50,  codepoint: "🙂", color: "#38bdf8", desc: "Moderate fatigue. Keep rest consistent."     },
  { max: 75,  codepoint: "😐", color: "#f59e0b", desc: "Noticeable fatigue. Breaks are important."   },
  { max: 100, codepoint: "😫", color: "#f43f5e", desc: "High burnout risk. Recovery mode activated." },
];

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ── Modal wrapper ─────────────────────────────────────────────────────────────
const ModalBase = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center px-4"
    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
  >
    <motion.div
      initial={{ scale: 0.92, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.92, y: 20, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="rounded-3xl shadow-2xl w-full max-w-md p-8"
      style={{ background: "#F7F3EE" }}
    >
      {children}
    </motion.div>
  </motion.div>
);

// ── Confirm Exit Modal ────────────────────────────────────────────────────────
const ConfirmExitModal = ({ onConfirm, onCancel }) => (
  <ModalBase>
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "#ffe4e6" }}>
        <AlertCircle size={32} style={{ color: "#e11d48" }} />
      </div>
      <h2 className="text-xl font-bold" style={{ color: "#1a1a1a" }}>End this session?</h2>
      <p className="text-sm" style={{ color: "#6b7280" }}>Your progress will be saved and burnout will be evaluated.</p>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all" style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.95)", color: "#374151" }}>Keep Going</button>
        <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all" style={{ background: "#e11d48", color: "#fff" }}>End Session</button>
      </div>
    </div>
  </ModalBase>
);

// ── Skip Break Modal ──────────────────────────────────────────────────────────
const SkipBreakModal = ({ onConfirm, onCancel }) => (
  <ModalBase>
    <div className="text-center space-y-4">
      <img src={appleEmoji("☕")} alt="coffee" width={56} height={56} className="mx-auto" draggable={false} />
      <h2 className="text-xl font-bold" style={{ color: "#1a1a1a" }}>Skip your break?</h2>
      <p className="text-sm" style={{ color: "#6b7280" }}>Skipping breaks increases burnout risk. This will be recorded.</p>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-2xl text-sm font-semibold" style={{ background: "#064e3b", color: "#fff" }}>Take Break</button>
        <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl text-sm font-semibold" style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.95)", color: "#6b7280" }}>Skip Anyway</button>
      </div>
    </div>
  </ModalBase>
);

// ── Mood Modal ────────────────────────────────────────────────────────────────
const MoodModal = ({ onSubmit, isSubmitting }) => {
  const [mood, setMood] = useState(2);
  return (
    <ModalBase>
      <h2 className="text-xl font-bold mb-1" style={{ color: "#1a1a1a" }}>
        How did the session feel?{" "}
        <img src={appleEmoji("🎉")} alt="party" width={24} height={24} className="inline-block align-middle" draggable={false} />
      </h2>
      <p className="text-sm mb-6" style={{ color: "#6b7280" }}>This helps calibrate your burnout score.</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {MOOD_OPTIONS.map(m => (
          <button
            key={m.id}
            onClick={() => setMood(m.id)}
            className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all"
            style={
              mood === m.id
                ? { background: "#dcfce7", border: "2px solid #22c55e" }
                : { background: "rgba(255,255,255,0.8)", border: "2px solid transparent" }
            }
          >
            <img src={appleEmoji(m.codepoint)} alt={m.label} width={44} height={44} draggable={false} />
            <span className="text-xs font-semibold" style={{ color: "#374151" }}>{m.label}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => onSubmit(mood)}
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
        style={{ background: "#064e3b", color: "#fff" }}
      >
        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
        {isSubmitting ? "Saving…" : "Save & See Results →"}
      </button>
    </ModalBase>
  );
};

// ── Result Screen ─────────────────────────────────────────────────────────────
const ResultScreen = ({ score, level, config, onContinue }) => {
  const lvl = RESULT_LEVELS.find(l => score <= l.max) || RESULT_LEVELS[RESULT_LEVELS.length - 1];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#E8E4DC" }}
    >
      <div className="rounded-3xl shadow-2xl p-12 max-w-sm w-full text-center space-y-6" style={{ background: "#F7F3EE" }}>
        <div className="flex justify-center">
          <img src={appleEmoji(lvl.codepoint)} alt={level} width={80} height={80} draggable={false} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#9ca3af" }}>Burnout Result</p>
          <p className="text-5xl font-bold" style={{ color: lvl.color }}>{score}%</p>
          <p className="text-lg font-semibold mt-1" style={{ color: lvl.color }}>{level}</p>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{lvl.desc}</p>
        {config && (
          <div className="rounded-2xl p-4 text-left space-y-1" style={{ background: "rgba(255,255,255,0.8)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#9ca3af" }}>Next Session (Adapted)</p>
            <p className="text-xs" style={{ color: "#374151" }}>Focus: <strong>{config.focusDuration} min</strong></p>
            <p className="text-xs" style={{ color: "#374151" }}>Break every: <strong>{config.breakInterval} min</strong></p>
            <p className="text-xs" style={{ color: "#374151" }}>Break duration: <strong>{config.breakDuration} min</strong></p>
          </div>
        )}
        <button
          onClick={onContinue}
          className="w-full py-3.5 rounded-2xl font-semibold transition-all"
          style={{ background: "#064e3b", color: "#fff" }}
        >
          Back to Dashboard →
        </button>
      </div>
    </motion.div>
  );
};

// ── Timer Ring ────────────────────────────────────────────────────────────────
const TimerRing = ({ secondsLeft, totalSeconds, isFocus }) => {
  const pct = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const r = 90, circ = 2 * Math.PI * r;
  const color = isFocus ? "#064e3b" : "#0284c7";
  return (
    <div className="relative w-56 h-56 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
        <circle cx="100" cy="100" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          style={{ transition: "stroke-dashoffset 1s linear" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-light tabular-nums tracking-tight" style={{ color: "#fff" }}>{fmt(secondsLeft)}</span>
        <span className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color }}>{isFocus ? "Focus" : "Break"}</span>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const SessionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession]           = useState(null);
  const [tasks, setTasks]               = useState([]);
  const [phase, setPhase]               = useState(Phase.Idle);
  const [isRunning, setIsRunning]       = useState(false);
  const [secondsLeft, setSecondsLeft]   = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [focusElapsed, setFocusElapsed] = useState(0);
  const [breaksSkipped, setBreaksSkipped]   = useState(0);
  const [sessionStart, setSessionStart]     = useState(null);
  const [addedBreakSecs, setAddedBreakSecs] = useState(0);

  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showSkipBreak, setShowSkipBreak]     = useState(false);
  const [showMood, setShowMood]               = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [resultData, setResultData]           = useState(null);
  const [loadError, setLoadError]             = useState("");

  const sessionIdFromUrl = useMemo(() => {
    const p = new URLSearchParams(location.search).get("sessionId");
    const n = Number(p);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [location.search]);

  const focusSecs = useMemo(() => Math.max(60, Math.round((session?.plannedFocusDuration || session?.planned_focus_duration || 45) * 60)), [session]);
  const breakSecs = useMemo(() => Math.max(60, Math.round(((session?.plannedBreakDuration || session?.planned_break_duration || 10) * 60) + addedBreakSecs)), [session, addedBreakSecs]);

  useEffect(() => {
    (async () => {
      try {
        const sessions = await getSessionsByUser(1);
        let target = sessionIdFromUrl ? sessions.find(s => (s.sessionId || s.session_id) === sessionIdFromUrl) : null;
        if (!target) target = sessions.find(s => s.status === "Planned") || sessions[0];
        if (!target) { setLoadError("No planned sessions. Generate one on the Schedule page."); return; }
        setSession(target);
        setPhase(Phase.Idle);
        const t = await getTasksBySession(target.sessionId || target.session_id).catch(() => []);
        setTasks(t);
      } catch { setLoadError("Unable to load session."); }
    })();
  }, [sessionIdFromUrl]);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft(p => { if (p <= 1) { clearInterval(id); return 0; } return p - 1; });
      if (phase === Phase.Focus) setFocusElapsed(p => p + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, secondsLeft, phase]);

  useEffect(() => {
    if (secondsLeft !== 0) return;
    if (phase === Phase.Focus) { setIsRunning(false); setPhase(Phase.BreakPrompt); }
    if (phase === Phase.Break) { setIsRunning(false); startFocus(); }
  }, [secondsLeft, phase]);

  const startFocus = useCallback(() => {
    setPhase(Phase.Focus); setSecondsLeft(focusSecs); setTotalSeconds(focusSecs); setIsRunning(true);
    if (!sessionStart) setSessionStart(new Date().toISOString());
  }, [focusSecs, sessionStart]);

  const handlePlay = () => { if (phase === Phase.Idle) { startFocus(); return; } setIsRunning(r => !r); };
  const handleTakeBreak = () => { setPhase(Phase.Break); setSecondsLeft(breakSecs); setTotalSeconds(breakSecs); setIsRunning(true); };
  const handleSkipBreakConfirm = () => { setShowSkipBreak(false); setBreaksSkipped(p => p + 1); startFocus(); };
  const handleAddTime = (opt) => { setSecondsLeft(p => p + opt.focusMin * 60); setTotalSeconds(p => p + opt.focusMin * 60); setAddedBreakSecs(p => p + opt.breakMin * 60); };
  const handleExitConfirm = () => { setShowConfirmExit(false); setIsRunning(false); setPhase(Phase.Evaluation); setShowMood(true); };

  const handleMoodSubmit = async (mood) => {
    setIsSubmitting(true);
    try {
      const endTime = new Date().toISOString();
      const sid = session.sessionId || session.session_id;
      const data = await completeSession(sid, { startTime: sessionStart || endTime, endTime, studyDuration: +(focusElapsed / 60).toFixed(2), mood, breaksSkipped });
      setResultData({ score: data.burnoutScore ?? 0, level: data.burnoutLevel ?? "Stable", config: data.adaptiveConfig });
      setShowMood(false); setPhase(Phase.Result);
    } catch { setIsSubmitting(false); }
  };

  const handleTaskToggle = async (task) => {
    const newStatus = task.status === "Completed" ? "Pending" : "Completed";
    await updateTask(task.taskId || task.task_id, { title: task.title, estimatedTime: task.estimatedTime || task.estimated_time || 30, status: newStatus });
    const sid = session.sessionId || session.session_id;
    setTasks(await getTasksBySession(sid).catch(() => tasks));
  };

  const handleContinue = () => { sessionStorage.setItem("cs_adapting", "1"); navigate("/dashboard"); };

  if (phase === Phase.Result && resultData) return <ResultScreen {...resultData} onContinue={handleContinue} />;

  const isFocusPhase = phase === Phase.Focus;
  const isBreakPhase = phase === Phase.Break;

  return (
    <div className="max-w-[1100px] mx-auto flex flex-col h-full">
      {/* Modals */}
      <AnimatePresence>
        {showConfirmExit && <ConfirmExitModal onConfirm={handleExitConfirm} onCancel={() => setShowConfirmExit(false)} />}
        {showSkipBreak  && <SkipBreakModal   onConfirm={handleSkipBreakConfirm} onCancel={() => setShowSkipBreak(false)} />}
        {showMood       && <MoodModal onSubmit={handleMoodSubmit} isSubmitting={isSubmitting} />}
      </AnimatePresence>

      {/* Break indicator bar */}
      {isBreakPhase && (
        <div className="fixed inset-0 z-30 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-1 animate-pulse" style={{ background: "#0284c7" }} />
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <span className="text-xs font-bold px-4 py-2 rounded-full shadow-lg" style={{ background: "#0284c7", color: "#fff" }}>
              Break in progress — rest and recharge
            </span>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#1a1a1a" }}>
            Focus Session
          </h1>
          <p className="flex items-center gap-1.5 text-sm font-medium mt-1 uppercase tracking-widest" style={{ color: "#9ca3af" }}>
            <Timer size={14} /> Session Runtime
          </p>
        </div>

        <button
          onClick={() => setShowConfirmExit(true)}
          disabled={isBreakPhase}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all disabled:opacity-30"
          style={{ 
            background: "rgba(225,29,72,0.1)", 
            backdropFilter: "blur(12px)", 
            border: "1px solid rgba(225,29,72,0.2)", 
            boxShadow: "0 2px 10px rgba(225,29,72,0.05)",
            color: "#e11d48" 
          }}
        >
          <Square size={16} /> Exit Session
        </button>
      </div>

      <div className="w-full pb-10">
        {loadError ? (
          <div className="rounded-3xl p-10 text-center w-full" style={{ background: "#F7F3EE" }}>
            <p style={{ color: "#6b7280" }}>{loadError}</p>
            <button onClick={() => navigate("/schedule")} className="mt-4 px-6 py-2 rounded-2xl text-sm font-semibold" style={{ background: "#064e3b", color: "#fff" }}>Go to Schedule</button>
          </div>
        ) : !session ? (
          <Loader2 size={32} className="animate-spin" style={{ color: "#9ca3af" }} />
        ) : (
          <div className="w-full flex gap-4 items-start">

            {/* ── Timer card (light) ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col items-center gap-4 rounded-3xl py-8 px-10 relative overflow-hidden" style={{ background: "#F7F3EE" }}>
              
              {/* Gradient blobs for visual interest since it's light now */}
              <div className="absolute rounded-full pointer-events-none" style={{ width: 300, height: 300, background: "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)", top: -50, left: -50, filter: "blur(40px)" }} />
              <div className="absolute rounded-full pointer-events-none" style={{ width: 250, height: 250, background: "radial-gradient(circle, rgba(2,132,199,0.08) 0%, transparent 70%)", bottom: -50, right: -50, filter: "blur(40px)" }} />

              {/* Phase label */}
              <div className="relative z-10 h-6">
                <AnimatePresence mode="wait">
                  <motion.div key={phase} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="text-center">
                    {phase === Phase.Idle        && <p className="text-sm font-bold uppercase tracking-widest" style={{ color: "#9ca3af" }}>Press Play to start focus</p>}
                    {phase === Phase.BreakPrompt && <p className="text-sm font-bold uppercase tracking-widest" style={{ color: "#15803d" }}>Focus complete! Take a break</p>}
                    {isFocusPhase               && <p className="text-sm font-bold uppercase tracking-widest" style={{ color: "#15803d" }}>Deep focus mode</p>}
                    {isBreakPhase               && <p className="text-sm font-bold uppercase tracking-widest" style={{ color: "#0284c7" }}>Break mode — recharge</p>}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Break prompt or timer ring */}
              <div className="relative z-10">
                {phase === Phase.BreakPrompt ? (
                  <div className="flex flex-col items-center gap-5 my-2">
                    <div className="w-32 h-32 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.2)" }}>
                      <Coffee size={40} style={{ color: "#15803d" }} />
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button onClick={handleTakeBreak} className="px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all" style={{ background: "#064e3b", color: "#fff" }}>
                        <Coffee size={16} /> Take Break
                      </button>
                      <button onClick={() => setShowSkipBreak(true)} className="px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all" style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.9)", color: "#6b7280" }}>
                        <SkipForward size={16} /> Skip
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    {/* Timer Ring */}
                    <div className="relative w-56 h-56 mx-auto">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="10" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke={isFocusPhase ? "#15803d" : "#0284c7"} strokeWidth="10"
                          strokeLinecap="round" strokeDasharray={2 * Math.PI * 80} strokeDashoffset={(2 * Math.PI * 80) * (1 - (totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0))}
                          style={{ transition: "stroke-dashoffset 1s linear" }} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold tabular-nums tracking-tighter" style={{ color: "#1a1a1a" }}>{fmt(secondsLeft)}</span>
                        <span className="text-xs font-bold uppercase tracking-widest mt-2" style={{ color: isFocusPhase ? "#15803d" : "#0284c7" }}>
                          {isFocusPhase ? "Focus" : "Break"}
                        </span>
                      </div>
                    </div>

                    {/* Play/Pause */}
                    <button
                      onClick={handlePlay}
                      disabled={isBreakPhase}
                      className="w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all disabled:opacity-50"
                      style={isRunning ? { background: "rgba(255,255,255,0.8)", color: "#1a1a1a", border: "1px solid rgba(0,0,0,0.05)" } : { background: "#064e3b", color: "#fff" }}
                    >
                      {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </button>

                    {/* Add time */}
                    <div className="h-10 mt-1">
                      {isFocusPhase && isRunning && (
                        <div className="flex gap-2 justify-center">
                          {ADD_TIME_OPTIONS.map((opt, i) => (
                            <button key={i} onClick={() => handleAddTime(opt)} className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all" style={{ background: "rgba(255,255,255,0.6)", color: "#6b7280", border: "1px solid rgba(0,0,0,0.05)" }}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats strip */}
              <div className="relative z-10 flex gap-12 text-center mt-1">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#9ca3af" }}>Focused</p>
                  <p className="text-base font-bold" style={{ color: "#1a1a1a" }}>{fmt(focusElapsed)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#9ca3af" }}>Breaks Skipped</p>
                  <p className="text-base font-bold" style={{ color: "#1a1a1a" }}>{breaksSkipped}</p>
                </div>
              </div>
            </div>

            {/* ── Task sidebar ──────────────────────────────────────────────── */}
            <div className="w-72 flex-shrink-0">
              <div className="rounded-3xl p-5" style={{ background: "#F7F3EE" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "#9ca3af" }}>Task Checklist</p>
                {tasks.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: "#9ca3af" }}>No tasks in this session.</p>
                ) : (
                  <ul className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {tasks.map((task, i) => (
                      <li
                        key={task.taskId || task.task_id || i}
                        className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all"
                        style={task.status === "Completed"
                          ? { background: "rgba(255,255,255,0.4)", opacity: 0.6 }
                          : { background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.95)" }
                        }
                        onClick={() => handleTaskToggle(task)}
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                          style={task.status === "Completed"
                            ? { background: "#064e3b", border: "none", color: "#fff" }
                            : { border: "1.5px solid #d1d5db" }
                          }
                        >
                          {task.status === "Completed" && <CheckCircle2 size={12} />}
                        </div>
                        <span className="text-sm font-medium" style={{ color: task.status === "Completed" ? "#9ca3af" : "#374151", textDecoration: task.status === "Completed" ? "line-through" : "none" }}>
                          {task.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;
