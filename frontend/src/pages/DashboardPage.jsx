import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPlannerByUser, getSessionsByUser, getTasksByUser } from "../services/api";

// Dashboard Components
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatusBanner from "../components/dashboard/StatusBanner";
import KPICards from "../components/dashboard/KPICards";
import BurnoutRiskGauge from "../components/dashboard/BurnoutRiskGauge";
import FocusFlowChart from "../components/dashboard/FocusFlowChart";
import Milestones from "../components/dashboard/Milestones";
import QuickActions from "../components/dashboard/QuickActions";

const defaultDashboardData = {
  greeting: "Hello, Alex",
  dateSubtitle: "MONDAY, OCTOBER 24 — DEEP WORK MODE ACTIVE",
  statusBanner: {
    type: "safe",
    message: "You are in a safe zone",
    description: "Your cognitive load is optimal for learning new complex concepts.",
  },
  kpis: [
    { label: "STUDY HOURS", value: "0h", icon: "clock" },
    { label: "BREAKS TAKEN", value: "0", icon: "coffee" },
    { label: "DAILY MOOD", value: "Neutral", icon: "smile" },
  ],
  burnoutRisk: {
    score: 0,
    status: "STABLE",
    description: "Load data to see your burnout risk analysis.",
  },
  focusFlowData: [
    { day: "MON", engagement: 0 },
    { day: "TUE", engagement: 0 },
    { day: "WED", engagement: 0 },
    { day: "THU", engagement: 0 },
    { day: "FRI", engagement: 0 },
    { day: "SAT", engagement: 0 },
    { day: "SUN", engagement: 0 },
  ],
  milestones: [
    {
      id: 1,
      title: "Neural Networks Exam",
      date: "FRIDAY, OCT 28",
      badge: "HIGH FOCUS",
      badgeColor: "green",
      borderColor: "border-green-500",
    },
    {
      id: 2,
      title: "Ethics in AI Essay",
      date: "MONDAY, OCT 31",
      badge: "PLANNING",
      badgeColor: "amber",
      borderColor: "border-amber-400",
    },
  ],
  quickActions: [
    { id: "new-task", label: "New Task", icon: "check-square-2" },
    { id: "review", label: "Review", icon: "clipboard-list" },
    { id: "unwind", label: "Unwind", icon: "leaf" },
    { id: "reports", label: "Reports", icon: "bar-chart-2" },
  ],
};

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(defaultDashboardData);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || '{"name": "Alex", "id": 1}');
    setUser(storedUser);
    setDashboardData(prev => ({ ...prev, greeting: `Hello, ${storedUser.name}` }));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [sessions, planner, tasks] = await Promise.all([
          getSessionsByUser(1),
          getPlannerByUser(1).catch(() => null),
          getTasksByUser(1).catch(() => []),
        ]);

        if (!isMounted) return;

        // Map tasks to milestones
        const dynamicMilestones = tasks.slice(0, 2).map((t, idx) => ({
          id: t.taskId || idx,
          title: t.title,
          date: "PENDING",
          badge: "TASK",
          badgeColor: "green",
          borderColor: "border-green-500",
        }));

        // --- Data Aggregation Logic ---
        const totalMinutes = sessions.reduce((acc, s) => acc + (s.studyDuration || 0), 0);
        const totalHours = (totalMinutes / 60).toFixed(1);
        const totalBreaks = sessions.reduce((acc, s) => acc + (s.breakCount || 0), 0);

        const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        const chartData = days.map((day) => ({ day, engagement: 0 }));

        sessions.forEach((s) => {
          const date = s.startTime ? new Date(s.startTime) : null;
          if (date && !isNaN(date)) {
            const dayName = days[date.getDay()];
            const entry = chartData.find((d) => d.day === dayName);
            if (entry) entry.engagement += s.studyDuration || 0;
          }
        });

        const maxEngagement = Math.max(...chartData.map((d) => d.engagement), 0) || 1;
        const normalizedChartData = chartData.map((d) => ({
          ...d,
          engagement: Math.round((d.engagement / maxEngagement) * 100),
        }));

        const sessionScore = sessions.length > 0 
          ? Math.min(100, sessions.length * 10) 
          : 30;

        setDashboardData((prev) => ({
          ...prev,
          milestones: dynamicMilestones.length > 0 ? dynamicMilestones : prev.milestones,
          kpis: [
            { label: "STUDY HOURS", value: `${totalHours}h`, icon: "clock" },
            { label: "BREAKS TAKEN", value: `${totalBreaks}`, icon: "coffee" },
            { label: "DAILY MOOD", value: "Happy", icon: "smile" },
          ],
          focusFlowData: normalizedChartData,
          burnoutRisk: {
            ...prev.burnoutRisk,
            score: sessionScore,
            status: sessionScore > 70 ? "HIGH RISK" : "STABLE",
            description: sessions.length > 0 
              ? "Your recovery sessions have been tracked. Keep maintaining a balanced pace."
              : prev.burnoutRisk.description,
          },
          statusBanner: planner
            ? {
                ...prev.statusBanner,
                message: "Planner synced",
                description: `Recommended load set to ${planner.recommendedLoad}%.`,
              }
            : prev.statusBanner,
        }));
      } catch (err) {
        if (isMounted) setError("Unable to load dashboard data.");
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

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
        statusBanner={dashboardData.statusBanner} 
        error={error} 
      />

      <div className="flex gap-6 items-start">
        {/* Main Section */}
        <div className="flex-1 min-w-0">
          <KPICards kpis={dashboardData.kpis} />
          <FocusFlowChart focusFlowData={dashboardData.focusFlowData} />
          
          <div className="flex gap-6 mt-6">
            <Milestones milestones={dashboardData.milestones} />
            <QuickActions quickActions={dashboardData.quickActions} />
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="flex-shrink-0">
          <BurnoutRiskGauge burnoutRisk={dashboardData.burnoutRisk} />
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
