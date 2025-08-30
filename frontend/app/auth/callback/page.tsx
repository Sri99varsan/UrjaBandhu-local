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

        console.log('OAuth callback started. Code:', !!code, 'Error:', errorParam)

        // Handle OAuth errors immediately
        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription)
          setError(errorDescription || 'Authentication failed')
          setTimeout(() => router.push('/auth?error=oauth_error'), 1000)
          return
        }

        // Handle successful OAuth callback
        if (code) {
          console.log('Processing OAuth code...')
          setStatus('Exchanging authorization code...')
          
          // Set a maximum timeout for the entire process
          const overallTimeout = setTimeout(() => {
            console.log('Overall process timeout - redirecting anyway')
            // Use environment-based URL
            const baseUrl = window.location.origin
            window.location.href = `${baseUrl}/ai-chatbot`
          }, 8000) // Increased to 8 seconds
          
          try {
            // Exchange code for session with timeout
            const exchangePromise = supabase.auth.exchangeCodeForSession(code)
            const exchangeTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Exchange timeout')), 5000) // Increased timeout
            )
            
            const { data, error: exchangeError } = await Promise.race([
              exchangePromise, 
              exchangeTimeout
            ]) as any
            
            if (exchangeError) {
              console.error('Session exchange failed:', exchangeError)
              clearTimeout(overallTimeout)
              setError('Failed to complete authentication')
              setTimeout(() => router.push('/auth?error=exchange_failed'), 2000)
              return
            }

            if (data.session && data.user) {
              console.log('Authentication successful for:', data.user.email)
              clearTimeout(overallTimeout)
              setStatus('Setting up your account...')
              
              // Store user ID
              setCurrentUserId(data.user.id)
              
              // Give the session time to propagate
              await new Promise(resolve => setTimeout(resolve, 500))
              
              // Quick connection check with very short timeout
              try {
                const connectionCheck = supabase
                  .from('consumer_connections')
                  .select('id')
                  .eq('user_id', data.user.id)
                  .limit(1)
                  .single()
                
                const quickTimeout = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Quick timeout')), 2000) // Increased timeout
                )
                
                const { data: connections } = await Promise.race([
                  connectionCheck, 
                  quickTimeout
                ])
                
                if (!connections) {
                  // New user - show setup modal
                  console.log('New user - showing setup')
                  setShowConsumerSetup(true)
                  setIsLoading(false)
                  return
                } else {
                  // Existing user - redirect immediately
                  console.log('Existing user - redirecting to chatbot')
                  const baseUrl = window.location.origin
                  // Add a small delay to ensure session is set
                  setTimeout(() => {
                    window.location.href = `${baseUrl}/ai-chatbot`
                  }, 1000)
                  return
                }
              } catch (dbError) {
                // Database check failed - assume new user and show setup
                console.log('DB check failed - showing setup for safety')
                setShowConsumerSetup(true)
                setIsLoading(false)
                return
              }
            } else {
              console.error('No session or user data received')
              setError('Authentication failed - no session')
              setTimeout(() => router.push('/auth?error=no_session'), 2000)
              return
            }
          } catch (error) {
            console.error('OAuth exchange error:', error)
            clearTimeout(overallTimeout)
            setError('Authentication failed')
            setTimeout(() => router.push('/auth?error=exchange_error'), 2000)
            return
          }
        }

        // No code - check existing session quickly
        try {
          const sessionCheck = supabase.auth.getSession()
          const sessionTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session timeout')), 3000)
          )
          
          const { data: sessionData, error: sessionError } = await Promise.race([
            sessionCheck,
            sessionTimeout
          ]) as any
          
          if (sessionError || !sessionData.session) {
            console.log('No session found - redirecting to auth')
            router.push('/auth')
            return
          }

          // Has session - redirect to chatbot immediately
          console.log('Existing session found - redirecting')
          const baseUrl = window.location.origin
          window.location.href = `${baseUrl}/ai-chatbot`
          
        } catch (error) {
          console.log('Session check failed - redirecting to auth')
          router.push('/auth')
        }

      } catch (error) {
        console.error('Callback error:', error)
        setError('Authentication failed')
        setTimeout(() => router.push('/auth?error=callback_error'), 2000)
      } finally {
        if (!showConsumerSetup) {
          setTimeout(() => setIsLoading(false), 500)
        }
      }
    }

    // Start immediately
    handleAuthCallback()
  }, [router, searchParams, callbackProcessed])

  const handleConsumerSetupComplete = () => {
    setShowConsumerSetup(false)
    // Immediate redirect to correct URL based on environment
    const baseUrl = window.location.origin
    window.location.href = `${baseUrl}/ai-chatbot`
  }

  const handleConsumerSetupSkip = () => {
    setShowConsumerSetup(false)
    // Redirect to dashboard
    const baseUrl = window.location.origin
    window.location.href = `${baseUrl}/dashboard`
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-electricity-50 to-energy-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">✕</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>Status: {status}</p>
            <p>Redirecting to sign in page...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse [animation-delay:2s]" />
      </div>
      
      <div className="relative z-10 text-center max-w-md mx-auto p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          {status.includes('successful') ? '🎉 Success!' : 'Completing Sign In'}
        </h2>
        <p className="text-gray-300 mb-4">{status}</p>
        <div className="text-sm text-gray-400">
          <p>Please wait, this will only take a moment...</p>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-6">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`bg-green-500 h-2 rounded-full animate-pulse ${isLoading ? 'w-3/5' : 'w-full'}`}
            ></div>
          </div>
        </div>
      </div>

      {/* Consumer Setup Modal */}
      {showConsumerSetup && currentUserId && (
        <ConsumerSetupModal
          isOpen={showConsumerSetup}
          onComplete={handleConsumerSetupComplete}
          onSkip={handleConsumerSetupSkip}
          userId={currentUserId}
        />
      )}
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse [animation-delay:2s]" />
        </div>
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-white">Loading...</span>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
