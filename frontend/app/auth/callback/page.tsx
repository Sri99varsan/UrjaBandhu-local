'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('Processing authentication...')
        
        // Get the code from URL parameters
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

        // If there's a code, exchange it for a session
        if (code) {
          setStatus('Exchanging code for session...')
          
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError)
            setError('Failed to complete authentication')
            setStatus('Session exchange failed')
            setTimeout(() => {
              router.push('/auth?error=session_error')
            }, 2000)
            return
          }

          if (data.session && data.user) {
            console.log('Authentication successful:', data.user.email)
            setStatus('Authentication successful! Checking setup...')
            
            // Clear any existing auth state and set new session
            await supabase.auth.setSession(data.session)
            
            // Check if user has any consumer connections
            const { data: connections, error: connectionsError } = await supabase
              .from('consumer_connections')
              .select('id')
              .eq('user_id', data.user.id)
              .limit(1)
            
            if (connectionsError) {
              console.error('Error checking connections:', connectionsError)
              // If there's an error checking connections, proceed to dashboard
              setTimeout(() => {
                window.location.href = '/dashboard'
              }, 1500)
              return
            }
            
            // If no connections found, redirect to setup
            if (!connections || connections.length === 0) {
              setStatus('Setting up your account...')
              setTimeout(() => {
                window.location.href = '/setup/consumer-id'
              }, 1500)
            } else {
              setStatus('Redirecting to dashboard...')
              setTimeout(() => {
                window.location.href = '/dashboard'
              }, 1500)
            }
          } else {
            setError('No session created')
            setStatus('No session created')
            setTimeout(() => {
              router.push('/auth?error=no_session')
            }, 2000)
          }
        } else {
          // No code parameter, try to get existing session
          setStatus('Checking existing session...')
          
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            console.error('Session error:', sessionError)
            setError('Session error')
            setStatus('Session check failed')
            setTimeout(() => {
              router.push('/auth?error=session_error')
            }, 2000)
            return
          }

          if (sessionData.session) {
            setStatus('Session found! Checking setup...')
            
            // Check if user has any consumer connections
            const { data: connections, error: connectionsError } = await supabase
              .from('consumer_connections')
              .select('id')
              .eq('user_id', sessionData.session.user.id)
              .limit(1)
            
            if (connectionsError) {
              console.error('Error checking connections:', connectionsError)
              // If there's an error, proceed to dashboard
              setTimeout(() => {
                window.location.href = '/dashboard'
              }, 1000)
              return
            }
            
            // If no connections found, redirect to setup
            if (!connections || connections.length === 0) {
              setTimeout(() => {
                window.location.href = '/setup/consumer-id'
              }, 1000)
            } else {
              setTimeout(() => {
                window.location.href = '/dashboard'
              }, 1000)
            }
          } else {
            setStatus('No session found')
            setTimeout(() => {
              router.push('/auth')
            }, 1000)
          }
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        setError('Unexpected error occurred')
        setStatus('Unexpected error')
        setTimeout(() => {
          router.push('/auth?error=unexpected_error')
        }, 2000)
      } finally {
        setIsLoading(false)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

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
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />
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
          <p>Please wait, this may take a few moments...</p>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-6">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{width: isLoading ? '60%' : '100%'}}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
