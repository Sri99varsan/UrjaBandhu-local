'use client'

import { usePathname } from 'next/navigation'
import NavigationWrapper from './NavigationWrapper'

interface ConditionalNavigationWrapperProps {
  children: React.ReactNode
}

export default function ConditionalNavigationWrapper({ children }: ConditionalNavigationWrapperProps) {
  const pathname = usePathname()
  
  // Pages that should have no navigation (homepage, auth, about, features)
  if (pathname === '/' || pathname === '/features' || pathname === '/about' || pathname === '/signout' || pathname?.startsWith('/auth')) {
    return <>{children}</>
  }
  
  // All other pages get full navigation with sidebar
  return (
    <NavigationWrapper>
      {children}
    </NavigationWrapper>
  )
}
