-- =========================================================
-- Cognitive Sanctuary — Migration v2
-- Realignment: Task-centric → Session-centric Adaptive Planner
-- Run this in Supabase SQL Editor (one-time migration)
-- =========================================================


-- ── study_sessions: add adaptive session structure fields ──
ALTER TABLE study_sessions
  ADD COLUMN IF NOT EXISTS planned_focus_duration  DOUBLE PRECISION DEFAULT 45,
  ADD COLUMN IF NOT EXISTS break_interval_minutes  INT DEFAULT 45,
  ADD COLUMN IF NOT EXISTS planned_break_duration  DOUBLE PRECISION DEFAULT 10,
  ADD COLUMN IF NOT EXISTS mood                    INT DEFAULT 2,
  ADD COLUMN IF NOT EXISTS breaks_skipped          INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status                  VARCHAR(50) DEFAULT 'Planned';

-- status values: Planned | InProgress | Completed | Cancelled


-- ── study_planner: add burnout mode tracking ──
ALTER TABLE study_planner
  ADD COLUMN IF NOT EXISTS burnout_mode  VARCHAR(50) DEFAULT 'Normal',
  ADD COLUMN IF NOT EXISTS planned_focus_duration  DOUBLE PRECISION DEFAULT 45,
  ADD COLUMN IF NOT EXISTS break_interval_minutes  INT DEFAULT 45,
  ADD COLUMN IF NOT EXISTS planned_break_duration  DOUBLE PRECISION DEFAULT 10,
  ADD COLUMN IF NOT EXISTS last_updated  TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- burnout_mode values: Normal | Warning | Recovery


-- ── burnout_records: add source data for audit/history ──
ALTER TABLE burnout_records
  ADD COLUMN IF NOT EXISTS mood           INT DEFAULT 2,
  ADD COLUMN IF NOT EXISTS breaks_skipped INT DEFAULT 0;


-- ── Backfill existing rows with sensible defaults ──
UPDATE study_sessions
SET status = 'Completed'
WHERE start_time IS NOT NULL AND end_time IS NOT NULL AND status IS NULL;

UPDATE study_sessions
SET status = 'Planned'
WHERE status IS NULL;

UPDATE study_planner
SET burnout_mode = 'Normal'
WHERE burnout_mode IS NULL;
