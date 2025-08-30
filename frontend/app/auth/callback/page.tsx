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
          
          // Add production environment detection
          const isProduction = process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost'
          console.log('Environment detected:', isProduction ? 'Production' : 'Development')
          
          // Set a maximum timeout for the entire process
          const overallTimeout = setTimeout(() => {
            console.log('Overall process timeout - redirecting anyway')
            // Use environment-based URL
            const baseUrl = window.location.origin
            window.location.href = `${baseUrl}/ai-chatbot`
          }, isProduction ? 15000 : 8000) // Longer timeout for production
          
          try {
            // Add retry logic for production
            let retryCount = 0
            const maxRetries = isProduction ? 3 : 1
            let exchangeData = null
            let exchangeError = null
            
            while (retryCount < maxRetries && !exchangeData) {
              if (retryCount > 0) {
                console.log(`Retry attempt ${retryCount} for session exchange...`)
                setStatus(`Retrying authentication... (${retryCount}/${maxRetries})`)
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // Progressive delay
              }
              
              try {
                // Exchange code for session with timeout
                const exchangePromise = supabase.auth.exchangeCodeForSession(code)
                const exchangeTimeout = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Exchange timeout')), isProduction ? 10000 : 5000)
                )
                
                const result = await Promise.race([
                  exchangePromise, 
                  exchangeTimeout
                ]) as any
                
                exchangeData = result.data
                exchangeError = result.error
                
                if (exchangeError) {
                  console.error(`Exchange attempt ${retryCount + 1} failed:`, exchangeError)
                  retryCount++
                } else {
                  break
                }
              } catch (error) {
                console.error(`Exchange attempt ${retryCount + 1} threw error:`, error)
                exchangeError = error
                retryCount++
              }
            }
            
            const { data, error: finalExchangeError } = { data: exchangeData, error: exchangeError }
            
            if (finalExchangeError) {
              console.error('All session exchange attempts failed:', finalExchangeError)
              clearTimeout(overallTimeout)
              
              // In production, try direct redirect with session check
              if (isProduction) {
                console.log('Production fallback: Checking for existing session...')
                setStatus('Checking authentication status...')
                
                try {
                  const { data: sessionData } = await supabase.auth.getSession()
                  if (sessionData.session) {
                    console.log('Found existing session in production fallback')
                    const baseUrl = window.location.origin
                    window.location.href = `${baseUrl}/ai-chatbot`
                    return
                  }
                } catch (sessionError) {
                  console.error('Session check also failed:', sessionError)
                }
              }
              
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
              
              // Give the session time to propagate (longer in production)
              await new Promise(resolve => setTimeout(resolve, isProduction ? 1500 : 500))
              
              // Quick connection check with production-aware timeout
              try {
                const connectionCheck = supabase
                  .from('consumer_connections')
                  .select('id')
                  .eq('user_id', data.user.id)
                  .limit(1)
                  .single()
                
                const quickTimeout = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('DB timeout')), isProduction ? 5000 : 2000)
                )
                
                const { data: connections } = await Promise.race([
                  connectionCheck, 
                  quickTimeout
                ]) as any
                
                if (!connections) {
                  // New user - show setup modal
                  console.log('New user detected - no consumer connections found')
                  setStatus('Welcome! Setting up your account...')
                  setShowConsumerSetup(true)
                  setIsLoading(false)
                  return
                } else {
                  // Existing user - redirect immediately
                  console.log('Existing user found - redirecting to dashboard')
                  const baseUrl = window.location.origin
                  setStatus('Redirecting to your dashboard...')
                  // Add a delay to ensure session is set (longer in production)
                  setTimeout(() => {
                    window.location.href = `${baseUrl}/ai-chatbot`
                  }, isProduction ? 2000 : 1000)
                  return
                }
              } catch (dbError) {
                // Database check failed - handle based on environment
                console.error('Consumer connections check failed:', dbError)
                console.log('User ID:', data.user.id)
                console.log('Error details:', JSON.stringify(dbError))
                
                if (isProduction) {
                  // In production, assume new user and show setup after longer wait
                  console.log('Production DB check failed - assuming new user, showing setup after delay')
                  setStatus('Setting up new account...')
                  setTimeout(() => {
                    setShowConsumerSetup(true)
                    setIsLoading(false)
                  }, 2000)
                } else {
                  // In development, show setup immediately
                  console.log('Development DB check failed - showing setup immediately')
                  setStatus('Setting up your account...')
                  setShowConsumerSetup(true)
                  setIsLoading(false)
                }
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
          console.log('No OAuth code found - checking for existing session')
          setStatus('Checking authentication status...')
          
          const sessionCheck = supabase.auth.getSession()
          const sessionTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session timeout')), 3000)
          )
          
          const { data: sessionData, error: sessionError } = await Promise.race([
            sessionCheck,
            sessionTimeout
          ]) as any
          
          if (sessionError || !sessionData.session) {
            console.log('No session found - redirecting to auth page')
            setError('No authentication session found. Please sign in again.')
            setTimeout(() => router.push('/auth'), 2000)
            return
          }

          // Has session - check if user needs setup or can go to dashboard
          console.log('Existing session found for user:', sessionData.session.user?.email)
          setCurrentUserId(sessionData.session.user.id)
          
          try {
            const { data: connections } = await supabase
              .from('consumer_connections')
              .select('id')
              .eq('user_id', sessionData.session.user.id)
              .limit(1)
              .single()
            
            if (!connections) {
              console.log('Existing user but no connections - showing setup')
              setShowConsumerSetup(true)
              setIsLoading(false)
            } else {
              console.log('Existing user with connections - redirecting to dashboard')
              const baseUrl = window.location.origin
              setStatus('Redirecting to your dashboard...')
              setTimeout(() => {
                window.location.href = `${baseUrl}/ai-chatbot`
              }, 1000)
            }
          } catch (dbError) {
            console.log('Database check failed for existing session - showing setup')
            setShowConsumerSetup(true)
            setIsLoading(false)
          }
          
        } catch (error) {
          console.error('Session check failed:', error)
          setError('Failed to verify authentication. Please sign in again.')
          setTimeout(() => router.push('/auth'), 2000)
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
