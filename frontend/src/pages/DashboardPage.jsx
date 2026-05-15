import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  getDashboardAnalytics,
  getPlannerByUser,
  getLatestBurnoutByUser,
  getSessionsByUser,
  getUserId,
} from "../services/api";
import { supabase } from "../services/supabase";

// Dashboard Components
import BurnoutEmojiIndicator from "../components/dashboard/BurnoutEmojiIndicator";
import WeeklyStudyChart from "../components/dashboard/WeeklyStudyChart";
import StudyCategoryChart from "../components/dashboard/StudyCategoryChart";

// ── Constants ─────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 30_000;

const defaultKpis = [
  { label: "Study Streak", value: "—", sub: "days" },
  { label: "Sessions Completed", value: "—", sub: "" },
  { label: "Burnout", value: "—", sub: "/ 100" },
];

function getBurnoutDesc(score) {
  if (score >= 75) return "High burnout detected. Recovery is recommended.";
  if (score >= 40) return "Moderate fatigue. Keep an eye on break consistency.";
  return "Burnout is stable based on your latest session.";
}

function buildTopKpis(analytics, burnoutScore) {
  return [
    { label: "Study Streak", value: analytics?.streakDays ?? "—", sub: "days" },
    { label: "Sessions Completed", value: analytics?.totalSessionsCompleted ?? "—", sub: "" },
    // {
    //   label: "Burnout",
    //   value: burnoutScore ? `${(Math.round(burnoutScore * 10) / 10).toFixed(1)}%` : "—",
    //   sub: "/ 100",
    // },
  ];
}

// Mode pill colours — Normal=green, Warning=amber, Recovery=red
const MODE_STYLES = {
  Normal:   { bg: "#dcfce7", color: "#15803d", cardGradient: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(165,193,167,0.5) 100%)" },
  Warning:  { bg: "#fef3c7", color: "#b45309", cardGradient: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(253,230,138,0.5) 100%)" },
  Recovery: { bg: "#ffe4e6", color: "#e11d48", cardGradient: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(254,205,211,0.5) 100%)" },
};

// ── Page ──────────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const navigate = useNavigate();
  const pollRef = useRef(null);

  const [greeting, setGreeting] = useState("Hello");
  const [dateSubtitle, setDateSubtitle] = useState("");
  const [kpis, setKpis] = useState(defaultKpis);
  const [weeklyData, setWeeklyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [planner, setPlanner] = useState(null);
  const [error, setError] = useState("");

  const [burnoutScore, setBurnoutScore] = useState(0);
  const [burnoutDesc, setBurnoutDesc] = useState("No burnout record yet.");
  const [lastPolled, setLastPolled] = useState(null);

  // ── Greeting ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const initUser = async () => {
      let storedUser = JSON.parse(localStorage.getItem("user"));
      
      // If no user in localStorage, it means we probably just redirected from Google OAuth.
      // Fetch the real session from Supabase.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        storedUser = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split("@")[0],
        };
        localStorage.setItem("user", JSON.stringify(storedUser));
      } else if (!storedUser) {
        // Fallback if completely unauthenticated
        storedUser = { name: "Guest", id: 1 };
      }

      const rawName = storedUser.name.split(' ')[0];
      // Capitalize first letter, lowercase the rest (e.g., Jyvhan)
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
      
      setGreeting(`Hello, ${formattedName}`);
      const today = new Date();
      setDateSubtitle(today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }));
      
      // Now that user is definitely stored, fetch data
      refreshAll(false);
    };
    initUser();
  }, []);

  // ── refreshAll ──────────────────────────────────────────────────────────────
  const refreshAll = useCallback(async (silent = false) => {
    try {
      const uid = getUserId();
      const [analytics, burnout, plannerData, allSessions] = await Promise.all([
        getDashboardAnalytics(uid).catch(() => null),
        getLatestBurnoutByUser(uid).catch(() => null),
        getPlannerByUser(uid).catch(() => null),
        getSessionsByUser(uid).catch(() => []),
      ]);

      // Use rolling average across ALL sessions, not just the latest single one
      const avgScore = analytics?.averageBurnoutScore ?? analytics?.AverageBurnoutScore ?? null;
      const latestScore = burnout?.score ?? burnout?.Score ?? 0;
      const score = avgScore !== null ? Math.round(avgScore * 10) / 10 : latestScore;

      setBurnoutScore(score);
      setBurnoutDesc(getBurnoutDesc(score));
      setPlanner(plannerData);

      if (analytics) {
        setWeeklyData(analytics.weeklyHours ?? []);
        setKpis(buildTopKpis(analytics, score));
      }

      const meta = JSON.parse(localStorage.getItem("cs_session_meta") || "{}");
      const cats = {};
      allSessions.forEach((s) => {
        const sid = s.sessionId || s.session_id;
        const category = meta[sid]?.category || "deep-work";
        cats[category] = (cats[category] || 0) + 1;
      });
      setCategoryData(Object.entries(cats).map(([name, value]) => ({ name, value })));

      setLastPolled(new Date());
      if (!silent) setError("");
    } catch {
      if (!silent) setError("Unable to load dashboard data.");
    }
  }, []);

  // We removed the initial useEffect(() => { refreshAll(false); }, [refreshAll]);
  // because it is now called inside the initUser effect once localStorage is guaranteed to be set.
  useEffect(() => {
    pollRef.current = setInterval(() => refreshAll(true), POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [refreshAll]);

  const mode = planner?.burnoutMode ?? "Normal";
  const modeStyle = MODE_STYLES[mode] || MODE_STYLES.Normal;

  return (
    <div className="max-w-[1100px] mx-auto">

      {/* ── Top row: greeting + compact quick-action buttons ─────────────────── */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#1a1a1a" }}>
            {greeting}
          </h1>
          <p className="text-sm font-medium mt-1 uppercase tracking-widest" style={{ color: "#9ca3af" }}>
            {dateSubtitle}
          </p>
        </div>

        {/* Compact quick-action buttons in place of the avatar */}
        <div className="flex gap-2 flex-shrink-0">
          {/* <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/schedule")}
            className="px-5 py-2.5 rounded-full text-xs font-bold transition-all"
            style={{ 
              background: "rgba(255,255,255,0.7)", 
              backdropFilter: "blur(12px)", 
              border: "1px solid rgba(255,255,255,0.9)", 
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              color: "#064e3b" 
            }}
          >
            Plan Session
          </motion.button> */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/schedule")}
            className="px-5 py-2.5 rounded-full text-xs font-bold transition-all"
            style={{ 
              background: "rgba(6,78,59,0.85)", 
              backdropFilter: "blur(12px)", 
              border: "1px solid rgba(255,255,255,0.15)", 
              boxShadow: "0 4px 16px rgba(6,78,59,0.25)",
              color: "#fff" 
            }}
          >
            Start Session
          </motion.button>
        </div>
      </div>

      {/* ── Main Bento Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">

        {/* ── Left main block (col 1 & 2, spans 2 rows) ────────────────────── */}
        <div
          className="col-span-2 row-span-2 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between"
          style={{ background: "#F7F3EE", minHeight: 480 }}
        >
          {/* Gradient blobs */}
          <div className="absolute rounded-full pointer-events-none" style={{ width: 220, height: 220, background: "radial-gradient(circle, rgba(34,197,94,0.35) 0%, transparent 70%)", top: 60, left: "35%", filter: "blur(40px)" }} />
          <div className="absolute rounded-full pointer-events-none" style={{ width: 200, height: 200, background: "radial-gradient(circle, rgba(251,146,60,0.3) 0%, transparent 70%)", bottom: 20, left: "52%", filter: "blur(38px)" }} />
          <div className="absolute rounded-full pointer-events-none" style={{ width: 160, height: 160, background: "radial-gradient(circle, rgba(250,204,21,0.2) 0%, transparent 70%)", top: 30, right: 40, filter: "blur(35px)" }} />

          {/* Section 1: Title & KPIs */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#6b7280" }}>
              FOCUS PLAN RESULTS
            </p>

            <div className="flex gap-2 flex-wrap">
              {kpis.map((kpi, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)" }}
                >
                  <span style={{ color: "#6b7280" }}>{kpi.label}</span>
                  <span className="font-bold" style={{ color: "#1a1a1a" }}>{kpi.value}</span>
                  {kpi.sub && <span style={{ color: "#9ca3af" }}>{kpi.sub}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Today's Plan mini */}
          {planner && (
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: "#374151" }}>Today's Plan</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: "FOCUS",    value: `${planner.adaptiveConfig?.focusDuration ?? planner.plannedFocusDuration ?? 45} min` },
                  { label: "BREAK",    value: `${planner.adaptiveConfig?.breakDuration ?? planner.plannedBreakDuration ?? 10} min` },
                  // { label: "INTERVAL", value: `${planner.adaptiveConfig?.breakInterval ?? planner.breakIntervalMinutes ?? 45} min` },
                  { label: "MODE",     value: planner?.burnoutMode ?? "Normal", isMode: true },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="px-4 py-2.5 rounded-xl"
                    style={
                      item.isMode
                        ? { background: modeStyle.bg, border: `1px solid ${modeStyle.bg}` }
                        : { background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.95)" }
                    }
                  >
                    <p
                      className="text-[9px] font-bold uppercase tracking-widest"
                      style={{ color: item.isMode ? modeStyle.color : "#9ca3af" }}
                    >
                      {item.label}
                    </p>
                    <p
                      className="text-sm font-bold"
                      style={{ color: item.isMode ? modeStyle.color : "#1a1a1a" }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Weekly Study Chart */}
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold" style={{ color: "#374151" }}>Weekly Study Hours</p>
                <p className="text-xs" style={{ color: "#9ca3af" }}>Study consistency across the week</p>
              </div>
            </div>
            <WeeklyStudyChart weeklyData={weeklyData} transparent />
          </div>
        </div>

        {/* ── Burnout light glassmorphic card (col 3, row 1) ─────────────────────────────── */}
        <div
          className="col-span-1 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden border-0"
          style={{ 
            background: modeStyle.cardGradient,
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            minHeight: 160 
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#6b7280" }}>
            BURNOUT LEVEL
          </p>
          <BurnoutEmojiIndicator score={burnoutScore} desc={burnoutDesc} />
        </div>

        {/* ── Study Distribution (col 3, row 2) ────────────────────────────── */}
        <div
          className="col-span-1 rounded-3xl p-5 flex flex-col"
          style={{ background: "#F7F3EE" }}
        >
          <StudyCategoryChart categoryData={categoryData} compact />
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
