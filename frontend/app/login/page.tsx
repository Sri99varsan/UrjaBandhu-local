'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Redirect to auth page with the same query parameters
    const queryString = searchParams.toString()
    const authUrl = queryString ? `/auth?${queryString}` : '/auth'
    router.replace(authUrl)
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-lg font-medium text-white">Redirecting to login...</span>
      </div>
    </div>
  )
}
