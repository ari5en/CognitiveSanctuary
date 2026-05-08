import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  getSessionsByUser,
  getPlannerByUser,
  getLatestBurnoutByUser,
  getTasksBySession,
} from "../services/api";

// Dashboard Components
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatusBanner from "../components/dashboard/StatusBanner";
import KPICards from "../components/dashboard/KPICards";
import BurnoutRiskGauge from "../components/dashboard/BurnoutRiskGauge";
import QuickActions from "../components/dashboard/QuickActions";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const defaultDashboardData = {
  greeting: "Hello",
  dateSubtitle: "System state overview",
  kpis: [
    { label: "TOTAL STUDY TIME", value: "0h", icon: "clock" },
    { label: "SESSIONS COMPLETED", value: "0", icon: "check" },
    { label: "BURNOUT SCORE", value: "0", icon: "activity" },
  ],
  burnoutRisk: {
    score: 0,
    status: "STABLE",
    description: "No burnout record yet.",
  },
  quickActions: [
    { id: "plan-session", label: "Plan New Session", icon: "calendar-check" },
    { id: "view-sessions", label: "View Sessions", icon: "play-circle" },
  ],
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(defaultDashboardData);
  const [error, setError] = useState("");
  const [planner, setPlanner] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [plannedTaskCount, setPlannedTaskCount] = useState(0);

  // REFLECT → PLAN: route Quick Actions back into the lifecycle
  const handleQuickAction = (actionId) => {
    if (actionId === "plan-session") navigate("/schedule");
    else if (actionId === "view-sessions") navigate("/sessions");
  };

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || '{"name": "Alex", "id": 1}',
    );
    const today = new Date();
    const formattedDate = today.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    setDashboardData((prev) => ({
      ...prev,
      greeting: `Hello, ${storedUser.name}`,
      dateSubtitle: formattedDate,
    }));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [sessionData, plannerData, burnout] = await Promise.all([
          getSessionsByUser(1),
          getPlannerByUser(1).catch(() => null),
          getLatestBurnoutByUser(1).catch(() => null),
        ]);

        if (!isMounted) return;

        const totalMinutes = (sessionData || []).reduce(
          (acc, s) => acc + (s.studyDuration || 0),
          0,
        );
        const totalHours = (totalMinutes / 60).toFixed(1);
        const completedSessions = (sessionData || []).filter(
          (s) => s.status === "Completed",
        ).length;

        setPlanner(plannerData);
        setSessions(sessionData || []);

        setDashboardData((prev) => ({
          ...prev,
          kpis: [
            {
              label: "TOTAL STUDY TIME",
              value: `${totalHours}h`,
              icon: "clock",
            },
            {
              label: "SESSIONS COMPLETED",
              value: `${completedSessions}`,
              icon: "check",
            },
            {
              label: "BURNOUT SCORE",
              value: burnout?.score?.toString() || "0",
              icon: "activity",
            },
          ],
          burnoutRisk: {
            score: burnout?.score || 0,
            status: (burnout?.burnoutLevel || "Stable").toUpperCase(),
            description:
              burnout?.burnoutLevel === "Critical"
                ? "High burnout detected. Recovery is recommended."
                : "Burnout is stable based on your latest session.",
          },
        }));
      } catch (err) {
        if (isMounted) setError("Unable to load dashboard data.");
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const nextPlannedSession = useMemo(() => {
    const planned = sessions.filter((s) => s.status === "Planned");
    if (planned.length === 0) return null;
    return planned.reduce((prev, curr) =>
      (curr.sessionId || curr.session_id) < (prev.sessionId || prev.session_id)
        ? curr
        : prev,
    );
  }, [sessions]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.status === "InProgress") || null,
    [sessions],
  );

  useEffect(() => {
    let isMounted = true;
    const loadTaskCount = async () => {
      if (!nextPlannedSession) {
        if (isMounted) setPlannedTaskCount(0);
        return;
      }

      const sessionId =
        nextPlannedSession.sessionId || nextPlannedSession.session_id;
      try {
        const tasks = await getTasksBySession(sessionId);
        if (isMounted) setPlannedTaskCount(tasks.length);
      } catch (err) {
        if (isMounted) setPlannedTaskCount(0);
      }
    };

    loadTaskCount();
    return () => {
      isMounted = false;
    };
  }, [nextPlannedSession]);

  const bannerContent = useMemo(() => {
    const mode = planner?.burnoutMode || "Normal";
    if (mode === "Recovery") {
      return {
        message: "Recovery mode active",
        description:
          "The planner reduced your workload to prioritize recovery.",
      };
    }
    if (mode === "Warning") {
      return {
        message: "Warning mode active",
        description: "The planner is spacing focus blocks to reduce overload.",
      };
    }
    return {
      message: "Normal mode active",
      description: "Your study plan is running at a standard focus load.",
    };
  }, [planner]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto"
    >
      <DashboardHeader
        greeting={dashboardData.greeting}
        dateSubtitle={dashboardData.dateSubtitle}
      />

      <StatusBanner
        burnoutMode={planner?.burnoutMode}
        message={bannerContent.message}
        description={bannerContent.description}
        error={error}
      />

      <div className="flex gap-6 items-start">
        {/* Main Section */}
        <div className="flex-1 min-w-0 space-y-6">
          <KPICards kpis={dashboardData.kpis} />

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Today's Plan</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/schedule")}
              >
                View Planner
              </Button>
            </div>
            {nextPlannedSession ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-slate-600">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  Focus:{" "}
                  {nextPlannedSession.plannedFocusDuration ||
                    nextPlannedSession.planned_focus_duration ||
                    45}{" "}
                  min
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  Break Interval:{" "}
                  {nextPlannedSession.breakIntervalMinutes ||
                    nextPlannedSession.break_interval_minutes ||
                    45}{" "}
                  min
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  Break:{" "}
                  {nextPlannedSession.plannedBreakDuration ||
                    nextPlannedSession.planned_break_duration ||
                    10}{" "}
                  min
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  Tasks: {plannedTaskCount}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No planned sessions yet. Generate one from the planner.
              </p>
            )}
          </Card>

          <Card className="space-y-2">
            <h3 className="font-bold text-slate-800">Session Progress</h3>
            {activeSession ? (
              <p className="text-sm text-slate-600">
                Active session #
                {activeSession.sessionId || activeSession.session_id} is in
                progress.
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                No active session right now.
              </p>
            )}
          </Card>

          <QuickActions
            quickActions={dashboardData.quickActions}
            onAction={handleQuickAction}
          />
        </div>

        <div className="flex-shrink-0">
          <BurnoutRiskGauge burnoutRisk={dashboardData.burnoutRisk} />
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
