'use client'

import { Suspense } from 'react'
import { AutomationDashboard } from '@/components/automation/automation-dashboard'

export default function AutomationPage() {
  // In a real app, you'd get this from authentication
  const userId = 'demo-user-1'

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense 
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }
      >
        <AutomationDashboard userId={userId} />
      </Suspense>
    </div>
  )
}
