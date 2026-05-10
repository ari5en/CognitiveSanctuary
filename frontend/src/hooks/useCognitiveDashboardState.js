import { useEffect, useState } from "react";
import {
  getLatestBurnoutByUser,
  getPlannerByUser,
  getSessionsByUser,
} from "../services/api";

const USER_ID = 1;

export function useCognitiveDashboardState() {
  const [planner, setPlanner] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [burnout, setBurnout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      try {
        const [plannerData, sessionData, burnoutData] = await Promise.all([
          getPlannerByUser(USER_ID).catch(() => null),
          getSessionsByUser(USER_ID),
          getLatestBurnoutByUser(USER_ID).catch(() => null),
        ]);
        if (!isActive) return;

        setPlanner(plannerData);
        setSessions(sessionData || []);
        setBurnout(burnoutData);
        setError("");
      } catch (loadError) {
        if (isActive) {
          setError("Unable to load backend dashboard state.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadState();
    return () => {
      isActive = false;
    };
  }, []);

  return {
    planner,
    sessions,
    burnout,
    activeSessionId: planner?.activeSessionId,
    loading,
    error,
  };
}
