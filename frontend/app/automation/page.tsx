'use client'

import { Suspense } from 'react'
import { AutomationDashboard } from '@/components/automation/automation-dashboard'

export default function AutomationPage() {
  // In a real app, you'd get this from authentication
  const userId = 'demo-user-1'

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10">
        <Suspense 
          fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg font-medium text-white">Loading automation...</span>
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
