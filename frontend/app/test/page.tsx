'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function SupabaseTest() {
  const [status, setStatus] = useState<string>('Testing...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient()
        
        // Test the connection by trying to get the session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setError(`Auth Error: ${error.message}`)
          setStatus('Connection failed')
        } else {
          setStatus('Connection successful!')
          setError(null)
        }
      } catch (err) {
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setStatus('Connection failed')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-gray-100">
          <h2 className="font-semibold mb-2">Environment Variables:</h2>
          <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}</p>
          <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET'}</p>
        </div>
        
        <div className={`p-4 rounded-lg ${status === 'Connection successful!' ? 'bg-green-100' : 'bg-yellow-100'}`}>
          <h2 className="font-semibold mb-2">Connection Status:</h2>
          <p>{status}</p>
          {error && (
            <div className="mt-2 p-2 bg-red-100 rounded">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
