'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Zap, BarChart3, Brain, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function InspiredHomepage() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()

  const handleSearch = () => {
    if (query.trim()) {
      // Store the query in localStorage to pass to chatbot after login
      localStorage.setItem('pendingQuery', query.trim())
      router.push('/login?redirect=dashboard&hasQuery=true')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">
            UrjaBandhu
          </span>
        </motion.div>

        <motion.div 
          className="flex items-center gap-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Button variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium">
            Features
          </Button>
          <Button variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium">
            About
          </Button>
          <Button 
            variant="outline" 
            className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            onClick={() => router.push('/login')}
          >
            Sign In
          </Button>
        </motion.div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Smarter energy{' '}
            <span className="text-blue-600">
              decisions
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto font-light">
            AI-powered insights to optimize your electricity usage and reduce energy costs.
          </p>

          {/* Search Bar */}
          <motion.div 
            className="relative max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div 
              className={`relative bg-white border-2 rounded-2xl p-1 shadow-lg transition-all duration-300 ${
                isFocused ? 'border-blue-500 shadow-blue-100' : 'border-gray-200 shadow-gray-100'
              }`}
            >
              <div className="flex items-center gap-4 px-6 py-4">
                <Search className={`h-5 w-5 transition-colors ${isFocused ? 'text-blue-500' : 'text-gray-400'}`} />
                <Input
                  type="text"
                  placeholder="How can I reduce my electricity bill?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="flex-1 border-0 bg-transparent text-gray-900 placeholder-gray-500 text-lg focus:ring-0 focus:outline-none"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={!query.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
            <span className="text-gray-500 text-sm font-medium">Popular:</span>
            {[
              "Reduce electricity bill",
              "Energy usage patterns",
              "Smart optimization"
            ].map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition-colors duration-200"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div 
        className="bg-gray-50 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful AI tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
                className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
