'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { AuthForm } from '@/components/auth/AuthForm'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthPageContent() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!loading && user) {
      const redirect = searchParams.get('redirect') || 'ai-chatbot'
      const hasQuery = searchParams.get('hasQuery') === 'true'
      
      if (hasQuery) {
        // If user came from homepage with a query, redirect to AI chatbot
        // The AI chatbot will pick up the query from localStorage
        router.push('/ai-chatbot')
      } else {
        router.push(`/${redirect}`)
      }
    }
  }, [user, loading, router, searchParams])

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Background effects */}
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
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return <AuthForm mode={mode} onToggleMode={toggleMode} />
}

export default function AuthPage() {
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
      <AuthPageContent />
    </Suspense>
  )
}
