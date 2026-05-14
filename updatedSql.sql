-- Supposing you want to migrate existing integer user_ids to Supabase auth UUIDs
-- Or add the required auth schema if missing.
-- NOTE: Please ensure your backend is updated to use string/uuid if you change the type.

-- Example: If you are adding a new UUID column mapped to Supabase auth
ALTER TABLE "Users" ADD COLUMN "auth_id" UUID REFERENCES auth.users(id);

-- If you are altering the primary key of Users to be UUID (requires dropping constraints first):
/*
ALTER TABLE "StudySessions" DROP CONSTRAINT "FK_StudySessions_Users";
ALTER TABLE "BurnoutRecords" DROP CONSTRAINT "FK_BurnoutRecords_Users";
ALTER TABLE "StudyPlanners" DROP CONSTRAINT "FK_StudyPlanners_Users";

ALTER TABLE "Users" ALTER COLUMN "Id" TYPE UUID USING gen_random_uuid();

ALTER TABLE "StudySessions" ALTER COLUMN "UserId" TYPE UUID;
ALTER TABLE "BurnoutRecords" ALTER COLUMN "UserId" TYPE UUID;
ALTER TABLE "StudyPlanners" ALTER COLUMN "UserId" TYPE UUID;

ALTER TABLE "StudySessions" ADD CONSTRAINT "FK_StudySessions_Users" FOREIGN KEY ("UserId") REFERENCES "Users"("Id");
ALTER TABLE "BurnoutRecords" ADD CONSTRAINT "FK_BurnoutRecords_Users" FOREIGN KEY ("UserId") REFERENCES "Users"("Id");
ALTER TABLE "StudyPlanners" ADD CONSTRAINT "FK_StudyPlanners_Users" FOREIGN KEY ("UserId") REFERENCES "Users"("Id");
*/

-- IMPORTANT: It's often easier to just map the Supabase UUID into your existing User table
-- instead of rewriting all foreign keys, e.g. mapping auth.users.id -> Users.Id
