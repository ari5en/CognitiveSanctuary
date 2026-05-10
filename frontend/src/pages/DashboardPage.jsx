import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  getSessionsByUser,
  getPlannerByUser,
  getLatestBurnoutByUser,
  getTasksBySession,
} from "../services/api";
import { CATEGORIES } from "../pages/SchedulePage";

// Dashboard Components
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatusBanner from "../components/dashboard/StatusBanner";
import KPICards from "../components/dashboard/KPICards";
import BurnoutRiskGauge from "../components/dashboard/BurnoutRiskGauge";
import BurnoutEmojiIndicator from "../components/dashboard/BurnoutEmojiIndicator";
import WeeklyStudyChart from "../components/dashboard/WeeklyStudyChart";
import StudyCategoryChart from "../components/dashboard/StudyCategoryChart";
import QuickActions from "../components/dashboard/QuickActions";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildWeeklyData(sessions) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun
  // Build Mon-indexed start of week
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const buckets = DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return DAYS.map((day, i) => {
    const dayStart = buckets[i];
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    const hours = sessions
      .filter(s => {
        if (!s.startTime && !s.start_time) return false;
        const t = new Date(s.startTime || s.start_time);
        return t >= dayStart && t <= dayEnd;
      })
      .reduce((acc, s) => acc + (s.studyDuration || s.study_duration || 0) / 60, 0);
    return { day, hours: Math.round(hours * 10) / 10 };
  });
}

function buildCategoryData(sessions) {
  const meta = JSON.parse(localStorage.getItem("cs_session_meta") || "{}");
  const counts = {};
  sessions.forEach(s => {
    const sid = s.sessionId || s.session_id;
    const cat = meta[sid]?.category || "deep-work";
    counts[cat] = (counts[cat] || 0) + 1;
  });
  return CATEGORIES
    .map(c => ({ name: c.label, value: counts[c.id] || 0 }))
    .filter(d => d.value > 0);
}

const defaultKpis = [
  { label: "TOTAL STUDY TIME",    value: "0h", icon: "clock"    },
  { label: "SESSIONS COMPLETED",  value: "0",  icon: "check"    },
  { label: "BURNOUT SCORE",        value: "0",  icon: "activity" },
];

const quickActions = [
  { id: "plan-session",  label: "Plan New Session", icon: "calendar-check" },
  { id: "view-sessions", label: "Start Session",    icon: "play-circle"    },
];

// ── Page ──────────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Hello");
  const [dateSubtitle, setDateSubtitle] = useState("");
  const [kpis, setKpis] = useState(defaultKpis);
  const [burnoutScore, setBurnoutScore] = useState(0);
  const [burnoutStatus, setBurnoutStatus] = useState("STABLE");
  const [burnoutDesc, setBurnoutDesc] = useState("No burnout record yet.");
  const [planner, setPlanner] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [plannedTaskCount, setPlannedTaskCount] = useState(0);
  const [error, setError] = useState("");

  const weeklyData   = useMemo(() => buildWeeklyData(sessions),  [sessions]);
  const categoryData = useMemo(() => buildCategoryData(sessions), [sessions]);

  const handleQuickAction = (actionId) => {
    if (actionId === "plan-session")  navigate("/schedule");
    if (actionId === "view-sessions") navigate("/schedule");
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || '{"name":"Alex","id":1}');
    const today = new Date();
    setGreeting(`Hello, ${storedUser.name}`);
    setDateSubtitle(today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }));
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [sessionData, plannerData, burnout] = await Promise.all([
          getSessionsByUser(1),
          getPlannerByUser(1).catch(() => null),
          getLatestBurnoutByUser(1).catch(() => null),
        ]);
        if (!mounted) return;

        const allSessions = sessionData || [];
        const completed = allSessions.filter(s => s.status === "Completed");
        const totalMinutes = allSessions.reduce((a, s) => a + (s.studyDuration || s.study_duration || 0), 0);
        const score = burnout?.score ?? burnout?.Score ?? 0;

        setPlanner(plannerData);
        setSessions(allSessions);
        setBurnoutScore(score);
        setBurnoutStatus((burnout?.burnoutLevel || burnout?.BurnoutLevel || "Stable").toUpperCase());
        setBurnoutDesc(
          score >= 75
            ? "High burnout detected. Recovery is recommended."
            : score >= 40
            ? "Moderate fatigue. Keep an eye on break consistency."
            : "Burnout is stable based on your latest session."
        );
        setKpis([
          { label: "TOTAL STUDY TIME",   value: `${(totalMinutes / 60).toFixed(1)}h`, icon: "clock"    },
          { label: "SESSIONS COMPLETED", value: `${completed.length}`,               icon: "check"    },
          { label: "BURNOUT SCORE",       value: `${score}`,                          icon: "activity" },
        ]);
      } catch {
        if (mounted) setError("Unable to load dashboard data.");
      }
    })();
    return () => { mounted = false; };
  }, []);

  const nextPlannedSession = useMemo(() =>
    sessions.filter(s => s.status === "Planned")
      .sort((a, b) => (a.sessionId || a.session_id) - (b.sessionId || b.session_id))[0] || null,
    [sessions],
  );

  useEffect(() => {
    if (!nextPlannedSession) { setPlannedTaskCount(0); return; }
    const sid = nextPlannedSession.sessionId || nextPlannedSession.session_id;
    getTasksBySession(sid).then(t => setPlannedTaskCount(t.length)).catch(() => setPlannedTaskCount(0));
  }, [nextPlannedSession]);

  const bannerContent = useMemo(() => {
    const mode = planner?.burnoutMode || "Normal";
    if (mode === "Recovery") return { message: "Recovery mode active", description: "The planner reduced your workload to prioritize recovery." };
    if (mode === "Warning")  return { message: "Warning mode active",  description: "The planner is spacing focus blocks to reduce overload." };
    return { message: "Normal mode active", description: "Your study plan is running at a standard focus load." };
  }, [planner]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-6xl mx-auto">
      <DashboardHeader greeting={greeting} dateSubtitle={dateSubtitle} />

      <StatusBanner burnoutMode={planner?.burnoutMode} message={bannerContent.message} description={bannerContent.description} error={error} />

      {/* KPIs */}
      <KPICards kpis={kpis} />

      {/* Row 1: Weekly chart + Burnout indicators */}
      <div className="flex gap-5 mb-5 items-start">
        <div className="flex-1 min-w-0">
          <WeeklyStudyChart weeklyData={weeklyData} />
        </div>
        <div className="flex flex-col gap-5 w-64 flex-shrink-0">
          <BurnoutEmojiIndicator score={burnoutScore} />
          <BurnoutRiskGauge burnoutRisk={{ score: burnoutScore, status: burnoutStatus, description: burnoutDesc }} />
        </div>
      </div>

      {/* Row 2: Category chart + Today's plan */}
      <div className="flex gap-5 mb-5 items-start">
        <div className="w-72 flex-shrink-0">
          <StudyCategoryChart categoryData={categoryData} />
        </div>
        <div className="flex-1 min-w-0 space-y-5">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Today's Plan</h3>
              <Button variant="outline" size="sm" onClick={() => navigate("/schedule")}>View Planner</Button>
            </div>
            {nextPlannedSession ? (
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Focus</p>
                  <p className="font-semibold">{nextPlannedSession.plannedFocusDuration || nextPlannedSession.planned_focus_duration || 45} min</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Break</p>
                  <p className="font-semibold">{nextPlannedSession.plannedBreakDuration || nextPlannedSession.planned_break_duration || 10} min</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Break Interval</p>
                  <p className="font-semibold">{nextPlannedSession.breakIntervalMinutes || nextPlannedSession.break_interval_minutes || 45} min</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Tasks</p>
                  <p className="font-semibold">{plannedTaskCount}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No planned sessions yet. Generate one from the planner.</p>
            )}
          </Card>

          <QuickActions quickActions={quickActions} onAction={handleQuickAction} />
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
