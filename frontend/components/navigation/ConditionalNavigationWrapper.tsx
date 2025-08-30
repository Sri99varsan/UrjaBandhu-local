'use client'

import { usePathname } from 'next/navigation'
import NavigationWrapper from '@/components/navigation/NavigationWrapper'

interface ConditionalNavigationWrapperProps {
  children: React.ReactNode
}

export default function ConditionalNavigationWrapper({ children }: ConditionalNavigationWrapperProps) {
  const pathname = usePathname()
  
  // For homepage, features, and about pages, render children directly without any navigation
  if (pathname === '/' || pathname === '/features' || pathname === '/about') {
    return <>{children}</>
  }
  
  // For all other pages, use the normal NavigationWrapper
  return <NavigationWrapper>{children}</NavigationWrapper>
}
