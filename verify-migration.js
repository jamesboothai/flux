const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function verifyMigration() {
  console.log('🔍 Verifying parent_task_id column was added...\n');

  // Insert a test task
  const { data: testTask, error: insertError } = await supabase
    .from('weekly_tasks')
    .insert({
      content: 'Test task',
      day_of_week: 0,
      week_offset: 0,
      completed: false,
      parent_task_id: null
    })
    .select()
    .single();

  if (insertError) {
    console.log('❌ Migration verification FAILED');
    console.log('Error:', insertError.message);
    return;
  }

  console.log('✅ Successfully inserted task with parent_task_id column');
  console.log('Task ID:', testTask.id);

  // Check if parent_task_id exists in the returned data
  if ('parent_task_id' in testTask) {
    console.log('✅ parent_task_id column exists and is accessible');
  } else {
    console.log('⚠️  parent_task_id column not in response (but insert worked)');
  }

  // Clean up test task
  await supabase.from('weekly_tasks').delete().eq('id', testTask.id);
  console.log('✅ Test task cleaned up');

  console.log('\n✅ Migration verified successfully!\n');
}

verifyMigration();
