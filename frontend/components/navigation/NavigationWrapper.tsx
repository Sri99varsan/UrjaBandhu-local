'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import PublicHeader from '@/components/navigation/PublicHeader'
import AuthenticatedSidebar from '@/components/navigation/AuthenticatedSidebar'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface NavigationWrapperProps {
  children: React.ReactNode
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [showLoading, setShowLoading] = useState(true)

  // Don't show loading for too long
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false)
    }, 2000) // Only show loading for 2 seconds max

    if (!loading) {
      setShowLoading(false)
      clearTimeout(timer)
    }

    return () => clearTimeout(timer)
  }, [loading])

  // Don't show any navigation on auth pages, homepage, features, or about pages
  const isAuthPage = pathname?.startsWith('/auth')
  const isHomePage = pathname === '/'
  const isFeaturesPage = pathname === '/features'
  const isAboutPage = pathname === '/about'
  
  if (loading && showLoading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (isAuthPage || isHomePage || isFeaturesPage || isAboutPage) {
    // Auth pages, homepage, features, and about pages get no navigation wrapper
    return <>{children}</>
  }

  if (user) {
    // Authenticated users get sidebar layout (for dashboard and other authenticated pages)
    return (
      <div className="min-h-screen bg-black relative">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>
        
        <AuthenticatedSidebar />
        
        {/* Main content area with sidebar offset */}
        <div className="lg:pl-72">
          <main className="min-h-screen relative">
            {children}
          </main>
        </div>
      </div>
    )
  }

  // Unauthenticated users get public header
  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main>
        {children}
      </main>
    </div>
  )
}
