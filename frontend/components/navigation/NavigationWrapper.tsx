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

  // Don't show any navigation on auth pages
  const isAuthPage = pathname?.startsWith('/auth')
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isAuthPage) {
    // Auth pages get no navigation
    return <>{children}</>
  }

  if (user) {
    // Authenticated users get sidebar layout
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthenticatedSidebar />
        
        {/* Main content area with sidebar offset */}
        <div className="lg:pl-64">
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    )
  }

  // Unauthenticated users get public header
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main>
        {children}
      </main>
    </div>
  )
}
