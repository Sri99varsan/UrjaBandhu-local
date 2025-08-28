'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { AuthForm } from '@/components/auth/AuthForm'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!loading && user) {
      const redirect = searchParams.get('redirect') || 'dashboard'
      const hasQuery = searchParams.get('hasQuery') === 'true'
      
      if (hasQuery) {
        // If user came from homepage with a query, redirect to dashboard
        // The dashboard will pick up the query from localStorage
        router.push('/dashboard')
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
      <div className="min-h-screen bg-gradient-to-br from-electricity-50 to-energy-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-electricity-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return <AuthForm mode={mode} onToggleMode={toggleMode} />
}
