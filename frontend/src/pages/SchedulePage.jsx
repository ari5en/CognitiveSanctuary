import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight, X, Pencil, BookOpen, Tag, Clock, Coffee, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  addTaskToSession,
  generateSession,
  getPlannerByUser,
  getSessionsByUser,
  getTasksBySession,
  updateTask,
} from "../services/api";

// ── Category config ──────────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: "programming",  label: "Programming",  color: "bg-violet-100 text-violet-700",  dot: "bg-violet-500"  },
  { id: "reading",      label: "Reading",      color: "bg-sky-100 text-sky-700",        dot: "bg-sky-500"      },
  { id: "school",       label: "School Work",  color: "bg-amber-100 text-amber-700",    dot: "bg-amber-500"    },
  { id: "deep-work",    label: "Deep Work",    color: "bg-sanctuary-100 text-sanctuary-800", dot: "bg-sanctuary-600" },
  { id: "review",       label: "Review",       color: "bg-rose-100 text-rose-700",      dot: "bg-rose-500"     },
];

// ── Sticky-note colour palette ────────────────────────────────────────────────
const NOTE_COLORS = [
  "bg-yellow-50  border-yellow-200",
  "bg-sky-50     border-sky-200",
  "bg-violet-50  border-violet-200",
  "bg-rose-50    border-rose-200",
  "bg-emerald-50 border-emerald-200",
  "bg-amber-50   border-amber-200",
];

// ── Modal backdrop ────────────────────────────────────────────────────────────
const Overlay = ({ onClose, children }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">New Study Session</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Session Name</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Morning Deep Work"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sanctuary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What will you study?"
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sanctuary-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    category === cat.id ? cat.color + " border-current" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 italic flex items-center gap-1">
            <Clock size={12} /> Focus & break timing is set automatically by your planner.
          </p>
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim() || busy}
          className="mt-6 w-full py-3 bg-sanctuary-900 text-white text-sm font-semibold rounded-xl hover:bg-sanctuary-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {busy ? "Generating…" : "Generate Session"}
        </button>
      </div>
    </Overlay>
  );
};

// ── Session Details Modal ─────────────────────────────────────────────────────
const SessionDetailsModal = ({ session, tasks, category, onClose, onStartSession, onAddTask, onTaskToggle }) => {
  const [taskInput, setTaskInput] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const sessionId = session.sessionId || session.session_id;
  const focusDuration = session.plannedFocusDuration || session.planned_focus_duration || 45;
  const breakDuration = session.plannedBreakDuration || session.planned_break_duration || 10;

  const handleAdd = async () => {
    if (!taskInput.trim()) return;
    setAddingTask(true);
    await onAddTask(sessionId, taskInput.trim());
    setTaskInput("");
    setAddingTask(false);
  };

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7">
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              {category && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${category.color}`}>{category.label}</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-800 truncate">
              {session.name || `Session #${sessionId}`}
            </h2>
            {session.description && (
              <p className="text-sm text-slate-500 mt-1">{session.description}</p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex-shrink-0"><X size={20} /></button>
        </div>

        {/* Focus/break info */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Focus</p>
            <p className="font-semibold">{focusDuration} min</p>
          </div>
          <div className="flex-1 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Break</p>
            <p className="font-semibold">{breakDuration} min</p>
          </div>
        </div>

        {/* Tasks */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tasks</p>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No tasks yet. Add one below.</p>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {tasks.map((task, i) => (
                <li key={task.taskId || task.task_id || i}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5"
                >
                  <button
                    onClick={() => onTaskToggle(task)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors flex-shrink-0 ${
                      task.status === "Completed"
                        ? "bg-sanctuary-600 border-sanctuary-600 text-white"
                        : "border-slate-300 hover:border-sanctuary-400"
                    }`}
                  >
                    {task.status === "Completed" && <CheckCircle2 size={12} />}
                  </button>
                  <span className={`text-sm flex-1 ${task.status === "Completed" ? "line-through text-slate-400" : "text-slate-700"}`}>
                    {task.title}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Add task inline */}
          <div className="flex items-center gap-2 mt-3">
            <input
              value={taskInput}
              onChange={e => setTaskInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder="Add a task…"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sanctuary-500"
            />
            <button
              onClick={handleAdd}
              disabled={!taskInput.trim() || addingTask}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 disabled:opacity-50 transition-colors"
            >
              {addingTask ? <Loader2 size={14} className="animate-spin" /> : "Add"}
            </button>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => { onClose(); onStartSession(sessionId); }}
          className="w-full py-3 bg-sanctuary-900 text-white text-sm font-semibold rounded-xl hover:bg-sanctuary-800 transition-colors flex items-center justify-center gap-2"
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
    className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
  >
    <Loader2 size={36} className="text-sanctuary-700 animate-spin mb-4" />
    <p className="text-slate-700 font-semibold text-lg">Adapting your next sessions…</p>
    <p className="text-slate-400 text-sm mt-1">The planner is updating based on your burnout results.</p>
  </motion.div>
);

// ── Sticky-note session card ──────────────────────────────────────────────────
const SessionCard = ({ session, tasks, colorClass, onClick }) => {
  const sessionId = session.sessionId || session.session_id;
  const focusDuration = session.plannedFocusDuration || session.planned_focus_duration || 45;
  const cat = CATEGORIES.find(c => c.id === session.category) || CATEGORIES[3];

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 28px rgba(0,0,0,0.10)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      onClick={onClick}
      className={`cursor-pointer border-2 rounded-2xl p-5 min-h-[200px] flex flex-col gap-3 relative shadow-md ${colorClass}`}
    >
      {/* Top-pin aesthetic */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow-sm" />

      <div className="flex items-start justify-between mt-2">
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${cat.color}`}>{cat.label}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Planned</span>
      </div>

      <div className="flex-1">
        <p className="font-bold text-slate-800 text-base leading-snug">
          {session.name || `Session #${sessionId}`}
        </p>
        {session.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{session.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1"><Clock size={12} /> {focusDuration} min focus</span>
        <span>{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
      </div>
    </motion.div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const SchedulePage = () => {
  const navigate = useNavigate();
  const [planner, setPlanner] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [tasksBySession, setTasksBySession] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdapting, setIsAdapting] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [detailsSession, setDetailsSession] = useState(null);

  const plannedSessions = useMemo(
    () => sessions.filter(s => s.status === "Planned"),
    [sessions],
  );

  const plannerBanner = useMemo(() => {
    if (!planner) return null;
    const mode = planner.burnoutMode || "Normal";
    if (mode === "Recovery") return { label: "Recovery Mode 😌", message: "Lighter sessions. Prioritise rest.", cls: "bg-rose-50 border-rose-200 text-rose-800" };
    if (mode === "Warning")  return { label: "Warning Mode ⚠️",  message: "Shorter focus blocks to pace you.", cls: "bg-amber-50 border-amber-200 text-amber-800" };
    return { label: "Normal Mode ✅", message: "Full focus workload set for today.", cls: "bg-emerald-50 border-emerald-200 text-emerald-800" };
  }, [planner]);

  const loadPlannerData = async (showAdapting = false) => {
    if (showAdapting) setIsAdapting(true);
    setIsLoading(true);
    try {
      const [plannerData, sessionData] = await Promise.all([
        getPlannerByUser(1).catch(() => null),
        getSessionsByUser(1),
      ]);
      setPlanner(plannerData);
      const all = sessionData || [];
      setSessions(all);
      const planned = all.filter(s => s.status === "Planned");
      const pairs = await Promise.all(
        planned.map(async s => {
          const sid = s.sessionId || s.session_id;
          const t = await getTasksBySession(sid).catch(() => []);
          return [sid, t];
        }),
      );
      setTasksBySession(Object.fromEntries(pairs));
      setError("");
    } catch {
      setError("Unable to load planner sessions.");
    } finally {
      setIsLoading(false);
      if (showAdapting) setTimeout(() => setIsAdapting(false), 1200);
    }
  };

  useEffect(() => {
    // Show "adapting" animation if returning from session
    const adapting = sessionStorage.getItem("cs_adapting");
    if (adapting) {
      sessionStorage.removeItem("cs_adapting");
      loadPlannerData(true);
    } else {
      loadPlannerData(false);
    }
  }, []);

  const handleCreateSession = async ({ name, description, category }) => {
    try {
      const session = await generateSession(1);
      // Store metadata in sessionStorage (no backend change needed for name/desc/category)
      const sid = session.sessionId || session.session_id;
      const meta = JSON.parse(localStorage.getItem("cs_session_meta") || "{}");
      meta[sid] = { name, description, category };
      localStorage.setItem("cs_session_meta", JSON.stringify(meta));
      await loadPlannerData();
    } catch {
      setError("Failed to generate session.");
    }
  };

  const enrichSession = (s) => {
    const sid = s.sessionId || s.session_id;
    const meta = JSON.parse(localStorage.getItem("cs_session_meta") || "{}")[sid] || {};
    return { ...s, name: meta.name, description: meta.description, category: meta.category };
  };

  const handleAddTask = async (sessionId, title) => {
    await addTaskToSession(sessionId, { title, estimatedTime: 30, status: "Pending" });
    const tasks = await getTasksBySession(sessionId).catch(() => []);
    setTasksBySession(prev => ({ ...prev, [sessionId]: tasks }));
  };

  const handleTaskToggle = async (task) => {
    const newStatus = task.status === "Completed" ? "Pending" : "Completed";
    await updateTask(task.taskId || task.task_id, { title: task.title, estimatedTime: task.estimatedTime || task.estimated_time || 30, status: newStatus });
    if (detailsSession) {
      const sid = detailsSession.sessionId || detailsSession.session_id;
      const tasks = await getTasksBySession(sid).catch(() => []);
      setTasksBySession(prev => ({ ...prev, [sid]: tasks }));
    }
  };

  const enriched = plannedSessions.map(enrichSession);

  return (
    <>
      <AnimatePresence>{isAdapting && <AdaptiveLoadingOverlay />}</AnimatePresence>

      {showCreateModal && (
        <CreateSessionModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateSession}
        />
      )}

      {detailsSession && (
        <SessionDetailsModal
          session={enrichSession(detailsSession)}
          tasks={tasksBySession[detailsSession.sessionId || detailsSession.session_id] || []}
          category={CATEGORIES.find(c => c.id === enrichSession(detailsSession).category)}
          onClose={() => setDetailsSession(null)}
          onStartSession={sid => navigate(`/sessions?sessionId=${sid}`)}
          onAddTask={handleAddTask}
          onTaskToggle={handleTaskToggle}
        />
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Study Planner</h1>
          <p className="text-sm text-slate-400 mt-1">Your adaptive schedule — updated after every session.</p>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        {/* Planner mode banner */}
        {plannerBanner && (
          <div className={`border rounded-2xl px-5 py-3.5 mb-6 ${plannerBanner.cls}`}>
            <p className="font-semibold text-sm">{plannerBanner.label}</p>
            <p className="text-xs opacity-80 mt-0.5">{plannerBanner.message}</p>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            {plannedSessions.length} planned session{plannedSessions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Session board */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 size={20} className="animate-spin" /> Loading sessions…
          </div>
        ) : enriched.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen size={40} className="text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">No planned sessions yet.</p>
            <p className="text-slate-400 text-sm mt-1">Click <strong>+</strong> to generate your first session.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {enriched.map((session, idx) => {
              const sid = session.sessionId || session.session_id;
              return (
                <SessionCard
                  key={sid}
                  session={session}
                  tasks={tasksBySession[sid] || []}
                  colorClass={NOTE_COLORS[idx % NOTE_COLORS.length]}
                  onClick={() => setDetailsSession(session)}
                />
              );
            })}
          </div>
        )}
      </motion.div>

      {/* FAB */}
      <button
        onClick={() => setShowCreateModal(true)}
        title="New session"
        className="fixed bottom-8 right-8 w-14 h-14 bg-sanctuary-900 text-white rounded-full shadow-lg flex items-center justify-center z-20 hover:bg-sanctuary-800 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus size={24} />
      </button>
    </>
  );
};

export default SchedulePage;
