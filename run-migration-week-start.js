const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function runMigration() {
  console.log('Running week_start migration...\n');

  let migrationSQL = fs.readFileSync('./supabase/migrations/20260414_week_start_migration.sql', 'utf8');

  // Remove single-line comments
  migrationSQL = migrationSQL.replace(/--[^\n]*/g, '');

  // Parse individual SQL statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 80).replace(/\s+/g, ' ');
    console.log(`[${i + 1}/${statements.length}] ${preview}...`);

    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: stmt + ';'
      });

      if (error) throw error;
      console.log('  Success\n');
    } catch (error) {
      if (error.message?.includes('exec_sql') || error.message?.includes('function') || error.code === '42883') {
        console.log('\n  Direct SQL execution not available via API.');
        console.log('\n  Copy and paste this SQL into Supabase SQL Editor:');
        console.log(`  https://supabase.com/dashboard/project/avhtlfuzuyceyjkihqcv/sql/new\n`);
        console.log('---');
        const originalSQL = fs.readFileSync('./supabase/migrations/20260414_week_start_migration.sql', 'utf8');
        console.log(originalSQL);
        console.log('---');
        console.log('\nThen click RUN in the SQL editor\n');
        return;
      } else {
        console.log(`  Error: ${error.message}\n`);
        throw error;
      }
    }
  }

  console.log('All migration statements executed successfully!');

  // Verify
  console.log('\nVerifying migration...');
  const { data, error } = await supabase
    .from('weekly_tasks')
    .select('*')
    .limit(3);

  if (!error && data !== null) {
    console.log(`Verified - found ${data.length} tasks`);
    if (data.length > 0) {
      console.log('Sample task:', JSON.stringify(data[0], null, 2));
    }
  } else {
    console.log('Verification error:', error?.message);
  }
}

runMigration().catch(err => {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
});
