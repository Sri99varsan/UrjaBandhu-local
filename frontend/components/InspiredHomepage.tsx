'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, BarChart3, Brain, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function InspiredHomepage() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [currentLanguageIndex, setCurrentLanguageIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const router = useRouter()

  // UrjaBandhu in different Indian languages
  const languageTexts = [
    { text: "UrjaBandhu", language: "English" },
    { text: "ऊर्जाबंधु", language: "Hindi" },
    { text: "ఊర్జాబంధు", language: "Telugu" },
    { text: "ऊर्जाबांधव", language: "Marathi" },
    { text: "শক্তিবন্ধু", language: "Bengali" },
    { text: "ऊर्जाबन्धु", language: "Nepali" },
    { text: "ਊਰਜਾਬੰਧੂ", language: "Punjabi" },
    { text: "ऊर्जामित्र", language: "Sanskrit" }
  ]

  useEffect(() => {
    setIsLoaded(true)
    
    let typingTimer: NodeJS.Timeout
    let languageTimer: NodeJS.Timeout
    let currentIndex = 0
    let charIndex = 0
    
    const typeText = () => {
      const currentText = languageTexts[currentIndex].text
      
      if (charIndex < currentText.length) {
        setTypedText(currentText.slice(0, charIndex + 1))
        charIndex++
        typingTimer = setTimeout(typeText, 200) // Slower typing: 120ms -> 200ms
      } else {
        // Wait before erasing - longer display time
        languageTimer = setTimeout(() => {
          eraseText()
        }, 3500) // Longer display: 2000ms -> 3500ms
      }
    }
    
    const eraseText = () => {
      const currentText = languageTexts[currentIndex].text
      
      if (charIndex > 0) {
        setTypedText(currentText.slice(0, charIndex - 1))
        charIndex--
        typingTimer = setTimeout(eraseText, 120) // Slower erasing: 80ms -> 120ms
      } else {
        // Move to next language
        currentIndex = (currentIndex + 1) % languageTexts.length
        setCurrentLanguageIndex(currentIndex)
        setTimeout(typeText, 800) // Longer pause between languages: 500ms -> 800ms
      }
    }
    
    // Start typing
    setTimeout(typeText, 1000)
    
    return () => {
      clearTimeout(typingTimer)
      clearTimeout(languageTimer)
    }
  }, [])

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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Top Navigation Header */}
      <motion.nav 
        className="relative z-50 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-end max-w-7xl mx-auto">
          {/* Navigation Buttons */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/about">
              <Button className="bg-white/5 hover:bg-white/10 border border-white/20 text-gray-300 hover:text-white px-4 py-2 rounded-lg backdrop-blur-md transition-all duration-300 text-sm hover:border-white/30">
                About
              </Button>
            </Link>
            
            <Link href="/features">
              <Button className="bg-white/5 hover:bg-white/10 border border-white/20 text-gray-300 hover:text-white px-4 py-2 rounded-lg backdrop-blur-md transition-all duration-300 text-sm hover:border-white/30">
                Features
              </Button>
            </Link>
            
            <Link href="/ai-chatbot">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black px-6 py-2 rounded-lg font-semibold transition-all duration-300 text-sm">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-green-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-400/15 rounded-full blur-[80px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-600/10 rounded-full blur-[120px] animate-pulse [animation-delay:4s]" />
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:1s] opacity-70" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-emerald-300 rounded-full animate-bounce [animation-delay:3s] opacity-60" />
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:2s] opacity-80" />
        <div className="absolute top-1/6 right-1/3 w-1 h-1 bg-green-300 rounded-full animate-bounce [animation-delay:4s] opacity-50" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 py-12 overflow-visible">
        <motion.div 
          className="text-center max-w-7xl mx-auto w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Dynamic UrjaBandhu Text */}
          <motion.div 
            className="mb-16 py-8"
            initial={{ opacity: 0, scale: 0.8, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.2,
              type: "spring",
              bounce: 0.4
            }}
          >
            <div className="relative overflow-visible min-h-[200px]">
              {/* Enhanced Background glow effect */}
              <div className="absolute inset-0 -inset-y-16 -inset-x-8 bg-gradient-to-r from-green-400/15 via-emerald-500/25 to-green-600/15 blur-[60px] rounded-full animate-pulse" />
              <div className="absolute inset-0 -inset-y-8 -inset-x-4 bg-gradient-to-r from-green-500/10 via-emerald-400/20 to-green-500/10 blur-[40px] rounded-full animate-pulse [animation-delay:1s]" />
              
              {/* Main text */}
              <motion.h2 
                className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black text-center tracking-tight leading-[1.1] py-4 min-h-[1.5em] overflow-visible"
                animate={{ 
                  textShadow: [
                    "0 0 30px rgba(34, 197, 94, 0.4)",
                    "0 0 60px rgba(34, 197, 94, 0.7)",
                    "0 0 30px rgba(34, 197, 94, 0.4)"
                  ]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="bg-gradient-to-r from-green-300 via-emerald-400 to-green-500 bg-clip-text text-transparent drop-shadow-2xl">
                  {typedText}
                </span>
                <motion.span 
                  className="text-green-400 ml-2"
                  animate={{ 
                    opacity: [1, 0, 1],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  |
                </motion.span>
              </motion.h2>
            </div>
          </motion.div>

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
              {/* Enhanced Glow effect - properly aligned */}
              {isFocused && (
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-lg" />
              )}
              
              <div className="relative flex items-center gap-4 px-6 py-4 bg-white/5 rounded-xl backdrop-blur-sm">
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
            className="flex flex-wrap items-center justify-center gap-3 mb-12"
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

      {/* Navigation Buttons Section */}
      <motion.div 
        className="relative py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Explore UrjaBandhu
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover our features, learn about our mission, or get started with your energy optimization journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* About Button */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/about">
                <div className="group p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl hover:shadow-green-500/20 hover:border-green-500/30 transition-all duration-500 hover:bg-white/10 cursor-pointer">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-400/30 group-hover:to-indigo-500/30 transition-all duration-300 shadow-lg shadow-blue-500/10">
                      <svg className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-300 transition-colors duration-300">About Us</h3>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">Learn about our mission to make energy optimization accessible to everyone</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Features Button */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/features">
                <div className="group p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/30 transition-all duration-500 hover:bg-white/10 cursor-pointer">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-400/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-purple-400/30 group-hover:to-pink-500/30 transition-all duration-300 shadow-lg shadow-purple-500/10">
                      <svg className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-purple-300 transition-colors duration-300">Features</h3>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">Explore all the powerful tools and features we offer for energy optimization</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Get Started Button */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/ai-chatbot">
                <div className="group p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl hover:shadow-green-500/20 hover:border-green-500/30 transition-all duration-500 hover:bg-white/10 cursor-pointer">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-green-400/30 group-hover:to-emerald-500/30 transition-all duration-300 shadow-lg shadow-green-500/10">
                      <svg className="h-8 w-8 text-green-400 group-hover:text-green-300 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-green-300 transition-colors duration-300">Get Started</h3>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">Start your energy optimization journey with our AI-powered landing page</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Alternative Get Started CTA */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <Link href="/ai-chatbot">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold px-8 py-4 text-lg rounded-2xl shadow-lg shadow-green-500/25 transition-all duration-300">
                Start Optimizing Now
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
