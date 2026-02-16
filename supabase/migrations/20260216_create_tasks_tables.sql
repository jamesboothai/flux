-- Weekly tasks table
CREATE TABLE IF NOT EXISTS weekly_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0-6 (Sunday-Saturday)
  week_offset INTEGER NOT NULL DEFAULT 0, -- 0 = current week, -1 = last week, 1 = next week
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Big picture goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  position INTEGER NOT NULL DEFAULT 0 -- For ordering
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_weekly_tasks_week ON weekly_tasks(week_offset, day_of_week);
CREATE INDEX IF NOT EXISTS idx_weekly_tasks_created ON weekly_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_position ON goals(position);
CREATE INDEX IF NOT EXISTS idx_goals_created ON goals(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE weekly_tasks IS 'Tasks organized by week and day for weekly planning';
COMMENT ON TABLE goals IS 'Big picture goals with ordering';
COMMENT ON COLUMN weekly_tasks.day_of_week IS '0=Sunday, 1=Monday, ..., 6=Saturday';
COMMENT ON COLUMN weekly_tasks.week_offset IS '0=current week, -1=last week, 1=next week, etc.';
