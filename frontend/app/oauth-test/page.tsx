'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface OAuthStatus {
  isConfigured: boolean
  error?: string
  details: string
}

export default function OAuthTestPage() {
  const [status, setStatus] = useState<OAuthStatus>({ isConfigured: false, details: 'Checking...' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkOAuthConfiguration()
  }, [])

  const checkOAuthConfiguration = async () => {
    try {
      // Test Supabase connection
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setStatus({
          isConfigured: false,
          error: error.message,
          details: 'Failed to connect to Supabase auth service'
        })
        return
      }

      setStatus({
        isConfigured: true,
        details: 'Supabase auth service is accessible. OAuth configuration depends on Supabase dashboard settings.'
      })
    } catch (error) {
      setStatus({
        isConfigured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to initialize auth service'
      })
    } finally {
      setLoading(false)
    }
  }

  const testGoogleOAuth = async () => {
    try {
      setLoading(true)
      // Use current origin instead of hardcoded URL
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${currentOrigin}/auth/callback`,
        },
      })

      if (error) {
        alert(`OAuth Error: ${error.message}`)
      }
    } catch (error) {
      alert(`Unexpected Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">OAuth Configuration Test</h1>
        
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${status.isConfigured ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'}`}>
            <h3 className="font-semibold text-lg mb-2">
              {status.isConfigured ? '✅ Auth Service Ready' : '❌ Configuration Issue'}
            </h3>
            <p className="text-sm text-gray-700">{status.details}</p>
            {status.error && (
              <p className="text-sm text-red-600 mt-2">Error: {status.error}</p>
            )}
          </div>

          <div className="bg-blue-100 border border-blue-400 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">📋 Setup Checklist</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Supabase project configured</li>
              <li>✅ Frontend OAuth implementation ready</li>
              <li>✅ Auth callback route created</li>
              <li>⚠️ Google OAuth provider needs configuration in Supabase dashboard</li>
            </ul>
          </div>

          <button
            onClick={testGoogleOAuth}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing...' : 'Test Google OAuth'}
          </button>

          <div className="bg-green-100 border border-green-400 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">✅ Performance Optimizations</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>🚀 Removed all setTimeout delays for instant redirects</li>
              <li>⚡ Streamlined database queries with single() method</li>
              <li>🔄 Added custom event system for immediate session refresh</li>
              <li>💨 Users no longer need to refresh page after OAuth</li>
              <li>🎯 New users redirect directly to setup modal</li>
              <li>🏃‍♂️ Existing users redirect immediately to AI chatbot</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
