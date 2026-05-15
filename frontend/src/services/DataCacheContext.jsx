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
  getUserId,
  getDashboardAnalytics,
  getLatestBurnoutByUser,
  getPlannerByUser,
  getSessionsByUser,
  getTasksBySession,
} from "./api";
import { supabase } from "./supabase";

// ── Context ────────────────────────────────────────────────────────────────────
const DataCacheContext = createContext(null);
const STALE_MS = 20_000; // treat cache as fresh for 20 s

// ── Provider ──────────────────────────────────────────────────────────────────
export const DataCacheProvider = ({ children }) => {
  // Each key stores { data, fetchedAt }
  const cache = useRef({});
  const inflight = useRef({});

  // Trigger a re-render in consumers when any slice updates
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((n) => n + 1), []);
  
  const [currentUserId, setCurrentUserId] = useState(getUserId());
  
  // Listen for Supabase auth state to update currentUserId dynamically 
  // (fixes bug where new users see default User 1 sessions on OAuth redirect)
  React.useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const idStr = session.user.id;
        let hash = 0;
        for (let i = 0; i < idStr.length; i++) {
          hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
          hash |= 0;
        }
        setCurrentUserId(Math.abs(hash) || 1);
      } else {
        setCurrentUserId(1);
      }
    });
  }, []);

  const scopeKey = useCallback(
    (key) => `${currentUserId}:${key}`,
    [currentUserId],
  );

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
    [bump],
  );

  // ── Public helpers ──────────────────────────────────────────────────────
  // read() auto-applies scopeKey so callers use plain names like "sessions"
  const read = useCallback((key) => cache.current[scopeKey(key)]?.data ?? null, [scopeKey]);

  const fetchAnalytics = useCallback(
    (opts) =>
      fetchSlice(
        scopeKey("analytics"),
        () => getDashboardAnalytics(currentUserId).catch(() => null),
        opts,
      ),
    [fetchSlice, currentUserId, scopeKey],
  );

  const fetchBurnout = useCallback(
    (opts) =>
      fetchSlice(
        scopeKey("burnout"),
        () => getLatestBurnoutByUser(currentUserId).catch(() => null),
        opts,
      ),
    [fetchSlice, currentUserId, scopeKey],
  );

  const fetchPlanner = useCallback(
    (opts) =>
      fetchSlice(
        scopeKey("planner"),
        () => getPlannerByUser(currentUserId).catch(() => null),
        opts,
      ),
    [fetchSlice, currentUserId, scopeKey],
  );

  const fetchSessions = useCallback(
    (opts) =>
      fetchSlice(
        scopeKey("sessions"),
        () => getSessionsByUser(currentUserId).catch(() => []),
        opts,
      ),
    [fetchSlice, currentUserId, scopeKey],
  );

  const fetchTasksForSession = useCallback(
    async (sessionId, opts) => {
      const key = scopeKey(`tasks_${sessionId}`);
      return fetchSlice(
        key,
        () => getTasksBySession(sessionId).catch(() => []),
        opts,
      );
    },
    [fetchSlice, scopeKey],
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
          fetchTasksForSession(s.sessionId || s.session_id, opts),
        ),
      );
    },
    [fetchPlanner, fetchSessions, fetchTasksForSession],
  );

  // Invalidate a specific key so next read forces a re-fetch
  const invalidate = useCallback(
    (key) => {
      const scopedKey = scopeKey(key);
      if (cache.current[scopedKey]) {
        cache.current[scopedKey].fetchedAt = 0; // mark stale
      }
    },
    [scopeKey],
  );

  const invalidateAll = useCallback(() => {
    Object.keys(cache.current).forEach((k) => {
      if (k.startsWith(`${currentUserId}:`)) {
        cache.current[k].fetchedAt = 0;
      }
    });
  }, [currentUserId]);

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
  if (!ctx)
    throw new Error("useDataCache must be used inside DataCacheProvider");
  return ctx;
};
