/**
 * DataCacheContext — stale-while-revalidate shared data layer
 *
 * Stores the last-known result for each API call so that pages render
 * immediately with cached data while a background fetch runs silently.
 * Pages never stall on a spinner after the first load.
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  getDashboardAnalytics,
  getLatestBurnoutByUser,
  getPlannerByUser,
  getSessionsByUser,
  getTasksBySession,
} from "./api";

// ── Context ────────────────────────────────────────────────────────────────────
const DataCacheContext = createContext(null);

const USER_ID = 1;
const STALE_MS = 20_000; // treat cache as fresh for 20 s

// ── Provider ──────────────────────────────────────────────────────────────────
export const DataCacheProvider = ({ children }) => {
  // Each key stores { data, fetchedAt }
  const cache = useRef({});
  const inflight = useRef({});

  // Trigger a re-render in consumers when any slice updates
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((n) => n + 1), []);

  // ── Generic fetch-with-cache ─────────────────────────────────────────────
  const fetchSlice = useCallback(
    async (key, fetcher, { force = false } = {}) => {
      const entry = cache.current[key];
      const now = Date.now();

      const isStale = !entry || now - entry.fetchedAt > STALE_MS;
      if (!force && !isStale) return entry.data; // fresh — return immediately

      // Deduplicate concurrent requests for the same key
      if (inflight.current[key]) return entry?.data ?? null;
      inflight.current[key] = true;

      try {
        const data = await fetcher();
        cache.current[key] = { data, fetchedAt: Date.now() };
        bump();
        return data;
      } catch {
        return entry?.data ?? null; // on error, serve stale
      } finally {
        inflight.current[key] = false;
      }
    },
    [bump]
  );

  // ── Public helpers ──────────────────────────────────────────────────────
  const read = useCallback(
    (key) => cache.current[key]?.data ?? null,
    []
  );

  const fetchAnalytics = useCallback(
    (opts) => fetchSlice("analytics", () => getDashboardAnalytics(USER_ID).catch(() => null), opts),
    [fetchSlice]
  );

  const fetchBurnout = useCallback(
    (opts) => fetchSlice("burnout", () => getLatestBurnoutByUser(USER_ID).catch(() => null), opts),
    [fetchSlice]
  );

  const fetchPlanner = useCallback(
    (opts) => fetchSlice("planner", () => getPlannerByUser(USER_ID).catch(() => null), opts),
    [fetchSlice]
  );

  const fetchSessions = useCallback(
    (opts) => fetchSlice("sessions", () => getSessionsByUser(USER_ID).catch(() => []), opts),
    [fetchSlice]
  );

  const fetchTasksForSession = useCallback(
    async (sessionId, opts) => {
      const key = `tasks_${sessionId}`;
      return fetchSlice(key, () => getTasksBySession(sessionId).catch(() => []), opts);
    },
    [fetchSlice]
  );

  // Fetch all planner-page data in one shot (parallel)
  const fetchPlannerPageData = useCallback(
    async (opts) => {
      const [plannerData, sessionData] = await Promise.all([
        fetchPlanner(opts),
        fetchSessions(opts),
      ]);
      const planned = (sessionData || []).filter((s) => s.status === "Planned");
      await Promise.all(
        planned.map((s) =>
          fetchTasksForSession(s.sessionId || s.session_id, opts)
        )
      );
    },
    [fetchPlanner, fetchSessions, fetchTasksForSession]
  );

  // Invalidate a specific key so next read forces a re-fetch
  const invalidate = useCallback((key) => {
    if (cache.current[key]) {
      cache.current[key].fetchedAt = 0; // mark stale
    }
  }, []);

  const invalidateAll = useCallback(() => {
    Object.keys(cache.current).forEach((k) => {
      cache.current[k].fetchedAt = 0;
    });
  }, []);

  const value = {
    tick, // consumers can use this to re-read from cache reactively
    read,
    fetchAnalytics,
    fetchBurnout,
    fetchPlanner,
    fetchSessions,
    fetchTasksForSession,
    fetchPlannerPageData,
    invalidate,
    invalidateAll,
  };

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useDataCache = () => {
  const ctx = useContext(DataCacheContext);
  if (!ctx) throw new Error("useDataCache must be used inside DataCacheProvider");
  return ctx;
};
