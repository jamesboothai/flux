-- Add parent_task_id column to weekly_tasks for subtasks feature
ALTER TABLE weekly_tasks
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES weekly_tasks(id) ON DELETE CASCADE;

-- Index for faster subtask queries
CREATE INDEX IF NOT EXISTS idx_weekly_tasks_parent ON weekly_tasks(parent_task_id);

-- Comment for documentation
COMMENT ON COLUMN weekly_tasks.parent_task_id IS 'Reference to parent task for subtasks (NULL for top-level tasks)';
