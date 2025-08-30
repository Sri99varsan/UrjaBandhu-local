'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react'

interface DiagnosticResult {
  test: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string
  action?: string
}

export default function ProductionOAuthDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [environment, setEnvironment] = useState<'development' | 'production'>('development')

  useEffect(() => {
    // Detect environment
    const isProduction = process.env.NODE_ENV === 'production' || 
                        window.location.hostname !== 'localhost'
    setEnvironment(isProduction ? 'production' : 'development')
  }, [])

  const runDiagnostics = async () => {
    setIsRunning(true)
    const diagnosticResults: DiagnosticResult[] = []

    // Test 1: Environment Detection
    const isProduction = environment === 'production'
    diagnosticResults.push({
      test: 'Environment Detection',
      status: 'pass',
      message: `Running in ${environment} mode`,
      details: `Hostname: ${window.location.hostname}, Origin: ${window.location.origin}`
    })

    // Test 2: Environment Variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!supabaseUrl || !supabaseKey) {
      diagnosticResults.push({
        test: 'Environment Variables',
        status: 'fail',
        message: 'Missing required environment variables',
        details: `SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}, SUPABASE_KEY: ${supabaseKey ? '✅' : '❌'}, APP_URL: ${appUrl || 'Not set'}`,
        action: 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your hosting platform'
      })
    } else {
      diagnosticResults.push({
        test: 'Environment Variables',
        status: 'pass',
        message: 'Required environment variables present',
        details: `SUPABASE_URL: ${supabaseUrl}, APP_URL: ${appUrl || window.location.origin}`
      })
    }

    // Test 3: Supabase Connection
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        diagnosticResults.push({
          test: 'Supabase Connection',
          status: 'fail',
          message: 'Failed to connect to Supabase',
          details: error.message,
          action: 'Check Supabase URL and API key'
        })
      } else {
        diagnosticResults.push({
          test: 'Supabase Connection',
          status: 'pass',
          message: 'Successfully connected to Supabase',
          details: `Session: ${data.session ? 'Active' : 'None'}`
        })
      }
    } catch (err) {
      diagnosticResults.push({
        test: 'Supabase Connection',
        status: 'fail',
        message: 'Connection error',
        details: err instanceof Error ? err.message : 'Unknown error',
        action: 'Check network connectivity and Supabase configuration'
      })
    }

    // Test 4: OAuth Provider Configuration
    try {
      // Check if we can access the auth providers (this will fail if not configured)
      const { data: { providers }, error } = await supabase.auth.getOAuthSignInUrl({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        diagnosticResults.push({
          test: 'OAuth Provider Configuration',
          status: 'fail',
          message: 'Google OAuth not properly configured',
          details: error.message,
          action: 'Configure Google OAuth in Supabase Dashboard → Authentication → Providers'
        })
      } else {
        diagnosticResults.push({
          test: 'OAuth Provider Configuration',
          status: 'pass',
          message: 'Google OAuth provider accessible',
          details: 'Google provider configuration appears valid'
        })
      }
    } catch (err) {
      diagnosticResults.push({
        test: 'OAuth Provider Configuration',
        status: 'warning',
        message: 'Could not verify OAuth configuration',
        details: err instanceof Error ? err.message : 'Unknown error',
        action: 'Manually verify Google OAuth is enabled in Supabase Dashboard'
      })
    }

    // Test 5: URL Configuration Check
    const expectedRedirectUrl = `${window.location.origin}/auth/callback`
    const supabaseRedirectUrl = `${supabaseUrl}/auth/v1/callback`
    
    diagnosticResults.push({
      test: 'URL Configuration',
      status: 'warning',
      message: 'Manual verification required',
      details: `App callback: ${expectedRedirectUrl}, Supabase callback: ${supabaseRedirectUrl}`,
      action: 'Verify these URLs are configured in Google OAuth Console'
    })

    // Test 6: Database Tables
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      if (error) {
        diagnosticResults.push({
          test: 'Database Tables',
          status: 'fail',
          message: 'Cannot access profiles table',
          details: error.message,
          action: 'Run database migrations or check table permissions'
        })
      } else {
        diagnosticResults.push({
          test: 'Database Tables',
          status: 'pass',
          message: 'Database tables accessible',
          details: 'Profiles table can be queried successfully'
        })
      }
    } catch (err) {
      diagnosticResults.push({
        test: 'Database Tables',
        status: 'fail',
        message: 'Database access error',
        details: err instanceof Error ? err.message : 'Unknown error',
        action: 'Check database configuration and RLS policies'
      })
    }

    setResults(diagnosticResults)
    setIsRunning(false)
  }

  const testOAuth = async () => {
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
        alert(`OAuth test failed: ${error.message}`)
      }
    } catch (err) {
      alert(`OAuth test error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔧 Production OAuth Diagnostic
          </h1>
          <p className="text-gray-300 text-lg">
            Diagnose OAuth issues in {environment} environment
          </p>
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium mt-4 ${
            environment === 'production' 
              ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }`}>
            {environment.toUpperCase()} MODE
          </div>
        </div>

        <Card className="mb-6 bg-gray-800/50 backdrop-blur border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <RefreshCw className={`h-5 w-5 ${isRunning ? 'animate-spin' : ''}`} />
              Diagnostic Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button 
                onClick={runDiagnostics} 
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? 'Running Tests...' : 'Run Full Diagnostic'}
              </Button>
              <Button 
                onClick={testOAuth} 
                variant="outline"
                className="border-green-600 text-green-400 hover:bg-green-600/20"
              >
                Test OAuth Flow
              </Button>
            </div>

            {results.length > 0 && (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border border-gray-600 rounded-lg p-4 bg-gray-800/30">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{result.test}</h3>
                        <p className="text-gray-300 text-sm mb-2">{result.message}</p>
                        {result.details && (
                          <p className="text-gray-400 text-xs mb-2 font-mono bg-gray-900/50 p-2 rounded">
                            {result.details}
                          </p>
                        )}
                        {result.action && (
                          <p className="text-yellow-300 text-xs">
                            <strong>Action:</strong> {result.action}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Guide */}
        <Card className="mb-6 bg-gray-800/50 backdrop-blur border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Production OAuth Configuration Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">1. Google OAuth Console Setup</h3>
              <div className="bg-gray-900/50 p-3 rounded text-sm font-mono">
                <p className="text-yellow-300 mb-2">Required URLs for Google OAuth Console:</p>
                <p>Authorized JavaScript Origins:</p>
                <p className="text-green-300">• {window.location.origin}</p>
                <p className="text-green-300">• https://ygjdvufbiobntseveoia.supabase.co</p>
                <p className="mt-2">Authorized Redirect URIs:</p>
                <p className="text-green-300">• https://ygjdvufbiobntseveoia.supabase.co/auth/v1/callback</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Google Console
              </Button>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">2. Supabase Dashboard Setup</h3>
              <div className="bg-gray-900/50 p-3 rounded text-sm">
                <p className="text-yellow-300 mb-2">Required configuration:</p>
                <p>• Site URL: <span className="text-green-300">{window.location.origin}</span></p>
                <p>• Redirect URLs: <span className="text-green-300">{window.location.origin}/auth/callback</span></p>
                <p>• Google OAuth Provider: Enabled with Client ID/Secret</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.open('https://supabase.com/dashboard/project/ygjdvufbiobntseveoia/auth/settings', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Supabase Dashboard
              </Button>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">3. Environment Variables (Vercel)</h3>
              <div className="bg-gray-900/50 p-3 rounded text-sm font-mono">
                <p className="text-yellow-300 mb-2">Required environment variables:</p>
                <p>NEXT_PUBLIC_SUPABASE_URL=https://ygjdvufbiobntseveoia.supabase.co</p>
                <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]</p>
                <p>NEXT_PUBLIC_APP_URL={window.location.origin}</p>
                <p>NODE_ENV=production</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-white mb-2">Current Environment</h4>
                <div className="bg-gray-900/50 p-3 rounded font-mono text-gray-300">
                  <p>Hostname: {window.location.hostname}</p>
                  <p>Origin: {window.location.origin}</p>
                  <p>Node Env: {process.env.NODE_ENV}</p>
                  <p>User Agent: {navigator.userAgent.substring(0, 50)}...</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Expected URLs</h4>
                <div className="bg-gray-900/50 p-3 rounded font-mono text-gray-300">
                  <p>App Callback: {window.location.origin}/auth/callback</p>
                  <p>Supabase Callback: https://ygjdvufbiobntseveoia.supabase.co/auth/v1/callback</p>
                  <p>OAuth Test: {window.location.origin}/oauth-test</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
