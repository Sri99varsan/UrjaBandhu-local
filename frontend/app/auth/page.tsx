'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Logo } from '@/components/ui/Logo'

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    // Simulate authentication loading time, then redirect to landing/setup page
    const timer = setTimeout(() => {
      router.push('/setup') // Redirect to setup page instead of ai-chatbot directly
    }, 2000) // 2 second delay to show the auth loading

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background Effects - Fixed to cover full page */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-[80px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-600/5 rounded-full blur-[120px] animate-pulse [animation-delay:4s]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Logo and Branding */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
              <Logo className="h-10 w-10" width={40} height={40} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                UrjaBandhu
              </h1>
              <p className="text-gray-400 text-sm">Smart Energy Management</p>
            </div>
          </motion.div>

          {/* Loading Animation */}
          <motion.div
            className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-2xl font-semibold text-white mb-2">
                Welcome Back!
              </h2>
              <p className="text-gray-300">
                Authenticating your account...
              </p>
            </motion.div>

            {/* Loading Spinner */}
            <motion.div
              className="flex items-center justify-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex space-x-2">
                <motion.div
                  className="w-3 h-3 bg-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: 0,
                  }}
                />
                <motion.div
                  className="w-3 h-3 bg-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: 0.2,
                  }}
                />
                <motion.div
                  className="w-3 h-3 bg-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: 0.4,
                  }}
                />
              </div>
            </motion.div>

            {/* Status Text */}
            <motion.p
              className="text-sm text-gray-400 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              Redirecting to your dashboard...
            </motion.p>
          </motion.div>

          {/* Quick Access Note */}
          <motion.div
            className="mt-6 text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <p>This is a demo authentication flow</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
