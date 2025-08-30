'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { OAuthDiagnostic } from '@/components/auth/OAuthDiagnostic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, Settings, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import toast from 'react-hot-toast'

interface OAuthStatus {
  isConfigured: boolean
  error?: string
  details: string
}

export default function OAuthTestPage() {
  const [status, setStatus] = useState<OAuthStatus>({ isConfigured: false, details: 'Checking...' })
  const [loading, setLoading] = useState(true)
  const { user, signOut } = useAuth()

  useEffect(() => {
    checkOAuthConfiguration()
  }, [])

  const checkOAuthConfiguration = async () => {
    try {
      setLoading(true)
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

      // Additional checks
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        setStatus({
          isConfigured: false,
          error: 'Missing environment variables',
          details: 'Supabase URL or anonymous key not configured'
        })
        return
      }

      setStatus({
        isConfigured: true,
        details: 'Supabase auth service is accessible. OAuth providers configured in dashboard.'
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

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Sign out failed')
    }
  }

  const testGoogleOAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        toast.error(`OAuth initiation failed: ${error.message}`)
      }
    } catch (error: any) {
      toast.error(`OAuth test failed: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            OAuth Testing & Diagnostics
          </h1>
          <p className="text-gray-300 text-lg">
            Diagnose and test OAuth authentication issues
          </p>
        </div>

        {/* User Status */}
        <Card className="mb-8 bg-white/5 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Current User Status</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 font-medium">✅ Signed In</p>
                  <p className="text-gray-300 text-sm">Email: {user.email}</p>
                  <p className="text-gray-300 text-sm">ID: {user.id}</p>
                  <p className="text-gray-300 text-sm">Provider: {user.app_metadata?.provider || 'email'}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 font-medium">⚠️ Not Signed In</p>
                  <p className="text-gray-300 text-sm">No active authentication session</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/auth">
                      Go to Sign In
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={testGoogleOAuth}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Test Google OAuth
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Status */}
        <Card className="mb-8 bg-white/5 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              OAuth Configuration Check
              <Button
                onClick={checkOAuthConfiguration}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Refresh'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-300">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Checking configuration...
              </div>
            ) : (
              <div>
                <div className={`flex items-center gap-2 mb-2 ${status.isConfigured ? 'text-green-400' : 'text-red-400'}`}>
                  <span>{status.isConfigured ? '✅' : '❌'}</span>
                  <span className="font-medium">
                    {status.isConfigured ? 'Configuration OK' : 'Configuration Issues'}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">{status.details}</p>
                {status.error && (
                  <p className="text-red-400 text-sm mt-1">Error: {status.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diagnostic Tests */}
        <OAuthDiagnostic />

        {/* Quick Links */}
        <Card className="mt-8 bg-white/5 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth">Auth Page</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/callback">Callback Page</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/ai-chatbot">AI Chatbot</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 bg-white/5 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">How to Test OAuth for New Users</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <div>
              <h3 className="font-medium text-white mb-2">For New Users:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>If not signed in, click "Test Google OAuth" above</li>
                <li>You should be redirected to Google's consent screen</li>
                <li>After approving, you should return to /auth/callback</li>
                <li>If you're a new user, you should see the Consumer Setup Modal</li>
                <li>Complete the setup or skip it to continue</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-2">For Existing Users:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Should be redirected directly to the AI Chatbot after OAuth</li>
                <li>No setup modal should appear</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">Common Issues:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>OAuth timeout:</strong> Check internet connection and Supabase status</li>
                <li><strong>Profile creation failed:</strong> Check database permissions</li>
                <li><strong>Redirect loop:</strong> Clear browser cookies and try again</li>
                <li><strong>Modal not showing:</strong> Check console for JavaScript errors</li>
                <li><strong>Session not persisting:</strong> Check if cookies are blocked</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">Performance Optimizations Applied:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-400">
                <li>🚀 Removed all setTimeout delays for instant redirects</li>
                <li>⚡ Streamlined database queries with single() method</li>
                <li>🔄 Added custom event system for immediate session refresh</li>
                <li>💨 Users no longer need to refresh page after OAuth</li>
                <li>🎯 New users redirect directly to setup modal</li>
                <li>🏃‍♂️ Existing users redirect immediately to AI chatbot</li>
                <li>🔍 Enhanced error handling and retry logic</li>
                <li>📊 Added comprehensive diagnostic tools</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
