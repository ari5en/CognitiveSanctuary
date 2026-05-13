import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  getDashboardAnalytics,
  getPlannerByUser,
  getLatestBurnoutByUser,
} from "../services/api";

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

// ── Constants ─────────────────────────────────────────────────────────────────
const LIVE_POLL_INTERVAL_MS = 60_000; // 60 seconds

const MOOD_LABELS = { 1: "Happy 😊", 2: "Neutral 😐", 3: "Tired 😴", 4: "Exhausted 😩" };

const defaultKpis = [
  { label: "Total Study Time",    value: "—", icon: "clock",    sub: "hours" },
  { label: "Sessions Completed",  value: "—", icon: "check",    sub: "" },
  { label: "Burnout Score",       value: "—", icon: "activity", sub: "/ 100" },
  { label: "Avg Mood",            value: "—", icon: "smile",    sub: "" },
  { label: "Study Streak",        value: "—", icon: "flame",    sub: "days" },
];

const quickActions = [
  { id: "plan-session",  label: "Plan New Session", icon: "calendar-check" },
  { id: "view-sessions", label: "Start Session",    icon: "play-circle"    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getBurnoutDesc(score) {
  if (score >= 75) return "High burnout detected. Recovery is recommended.";
  if (score >= 40) return "Moderate fatigue. Keep an eye on break consistency.";
  return "Burnout is stable based on your latest session.";
}

function buildKpis(analytics, burnoutScore) {
  const avgMoodLabel = MOOD_LABELS[Math.round(analytics?.averageMood ?? 2)] ?? "Neutral 😐";
  return [
    {
      label: "Total Study Time",
      value: `${analytics?.totalStudyHours ?? 0}h`,
      icon: "clock",
      sub: "all time",
    },
    {
      label: "Sessions Completed",
      value: `${analytics?.totalSessionsCompleted ?? 0}`,
      icon: "check",
      sub: `${analytics?.tasksPending ?? 0} tasks pending`,
    },
    {
      label: "Burnout Score",
      value: `${Math.round(burnoutScore)}`,
      icon: "activity",
      sub: "/ 100 (latest)",
    },
    {
      label: "Avg Mood",
      value: avgMoodLabel,
      icon: "smile",
      sub: "across sessions",
    },
    {
      label: "Study Streak",
      value: `${analytics?.streakDays ?? 0}`,
      icon: "flame",
      sub: `${analytics?.streakDays === 1 ? "day" : "days"} in a row`,
    },
  ];
}

// ── Page ──────────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const navigate = useNavigate();
  const pollRef  = useRef(null);
  // Hold analytics reference so live poll can rebuild KPIs with latest burnout score
  const analyticsRef = useRef(null);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [greeting, setGreeting]         = useState("Hello");
  const [dateSubtitle, setDateSubtitle] = useState("");
  const [kpis, setKpis]                 = useState(defaultKpis);
  const [weeklyData, setWeeklyData]     = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [planner, setPlanner]           = useState(null);
  const [error, setError]               = useState("");

  // ── Live-polled burnout state (updates every 60s) ─────────────────────────
  const [burnoutScore, setBurnoutScore]   = useState(0);
  const [burnoutStatus, setBurnoutStatus] = useState("STABLE");
  const [burnoutDesc, setBurnoutDesc]     = useState("No burnout record yet.");
  const [lastPolled, setLastPolled]       = useState(null);

  // ── Greeting on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || '{"name":"Alex","id":1}');
    const today = new Date();
    setGreeting(`Hello, ${storedUser.name}`);
    setDateSubtitle(
      today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
    );
  }, []);

  // ── Live-poll: silently refresh burnout + planner only ────────────────────
  const pollBurnout = useCallback(async () => {
    try {
      const [burnout, plannerData] = await Promise.all([
        getLatestBurnoutByUser(1).catch(() => null),
        getPlannerByUser(1).catch(() => null),
      ]);
      const score = burnout?.score ?? burnout?.Score ?? 0;
      setBurnoutScore(score);
      setBurnoutStatus((burnout?.burnoutLevel || burnout?.BurnoutLevel || "Stable").toUpperCase());
      setBurnoutDesc(getBurnoutDesc(score));
      setPlanner(plannerData);
      setLastPolled(new Date());

      // Rebuild only the burnout KPI slot (index 2) in-place
      if (analyticsRef.current) {
        setKpis(buildKpis(analyticsRef.current, score));
      }
    } catch {
      // fail silently — live poll must not disrupt the page
    }
  }, []);

  // ── Initial data load ─────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Single backend call for all aggregated metrics + first burnout poll in parallel
        const [analytics] = await Promise.all([
          getDashboardAnalytics(1),
          pollBurnout(),
        ]);
        if (!mounted) return;

        analyticsRef.current = analytics;
        setWeeklyData(analytics?.weeklyHours ?? []);

        // Category data is localStorage-based (no DB column for category yet)
        const meta = JSON.parse(localStorage.getItem("cs_session_meta") || "{}");
        const cats = {};
        Object.values(meta).forEach(({ category }) => {
          if (category) cats[category] = (cats[category] || 0) + 1;
        });
        setCategoryData(Object.entries(cats).map(([name, value]) => ({ name, value })));
      } catch {
        if (mounted) setError("Unable to load dashboard data.");
      }
    })();
    return () => { mounted = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Start 60-second live-poll interval ────────────────────────────────────
  useEffect(() => {
    pollRef.current = setInterval(pollBurnout, LIVE_POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [pollBurnout]);

  // ── Banner content from planner mode ─────────────────────────────────────
  const mode = planner?.burnoutMode ?? "Normal";
  const bannerContent =
    mode === "Recovery"
      ? { message: "Recovery mode active",  description: "The planner reduced your workload to prioritize recovery." }
      : mode === "Warning"
      ? { message: "Warning mode active",   description: "The planner is spacing focus blocks to reduce overload." }
      : { message: "Normal mode active",    description: "Your study plan is running at a standard focus load." };

  const handleQuickAction = (actionId) => {
    if (actionId === "plan-session")  navigate("/schedule");
    if (actionId === "view-sessions") navigate("/schedule");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto"
    >
      <DashboardHeader greeting={greeting} dateSubtitle={dateSubtitle} />

      <StatusBanner
        burnoutMode={planner?.burnoutMode}
        message={bannerContent.message}
        description={bannerContent.description}
        error={error}
      />

      {/* KPIs — 5 backend-powered metrics */}
      <KPICards kpis={kpis} />

      {/* Row 1: Weekly chart + Burnout indicators */}
      <div className="flex gap-5 mb-5 items-start">
        <div className="flex-1 min-w-0">
          <WeeklyStudyChart weeklyData={weeklyData} />
        </div>
        <div className="flex flex-col gap-5 w-64 flex-shrink-0">
          <BurnoutEmojiIndicator score={burnoutScore} />
          <BurnoutRiskGauge
            burnoutRisk={{
              score: burnoutScore,
              status: burnoutStatus,
              description: burnoutDesc,
            }}
          />
          {lastPolled && (
            <p className="text-center text-[10px] text-slate-400">
              Updated {lastPolled.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
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
              <Button variant="outline" size="sm" onClick={() => navigate("/schedule")}>
                View Planner
              </Button>
            </div>
            {planner ? (
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Focus</p>
                  <p className="font-semibold">
                    {planner.adaptiveConfig?.focusDuration ?? planner.plannedFocusDuration ?? 45} min
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Break</p>
                  <p className="font-semibold">
                    {planner.adaptiveConfig?.breakDuration ?? planner.plannedBreakDuration ?? 10} min
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Break Interval</p>
                  <p className="font-semibold">
                    {planner.adaptiveConfig?.breakInterval ?? planner.breakIntervalMinutes ?? 45} min
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Mode</p>
                  <p className="font-semibold">{planner?.burnoutMode ?? "Normal"}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No planned sessions yet. Generate one from the planner.
              </p>
            )}
          </Card>

          <QuickActions quickActions={quickActions} onAction={handleQuickAction} />
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
