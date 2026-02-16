const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testExecSQL() {
  console.log('🔍 Testing exec_sql function...\n');

  // Test 1: Try to call exec_sql with a simple SELECT statement
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT 1 as test'
    });

    if (error) {
      if (error.code === '42883' || error.message?.includes('function') || error.message?.includes('does not exist')) {
        console.log('❌ exec_sql function NOT found');
        console.log('Error:', error.message);
        console.log('\n⚠️  You need to run setup-migration-function.sql');
        console.log('Go to: https://supabase.com/dashboard/project/avhtlfuzuyceyjkihqcv/sql/new');
        return false;
      } else {
        console.log('❌ Unexpected error:', error);
        return false;
      }
    }

    console.log('✅ exec_sql function exists and works!');
    console.log('Response:', data);
    console.log('\n✅ I can now run SQL migrations automatically!\n');
    return true;

  } catch (err) {
    console.log('❌ Error testing exec_sql:', err.message);
    return false;
  }
}

async function verifyAllMigrations() {
  console.log('═'.repeat(70));
  console.log('VERIFYING ALL MIGRATIONS');
  console.log('═'.repeat(70));
  console.log();

  // Test exec_sql function
  const execSqlWorks = await testExecSQL();

  console.log();
  console.log('─'.repeat(70));
  console.log('MIGRATION STATUS SUMMARY');
  console.log('─'.repeat(70));

  // Test parent_task_id column
  console.log('\n🔍 Checking parent_task_id column...');
  const { data: testData, error: testError } = await supabase
    .from('weekly_tasks')
    .select('id, parent_task_id')
    .limit(1);

  if (testError) {
    console.log('❌ parent_task_id column: NOT FOUND');
    console.log('   Error:', testError.message);
  } else {
    console.log('✅ parent_task_id column: EXISTS');
  }

  console.log('\n🔍 Checking exec_sql function...');
  if (execSqlWorks) {
    console.log('✅ exec_sql function: CONFIGURED');
  } else {
    console.log('❌ exec_sql function: NOT CONFIGURED');
  }

  console.log('\n' + '═'.repeat(70));
  
  if (execSqlWorks && !testError) {
    console.log('✅ ALL MIGRATIONS COMPLETE - Ready for automatic SQL execution!');
  } else if (!testError && !execSqlWorks) {
    console.log('⚠️  PARTIAL - parent_task_id exists, but exec_sql needs setup');
  } else {
    console.log('❌ INCOMPLETE - See errors above');
  }
  console.log('═'.repeat(70));
  console.log();
}

verifyAllMigrations();
