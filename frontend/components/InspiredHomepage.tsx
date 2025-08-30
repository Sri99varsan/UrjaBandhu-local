'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, BarChart3, Brain, Settings } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function InspiredHomepage() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()

  const handleSearch = () => {
    if (query.trim()) {
      // Store the query in localStorage to pass to chatbot
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingQuery', query.trim())
      }
      router.push('/ai-chatbot')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-green-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-400/15 rounded-full blur-[80px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-600/10 rounded-full blur-[120px] animate-pulse [animation-delay:4s]" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Smarter energy{' '}
            <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
              decisions
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto font-light">
            AI-powered insights to optimize your electricity usage and reduce energy costs.
          </p>

          {/* Search Bar */}
          <motion.div 
            className="relative max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Glassmorphism Search Container */}
            <div 
              className={`relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1 shadow-2xl transition-all duration-300 ${
                isFocused ? 'border-green-500/50 shadow-green-500/20' : 'border-white/20'
              }`}
            >
              {/* Glow effect */}
              {isFocused && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl -z-10" />
              )}
              
              <div className="flex items-center gap-4 px-6 py-4">
                <Search className={`h-5 w-5 transition-colors ${isFocused ? 'text-green-400' : 'text-gray-400'}`} />
                <Input
                  type="text"
                  placeholder="How can I reduce my electricity bill?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="flex-1 border-0 bg-transparent text-white placeholder-gray-400 text-lg focus:ring-0 focus:outline-none"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={!query.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black px-6 py-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-green-500/25"
                >
                  Analyze
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick Suggestions */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <span className="text-gray-400 text-sm font-medium">Popular:</span>
            {[
              "Reduce electricity bill",
              "Energy usage patterns",
              "Smart optimization"
            ].map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="text-sm bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-gray-300 hover:text-green-400 px-4 py-2 rounded-full transition-all duration-300 hover:border-green-400/30"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div 
        className="relative py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        {/* Glassmorphism background for features section */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful AI tools
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to understand and optimize your energy consumption
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Bill Analysis",
                description: "Upload your electricity bill and get instant insights on usage patterns and cost optimization opportunities."
              },
              {
                icon: BarChart3,
                title: "Usage Tracking",
                description: "Monitor real-time energy consumption with detailed analytics and personalized recommendations."
              },
              {
                icon: Settings,
                title: "Smart Optimization",
                description: "Automated suggestions to reduce energy waste and lower your monthly electricity costs."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group text-center p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl hover:shadow-green-500/20 hover:border-green-500/30 transition-all duration-500 hover:bg-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                {/* Icon with glassmorphism background */}
                <div className="w-16 h-16 bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-green-400/30 group-hover:to-emerald-500/30 transition-all duration-300 shadow-lg shadow-green-500/10">
                  <feature.icon className="h-8 w-8 text-green-400 group-hover:text-green-300 transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-green-300 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
