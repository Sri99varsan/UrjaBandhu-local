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

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('Processing authentication...')
        
        // Check if this is a setup request or if we have an OAuth code
        const setupParam = searchParams.get('setup')
        const code = searchParams.get('code')
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        // Check for OAuth errors first
        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription)
          setError(errorDescription || errorParam)
          setStatus('Authentication failed')
          setTimeout(() => {
            router.push('/auth?error=oauth_error')
          }, 2000)
          return
        }

        // If we have a code, exchange it for a session first
        if (code) {
          setStatus('Completing sign in...')
          console.log('OAuth code received, exchanging for session...')
          
          try {
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            
            if (exchangeError) {
              console.error('Error exchanging code for session:', exchangeError)
              setError('Failed to complete authentication')
              setStatus('Authentication failed')
              router.push('/auth?error=session_error')
              return
            }

            if (data.session && data.user) {
              console.log('OAuth successful for user:', data.user.email)
              setStatus('Setting up your account...')
              
              // Trigger a custom event to refresh AuthProvider immediately
              window.dispatchEvent(new CustomEvent('auth-session-refresh'))
              
              // Quick check for existing connections
              const { data: connections } = await supabase
                .from('consumer_connections')
                .select('id')
                .eq('user_id', data.user.id)
                .limit(1)
                .single()
              
              if (!connections) {
                // New user - show setup modal
                console.log('New user detected, showing setup modal')
                setCurrentUserId(data.user.id)
                setShowConsumerSetup(true)
                setIsLoading(false)
              } else {
                // Existing user - redirect immediately
                console.log('Existing user detected, redirecting to AI chatbot')
                window.location.href = '/ai-chatbot'
              }
              return
            }
          } catch (error) {
            console.error('OAuth processing error:', error)
            setError('Authentication failed')
            router.push('/auth?error=oauth_failed')
            return
          }
        }

        // If no code but we have a setup param, check existing session
        setStatus('Verifying session...')
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !sessionData.session) {
          console.log('No valid session found, redirecting to auth')
          router.push('/auth')
          return
        }

        console.log('Session found for user:', sessionData.session.user.email)
        
        // Quick check for existing connections
        const { data: connections } = await supabase
          .from('consumer_connections')
          .select('id')
          .eq('user_id', sessionData.session.user.id)
          .limit(1)
          .single()
        
        // Show setup modal if no connections or setup requested
        if (!connections || setupParam === 'true') {
          console.log('Showing setup modal for user')
          setCurrentUserId(sessionData.session.user.id)
          setShowConsumerSetup(true)
          setIsLoading(false)
        } else {
          console.log('Existing user detected, redirecting to AI chatbot')
          window.location.href = '/ai-chatbot'
        }

      } catch (error) {
        console.error('Auth callback error:', error)
        setError('Authentication failed')
        router.push('/auth?error=callback_failed')
      } finally {
        if (!showConsumerSetup) {
          setIsLoading(false)
        }
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  const handleConsumerSetupComplete = () => {
    setShowConsumerSetup(false)
    // Immediate redirect without delay
    window.location.href = '/ai-chatbot'
  }

  const handleConsumerSetupSkip = () => {
    setShowConsumerSetup(false)
    // Immediate redirect without delay
    window.location.href = '/dashboard'
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
