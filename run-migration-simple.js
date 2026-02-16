const https = require('https');

const SUPABASE_URL = 'https://avhtlfuzuyceyjkihqcv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2aHRsZnV6dXljZXlqa2locWN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI2MjQ3MSwiZXhwIjoyMDg2ODM4NDcxfQ.DXBBbzQPbusSLKwqwgg0YfMkRKSWJnTnIIZo4gmZ3kQ';

// SQL statements to execute
const createWeeklyTasksTable = `
CREATE TABLE IF NOT EXISTS weekly_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  week_offset INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);
`;

const createGoalsTable = `
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  position INTEGER NOT NULL DEFAULT 0
);
`;

const createIndexes = [
  'CREATE INDEX IF NOT EXISTS idx_weekly_tasks_week ON weekly_tasks(week_offset, day_of_week);',
  'CREATE INDEX IF NOT EXISTS idx_weekly_tasks_created ON weekly_tasks(created_at DESC);',
  'CREATE INDEX IF NOT EXISTS idx_goals_position ON goals(position);',
  'CREATE INDEX IF NOT EXISTS idx_goals_created ON goals(created_at DESC);'
];

async function executeSQLViaAPI(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);

    const data = JSON.stringify({ query: sql });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: responseData });
        } else {
          resolve({ success: false, error: responseData, status: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runMigration() {
  console.log('🚀 Starting Supabase migration...\n');

  console.log('Creating weekly_tasks table...');
  const result1 = await executeSQLViaAPI(createWeeklyTasksTable);
  console.log(result1.success ? '✅ Success' : `❌ Failed: ${result1.error}`);

  console.log('\nCreating goals table...');
  const result2 = await executeSQLViaAPI(createGoalsTable);
  console.log(result2.success ? '✅ Success' : `❌ Failed: ${result2.error}`);

  console.log('\nCreating indexes...');
  for (const indexSQL of createIndexes) {
    const result = await executeSQLViaAPI(indexSQL);
    const name = indexSQL.match(/idx_\w+/)?.[0] || 'index';
    console.log(`  ${name}: ${result.success ? '✅' : '❌'}`);
  }

  console.log('\n🎉 Migration attempt complete!');
  console.log('\nNote: If the tables already existed, you may see errors - that\'s OK!');
}

runMigration().catch((error) => {
  console.error('❌ Fatal error:', error.message);
});
