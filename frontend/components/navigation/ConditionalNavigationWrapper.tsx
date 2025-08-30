'use client'

import { usePathname } from 'next/navigation'

interface ConditionalNavigationWrapperProps {
  children: React.ReactNode
}

export default function ConditionalNavigationWrapper({ children }: ConditionalNavigationWrapperProps) {
  const pathname = usePathname()
  
  // For homepage and most pages, render children directly without any navigation since we removed OAuth
  // Only specific authenticated pages would need navigation (but we're bypassing auth)
  if (pathname === '/' || pathname === '/ai-chatbot' || pathname === '/features' || pathname === '/about' || pathname === '/setup' || pathname === '/signout' || pathname?.startsWith('/auth')) {
    return <>{children}</>
  }
  
  // For other pages, still render without navigation for now since we removed auth
  return <>{children}</>
}
