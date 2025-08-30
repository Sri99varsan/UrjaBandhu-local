// Manual migration runner - Run this once to create the teams table
// Instructions:
// 1. Copy the SQL from supabase/migrations/001_create_teams_table.sql
// 2. Go to your Supabase dashboard -> SQL Editor
// 3. Paste and run the SQL to create the teams table
// 4. The teams page should then work and display the sample data

import { createClient } from '@/lib/supabase'

export async function runTeamsMigration() {
  const supabase = createClient()
  
  // Test if teams table exists by trying to fetch data
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Teams table does not exist. Please run the SQL migration.')
      console.log('SQL file location: supabase/migrations/001_create_teams_table.sql')
      return false
    }
    
    console.log('Teams table exists and is accessible!')
    return true
  } catch (err) {
    console.error('Error checking teams table:', err)
    return false
  }
}

// Instructions for manual setup:
export const MIGRATION_INSTRUCTIONS = `
To set up the teams database:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of: frontend/supabase/migrations/001_create_teams_table.sql
4. Paste and execute the SQL in the Supabase SQL Editor
5. The teams page will then be fully functional at /teams

The migration includes:
- Teams table creation
- Sample team data
- Row Level Security policies
- Updated timestamp triggers
`
