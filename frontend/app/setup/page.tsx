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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-gray-700">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to UrjaBandhu! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Let's set up your electricity connection to get started with smart energy management.
            </p>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Setup</h2>
              <p className="text-gray-600 mb-4">
                Connect your electricity provider account to start tracking your energy consumption and get personalized insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Set Up Connection
                </button>
                <button
                  onClick={handleSkipSetup}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-green-600 text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Real-time Monitoring</h3>
              <p className="text-gray-600">Track your electricity consumption in real-time and identify energy-hungry devices.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-blue-600 text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Analytics</h3>
              <p className="text-gray-600">Get detailed insights and recommendations to optimize your energy usage.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-purple-600 text-3xl mb-4">💡</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Recommendations</h3>
              <p className="text-gray-600">Receive personalized tips to reduce your electricity bills and carbon footprint.</p>
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
