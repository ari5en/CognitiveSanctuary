-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS) + DEV POLICIES
-- Cognitive Sanctuary - Phase 4 Fix
-- =====================================================

-- NOTE:
-- This is a DEV/PROJECT SETUP.
-- It allows anon access for INSERT/SELECT/UPDATE
-- so your backend can work without authentication blocking.

-- =====================================================
-- 1. STUDY SESSIONS
-- =====================================================

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select sessions"
ON study_sessions
FOR SELECT
USING (true);

CREATE POLICY "Allow anon insert sessions"
ON study_sessions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow anon update sessions"
ON study_sessions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- =====================================================
-- 2. STUDY TASKS
-- =====================================================

ALTER TABLE study_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select tasks"
ON study_tasks
FOR SELECT
USING (true);

CREATE POLICY "Allow anon insert tasks"
ON study_tasks
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow anon update tasks"
ON study_tasks
FOR UPDATE
USING (true)
WITH CHECK (true);

-- =====================================================
-- 3. STUDY PLANNER
-- =====================================================

ALTER TABLE study_planner ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select planner"
ON study_planner
FOR SELECT
USING (true);

CREATE POLICY "Allow anon insert planner"
ON study_planner
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow anon update planner"
ON study_planner
FOR UPDATE
USING (true)
WITH CHECK (true);

-- =====================================================
-- 4. BURNOUT RECORDS
-- =====================================================

ALTER TABLE burnout_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select burnout"
ON burnout_records
FOR SELECT
USING (true);

CREATE POLICY "Allow anon insert burnout"
ON burnout_records
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow anon update burnout"
ON burnout_records
FOR UPDATE
USING (true)
WITH CHECK (true);

-- =====================================================
-- END OF FILE
-- =====================================================