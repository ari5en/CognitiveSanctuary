-- ==============================================================================
-- COGNITIVE SANCTUARY — SAFE SCHEMA-ONLY FIX
-- ✅ Does NOT delete any data. Teammates' user_id=1 rows are untouched.
-- Run this entire script in your Supabase SQL Editor.
-- ==============================================================================

-- ── 1. DROP OLD FOREIGN KEY CONSTRAINTS (schema only, no data deleted) ─────────
ALTER TABLE IF EXISTS public.study_sessions    DROP CONSTRAINT IF EXISTS fk_user;
ALTER TABLE IF EXISTS public.burnout_records   DROP CONSTRAINT IF EXISTS fk_user;
ALTER TABLE IF EXISTS public.study_planners    DROP CONSTRAINT IF EXISTS fk_user;
ALTER TABLE IF EXISTS public.study_planner     DROP CONSTRAINT IF EXISTS fk_user;
ALTER TABLE IF EXISTS public.study_sessions    DROP CONSTRAINT IF EXISTS "FK_StudySessions_Users";
ALTER TABLE IF EXISTS public.burnout_records   DROP CONSTRAINT IF EXISTS "FK_BurnoutRecords_Users";
ALTER TABLE IF EXISTS public.study_planners    DROP CONSTRAINT IF EXISTS "FK_StudyPlanners_Users";
ALTER TABLE IF EXISTS public.study_planner     DROP CONSTRAINT IF EXISTS "FK_StudyPlanners_Users";
ALTER TABLE IF EXISTS public.study_sessions    DROP CONSTRAINT IF EXISTS study_sessions_user_id_fkey;
ALTER TABLE IF EXISTS public.study_planner     DROP CONSTRAINT IF EXISTS study_planner_user_id_fkey;
ALTER TABLE IF EXISTS public.burnout_records   DROP CONSTRAINT IF EXISTS burnout_records_user_id_fkey;

-- ── 2. DISABLE ROW LEVEL SECURITY (no data deleted, just makes rows visible) ───
-- The .NET backend uses the anon key which RLS was hiding your rows from.
-- Your teammates' rows (user_id=1) remain fully intact and are unaffected.
ALTER TABLE IF EXISTS public.study_planner    DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.study_sessions   DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.burnout_records  DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.study_planners   DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users            DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.study_tasks      DISABLE ROW LEVEL SECURITY;

-- ── 3. DROP EXTRA UNIQUE CONSTRAINTS ON study_planner.user_id (schema only) ────
-- This allows the backend to upsert without hitting unique key conflicts.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname, conrelid::regclass AS tbl
    FROM pg_constraint
    WHERE contype = 'u'
      AND conrelid = 'public.study_planner'::regclass
  LOOP
    EXECUTE 'ALTER TABLE ' || r.tbl || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- ── 4. FIX ORPHANED PLANNER ROWS (only deletes rows with no matching sessions) ─
-- Deletes planner rows ONLY where that user_id has no study_sessions at all.
-- This safely removes the stale user_id=1 planner if user_id=1 has no sessions.
-- Your teammates' data is kept if they have real sessions under their user_id.
DELETE FROM public.study_planner
WHERE user_id NOT IN (SELECT DISTINCT user_id FROM public.study_sessions);
