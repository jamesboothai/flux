# Supabase Setup Instructions

## Quick Setup (2 minutes)

### Step 1: Go to Supabase SQL Editor

1. Open your browser and go to: https://supabase.com/dashboard/project/avhtlfuzuyceyjkihqcv/sql/new
2. You should see a SQL editor

### Step 2: Copy and Run This SQL

Copy the entire SQL below and paste it into the editor, then click **RUN**:

```sql
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
```

### Step 3: Verify Tables Were Created

1. Go to: https://supabase.com/dashboard/project/avhtlfuzuyceyjkihqcv/editor
2. You should see two new tables:
   - `weekly_tasks`
   - `goals`

### Step 4: Update Vercel Environment Variables

1. Go to: https://vercel.com/personal-67194c15/flux/settings/environment-variables
2. Add or update these variables:
   - `SUPABASE_URL` = `https://avhtlfuzuyceyjkihqcv.supabase.co`
   - `SUPABASE_SERVICE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2aHRsZnV6dXljZXlqa2locWN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI2MjQ3MSwiZXhwIjoyMDg2ODM4NDcxfQ.DXBBbzQPbusSLKwqwgg0YfMkRKSWJnTnIIZo4gmZ3kQ`
3. Redeploy your site or wait for the next automatic deployment

### Step 5: Test It Out!

1. Visit your site: https://flux.vercel.app (or your custom domain)
2. Click the **"tasks"** button in the bottom-left corner
3. Start adding tasks and goals!

---

## Troubleshooting

**If you see "Could not find table" errors:**
- Make sure you ran the SQL in Step 2
- Check that the tables exist in the Table Editor
- Verify the environment variables are set correctly in Vercel

**If the migration was already run:**
- That's OK! The SQL uses `IF NOT EXISTS` so it won't create duplicates
