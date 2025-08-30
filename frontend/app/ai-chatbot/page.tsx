'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const ChatbotLandingPage = dynamic(() => import('@/components/ChatbotLandingPage'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading...</div>
})

export default function AIChatbotPage() {
  const [initialQuery, setInitialQuery] = useState<string | null>(null)

  useEffect(() => {
    // Check for pending query from homepage
    if (typeof window !== 'undefined') {
      const pendingQuery = localStorage.getItem('pendingQuery')
      if (pendingQuery) {
        setInitialQuery(pendingQuery)
        localStorage.removeItem('pendingQuery') // Clear it after use
      }
    }
  }, [])

  return <ChatbotLandingPage initialQuery={initialQuery} />
}