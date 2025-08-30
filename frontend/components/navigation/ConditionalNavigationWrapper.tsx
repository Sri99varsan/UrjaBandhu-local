'use client'

import { usePathname } from 'next/navigation'
import NavigationWrapper from '@/components/navigation/NavigationWrapper'

interface ConditionalNavigationWrapperProps {
  children: React.ReactNode
}

export default function ConditionalNavigationWrapper({ children }: ConditionalNavigationWrapperProps) {
  const pathname = usePathname()
  
  // For homepage, features, about, auth, setup, and signout pages, render children directly without any navigation
  if (pathname === '/' || pathname === '/features' || pathname === '/about' || pathname === '/setup' || pathname === '/signout' || pathname?.startsWith('/auth')) {
    return <>{children}</>
  }
  
  // For all other pages, use the normal NavigationWrapper
  return <NavigationWrapper>{children}</NavigationWrapper>
}
