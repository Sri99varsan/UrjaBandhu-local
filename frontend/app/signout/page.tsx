'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SignOutPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleGoHome = () => {
    router.push('/')
  }

  const handleSignInAgain = () => {
    router.push('/auth')
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center mb-6"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-2xl font-bold text-white mb-4"
          >
            Successfully Signed Out
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-gray-300 mb-6"
          >
            You have been securely signed out of your account. Thank you for using UrjaBandhu!
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-6"
          >
            <p className="text-sm text-gray-400 mb-2">
              Redirecting to homepage in
            </p>
            <div className="text-3xl font-bold text-green-400">{countdown}</div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-3"
          >
            <Button
              onClick={handleGoHome}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold py-3 rounded-xl shadow-lg shadow-green-500/25"
            >
              Go to Homepage
            </Button>
            
            <Button
              onClick={handleSignInAgain}
              variant="ghost"
              className="w-full text-gray-300 hover:text-green-400 hover:bg-white/5 border border-white/20 hover:border-green-400/30 py-3 rounded-xl"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign In Again
            </Button>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-6 pt-4 border-t border-white/10"
          >
            <p className="text-xs text-gray-500">
              Your session data has been cleared for security.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
