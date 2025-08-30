'use client'

import { Suspense } from 'react'
import { AutomationDashboard } from '@/components/automation/automation-dashboard'
import { theme } from '@/lib/theme'

export default function AutomationPage() {
  // In a real app, you'd get this from authentication
  const userId = 'demo-user-1'

  return (
    <div className={theme.background.base}>
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className={theme.background.grid} />
        <div className={theme.background.orbs.topLeft} />
        <div className={theme.background.orbs.bottomRight} />
      </div>
      
      <div className="relative z-10">
        <Suspense 
          fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <span className={`text-lg font-medium ${theme.text.primary}`}>Loading automation...</span>
              </div>
            </div>
          }
        >
          <AutomationDashboard userId={userId} />
        </Suspense>
      </div>
    </div>
  )
}
