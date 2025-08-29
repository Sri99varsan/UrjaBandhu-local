'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Clock, 
  BarChart3, 
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Cpu,
  Eye,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { advancedAnalyticsService, TimeSeriesData, ConsumptionPrediction, UsagePattern, DeviceAnalytics, EnergyInsight } from '@/lib/analytics-advanced'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

export default function AdvancedAnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [activeTab, setActiveTab] = useState('overview')

  // Data states
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [predictions, setPredictions] = useState<ConsumptionPrediction[]>([])
  const [usagePatterns, setUsagePatterns] = useState<UsagePattern[]>([])
  const [deviceAnalytics, setDeviceAnalytics] = useState<DeviceAnalytics[]>([])
  const [insights, setInsights] = useState<EnergyInsight[]>([])

  const loadAdvancedAnalytics = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const [timeSeriesResult, predictionsResult, patternsResult, devicesResult, insightsResult] = await Promise.all([
        advancedAnalyticsService.getTimeSeriesData(user.id, timeRange),
        advancedAnalyticsService.getPredictedConsumption(user.id, 7),
        advancedAnalyticsService.getUsagePatterns(user.id),
        advancedAnalyticsService.getDeviceAnalytics(user.id),
        advancedAnalyticsService.generateInsights(user.id)
      ])

      setTimeSeriesData(timeSeriesResult)
      setPredictions(predictionsResult)
      setUsagePatterns(patternsResult)
      setDeviceAnalytics(devicesResult)
      setInsights(insightsResult)
      
      toast.success('Analytics updated successfully')
    } catch (error) {
      console.error('Error loading advanced analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }, [user?.id, timeRange])

  useEffect(() => {
    if (user?.id) {
      loadAdvancedAnalytics()
    }
  }, [user?.id, timeRange, loadAdvancedAnalytics])

  // Prepare chart data
  const chartData = timeSeriesData.map(item => ({
    date: format(parseISO(item.timestamp), 'MMM dd'),
    consumption: item.consumption,
    cost: item.cost,
    devices: item.device_count,
    peak: item.peak_demand
  }))

  const predictionChartData = [...chartData.slice(-7), ...predictions.map(p => ({
    date: format(parseISO(p.date), 'MMM dd'),
    consumption: null,
    predicted: p.predicted_consumption,
    confidence: p.confidence * 100
  }))]

  const patternChartData = usagePatterns.map(p => ({
    hour: `${p.hour.toString().padStart(2, '0')}:00`,
    consumption: p.average_consumption,
    cost: p.cost_per_hour,
    peak_probability: p.peak_probability * 100
  }))

  const deviceChartData = deviceAnalytics.slice(0, 6).map(d => ({
    name: d.device_name,
    consumption: d.total_consumption,
    cost: d.cost_contribution,
    efficiency: d.efficiency_score
  }))

  // Color schemes
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']
  
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'optimization': return <TrendingUp className="h-5 w-5 text-blue-500" />
      case 'prediction': return <Eye className="h-5 w-5 text-purple-500" />
      case 'efficiency': return <Cpu className="h-5 w-5 text-green-500" />
      case 'cost': return <Zap className="h-5 w-5 text-yellow-500" />
      default: return <CheckCircle2 className="h-5 w-5 text-gray-500" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse [animation-delay:2s]" />
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-white">Loading advanced analytics...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive insights, predictions, and optimization recommendations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
              title="Select time range for analytics"
              aria-label="Select time range for analytics"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button 
              onClick={loadAdvancedAnalytics} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Consumption</p>
                <p className="text-2xl font-bold text-gray-900">
                  {timeSeriesData.reduce((sum, d) => sum + d.consumption, 0).toFixed(1)} kWh
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : timeRange === '90d' ? 'Last 90 days' : 'Last year'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Daily</p>
                <p className="text-2xl font-bold text-gray-900">
                  {timeSeriesData.length > 0 ? (timeSeriesData.reduce((sum, d) => sum + d.consumption, 0) / timeSeriesData.length).toFixed(1) : '0'} kWh
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Per day average</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peak Demand</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...timeSeriesData.map(d => d.peak_demand), 0).toFixed(1)} kW
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Maximum recorded</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Insights</p>
                <p className="text-2xl font-bold text-gray-900">{insights.length}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {insights.filter(i => i.action_required).length} require action
            </p>
          </div>
        </div>

        {/* Insights Section */}
        {insights.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                <h2 className="text-xl font-semibold text-gray-900">AI-Powered Insights</h2>
              </div>
              <p className="text-gray-600 mt-1">
                Intelligent recommendations based on your energy usage patterns
              </p>
            </div>
            <div className="p-6 space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className={`p-4 rounded-lg border-l-4 border-l-blue-500 ${getImpactColor(insight.impact)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <h3 className="font-medium">{insight.title}</h3>
                        <p className="text-sm mt-1 opacity-90">{insight.description}</p>
                        <div className="mt-3 flex items-center gap-4">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-white rounded">
                            {insight.type}
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            ₹{insight.savings_potential.toFixed(0)} potential savings
                          </span>
                        </div>
                        {insight.recommendations.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-2">Recommendations:</p>
                            <ul className="text-sm space-y-1 opacity-90">
                              {insight.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-blue-500 mt-1">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    {insight.action_required && (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                        Action Required
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'predictions', name: 'Predictions' },
                { id: 'patterns', name: 'Patterns' },
                { id: 'devices', name: 'Devices' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Consumption Trends */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Consumption Trends</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value, name) => [
                              `${value} ${name === 'consumption' ? 'kWh' : name === 'cost' ? '₹' : ''}`,
                              name === 'consumption' ? 'Consumption' : name === 'cost' ? 'Cost' : name
                            ]}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="consumption" 
                            stroke="#8884d8" 
                            fill="#8884d8" 
                            fillOpacity={0.3} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Cost Analysis */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Analysis</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`₹${value}`, 'Cost']} />
                          <Bar dataKey="cost" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'predictions' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Consumption Predictions */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Consumption Forecast</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={predictionChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="consumption" 
                            stroke="#8884d8" 
                            strokeWidth={2}
                            name="Actual"
                            connectNulls={false}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="predicted" 
                            stroke="#ff7300" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="Predicted"
                            connectNulls={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Prediction Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Prediction Details</h3>
                    <div className="space-y-3">
                      {predictions.slice(0, 5).map((prediction, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <div>
                            <p className="font-medium">{format(parseISO(prediction.date), 'MMM dd, yyyy')}</p>
                            <p className="text-sm text-gray-600">
                              {prediction.predicted_consumption.toFixed(1)} kWh • ₹{prediction.predicted_cost.toFixed(0)}
                            </p>
                          </div>
                          <div className="text-right">
                            <ProgressBar 
                              value={prediction.confidence * 100}
                              className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden"
                              barClassName="h-full bg-blue-500 rounded-full transition-all duration-300"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {(prediction.confidence * 100).toFixed(0)}% confidence
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'patterns' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Hourly Usage Pattern */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Usage Pattern</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={patternChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="consumption" 
                            stroke="#8884d8" 
                            fill="#8884d8" 
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Peak Hours */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Peak Usage Hours</h3>
                    <div className="space-y-3">
                      {usagePatterns
                        .sort((a, b) => b.peak_probability - a.peak_probability)
                        .slice(0, 8)
                        .map((pattern, index) => (
                          <div key={pattern.hour} className="flex items-center justify-between p-2">
                            <div className="flex items-center gap-3">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">
                                {pattern.hour.toString().padStart(2, '0')}:00
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ProgressBar 
                                value={pattern.peak_probability * 100}
                                className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden"
                                barClassName="h-full bg-blue-500 rounded-full transition-all duration-300"
                              />
                              <span className="text-sm font-medium w-12">
                                {(pattern.peak_probability * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'devices' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Device Consumption Distribution */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Device Consumption</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={deviceChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="consumption"
                          >
                            {deviceChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} kWh`, 'Consumption']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Device Efficiency */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Device Efficiency</h3>
                    <div className="space-y-4">
                      {deviceAnalytics.slice(0, 6).map((device, index) => (
                        <div key={device.device_id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Cpu className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{device.device_name}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              device.efficiency_score >= 80 ? 'bg-green-100 text-green-800' :
                              device.efficiency_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {device.efficiency_score}%
                            </span>
                          </div>
                          <ProgressBar 
                            value={device.efficiency_score}
                            className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
                            barClassName="h-full bg-blue-500 rounded-full transition-all duration-300"
                          />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{device.total_consumption.toFixed(1)} kWh</span>
                            <span>₹{device.cost_contribution.toFixed(0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
