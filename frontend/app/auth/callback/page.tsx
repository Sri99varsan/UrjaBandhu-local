'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Initializing...')
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    let mounted = true

    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        console.log('Callback params:', { code: !!code, error, errorDescription })
        setDebugInfo({ code: !!code, error, errorDescription })

        if (error) {
          setStatus(`OAuth Error: ${error} - ${errorDescription}`)
          setTimeout(() => router.push('/auth'), 3000)
          return
        }

        if (!code) {
          setStatus('No authorization code found')
          setTimeout(() => router.push('/auth'), 3000)
          return
        }

        setStatus('Exchanging code for session...')
        
        // Exchange code for session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        console.log('Exchange result:', { data: !!data, error: exchangeError })
        
        if (exchangeError) {
          setStatus(`Session exchange failed: ${exchangeError.message}`)
          console.error('Exchange error details:', exchangeError)
          setTimeout(() => router.push('/auth'), 3000)
          return
        }

        if (!data?.user) {
          setStatus('No user in session data')
          setTimeout(() => router.push('/auth'), 3000)
          return
        }

        setStatus(`User authenticated: ${data.user.email}`)
        console.log('User authenticated successfully:', data.user.email)
        
        // Give a moment for the auth state to update, then redirect
        setTimeout(() => {
          if (mounted) {
            router.push('/ai-chatbot')
          }
        }, 1500)

      } catch (err) {
        console.error('Callback error:', err)
        setStatus(`Unexpected error: ${err}`)
        setTimeout(() => router.push('/auth'), 3000)
      }
    }

    handleCallback()

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
        <h3 className="text-sm font-medium text-gray-900 mb-2">Processing Authentication</h3>
        <p className="text-sm text-gray-500 mb-4">{status}</p>
        {debugInfo && (
          <div className="text-xs text-left bg-gray-100 p-2 rounded">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
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
