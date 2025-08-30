'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import ConsumerSetupModal from '@/components/auth/ConsumerSetupModal'

export default function SetupPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      // If user is not authenticated, redirect to auth page
      router.push('/auth')
    }
  }, [user, loading, router])

  const handleSetupComplete = () => {
    setIsModalOpen(false)
    router.push('/ai-chatbot')
  }

  const handleSkipSetup = () => {
    setIsModalOpen(false)
    router.push('/ai-chatbot')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse [animation-delay:2s]" />
        </div>
        
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-white">Loading setup...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-600/5 rounded-full blur-[100px]" />
      </div>
      <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0deg,rgba(34,197,94,0.05)_360deg)]" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to UrjaBandhu! 🎉
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Let's set up your electricity connection to get started with smart energy management.
            </p>
            <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-6 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Quick Setup</h2>
              <p className="text-gray-300 mb-4">
                Connect your electricity provider account to start tracking your energy consumption and get personalized insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg"
                >
                  Set Up Connection
                </button>
                <button
                  onClick={handleSkipSetup}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-200 font-semibold"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-6">
              <div className="text-green-400 text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Monitoring</h3>
              <p className="text-gray-300">Track your electricity consumption in real-time and identify energy-hungry devices.</p>
            </div>
            <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-6">
              <div className="text-blue-400 text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Analytics</h3>
              <p className="text-gray-300">Get detailed insights and recommendations to optimize your energy usage.</p>
            </div>
            <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-6">
              <div className="text-purple-400 text-3xl mb-4">💡</div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Recommendations</h3>
              <p className="text-gray-300">Receive personalized tips to reduce your electricity bills and carbon footprint.</p>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && user && (
        <ConsumerSetupModal
          isOpen={isModalOpen}
          onComplete={handleSetupComplete}
          onSkip={handleSkipSetup}
          userId={user.id}
        />
      )}
    </div>
  )
}
