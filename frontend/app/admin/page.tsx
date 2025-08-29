'use client'

import { useState, useEffect } from 'react'
import { runTeamsMigration, MIGRATION_INSTRUCTIONS } from '@/lib/migrations'
import { createClient } from '@/lib/supabase'
import { Team } from '@/lib/supabase'

export default function AdminPage() {
  const [migrationStatus, setMigrationStatus] = useState<boolean | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkMigrationStatus()
  }, [])

  const checkMigrationStatus = async () => {
    setLoading(true)
    const status = await runTeamsMigration()
    setMigrationStatus(status)
    
    if (status) {
      // Fetch teams if migration is successful
      const supabase = createClient()
      const { data } = await supabase
        .from('teams')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
      
      setTeams(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Database Migration Status</h2>
          
          {loading ? (
            <p className="text-gray-400">Checking migration status...</p>
          ) : migrationStatus ? (
            <div className="text-green-400">
              <p>✅ Teams table exists and is accessible!</p>
              <p className="text-gray-300 mt-2">Found {teams.length} team members</p>
            </div>
          ) : (
            <div className="text-red-400">
              <p>❌ Teams table does not exist</p>
              <p className="text-gray-300 mt-2">Please run the SQL migration</p>
            </div>
          )}
          
          <button
            onClick={checkMigrationStatus}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Recheck Status
          </button>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-4">Migration Instructions</h2>
          <pre className="text-gray-300 text-sm whitespace-pre-wrap bg-slate-900/50 p-4 rounded-lg">
            {MIGRATION_INSTRUCTIONS}
          </pre>
        </div>

        {teams.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Current Team Members</h2>
            <div className="space-y-2">
              {teams.map((team) => (
                <div key={team.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div>
                    <span className="text-white font-medium">{team.name}</span>
                    <span className="text-blue-400 ml-2">- {team.role}</span>
                    {team.department && (
                      <span className="text-gray-400 ml-2">({team.department})</span>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">Order: {team.order_index}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
