'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import PublicHeader from '@/components/navigation/PublicHeader'
import AuthenticatedSidebar from '@/components/navigation/AuthenticatedSidebar'
import { usePathname } from 'next/navigation'

interface NavigationWrapperProps {
  children: React.ReactNode
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Don't show any navigation on auth pages or homepage
  const isAuthPage = pathname?.startsWith('/auth')
  const isHomePage = pathname === '/'
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isAuthPage || isHomePage) {
    // Auth pages and homepage get no navigation
    return <>{children}</>
  }

  if (user) {
    // Authenticated users get sidebar layout
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
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        {children}
      </main>
    </div>
  )
}
