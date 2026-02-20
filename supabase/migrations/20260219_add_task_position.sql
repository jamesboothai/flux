-- Add position column to weekly_tasks for drag-and-drop reordering
ALTER TABLE weekly_tasks
ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;

-- Backfill positions for existing tasks based on current created_at order
-- Preserves the existing visual order, scoped per day/week
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY week_offset, day_of_week
    ORDER BY created_at ASC
  ) - 1 AS new_position
  FROM weekly_tasks
)
UPDATE weekly_tasks
SET position = ranked.new_position
FROM ranked
WHERE weekly_tasks.id = ranked.id;

-- Index for efficient ordering queries
CREATE INDEX IF NOT EXISTS idx_weekly_tasks_position ON weekly_tasks(week_offset, day_of_week, position);

-- Documentation
COMMENT ON COLUMN weekly_tasks.position IS 'Sort position within a day (0-based, lower = higher in list)';
