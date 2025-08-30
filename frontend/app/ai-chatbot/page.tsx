'use client'

import { useEffect, useState } from 'react'
import ChatbotLandingPage from '@/components/ChatbotLandingPage'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [initialQuery, setInitialQuery] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !user) {
      router.push('/auth')
      return
    }

    // Check for pending query from homepage
    if (typeof window !== 'undefined') {
      const pendingQuery = localStorage.getItem('pendingQuery')
      if (pendingQuery) {
        setInitialQuery(pendingQuery)
        localStorage.removeItem('pendingQuery') // Clear it after use
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-white">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to auth
  }

  return <ChatbotLandingPage initialQuery={initialQuery} />
}