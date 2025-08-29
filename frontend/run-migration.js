#!/usr/bin/env node

/**
 * Direct Database Migration Script
 * 
 * This script connects directly to your Supabase database and runs the teams table migration.
 * 
 * Prerequisites:
 * 1. Update your .env.local with real Supabase credentials
 * 2. Install pg package: npm install pg
 * 3. Run: node run-migration.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  // Parse Supabase URL to get database connection details
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    console.error('❌ Please update your .env.local with real Supabase credentials');
    console.log('\n📝 You need:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required for database migrations');
    console.log('Get it from: Supabase Dashboard > Settings > API > service_role key');
    process.exit(1);
  }

  // Extract project ID from URL
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (!projectId) {
    console.error('❌ Invalid Supabase URL format');
    process.exit(1);
  }

  // Database connection config
  const dbConfig = {
    host: `db.${projectId}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: supabaseServiceKey,
    ssl: { rejectUnauthorized: false }
  };

  console.log('🔗 Connecting to Supabase database...');

  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250829051851_create_teams_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📦 Running teams table migration...');
    
    // Run the migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('🎉 Teams table created with sample data');
    console.log('🌐 You can now view the teams section on your website');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Teams table already exists. You can safely ignore this error.');
    }
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Check if pg package is installed
try {
  require('pg');
} catch (error) {
  console.error('❌ pg package not found. Installing...');
  const { execSync } = require('child_process');
  execSync('npm install pg', { stdio: 'inherit' });
  console.log('✅ pg package installed');
}

runMigration().catch(console.error);
