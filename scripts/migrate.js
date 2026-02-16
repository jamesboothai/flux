#!/usr/bin/env node
/**
 * Automatic SQL Migration Runner for Flux
 * 
 * Usage: node scripts/migrate.js [migration-file.sql]
 * Example: node scripts/migrate.js supabase/migrations/20260216_add_subtasks.sql
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runMigration(sqlFilePath) {
  console.log('🚀 Flux SQL Migration Runner\n');
  console.log(`📁 File: ${sqlFilePath}\n`);

  // Read SQL file
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`❌ File not found: ${sqlFilePath}`);
    process.exit(1);
  }

  let migrationSQL = fs.readFileSync(sqlFilePath, 'utf8');
  
  // Remove comments and parse statements
  migrationSQL = migrationSQL.replace(/--[^\n]*/g, '');
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Found ${statements.length} SQL statement(s)\n`);

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 80).replace(/\s+/g, ' ');
    
    console.log(`[${i + 1}/${statements.length}] ${preview}...`);

    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: stmt + ';'
      });

      if (error) {
        throw error;
      }

      if (data && !data.success) {
        throw new Error(data.error || 'Unknown error');
      }

      console.log('  ✅ Success\n');
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}\n`);
      throw error;
    }
  }

  console.log('✅ Migration completed successfully!\n');
}

// Main
const sqlFile = process.argv[2];

if (!sqlFile) {
  console.log('Usage: node scripts/migrate.js <migration-file.sql>');
  console.log('Example: node scripts/migrate.js supabase/migrations/20260216_add_subtasks.sql');
  process.exit(1);
}

runMigration(sqlFile).catch(err => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});
