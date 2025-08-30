/**
 * AI Energy Insights Dashboard
 * Advanced AI-powered energy optimization and insights
 */

'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { 
  useEnergyInsights, 
  useSmartRecommendations, 
  useEnergyPatterns, 
  useEnvironmentalImpact,
  useEnergyEfficiencyScore 
} from '@/hooks/useEnergyOptimization'
import {
  Brain,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Leaf,
  Target,
  Zap,
  Clock,
  DollarSign,
  Award,
  AlertTriangle,
  CheckCircle,
  Play,
  BarChart3,
  Gauge,
  Calendar,
  Settings,
  Download,
  Share2,
  Sparkles,
  ThermometerSun,
  TreePine,
  Recycle,
  Battery
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'

export default function AIInsightsDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('insights')

  // Hooks for AI-powered data
  const { insights, loading: insightsLoading, refetch: refetchInsights } = useEnergyInsights(user?.id || 'demo-user-1', true)
  const { recommendations, loading: recommendationsLoading, executeRecommendation, executingActions } = useSmartRecommendations(user?.id || 'demo-user-1')
  const { patterns, loading: patternsLoading } = useEnergyPatterns(user?.id || 'demo-user-1')
  const { impact, loading: impactLoading } = useEnvironmentalImpact(user?.id || 'demo-user-1')
  const { score, loading: scoreLoading } = useEnergyEfficiencyScore(user?.id || 'demo-user-1')

  if (!loading && !user) {
    router.push('/auth')
    return null
  }

  const handleExecuteRecommendation = async (recommendationId: string, title: string) => {
    const success = await executeRecommendation(recommendationId)
    if (success) {
      toast.success(`Successfully executed: ${title}`)
    } else {
      toast.error(`Failed to execute: ${title}`)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'cost_saving': return <DollarSign className="h-5 w-5" />
      case 'efficiency': return <Gauge className="h-5 w-5" />
      case 'behavioral': return <Brain className="h-5 w-5" />
      case 'predictive': return <TrendingUp className="h-5 w-5" />
      case 'environmental': return <Leaf className="h-5 w-5" />
      default: return <Lightbulb className="h-5 w-5" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'cost_saving': return 'text-green-400'
      case 'efficiency': return 'text-blue-400'
      case 'behavioral': return 'text-purple-400'
      case 'predictive': return 'text-orange-400'
      case 'environmental': return 'text-emerald-400'
      default: return 'text-gray-400'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`

  if (loading || insightsLoading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse [animation-delay:2s]" />
        
        <div className="flex items-center space-x-3 bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6 relative z-10">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-white">Loading AI Insights...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse [animation-delay:2s]" />
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10 p-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
              <Brain className="h-8 w-8 text-green-400" />
              AI Energy Insights
            </h1>
            <p className="text-gray-400 mt-2">Intelligent energy analysis powered by AI to optimize your consumption and reduce costs</p>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                refetchInsights()
                toast.success('Insights refreshed!')
              }}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Refresh Analysis
            </Button>
            <Button>
              <Share2 className="h-4 w-4 mr-2" />
              Share Report
            </Button>
          </div>
        </motion.div>

        {/* Energy Efficiency Score */}
        {score && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl hover:bg-gray-800/40 hover:border-green-500/40 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <Award className="h-5 w-5" />
                  Energy Efficiency Score
                </CardTitle>
                <CardDescription className="text-gray-300">
                  AI-powered efficiency rating based on your energy usage patterns and optimization potential
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                          cx="50%" 
                          cy="50%" 
                          innerRadius="60%" 
                          outerRadius="90%" 
                          data={[{ value: score.overall_score * 10 }]}
                        >
                          <RadialBar 
                            dataKey="value" 
                            cornerRadius={10} 
                            fill="#10b981" 
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{score.overall_score}/10</div>
                          <div className="text-xs text-gray-400">Overall</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{score.benchmark_comparison}</p>
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="font-medium text-white">Category Breakdown</h4>
                    {Object.entries(score.category_scores).map(([category, value]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{category}</span>
                          <span className="text-green-400">{value}/10</span>
                        </div>
                        <Progress value={value * 10} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg">
              <TabsTrigger value="insights" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/50 rounded-lg transition-all duration-200">
                <Lightbulb className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 data-[state=active]:border-blue-500/50 rounded-lg transition-all duration-200">
                <Target className="h-4 w-4 mr-2" />
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="patterns" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:border-purple-500/50 rounded-lg transition-all duration-200">
                <BarChart3 className="h-4 w-4 mr-2" />
                Patterns
              </TabsTrigger>
              <TabsTrigger value="environmental" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/50 rounded-lg transition-all duration-200">
                <TreePine className="h-4 w-4 mr-2" />
                Environmental
              </TabsTrigger>
              <TabsTrigger value="automation" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 data-[state=active]:border-orange-500/50 rounded-lg transition-all duration-200">
                <Settings className="h-4 w-4 mr-2" />
                Automation
              </TabsTrigger>
            </TabsList>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid gap-6">
                {insights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl hover:bg-gray-800/40 hover:border-green-500/40 transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-gray-700/40 backdrop-blur-sm border border-white/10 ${getInsightColor(insight.type)}`}>
                              {getInsightIcon(insight.type)}
                            </div>
                            <div>
                              <CardTitle className="text-white">{insight.title}</CardTitle>
                              <CardDescription className="mt-1 text-gray-300">{insight.description}</CardDescription>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={getImpactColor(insight.impact)}>
                                  {insight.impact.toUpperCase()} IMPACT
                                </Badge>
                                <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
                                  {formatCurrency(insight.savings_potential)}/month
                                </Badge>
                                <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">
                                  {(insight.confidence_score * 100).toFixed(0)}% confidence
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-white mb-2">Actionable Steps:</h4>
                            <ul className="space-y-1">
                              {insight.actionable_steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start gap-2 text-sm text-gray-300">
                                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <Separator className="border-white/10" />
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>Category: {insight.category}</span>
                              <span>•</span>
                              <span>Difficulty: {insight.implementation_difficulty}</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="default"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Apply Insight
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Smart Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              {recommendations && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl hover:bg-gray-800/40 hover:border-green-500/40 transition-all duration-300">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {formatCurrency(recommendations.total_potential_savings)}
                        </div>
                        <p className="text-sm text-gray-300">Potential Monthly Savings</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl hover:bg-gray-800/40 hover:border-blue-500/40 transition-all duration-300">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {recommendations.recommendations.length}
                        </div>
                        <p className="text-sm text-gray-300">Smart Recommendations</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl hover:bg-gray-800/40 hover:border-orange-500/40 transition-all duration-300">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-400">
                          {recommendations.implementation_timeline}
                        </div>
                        <p className="text-sm text-gray-300">Implementation Time</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4">
                    {recommendations.recommendations.map((rec, index) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl hover:bg-gray-800/40 hover:border-blue-500/40 transition-all duration-300">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-white flex items-center gap-2">
                                  {rec.device_name && (
                                    <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10">
                                      {rec.device_name}
                                    </Badge>
                                  )}
                                  {rec.title}
                                </CardTitle>
                                <CardDescription className="mt-1 text-gray-300">{rec.description}</CardDescription>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-400">
                                  {formatCurrency(rec.potential_savings)}
                                </div>
                                <div className="text-xs text-gray-400">per month</div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-400">Implementation Cost</p>
                                <p className="font-medium text-white">{formatCurrency(rec.implementation_cost)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Payback Period</p>
                                <p className="font-medium text-white">{rec.payback_period_months} months</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Priority Score</p>
                                <p className="font-medium text-white">{rec.priority_score}/10</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Automation</p>
                                <p className="font-medium text-white">
                                  {rec.automated_action_available ? (
                                    <span className="text-green-400">Available</span>
                                  ) : (
                                    <span className="text-orange-400">Manual</span>
                                  )}
                                </p>
                              </div>
                            </div>

                            {rec.automated_action_available && (
                              <div className="flex justify-end">
                                <Button
                                  onClick={() => handleExecuteRecommendation(rec.id, rec.title)}
                                  disabled={executingActions.has(rec.id)}
                                  variant="default"
                                >
                                  {executingActions.has(rec.id) ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                      Executing...
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-4 w-4 mr-2" />
                                      Execute Now
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Energy Patterns Tab */}
            <TabsContent value="patterns" className="space-y-6">
              {patterns.length > 0 && (
                <div className="grid gap-6">
                  {patterns.map((pattern, index) => (
                    <motion.div
                      key={pattern.pattern_type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl hover:bg-gray-800/40 hover:border-purple-500/40 transition-all duration-300">
                        <CardHeader>
                          <CardTitle className="text-white capitalize">
                            {pattern.pattern_type} Usage Pattern
                          </CardTitle>
                          <CardDescription className="text-gray-300">
                            Smart analysis of your {pattern.pattern_type} energy usage patterns and trends
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="text-center p-4 bg-gray-700/30 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-gray-700/40 transition-all duration-200">
                              <div className="text-2xl font-bold text-purple-400">
                                {pattern.peak_hours.length}
                              </div>
                              <p className="text-sm text-gray-300">Peak Usage Hours</p>
                            </div>
                            <div className="text-center p-4 bg-gray-700/30 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-gray-700/40 transition-all duration-200">
                              <div className="text-2xl font-bold text-blue-400">
                                {(pattern.consumption_variance * 100).toFixed(0)}%
                              </div>
                              <p className="text-sm text-gray-300">Usage Variance</p>
                            </div>
                            <div className="text-center p-4 bg-gray-700/30 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-gray-700/40 transition-all duration-200">
                              <div className="text-2xl font-bold text-green-400">
                                {(pattern.cost_efficiency_score * 100).toFixed(0)}%
                              </div>
                              <p className="text-sm text-gray-300">Efficiency Score</p>
                            </div>
                            <div className="text-center p-4 bg-gray-700/30 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-gray-700/40 transition-all duration-200">
                              <div className="text-2xl font-bold text-orange-400">
                                {pattern.anomalies_detected}
                              </div>
                              <p className="text-sm text-gray-300">Detected Anomalies</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-white mb-3">Smart Optimization Opportunities:</h4>
                            <ul className="space-y-2">
                              {pattern.optimization_opportunities.map((opportunity, oppIndex) => (
                                <li key={oppIndex} className="flex items-start gap-2 text-sm text-gray-300">
                                  <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                  {opportunity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Environmental Impact Tab */}
            <TabsContent value="environmental" className="space-y-6">
              {impact && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl hover:bg-gray-800/40 hover:border-red-500/40 transition-all duration-300">
                      <CardContent className="p-4 text-center">
                        <ThermometerSun className="h-8 w-8 text-red-400 mx-auto mb-2" />
                        <div className="text-xl font-bold text-red-400">
                          {impact.carbon_footprint_kg.toFixed(0)} kg
                        </div>
                        <p className="text-sm text-gray-300">Current Carbon Footprint</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl hover:bg-gray-800/40 hover:border-green-500/40 transition-all duration-300">
                      <CardContent className="p-4 text-center">
                        <TreePine className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <div className="text-xl font-bold text-green-400">
                          {impact.carbon_reduction_potential} kg
                        </div>
                        <p className="text-sm text-gray-300">Reduction Potential</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl hover:bg-gray-800/40 hover:border-yellow-500/40 transition-all duration-300">
                      <CardContent className="p-4 text-center">
                        <Battery className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                        <div className="text-xl font-bold text-yellow-400">
                          {(impact.renewable_energy_score * 100).toFixed(0)}%
                        </div>
                        <p className="text-sm text-gray-300">Renewable Energy Usage</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl hover:bg-gray-800/40 hover:border-emerald-500/40 transition-all duration-300">
                      <CardContent className="p-4 text-center">
                        <Recycle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                        <div className="text-xl font-bold text-emerald-400">
                          {impact.eco_friendly_rating}/10
                        </div>
                        <p className="text-sm text-gray-300">Sustainability Rating</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl hover:bg-gray-800/40 hover:border-emerald-500/40 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-emerald-400 flex items-center gap-2">
                        <Leaf className="h-5 w-5" />
                        Sustainability Recommendations
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        AI-powered suggestions to reduce your environmental impact and increase energy efficiency
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {impact.green_recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-3 p-3 bg-gray-700/30 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-gray-700/40 transition-all duration-200">
                            <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Automation Tab */}
            <TabsContent value="automation" className="space-y-6">
              <div className="text-center py-12 bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                <Settings className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Smart Automation Coming Soon</h3>
                <p className="text-gray-300 mb-6">
                  Advanced AI-driven automation that learns your patterns and optimizes energy usage automatically
                </p>
                <Button 
                  onClick={() => router.push('/automation')}
                  variant="default"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Set Up Manual Controls
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
