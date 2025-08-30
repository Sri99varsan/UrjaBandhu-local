'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    let mounted = true

    const handleAuthCallback = async () => {
      try {
        // Get current session - Supabase may have already handled the OAuth callback
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        console.log('Callback - checking session:', { 
          hasSession: !!session, 
          user: session?.user?.email,
          error: sessionError 
        })

        if (sessionError) {
          console.error('Session error:', sessionError)
          setStatus(`Session error: ${sessionError.message}`)
          setTimeout(() => router.push('/auth'), 3000)
          return
        }

        if (session?.user) {
          setStatus(`Welcome ${session.user.email}! Redirecting...`)
          console.log('User authenticated successfully:', session.user.email)
          
          // Wait a bit for auth state to propagate, then redirect
          setTimeout(() => {
            if (mounted) {
              router.push('/ai-chatbot')
            }
          }, 1500)
          return
        }

        // If no session, check for auth hash fragments (PKCE flow)
        if (typeof window !== 'undefined' && window.location.hash) {
          console.log('Found auth hash, processing...')
          setStatus('Processing OAuth response...')
          
          // Supabase client will automatically handle the hash
          // Just wait a moment and check session again
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession()
            if (retrySession?.user) {
              setStatus(`Welcome ${retrySession.user.email}! Redirecting...`)
              setTimeout(() => router.push('/ai-chatbot'), 1000)
            } else {
              setStatus('Authentication failed - no session found')
              setTimeout(() => router.push('/auth'), 3000)
            }
          }, 2000)
          return
        }

        // Check URL parameters for error
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (error) {
          setStatus(`OAuth Error: ${error} - ${errorDescription}`)
          console.error('OAuth error:', error, errorDescription)
          setTimeout(() => router.push('/auth'), 3000)
          return
        }

        // No session, no hash, no error - redirect to auth
        setStatus('No authentication data found')
        setTimeout(() => router.push('/auth'), 2000)

      } catch (err) {
        console.error('Auth callback error:', err)
        setStatus(`Error: ${err}`)
        setTimeout(() => router.push('/auth'), 3000)
      }
    }

    handleAuthCallback()

    return () => { mounted = false }
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Authentication</h3>
        <p className="text-sm text-gray-500">{status}</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  )
}
