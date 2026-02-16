const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Checking if parent_task_id column exists...\n');

  // Try to query the table structure
  const { data, error } = await supabase
    .from('weekly_tasks')
    .select('*')
    .limit(1);

  if (data && data.length > 0) {
    console.log('Sample task structure:', Object.keys(data[0]));
    
    if ('parent_task_id' in data[0]) {
      console.log('✅ parent_task_id column already exists!');
    } else {
      console.log('❌ parent_task_id column does NOT exist');
      console.log('\nYou need to run this SQL in Supabase SQL Editor:');
      console.log('https://supabase.com/dashboard/project/avhtlfuzuyceyjkihqcv/sql/new\n');
      const fs = require('fs');
      const migrationSQL = fs.readFileSync('./supabase/migrations/20260216_add_subtasks.sql', 'utf8');
      console.log(migrationSQL);
    }
  } else {
    console.log('No tasks found or error:', error);
  }
}

runMigration();
