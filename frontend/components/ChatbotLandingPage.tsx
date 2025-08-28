'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  Activity,
  Brain,
  ArrowRight,
  Mic,
  Send,
  Sparkles,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AnalysisStep {
  id: string
  title: string
  description: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  completed: boolean
}

export default function ChatbotLandingPage({ initialQuery }: { initialQuery?: string | null }) {
  const { user } = useAuth()
  const router = useRouter()
  const [animationPhase, setAnimationPhase] = useState<'entrance' | 'analyzing' | 'results'>('entrance')
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    {
      id: 'power-usage',
      title: 'Power Usage Analysis',
      description: 'Analyzing current device consumption patterns',
      value: '2.4 kWh today',
      icon: Zap,
      completed: false
    },
    {
      id: 'spending',
      title: 'Current Spending',
      description: 'Calculating electricity costs and trends',
      value: '₹127 this month',
      icon: DollarSign,
      completed: false
    },
    {
      id: 'prediction',
      title: 'Month-end Prediction',
      description: 'Forecasting usage and costs',
      value: '₹380 estimated',
      icon: TrendingUp,
      completed: false
    }
  ])
  
  const [currentStep, setCurrentStep] = useState(0)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    // If there's an initial query, skip entrance and go directly to analyzing
    if (initialQuery) {
      setAnimationPhase('analyzing')
      return
    }
    
    // Entrance animation sequence
    const timer1 = setTimeout(() => {
      setAnimationPhase('analyzing')
    }, 2000)

    return () => clearTimeout(timer1)
  }, [initialQuery])

  useEffect(() => {
    if (animationPhase === 'analyzing') {
      // Simulate analysis steps
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = prev + 1
          
          // Mark current step as completed
          setAnalysisSteps(steps => 
            steps.map((step, index) => 
              index === prev ? { ...step, completed: true } : step
            )
          )
          
          if (nextStep >= analysisSteps.length) {
            clearInterval(stepInterval)
            setTimeout(() => {
              setAnimationPhase('results')
              setShowChat(true)
            }, 1000)
            return prev
          }
          
          return nextStep
        })
      }, 1500)

      return () => clearInterval(stepInterval)
    }
  }, [animationPhase, analysisSteps.length])

  const navigateToFullDashboard = () => {
    router.push('/dashboard-full')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0deg,rgba(14,165,233,0.05)_360deg)]" />
      
      {/* Main Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        
        {/* Entrance Animation */}
        <AnimatePresence>
          {animationPhase === 'entrance' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-center"
            >
              <div className="relative">
                {/* Glowing Effect */}
                <motion.div 
                  className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-blue-400/30 rounded-full scale-150"
                  animate={{ 
                    scale: [1.5, 1.8, 1.5],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Main Text */}
                <motion.div 
                  className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-8 py-6 shadow-2xl"
                  initial={{ rotateX: -15 }}
                  animate={{ rotateX: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <motion.h1 
                    className="text-4xl md:text-6xl font-bold text-white mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                  >
                    Let's make{' '}
                    <motion.span 
                      className="bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent"
                      animate={{ 
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{ backgroundSize: '200% 200%' }}
                    >
                      a miracle
                    </motion.span>
                  </motion.h1>
                </motion.div>
              </div>
              
              {/* User Avatar and Search Bar */}
              <motion.div 
                className="flex items-center justify-center gap-4 mt-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar className="h-12 w-12 border-2 border-blue-400/50">
                    <AvatarFallback className="bg-blue-500 text-white font-semibold">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-full px-6 py-3 min-w-[300px]"
                  whileHover={{ scale: 1.02 }}
                >
                  <Brain className="h-5 w-5 text-blue-400" />
                  <span className="text-slate-300 flex-1">Initializing energy analysis...</span>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-4 w-4 text-orange-400" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Phase */}
        <AnimatePresence>
          {animationPhase === 'analyzing' && (
            <motion.div 
              className="w-full max-w-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-white mb-2">Analyzing Your Energy Profile</h2>
                <p className="text-slate-400">Please wait while I examine your electricity usage patterns</p>
              </motion.div>
              
              <div className="space-y-4">
                {analysisSteps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = index === currentStep
                  const isCompleted = step.completed
                  
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2, duration: 0.6 }}
                    >
                      <Card 
                        className={cn(
                          "bg-slate-800/60 backdrop-blur-sm border transition-all duration-500",
                          isActive ? "border-blue-400/50 shadow-lg shadow-blue-400/20" : "border-slate-700/50",
                          isCompleted && "border-green-400/50"
                        )}
                      >
                        <CardContent className="p-6">
                          <motion.div 
                            className="flex items-center gap-4"
                            animate={isActive ? { scale: [1, 1.02, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <motion.div 
                              className={cn(
                                "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                                isCompleted ? "bg-green-500" : isActive ? "bg-blue-500" : "bg-slate-700"
                              )}
                              animate={isActive ? { 
                                boxShadow: [
                                  "0 0 0 0 rgba(59, 130, 246, 0.7)",
                                  "0 0 0 10px rgba(59, 130, 246, 0)",
                                  "0 0 0 0 rgba(59, 130, 246, 0)"
                                ]
                              } : {}}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <Icon className="h-6 w-6 text-white" />
                            </motion.div>
                            
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                              <p className="text-slate-400 text-sm">{step.description}</p>
                            </div>
                            
                            {isCompleted && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, ease: "backOut" }}
                              >
                                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-400/50">
                                  {step.value}
                                </Badge>
                              </motion.div>
                            )}
                            
                            {isActive && (
                              <motion.div 
                                className="flex items-center gap-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <motion.div 
                                  className="w-2 h-2 bg-blue-400 rounded-full"
                                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                />
                                <motion.div 
                                  className="w-2 h-2 bg-blue-400 rounded-full"
                                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                />
                                <motion.div 
                                  className="w-2 h-2 bg-blue-400 rounded-full"
                                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                />
                              </motion.div>
                            )}
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Phase with Chat Interface */}
        {animationPhase === 'results' && (
          <motion.div 
            className="w-full max-w-4xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Analysis Results */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.h2 
                className="text-3xl font-bold text-white mb-2"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5, ease: "backOut" }}
              >
                Analysis Complete!
              </motion.h2>
              <p className="text-slate-400">Here's what I found about your energy usage</p>
            </motion.div>
            
            {/* Quick Stats */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {analysisSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 50, rotateX: -20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ 
                      delay: 0.8 + index * 0.1, 
                      duration: 0.6,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: 5,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50">
                      <CardContent className="p-4 text-center">
                        <motion.div
                          whileHover={{ rotate: 10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-white">{step.value}</h3>
                        <p className="text-slate-400 text-sm">{step.title}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Chat Interface */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50">
                <CardContent className="p-6">
                  <motion.div 
                    className="flex items-start gap-4 mb-6"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                  >
                    <motion.div 
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      animate={{ 
                        boxShadow: [
                          "0 0 0 0 rgba(59, 130, 246, 0.4)",
                          "0 0 0 8px rgba(59, 130, 246, 0)",
                          "0 0 0 0 rgba(59, 130, 246, 0)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Brain className="h-5 w-5 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <motion.div 
                        className="bg-slate-700/50 rounded-lg p-4 mb-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.6, duration: 0.5 }}
                      >
                        <motion.p 
                          className="text-white"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.8, duration: 1 }}
                        >
                          {initialQuery ? (
                            <>
                              Great question: "<em className="text-blue-300">{initialQuery}</em>" <br/><br/>
                              I've analyzed your energy usage in response to your query. Your current consumption is <strong>2.4 kWh today</strong> 
                              with spending at <strong>₹127 this month</strong>. Based on your patterns, I predict you'll spend 
                              <strong> ₹380 by month-end</strong>. Let me provide specific insights related to your question.
                            </>
                          ) : (
                            <>
                              Hello! I've analyzed your energy usage. Your current consumption is <strong>2.4 kWh today</strong> 
                              with spending at <strong>₹127 this month</strong>. Based on your patterns, I predict you'll spend 
                              <strong> ₹380 by month-end</strong>. Would you like me to suggest ways to reduce your electricity bill?
                            </>
                          )}
                        </motion.p>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  {/* Quick Actions */}
                  <motion.div 
                    className="flex flex-wrap gap-2 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 0.6 }}
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-white"
                      >
                        Show savings tips
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-white"
                      >
                        Device breakdown
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-white"
                        onClick={navigateToFullDashboard}
                      >
                        Full dashboard
                      </Button>
                    </motion.div>
                  </motion.div>
                  
                  {/* Input Area */}
                  <motion.div 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.2, duration: 0.6 }}
                  >
                    <div className="flex-1 flex items-center gap-2 bg-slate-700/50 rounded-lg px-4 py-3">
                      <input 
                        type="text" 
                        placeholder="Ask me anything about your energy usage..."
                        className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none"
                      />
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button size="sm" variant="ghost" className="p-1">
                          <Mic className="h-4 w-4 text-blue-400" />
                        </Button>
                      </motion.div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                        <Send className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
              
              {/* Continue to Dashboard */}
              <motion.div 
                className="text-center mt-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.4, duration: 0.6 }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={navigateToFullDashboard}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    Continue to Full Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
        </div>
      </div>
    )
  }
