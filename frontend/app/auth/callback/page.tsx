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
  const [showConsumerSetup, setShowConsumerSetup] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const safePush = (path: string) => {
      if (!mounted) return
      router.push(path)
    }

    const handleAuthFlow = async () => {
      try {
        const code = searchParams.get('code')
        const errorParam = searchParams.get('error')

        console.log('Auth callback: code?', !!code, 'error?', !!errorParam)

        if (errorParam) {
          setError('OAuth error')
          setIsLoading(false)
          setTimeout(() => safePush('/auth'), 1500)
          return
        }

        // First check if SDK already has session (some flows auto-exchange)
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData?.session?.user) {
          console.log('Session present from SDK')
          await proceedAfterAuth(sessionData.session.user.id)
          return
        }

        // If no session, but code exists, attempt exchange with timeout
        if (code) {
          const exchangePromise = supabase.auth.exchangeCodeForSession(code)
          const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('exchange_timeout')), 8000))

          let result
          try {
            result = await Promise.race([exchangePromise, timeout])
          } catch (e) {
            console.warn('Exchange failed or timed out, checking session again')
            const { data: sessionRetry } = await supabase.auth.getSession()
            if (sessionRetry?.session?.user) {
              await proceedAfterAuth(sessionRetry.session.user.id)
              return
            }

            setError('Authentication timed out')
            setIsLoading(false)
            setTimeout(() => safePush('/auth'), 1500)
            return
          }

          const { data, error: sessionError } = result as any
          if (sessionError) {
            console.error('Session exchange error', sessionError)
            setError('Authentication failed')
            setIsLoading(false)
            setTimeout(() => safePush('/auth'), 1500)
            return
          }

          if (data?.user) {
            await proceedAfterAuth(data.user.id)
            return
          }

          setError('No user after exchange')
          setIsLoading(false)
          setTimeout(() => safePush('/auth'), 1500)
          return
        }

        // No code and no session - redirect to auth
        setError('No authentication information found')
        setIsLoading(false)
        setTimeout(() => safePush('/auth'), 1500)
      } catch (err) {
        console.error('Callback flow error', err)
        setError('Authentication error')
        setIsLoading(false)
        setTimeout(() => safePush('/auth'), 1500)
      }
    }

    const proceedAfterAuth = async (userId: string) => {
      if (!mounted) return
      setCurrentUserId(userId)

      // Check or create profile
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile check error', profileError)
        }

        if (!profile) {
          await supabase.from('profiles').insert([{
            id: userId,
          }])
          // show setup modal for new user
          setShowConsumerSetup(true)
          setIsLoading(false)
          return
        }

        // existing user - check connections
        const { data: connections } = await supabase
          .from('consumer_connections')
          .select('id')
          .eq('user_id', userId)
          .limit(1)

        setIsLoading(false)

        if (!connections || connections.length === 0) {
          setShowConsumerSetup(true)
        } else {
          // final redirect to ai-chatbot
          safePush('/ai-chatbot')
        }
      } catch (e) {
        console.error('post-auth error', e)
        setIsLoading(false)
        safePush('/ai-chatbot')
      }
    }

    handleAuthFlow()

    return () => { mounted = false }
  }, [router, searchParams])

  const onComplete = () => { setShowConsumerSetup(false); router.push('/ai-chatbot') }
  const onSkip = () => { setShowConsumerSetup(false); router.push('/ai-chatbot') }

  if (showConsumerSetup && currentUserId) {
    return (
      <ConsumerSetupModal isOpen={showConsumerSetup} onComplete={onComplete} onSkip={onSkip} userId={currentUserId} />
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
          <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Please wait</h3>
        <p className="mt-2 text-sm text-gray-500">Verifying authentication...</p>
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
