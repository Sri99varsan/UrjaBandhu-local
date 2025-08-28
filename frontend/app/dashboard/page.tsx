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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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