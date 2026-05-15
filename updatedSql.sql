-- ==============================================================================
-- FIX: DATA ISOLATION FIX
-- ==============================================================================
-- Run these commands below to drop the Foreign Key constraint that checks if a user exists in the Users table.
-- The frontend has been updated to pass a unique hashed integer userId based on the logged in account.
-- Dropping this constraint allows those unique users to be saved without throwing a 500 error.

-- Make sure the auth_id column exists (safely ignores if it's already there)
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id);

-- Drop the actual lowercase constraints (Supabase AI confirmed your constraint is named 'fk_user')
ALTER TABLE IF EXISTS public.study_sessions DROP CONSTRAINT IF EXISTS fk_user;
ALTER TABLE IF EXISTS public.burnout_records DROP CONSTRAINT IF EXISTS fk_user;
ALTER TABLE IF EXISTS public.study_planners DROP CONSTRAINT IF EXISTS fk_user;

-- Also safely drop the generated constraint names just in case they exist:
ALTER TABLE IF EXISTS public.study_sessions DROP CONSTRAINT IF EXISTS "FK_StudySessions_Users";
ALTER TABLE IF EXISTS public.burnout_records DROP CONSTRAINT IF EXISTS "FK_BurnoutRecords_Users";
ALTER TABLE IF EXISTS public.study_planners DROP CONSTRAINT IF EXISTS "FK_StudyPlanners_Users";
