-- Migration: Replace relative week_offset with absolute week_start date
-- This fixes the bug where tasks created in past weeks permanently show as "current week"

-- Step 1: Add week_start column (nullable initially for backfill)
ALTER TABLE weekly_tasks ADD COLUMN IF NOT EXISTS week_start DATE;

-- Step 2: Backfill existing rows
-- Calculate the Sunday of the week each task was created
-- PostgreSQL date_trunc('week', ...) returns Monday, so we subtract 1 day to get Sunday
-- We also factor in the original week_offset (e.g., if task was created for "next week")
UPDATE weekly_tasks
SET week_start = (
  DATE_TRUNC('week', created_at + INTERVAL '1 day')::date - 1
  + (week_offset * 7)
);

-- Step 3: Make NOT NULL after backfill
ALTER TABLE weekly_tasks ALTER COLUMN week_start SET NOT NULL;

-- Step 4: Add index for the new column
CREATE INDEX IF NOT EXISTS idx_weekly_tasks_week_start ON weekly_tasks(week_start, day_of_week);

-- Step 5: Drop old week_offset column and its index
DROP INDEX IF EXISTS idx_weekly_tasks_week;
ALTER TABLE weekly_tasks DROP COLUMN IF EXISTS week_offset;
