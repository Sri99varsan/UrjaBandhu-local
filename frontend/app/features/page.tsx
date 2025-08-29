'use client'

import { motion } from 'framer-motion'
import { 
  Brain, 
  BarChart3, 
  Settings, 
  Zap, 
  Shield, 
  Clock, 
  TrendingDown, 
  Smartphone,
  ChevronRight 
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const features = [
  {
    icon: Brain,
    title: "AI-Powered Bill Analysis",
    description: "Upload your electricity bill and get instant AI insights on usage patterns, cost optimization opportunities, and personalized recommendations.",
    highlights: ["Smart pattern recognition", "Cost optimization", "Instant insights"],
    badge: "Popular"
  },
  {
    icon: BarChart3,
    title: "Real-time Usage Tracking",
    description: "Monitor your energy consumption in real-time with detailed analytics, historical comparisons, and trend analysis.",
    highlights: ["Live monitoring", "Historical data", "Trend analysis"],
    badge: "Pro"
  },
  {
    icon: Settings,
    title: "Smart Optimization Engine",
    description: "Automated suggestions to reduce energy waste, optimize device usage, and lower your monthly electricity costs.",
    highlights: ["Automated suggestions", "Device optimization", "Cost reduction"],
    badge: "AI"
  },
  {
    icon: Zap,
    title: "Device Management",
    description: "Control and monitor all your smart devices from one centralized dashboard with scheduling and automation features.",
    highlights: ["Centralized control", "Smart scheduling", "Automation"],
    badge: "Smart"
  },
  {
    icon: Shield,
    title: "Energy Security",
    description: "Protect against energy theft and monitor for unusual consumption patterns with advanced security algorithms.",
    highlights: ["Theft detection", "Pattern monitoring", "Security alerts"],
    badge: "Security"
  },
  {
    icon: Clock,
    title: "Predictive Analytics",
    description: "Forecast future energy consumption and costs based on historical data and machine learning algorithms.",
    highlights: ["Future forecasting", "ML algorithms", "Cost prediction"],
    badge: "Advanced"
  },
  {
    icon: TrendingDown,
    title: "Cost Reduction Tools",
    description: "Identify opportunities to reduce energy costs through tariff optimization, peak hour management, and efficiency improvements.",
    highlights: ["Tariff optimization", "Peak hour management", "Efficiency tips"],
    badge: "Savings"
  },
  {
    icon: Smartphone,
    title: "Mobile App Integration",
    description: "Access all features on-the-go with our mobile app, featuring push notifications and remote device control.",
    highlights: ["Mobile access", "Push notifications", "Remote control"],
    badge: "Mobile"
  }
]

export default function FeaturesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 shadow-2xl">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
                <Logo className="h-5 w-5" width={20} height={20} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                UrjaBandhu
              </span>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-2 py-2 shadow-xl">
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="text-gray-300 hover:text-green-400 font-medium hover:bg-white/10 transition-all duration-300" asChild>
                <Link href="/">Home</Link>
              </Button>
              <Button variant="ghost" className="text-green-400 bg-white/10 font-medium transition-all duration-300">
                Features
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-green-400 font-medium hover:bg-white/10 transition-all duration-300" asChild>
                <Link href="/about">About</Link>
              </Button>
              <Button 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold shadow-lg shadow-green-500/25 transition-all duration-300"
                onClick={() => router.push('/auth')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-12">
        {/* Header Section */}
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Powerful{' '}
            <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
              Features
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto font-light">
            Discover all the intelligent tools and features designed to help you optimize your energy consumption and reduce costs.
          </p>
          <Button 
            onClick={() => router.push('/auth')}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold px-8 py-4 text-lg shadow-xl shadow-green-500/25 transition-all duration-300"
          >
            Get Started Now
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl hover:shadow-green-500/20 hover:border-green-500/30 transition-all duration-500 hover:bg-white/10 overflow-hidden">
                  <CardHeader className="relative">
                    {feature.badge && (
                      <Badge 
                        variant="secondary" 
                        className="absolute top-4 right-4 bg-green-500/20 text-green-400 border-green-500/30 text-xs"
                      >
                        {feature.badge}
                      </Badge>
                    )}
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl flex items-center justify-center mb-4 group-hover:from-green-400/30 group-hover:to-emerald-500/30 transition-all duration-300 shadow-lg shadow-green-500/10">
                      <feature.icon className="h-6 w-6 text-green-400 group-hover:text-green-300 transition-colors duration-300" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-white group-hover:text-green-300 transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    <div className="space-y-2">
                      {feature.highlights.map((highlight, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-1 h-1 bg-green-400 rounded-full" />
                          <span className="text-gray-300">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div 
          className="text-center max-w-4xl mx-auto mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Saving Energy?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already saving money and reducing their carbon footprint with UrjaBandhu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push('/auth')}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold px-8 py-4 text-lg shadow-xl shadow-green-500/25 transition-all duration-300"
              >
                Get Started Free
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-green-400/30 text-green-400 hover:bg-green-400/10 px-8 py-4 text-lg transition-all duration-300"
                asChild
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
