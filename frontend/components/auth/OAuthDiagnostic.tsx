'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface DiagnosticResult {
  test: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: any
}

export function OAuthDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [running, setRunning] = useState(false)

  const runDiagnostics = async () => {
    setRunning(true)
    const newResults: DiagnosticResult[] = []

    // Test 1: Supabase Connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      newResults.push({
        test: 'Supabase Connection',
        status: error ? 'error' : 'success',
        message: error ? `Failed: ${error.message}` : 'Connection successful',
        details: error || data
      })
    } catch (error: any) {
      newResults.push({
        test: 'Supabase Connection',
        status: 'error',
        message: `Failed: ${error.message}`,
        details: error
      })
    }

    // Test 2: Auth Session
    try {
      const { data, error } = await supabase.auth.getSession()
      newResults.push({
        test: 'Current Auth Session',
        status: data.session ? 'success' : 'warning',
        message: data.session ? `Logged in as: ${data.session.user?.email}` : 'No active session',
        details: data.session ? {
          userId: data.session.user?.id,
          provider: data.session.user?.app_metadata?.provider,
          email: data.session.user?.email
        } : null
      })
    } catch (error: any) {
      newResults.push({
        test: 'Current Auth Session',
        status: 'error',
        message: `Failed: ${error.message}`,
        details: error
      })
    }

    // Test 3: Profile Check
    try {
      const { data: session } = await supabase.auth.getSession()
      if (session.session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.session.user.id)
          .single()
        
        newResults.push({
          test: 'User Profile',
          status: error ? 'error' : 'success',
          message: error ? `Profile not found: ${error.message}` : 'Profile exists',
          details: data || error
        })
      } else {
        newResults.push({
          test: 'User Profile',
          status: 'warning',
          message: 'Cannot check profile - no user session',
          details: null
        })
      }
    } catch (error: any) {
      newResults.push({
        test: 'User Profile',
        status: 'error',
        message: `Failed: ${error.message}`,
        details: error
      })
    }

    // Test 4: Consumer Connections
    try {
      const { data: session } = await supabase.auth.getSession()
      if (session.session?.user) {
        const { data, error } = await supabase
          .from('consumer_connections')
          .select('*')
          .eq('user_id', session.session.user.id)
        
        newResults.push({
          test: 'Consumer Connections',
          status: error ? 'error' : data?.length ? 'success' : 'warning',
          message: error ? `Failed: ${error.message}` : data?.length ? `Found ${data.length} connections` : 'No connections found',
          details: data || error
        })
      } else {
        newResults.push({
          test: 'Consumer Connections',
          status: 'warning',
          message: 'Cannot check connections - no user session',
          details: null
        })
      }
    } catch (error: any) {
      newResults.push({
        test: 'Consumer Connections',
        status: 'error',
        message: `Failed: ${error.message}`,
        details: error
      })
    }

    // Test 5: OAuth Configuration
    try {
      const isProduction = process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost'
      const currentOrigin = window.location.origin
      
      newResults.push({
        test: 'OAuth Configuration',
        status: 'success',
        message: 'Configuration detected',
        details: {
          environment: isProduction ? 'Production' : 'Development',
          currentOrigin,
          expectedRedirectUrl: `${currentOrigin}/auth/callback`,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        }
      })
    } catch (error: any) {
      newResults.push({
        test: 'OAuth Configuration',
        status: 'error',
        message: `Failed: ${error.message}`,
        details: error
      })
    }

    setResults(newResults)
    setRunning(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <RefreshCw className="h-5 w-5 text-gray-500 animate-spin" />
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-md border border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          OAuth Diagnostic Tool
          <Button 
            onClick={runDiagnostics} 
            disabled={running}
            size="sm"
            variant="outline"
            className="ml-auto"
          >
            {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Re-run Tests'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
            {getIcon(result.status)}
            <div className="flex-1">
              <h3 className="font-medium text-white">{result.test}</h3>
              <p className="text-sm text-gray-300">{result.message}</p>
              {result.details && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-400 cursor-pointer">Show details</summary>
                  <pre className="mt-1 text-xs bg-black/20 p-2 rounded text-gray-300 overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
