# Database Migration Instructions

To set up the database tables for the tasks feature, you need to run the migration SQL file.

## Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/migrations/20260216_create_tasks_tables.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the migration

## Option 2: Supabase CLI (if installed)

```bash
cd flux
supabase db push
```

## Verify Migration

After running the migration, verify that the tables were created:

1. Go to Supabase Dashboard → Table Editor
2. You should see two new tables:
   - `weekly_tasks`
   - `goals`

## Environment Variables

Make sure your Vercel deployment has these environment variables set:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key (not the anon key)

These should already be configured if your site is working.
