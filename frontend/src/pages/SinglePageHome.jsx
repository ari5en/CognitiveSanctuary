import React, { useMemo, useState } from "react";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatusBanner from "../components/dashboard/StatusBanner";
import KPICards from "../components/dashboard/KPICards";
import BurnoutRiskGauge from "../components/dashboard/BurnoutRiskGauge";
import ScheduleHeader from "../components/schedule/ScheduleHeader";
import SessionHeader from "../components/sessions/SessionHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useCognitiveDashboardState } from "../hooks/useCognitiveDashboardState";
import { useSessionExecutionEngine } from "../hooks/useSessionExecutionEngine";

function getPlannerModeLabel(mode) {
  if (mode === "Recovery") return "Minimal";
  if (mode === "Warning") return "Reduced";
  return "Safe";
}

function PlannerSessionRow({ session, isSelected, onSelect }) {
  const sessionId = session.sessionId ?? session.session_id;
  const focusDuration = session.plannedFocusDuration ?? session.planned_focus_duration;
  const breakInterval = session.breakIntervalMinutes ?? session.break_interval_minutes;
  const breakDuration = session.plannedBreakDuration ?? session.planned_break_duration;

  return (
    <div
      className={`flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 ${
        isSelected ? "bg-slate-50" : "bg-white"
      }`}
    >
      <div>
        <p className="text-sm font-semibold text-slate-800">
          Session #{sessionId}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Focus {focusDuration}m • Interval {breakInterval}m • Break {breakDuration}m
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge color="slate">{session.status || "Unknown"}</Badge>
        <Button
          variant={isSelected ? "solid" : "outline"}
          size="sm"
          onClick={() => onSelect(sessionId)}
        >
          Inspect
        </Button>
      </div>
    </div>
  );
}

function PlannerSessionsList({ sessions, selectedSessionId, onSelect }) {
  return (
    <div className="space-y-2">
      {sessions.map((s) => (
        <PlannerSessionRow
          key={s.sessionId}
          session={s}
          isSelected={selectedSessionId === s.sessionId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function StreamSessionRow({ session }) {
  const sessionId = session.sessionId ?? session.session_id;
  const focusDuration = session.plannedFocusDuration ?? session.planned_focus_duration;
  const breakInterval = session.breakIntervalMinutes ?? session.break_interval_minutes;

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          Session #{sessionId}
        </p>
        <p className="text-xs text-slate-500">Live Status: {session.status || "Unknown"}</p>
      </div>
      <div className="text-right text-xs text-slate-600 space-y-1">
        <p>Focus Window: {focusDuration} min</p>
        <p>Break Interval: {breakInterval} min</p>
      </div>
    </div>
  );
}

function StreamSessionsList({ sessions }) {
  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <StreamSessionRow key={session.sessionId} session={session} />
      ))}
    </div>
  );
}

const SinglePageHome = () => {
  const { planner, sessions, burnout, activeSessionId, loading, error } =
    useCognitiveDashboardState();

  // UI-only selection state for previewing a session
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Find active session for execution hook and timer overlay — purely presentation
  const activeSession = useMemo(
    () => sessions.find((s) => s.sessionId === activeSessionId) || null,
    [sessions, activeSessionId]
  );

  useSessionExecutionEngine({ activeSessionId, session: activeSession });

  const selectedSession = useMemo(
    () =>
      sessions.find((s) => (s.sessionId ?? s.session_id) === selectedSessionId) ||
      null,
    [sessions, selectedSessionId]
  );

  const systemStatus = error ? "Error" : loading ? "Loading" : "Synced";
  const bannerMessage =
    planner?.burnoutMode === "Recovery"
      ? "Recovery mode active"
      : planner?.burnoutMode === "Warning"
        ? "Warning mode active"
        : "Normal mode active";
  const bannerDescription =
    planner?.burnoutMode === "Recovery"
      ? "System load is reduced to protect cognitive recovery."
      : planner?.burnoutMode === "Warning"
        ? "Adaptive pacing is enabled to reduce overload risk."
        : "Planner is operating at full healthy cognitive load.";
  const kpis = [
    { label: "TOTAL SESSIONS", value: `${sessions.length}`, icon: "clock" },
    {
      label: "ACTIVE SESSION",
      value: activeSessionId ? `#${activeSessionId}` : "NONE",
      icon: "check",
    },
    { label: "BURNOUT SCORE", value: `${burnout?.score ?? 0}`, icon: "activity" },
  ];
  const burnoutRisk = {
    score: burnout?.score ?? 0,
    status: (burnout?.burnoutLevel || "Stable").toUpperCase(),
    description:
      burnout?.burnoutLevel === "Critical"
        ? "Critical burnout level detected."
        : "No critical burnout warning detected.",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-8">
      {/* Dashboard Panel */}
      <section aria-label="Dashboard Panel" className="space-y-6">
        <DashboardHeader
          greeting="Adaptive Dashboard"
          dateSubtitle={loading ? "Loading backend state" : "Backend synced"}
        />

        <StatusBanner
          burnoutMode={planner?.burnoutMode}
          message={bannerMessage}
          description={bannerDescription}
          error={error}
        />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-6 items-start">
          <div className="space-y-4">
            <Card className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                System State
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Planner Mode</p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {planner ? getPlannerModeLabel(planner.burnoutMode) : "Unavailable"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Burnout Level</p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {burnout?.burnoutLevel || "Stable"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Burnout Score</p>
                  <p className="font-semibold text-slate-800 mt-1">{burnout?.score ?? "N/A"}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-slate-500">System Status</p>
                  <p className="font-semibold text-slate-800 mt-1">{systemStatus}</p>
                </div>
              </div>
            </Card>

            <KPICards kpis={kpis} />
          </div>

          <BurnoutRiskGauge burnoutRisk={burnoutRisk} />
        </div>
      </section>

      {/* Planner Panel */}
      <section aria-label="Planner Panel" className="space-y-6">
        <ScheduleHeader
          title="Planning Layer"
          description="Control view for selecting which session to inspect."
        />

        <Card className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Planner Sessions</p>
          <p className="text-sm text-slate-500">
            Choose a session to inspect in the focused panel.
          </p>

          <div className="pt-2">
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-500">No planned sessions from backend.</p>
            ) : (
              <PlannerSessionsList
                sessions={sessions}
                selectedSessionId={selectedSessionId}
                onSelect={setSelectedSessionId}
              />
            )}
          </div>
        </Card>
      </section>

      {/* Session Stream Panel */}
      <section aria-label="Session Stream Panel" className="space-y-6">
        <SessionHeader
          title="Session Stream"
          subtitle="Monitoring feed of live session state (read-only)."
        />

        <Card className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Sessions</p>
          <p className="text-sm text-slate-500">
            Real-time operational view of all session timing states.
          </p>
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-500">No sessions available.</p>
          ) : (
            <StreamSessionsList sessions={sessions} />
          )}
        </Card>
      </section>

      {/* Session Preview Panel */}
      <section aria-label="Session Preview Panel" className="space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Focused Inspector
        </p>
        <Card className="space-y-5">
          {selectedSession ? (
            <div className="text-sm text-slate-700 space-y-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-slate-500">Session Overview</p>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 space-y-1">
                  <p>ID: #{selectedSession.sessionId ?? selectedSession.session_id}</p>
                  <p>Status: {selectedSession.status || "Unknown"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-slate-500">Timing</p>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 space-y-1">
                  <p>
                    Focus Duration:{" "}
                    {selectedSession.plannedFocusDuration ??
                      selectedSession.planned_focus_duration}{" "}
                    min
                  </p>
                  <p>
                    Break Interval:{" "}
                    {selectedSession.breakIntervalMinutes ??
                      selectedSession.break_interval_minutes}{" "}
                    min
                  </p>
                  <p>
                    Break Duration:{" "}
                    {selectedSession.plannedBreakDuration ??
                      selectedSession.planned_break_duration}{" "}
                    min
                  </p>
                </div>
              </div>

              {(selectedSession.mood != null ||
                selectedSession.breaksSkipped != null ||
                selectedSession.breaks_skipped != null) && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Metadata</p>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 space-y-1">
                    {selectedSession.mood != null && <p>Mood: {selectedSession.mood}</p>}
                    {(selectedSession.breaksSkipped != null ||
                      selectedSession.breaks_skipped != null) && (
                      <p>
                        Breaks Skipped:{" "}
                        {selectedSession.breaksSkipped ?? selectedSession.breaks_skipped}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No session selected from the planning layer.
            </p>
          )}
        </Card>
      </section>

      {/* Timer Overlay Panel (execution layer only) */}
      <section aria-label="Timer Overlay Panel">
        {activeSessionId && activeSession ? (
          <div className="fixed bottom-6 right-6 z-30 w-[280px]">
            <Card className="border-dashed border-slate-200 p-4 text-sm text-slate-600 space-y-2 shadow-lg">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Execution Overlay
              </p>
              <p>
                Focus Time:{" "}
                {activeSession.plannedFocusDuration ?? activeSession.planned_focus_duration} min
              </p>
              <p>
                Break Interval:{" "}
                {activeSession.breakIntervalMinutes ?? activeSession.break_interval_minutes} min
              </p>
              <p>
                Break Duration:{" "}
                {activeSession.plannedBreakDuration ?? activeSession.planned_break_duration} min
              </p>
            </Card>
          </div>
        ) : (
          <div className="fixed bottom-6 right-6 z-20 w-[280px]">
            <Card className="border-dashed border-slate-200 p-4 text-sm text-slate-400">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
                Execution Overlay
              </p>
              <p className="mt-2">No active session.</p>
            </Card>
          </div>
        )}
      </section>
    </div>
  );
};

export default SinglePageHome;
