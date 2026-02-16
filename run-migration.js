const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase connection details
const connectionString = 'postgresql://postgres.avhtlfuzuyceyjkihqcv:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2aHRsZnV6dXljZXlqa2locWN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI2MjQ3MSwiZXhwIjoyMDg2ODM4NDcxfQ.DXBBbzQPbusSLKwqwgg0YfMkRKSWJnTnIIZo4gmZ3kQ@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

async function runMigration() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!\n');

    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20260216_create_tasks_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration SQL...\n');
    await client.query(sql);

    console.log('✅ Migration executed successfully!\n');

    // Verify tables were created
    console.log('Verifying tables...');

    const tablesCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('weekly_tasks', 'goals')
    `);

    console.log('\n=== Migration Results ===');
    const tableNames = tablesCheck.rows.map(r => r.table_name);

    if (tableNames.includes('weekly_tasks')) {
      console.log('✅ weekly_tasks table created');
    } else {
      console.log('❌ weekly_tasks table not found');
    }

    if (tableNames.includes('goals')) {
      console.log('✅ goals table created');
    } else {
      console.log('❌ goals table not found');
    }

    if (tableNames.length === 2) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\nYou can now use the tasks feature at your site.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

runMigration().catch(console.error);
