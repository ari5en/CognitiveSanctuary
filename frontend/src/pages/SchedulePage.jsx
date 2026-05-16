import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ArrowRight,
  X,
  Clock,
  CheckCircle2,
  Loader2,
  BookOpen,
  SkipForward,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDataCache } from "../services/DataCacheContext";
import {
  addTaskToSession,
  generateSession,
  getTasksBySession,
  updateTask,
  getUserId,
} from "../services/api";

// ── Category config ───────────────────────────────────────────────────────────
export const CATEGORIES = [
  {
    id: "programming",
    label: "Programming",
    color: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
  },
  {
    id: "reading",
    label: "Reading",
    color: "bg-sky-100 text-sky-700",
    dot: "bg-sky-500",
  },
  {
    id: "school",
    label: "School Work",
    color: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  {
    id: "deep-work",
    label: "Deep Work",
    color: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-600",
  },
  {
    id: "review",
    label: "Review",
    color: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
];

// Mode colours — matching dashboard
const MODE_STYLES = {
  Normal: {
    bg: "#dcfce7",
    color: "#15803d",
    label: "Normal Mode",
    msg: "Full focus workload set for today.",
    cardGradient:
      "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(165,193,167,0.5) 100%)",
  },
  Warning: {
    bg: "#fef3c7",
    color: "#b45309",
    label: "Warning Mode",
    msg: "Shorter focus blocks to pace you.",
    cardGradient:
      "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(253,230,138,0.5) 100%)",
  },
  Recovery: {
    bg: "#ffe4e6",
    color: "#e11d48",
    label: "Recovery Mode",
    msg: "Lighter sessions. Prioritise rest.",
    cardGradient:
      "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(254,205,211,0.5) 100%)",
  },
};

// ── Modal backdrop ────────────────────────────────────────────────────────────
const Overlay = ({ onClose, children }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Create Session Modal ──────────────────────────────────────────────────────
const CreateSessionModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    setBusy(true);
    await onCreate({ name, description, category });
    setBusy(false);
    onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <div
        className="rounded-3xl shadow-2xl w-full max-w-md p-7"
        style={{ background: "#F7F3EE" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: "#1a1a1a" }}>
            New Study Session
          </h2>
          <button
            onClick={onClose}
            style={{ color: "#9ca3af" }}
            className="hover:opacity-70 transition-opacity"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-widest mb-1.5"
              style={{ color: "#9ca3af" }}
            >
              Session Name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Deep Work"
              className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.95)",
                color: "#1a1a1a",
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-widest mb-1.5"
              style={{ color: "#9ca3af" }}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you study?"
              rows={3}
              className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none resize-none"
              style={{
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.95)",
                color: "#1a1a1a",
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "#9ca3af" }}
            >
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    category === cat.id
                      ? cat.color + " border-current"
                      : "border-transparent hover:opacity-80"
                  }`}
                  style={
                    category !== cat.id
                      ? {
                          background: "rgba(255,255,255,0.6)",
                          color: "#6b7280",
                        }
                      : {}
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <p
            className="text-xs flex items-center gap-1.5"
            style={{ color: "#9ca3af" }}
          >
            <Clock size={12} /> Focus &amp; break timing is set automatically by
            your planner.
          </p>
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim() || busy}
          className="mt-6 w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          style={{ background: "#1a1a1a", color: "#fff" }}
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          {busy ? "Generating…" : "Generate Session"}
        </button>
      </div>
    </Overlay>
  );
};

// ── Session Details Modal ─────────────────────────────────────────────────────
const SessionDetailsModal = ({
  session,
  tasks,
  category,
  onClose,
  onStartSession,
  onAddTask,
  onTaskToggle,
  planner,
}) => {
  const [taskInput, setTaskInput] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const sessionId = session.sessionId || session.session_id;
  const focusDuration =
    planner?.adaptiveConfig?.focusDuration ??
    session.plannedFocusDuration ??
    session.planned_focus_duration ??
    45;
  const breakDuration =
    planner?.adaptiveConfig?.breakDuration ??
    session.plannedBreakDuration ??
    session.planned_break_duration ??
    10;

  const handleAdd = async () => {
    if (!taskInput.trim()) return;
    setAddingTask(true);
    await onAddTask(sessionId, taskInput.trim());
    setTaskInput("");
    setAddingTask(false);
  };

  return (
    <Overlay onClose={onClose}>
      <div
        className="rounded-3xl shadow-2xl w-full max-w-lg p-7"
        style={{ background: "#F7F3EE" }}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              {category && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${category.color}`}
                >
                  {category.label}
                </span>
              )}
            </div>
            <h2
              className="text-xl font-bold truncate"
              style={{ color: "#1a1a1a" }}
            >
              {session.name || `Session #${sessionId}`}
            </h2>
            {session.description && (
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
                {session.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ color: "#9ca3af" }}
            className="hover:opacity-70 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Focus/break info */}
        <div className="flex gap-3 mb-5">
          {[
            { label: "Focus", value: `${focusDuration} min` },
            { label: "Break", value: `${breakDuration} min` },
          ].map((item) => (
            <div
              key={item.label}
              className="flex-1 rounded-2xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.95)",
              }}
            >
              <p
                className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: "#9ca3af" }}
              >
                {item.label}
              </p>
              <p className="text-sm font-bold" style={{ color: "#1a1a1a" }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tasks */}
        <div className="mb-5">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#9ca3af" }}
          >
            Tasks
          </p>
          {tasks.length === 0 ? (
            <p
              className="text-sm text-center py-4"
              style={{ color: "#9ca3af" }}
            >
              No tasks yet. Add one below.
            </p>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {tasks.map((task, i) => (
                <li
                  key={task.taskId || task.task_id || i}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(255,255,255,0.95)",
                  }}
                >
                  <button
                    onClick={() => onTaskToggle(task)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors flex-shrink-0 ${
                      task.status === "Completed"
                        ? "border-transparent text-white"
                        : "border-slate-300 hover:border-green-400"
                    }`}
                    style={
                      task.status === "Completed"
                        ? { background: "#064e3b" }
                        : {}
                    }
                  >
                    {task.status === "Completed" && <CheckCircle2 size={12} />}
                  </button>
                  <span
                    className={`text-sm flex-1 ${task.status === "Completed" ? "line-through" : ""}`}
                    style={{
                      color:
                        task.status === "Completed" ? "#9ca3af" : "#374151",
                    }}
                  >
                    {task.title}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-2 mt-3">
            <input
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Add a task…"
              className="flex-1 rounded-2xl px-4 py-2.5 text-sm focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.95)",
                color: "#1a1a1a",
              }}
            />
            <button
              onClick={handleAdd}
              disabled={!taskInput.trim() || addingTask}
              className="px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: "#1a1a1a", color: "#fff" }}
            >
              {addingTask ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Add"
              )}
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            onStartSession(sessionId);
          }}
          disabled={tasks.length === 0}
          className="w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          style={{ background: "#064e3b", color: "#fff" }}
        >
          Start Session <ArrowRight size={16} />
        </button>
      </div>
    </Overlay>
  );
};

// ── Adaptive loading overlay ──────────────────────────────────────────────────
const AdaptiveLoadingOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-40 flex flex-col items-center justify-center"
    style={{
      background: "rgba(232,228,220,0.85)",
      backdropFilter: "blur(8px)",
    }}
  >
    <Loader2
      size={36}
      className="animate-spin mb-4"
      style={{ color: "#064e3b" }}
    />
    <p className="font-semibold text-lg" style={{ color: "#1a1a1a" }}>
      Adapting your next sessions…
    </p>
    <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
      The planner is updating based on your burnout results.
    </p>
  </motion.div>
);

// ── Session Card (bento style) ────────────────────────────────────────────────
const SessionCard = ({ session, tasks, onClick, planner }) => {
  const sessionId = session.sessionId || session.session_id;
  const focusDuration =
    planner?.adaptiveConfig?.focusDuration ??
    session.plannedFocusDuration ??
    session.planned_focus_duration ??
    45;
  const cat =
    CATEGORIES.find((c) => c.id === session.category) || CATEGORIES[3];

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.10)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      onClick={onClick}
      className="cursor-pointer rounded-3xl p-5 flex flex-col gap-3 relative"
      style={{
        background: "#F7F3EE",
        minHeight: 180,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {/* Top: category + status */}
      <div className="flex items-start justify-between">
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cat.color}`}
        >
          {cat.label}
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "#9ca3af" }}
        >
          Planned
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <p
          className="font-bold text-base leading-snug"
          style={{ color: "#1a1a1a" }}
        >
          {session.name || `Session #${sessionId}`}
        </p>
        {session.description && (
          <p className="text-xs mt-1 line-clamp-2" style={{ color: "#6b7280" }}>
            {session.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between text-xs"
        style={{ color: "#9ca3af" }}
      >
        <span className="flex items-center gap-1.5">
          <Clock size={11} /> {focusDuration} min focus
        </span>
        <span>
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </span>
      </div>
    </motion.div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const SchedulePage = () => {
  const navigate = useNavigate();
  const { read, fetchPlannerPageData, fetchTasksForSession, invalidate, tick } =
    useDataCache();

  const [error, setError] = useState("");
  const [isAdapting, setIsAdapting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [detailsSession, setDetailsSession] = useState(null);

  // ── Read from cache immediately (no spinner on revisit) ──────────────────────
  const planner = read("planner");
  const sessions = read("sessions") || [];

  // Merge tasks from cache
  const tasksBySession = useMemo(() => {
    const result = {};
    sessions
      .filter((s) => s.status === "Planned")
      .forEach((s) => {
        const sid = s.sessionId || s.session_id;
        result[sid] = read(`tasks_${sid}`) || [];
      });
    return result;
  }, [sessions, read, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const plannedSessions = useMemo(
    () => sessions.filter((s) => s.status === "Planned"),
    [sessions],
  );

  const mode = planner?.burnoutMode ?? "Normal";
  const modeStyle = MODE_STYLES[mode] || MODE_STYLES.Normal;

  // ── Background revalidation ──────────────────────────────────────────────────
  const revalidate = useCallback(
    async (showAdapting = false) => {
      if (showAdapting) setIsAdapting(true);
      try {
        await fetchPlannerPageData({ force: true });
        setError("");
      } catch {
        setError("Unable to load planner sessions.");
      } finally {
        if (showAdapting) setTimeout(() => setIsAdapting(false), 1200);
      }
    },
    [fetchPlannerPageData],
  );

  useEffect(() => {
    const adapting = sessionStorage.getItem("cs_adapting");
    if (adapting) {
      sessionStorage.removeItem("cs_adapting");
      revalidate(true);
    } else {
      // Silently revalidate in background; cached data renders immediately
      fetchPlannerPageData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // suppress lint — tick re-renders when cache updates
  void tick;

  const handleCreateSession = async ({ name, description, category }) => {
    try {
      const session = await generateSession(getUserId());
      const sid = session.sessionId || session.session_id;
      const meta = JSON.parse(localStorage.getItem("cs_session_meta") || "{}");
      meta[sid] = { name, description, category };
      localStorage.setItem("cs_session_meta", JSON.stringify(meta));
      // Invalidate sessions + tasks so next read is fresh
      invalidate("sessions");
      await revalidate();
    } catch (err) {
      console.error("[handleCreateSession] error:", err);
      setError(
        "Failed to generate session: " +
          (err?.message || "Backend may be offline."),
      );
    }
  };

  const enrichSession = (s) => {
    const sid = s.sessionId || s.session_id;
    const meta =
      JSON.parse(localStorage.getItem("cs_session_meta") || "{}")[sid] || {};
    return {
      ...s,
      name: meta.name,
      description: meta.description,
      category: meta.category,
    };
  };

  const handleAddTask = async (sessionId, title) => {
    await addTaskToSession(sessionId, {
      title,
      estimatedTime: 30,
      status: "Pending",
    });
    await fetchTasksForSession(sessionId, { force: true });
  };

  const handleTaskToggle = async (task) => {
    const newStatus = task.status === "Completed" ? "Pending" : "Completed";
    await updateTask(task.taskId || task.task_id, {
      title: task.title,
      estimatedTime: task.estimatedTime || task.estimated_time || 30,
      status: newStatus,
    });
    if (detailsSession) {
      const sid = detailsSession.sessionId || detailsSession.session_id;
      await fetchTasksForSession(sid, { force: true });
    }
  };

  const enriched = plannedSessions.map(enrichSession);

  return (
    <>
      <AnimatePresence>
        {isAdapting && <AdaptiveLoadingOverlay />}
      </AnimatePresence>

      {showCreateModal && (
        <CreateSessionModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateSession}
        />
      )}

      {detailsSession && (
        <SessionDetailsModal
          session={enrichSession(detailsSession)}
          tasks={
            tasksBySession[
              detailsSession.sessionId || detailsSession.session_id
            ] || []
          }
          category={CATEGORIES.find(
            (c) => c.id === enrichSession(detailsSession).category,
          )}
          onClose={() => setDetailsSession(null)}
          onStartSession={(sid) => navigate(`/sessions?sessionId=${sid}`)}
          onAddTask={handleAddTask}
          onTaskToggle={handleTaskToggle}
          planner={planner}
        />
      )}

      <div className="max-w-[1100px] mx-auto px-4 sm:px-0">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
          <div className="min-w-0">
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight break-words"
              style={{ color: "#1a1a1a" }}
            >
              Study Planner
            </h1>
            <p
              className="text-sm font-medium mt-1 uppercase tracking-widest"
              style={{ color: "#9ca3af" }}
            >
              Your adaptive schedule — updated after every session
            </p>
            {error && (
              <p className="text-xs mt-2" style={{ color: "#e11d48" }}>
                {error}
              </p>
            )}
          </div>

          {/* New Session button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all w-full sm:w-auto"
            style={{
              background: "rgba(6,78,59,0.85)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 4px 16px rgba(6,78,59,0.25)",
              color: "#fff",
            }}
          >
            <Plus size={16} /> New Session
          </motion.button>
        </div>

        {/* ── Bento grid ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Mode banner — light glassmorphic card, col-span-1 */}
          <div
            className="col-span-1 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden"
            style={{
              background: modeStyle.cardGradient,
              backdropFilter: "blur(12px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              minHeight: 120,
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-2"
              style={{ color: "#6b7280" }}
            >
              PLANNER MODE
            </p>
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl mb-2"
                style={{ background: modeStyle.bg }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: modeStyle.color }}
                >
                  {modeStyle.label}
                </span>
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#4b5563" }}
              >
                {modeStyle.msg}
              </p>
            </div>
          </div>

          {/* Stats strip — col-span-2 */}
          <div
            className="lg:col-span-2 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4"
            style={{ background: "#F7F3EE" }}
          >
            {[
              {
                label: "PLANNED",
                value: plannedSessions.length,
                sub: "session" + (plannedSessions.length !== 1 ? "s" : ""),
              },
              {
                label: "FOCUS",
                value:
                  planner?.adaptiveConfig?.focusDuration ??
                  planner?.plannedFocusDuration ??
                  45,
                sub: "min per block",
              },
              {
                label: "BREAK",
                value:
                  planner?.adaptiveConfig?.breakDuration ??
                  planner?.plannedBreakDuration ??
                  10,
                sub: "min recovery",
              },
            ].map((stat, i) => (
              <div key={i}>
                <p
                  className="text-[9px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: "#9ca3af" }}
                >
                  {stat.label}
                </p>
                <p className="text-3xl font-bold" style={{ color: "#1a1a1a" }}>
                  {stat.value}
                </p>
                <p className="text-xs" style={{ color: "#6b7280" }}>
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>

          {/* ── Session board — full width ────────────────────────────────────── */}
          <div className="lg:col-span-3">
            {enriched.length === 0 ? (
              <div
                className="rounded-3xl p-12 flex flex-col items-center justify-center text-center"
                style={{ background: "#F7F3EE" }}
              >
                <BookOpen
                  size={36}
                  className="mb-4"
                  style={{ color: "#d1d5db" }}
                />
                <p className="font-semibold" style={{ color: "#374151" }}>
                  No planned sessions yet.
                </p>
                <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>
                  Click <strong>New Session</strong> to generate your first
                  session.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {enriched.map((session) => {
                  const sid = session.sessionId || session.session_id;
                  return (
                    <SessionCard
                      key={sid}
                      session={session}
                      tasks={tasksBySession[sid] || []}
                      onClick={() => setDetailsSession(session)}
                      planner={planner}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SchedulePage;
