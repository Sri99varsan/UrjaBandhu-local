'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ConsumerSetupModal from '@/components/auth/ConsumerSetupModal'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('Processing authentication...')
  const [showConsumerSetup, setShowConsumerSetup] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [callbackProcessed, setCallbackProcessed] = useState(false)

  useEffect(() => {
    // Prevent multiple executions
    if (callbackProcessed) return

    const handleAuthCallback = async () => {
      try {
        setCallbackProcessed(true)
        setStatus('Completing sign in...')
        
        const code = searchParams.get('code')
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        // Get environment variables for proper configuration
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const appUrl = process.env.NEXT_PUBLIC_APP_URL
        const isProduction = process.env.NODE_ENV === 'production'

        console.log('OAuth callback started', {
          hasCode: !!code,
          error: errorParam,
          environment: isProduction ? 'production' : 'development',
          supabaseUrl: supabaseUrl?.substring(0, 30) + '...',
          appUrl: appUrl,
          currentUrl: window.location.href
        })

        // Handle OAuth errors immediately
        if (errorParam) {
          const errorDetails = {
            error: errorParam,
            description: errorDescription,
            hostname: window.location.hostname,
            origin: window.location.origin,
            fullUrl: window.location.href,
            expectedAppUrl: appUrl,
            timestamp: new Date().toISOString(),
            environment: isProduction ? 'production' : 'development'
          }
          console.error('OAuth error details:', errorDetails)
          
          let errorMessage = 'OAuth authentication failed'
          if (errorParam === 'access_denied') {
            errorMessage = 'Access was denied. Please try again.'
          } else if (errorParam === 'redirect_uri_mismatch') {
            errorMessage = 'OAuth configuration error. Please contact support.'
          }
          
          setError(errorMessage)
          setIsLoading(false)
          
          // Use environment-based redirect URL
          const authUrl = appUrl ? `${appUrl}/auth` : '/auth'
          setTimeout(() => {
            if (appUrl && window.location.origin !== appUrl) {
              window.location.href = authUrl
            } else {
              router.push('/auth')
            }
          }, 3000)
          return
        }

        if (!code) {
          console.error('No OAuth code received')
          setError('No authorization code received')
          setIsLoading(false)
          
          const authUrl = appUrl ? `${appUrl}/auth` : '/auth'
          setTimeout(() => {
            if (appUrl && window.location.origin !== appUrl) {
              window.location.href = authUrl
            } else {
              router.push('/auth')
            }
          }, 3000)
          return
        }

        // Validate environment configuration
        if (!supabaseUrl) {
          console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
          setError('Configuration error: Missing Supabase URL')
          setIsLoading(false)
          return
        }

        // Exchange code for session
        setStatus('Verifying authentication...')
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (sessionError) {
          console.error('Session exchange error:', sessionError)
          setError(`Authentication failed: ${sessionError.message}`)
          setIsLoading(false)
          
          const authUrl = appUrl ? `${appUrl}/auth` : '/auth'
          setTimeout(() => {
            if (appUrl && window.location.origin !== appUrl) {
              window.location.href = authUrl
            } else {
              router.push('/auth')
            }
          }, 3000)
          return
        }

        if (!sessionData?.user) {
          console.error('No user after session exchange')
          setError('Authentication failed: No user data received')
          setIsLoading(false)
          
          const authUrl = appUrl ? `${appUrl}/auth` : '/auth'
          setTimeout(() => {
            if (appUrl && window.location.origin !== appUrl) {
              window.location.href = authUrl
            } else {
              router.push('/auth')
            }
          }, 3000)
          return
        }

        const user = sessionData.user
        setCurrentUserId(user.id)
        console.log('User authenticated:', user.id)

        // Check if user profile exists
        setStatus('Checking user profile...')
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, phone')
          .eq('id', user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile check error:', profileError)
          setError('Failed to check user profile')
          setIsLoading(false)
          return
        }

        // If no profile exists, this is a new user - create profile
        if (!profile) {
          console.log('New user detected, creating profile...')
          setStatus('Setting up your account...')
          
          const { error: profileCreateError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
              last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
              email: user.email,
              phone: null
            }])

          if (profileCreateError) {
            console.error('Profile creation error:', profileCreateError)
            setError('Failed to create user profile')
            setIsLoading(false)
            return
          }
          
          console.log('Profile created for new user')
          
          // Show consumer setup modal for new users
          setIsLoading(false)
          setShowConsumerSetup(true)
          return
        }

        // Existing user - check if they have consumer connections
        setStatus('Checking your connections...')
        const { data: connections, error: connectionError } = await supabase
          .from('consumer_connections')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

        if (connectionError) {
          console.error('Connection check error:', connectionError)
          // Continue to dashboard even if connection check fails
        }

        if (!connections || connections.length === 0) {
          // Existing user with no connections - show setup modal
          console.log('Existing user with no connections, showing setup modal')
          setIsLoading(false)
          setShowConsumerSetup(true)
          return
        }

        // User has connections - go to dashboard
        console.log('User has connections, redirecting to dashboard')
        setStatus('Redirecting to dashboard...')
        
        // Use environment-based redirect URL
        const dashboardUrl = appUrl ? `${appUrl}/dashboard` : '/dashboard'
        if (appUrl && window.location.origin !== appUrl) {
          window.location.href = dashboardUrl
        } else {
          router.push('/dashboard')
        }

      } catch (error) {
        console.error('Callback handling error:', error)
        setError('An unexpected error occurred during authentication')
        setIsLoading(false)
        
        const appUrl = process.env.NEXT_PUBLIC_APP_URL
        const authUrl = appUrl ? `${appUrl}/auth` : '/auth'
        setTimeout(() => {
          if (appUrl && window.location.origin !== appUrl) {
            window.location.href = authUrl
          } else {
            router.push('/auth')
          }
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router, searchParams, callbackProcessed])

  const handleConsumerSetupComplete = () => {
    setShowConsumerSetup(false)
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const dashboardUrl = appUrl ? `${appUrl}/dashboard` : '/dashboard'
    
    if (appUrl && window.location.origin !== appUrl) {
      window.location.href = dashboardUrl
    } else {
      router.push('/dashboard')
    }
  }

  const handleConsumerSetupSkip = () => {
    setShowConsumerSetup(false)
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const dashboardUrl = appUrl ? `${appUrl}/dashboard` : '/dashboard'
    
    if (appUrl && window.location.origin !== appUrl) {
      window.location.href = dashboardUrl
    } else {
      router.push('/dashboard')
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Error</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">{error}</p>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-400">Redirecting to login page...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showConsumerSetup && currentUserId) {
    return (
      <ConsumerSetupModal
        isOpen={showConsumerSetup}
        onComplete={handleConsumerSetupComplete}
        onSkip={handleConsumerSetupSkip}
        userId={currentUserId}
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Please wait</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">{status}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}