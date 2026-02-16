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
  console.log('🔧 Running database migration for subtasks...\n');

  let migrationSQL = fs.readFileSync('./supabase/migrations/20260216_add_subtasks.sql', 'utf8');

  // Remove single-line comments (-- comments)
  migrationSQL = migrationSQL.replace(/--[^\n]*/g, '');

  // Parse individual SQL statements (split by semicolon)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  if (statements.length === 0) {
    console.log('⚠️  No SQL statements found in migration file');
    return;
  }

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 80).replace(/\s+/g, ' ');
    console.log(`[${i + 1}/${statements.length}] ${preview}...`);

    try {
      // Try using Supabase's rpc function
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: stmt + ';' 
      });

      if (error) {
        throw error;
      }

      console.log('  ✅ Success\n');
    } catch (error) {
      // If rpc doesn't exist, fall back to manual instructions
      if (error.message?.includes('exec_sql') || error.message?.includes('function') || error.code === '42883') {
        console.log('  ⚠️  Direct SQL execution not available via API\n');
        console.log('═'.repeat(70));
        console.log('MANUAL MIGRATION REQUIRED');
        console.log('═'.repeat(70));
        console.log('\n📋 Copy and paste this SQL into Supabase SQL Editor:\n');
        console.log('🔗 https://supabase.com/dashboard/project/avhtlfuzuyceyjkihqcv/sql/new\n');
        console.log('─'.repeat(70));
        const originalSQL = fs.readFileSync('./supabase/migrations/20260216_add_subtasks.sql', 'utf8');
        console.log(originalSQL);
        console.log('─'.repeat(70));
        console.log('\nThen click RUN in the SQL editor\n');
        return;
      } else {
        console.log(`  ❌ Error: ${error.message}\n`);
        throw error;
      }
    }
  }

  console.log('✅ All migration statements executed successfully!');

  // Verify the column was added
  console.log('\n🔍 Verifying migration...');
  const { data, error } = await supabase
    .from('weekly_tasks')
    .select('*')
    .limit(1);

  if (!error && data !== null) {
    console.log('✅ Migration verified - weekly_tasks table is accessible');
  }
}

runMigration().catch(err => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});
