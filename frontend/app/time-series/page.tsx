/**
 * Time Series Dashboard Component
 * Real-time analytics dashboard for UrjaBandhu energy data
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useConsumptionData, useRealTimeStats, useTimeSeriesIngestion } from '@/hooks/useTimeSeries'
import {
  Activity,
  Zap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Database,
  RefreshCw,
  Settings,
  Download,
  Play,
  Pause
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts'
import { format } from 'date-fns'

interface ChartDataPoint {
  time: string
  consumption: number
  cost: number
  timestamp: Date
}

export default function TimeSeriesDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  // Time range and refresh settings
  const [timeRange, setTimeRange] = useState('24h')
  const [granularity, setGranularity] = useState<string>()
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  // Hooks for data fetching
  const { data: consumptionData, loading: consumptionLoading, error: consumptionError, refetch: refetchConsumption } = 
    useConsumptionData(timeRange, granularity, autoRefresh)
  
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = 
    useRealTimeStats(autoRefresh)
  
  const { loading: ingestionLoading, generateMockData } = useTimeSeriesIngestion()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Process chart data
  const chartData: ChartDataPoint[] = consumptionData.map(point => ({
    time: format(point.timestamp, timeRange === '24h' ? 'HH:mm' : 'MMM dd'),
    consumption: point.consumption,
    cost: point.cost,
    timestamp: point.timestamp
  }))

  // Calculate trends
  const currentConsumption = stats?.currentConsumption || 0
  const previousConsumption = chartData.length > 1 ? chartData[chartData.length - 2]?.consumption || 0 : 0
  const consumptionTrend = currentConsumption - previousConsumption
  const trendPercentage = previousConsumption > 0 ? ((consumptionTrend / previousConsumption) * 100) : 0

  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange)
    // Auto-adjust granularity based on time range
    switch (newRange) {
      case '1h':
        setGranularity('1m')
        break
      case '24h':
        setGranularity('1h')
        break
      case '7d':
        setGranularity('6h')
        break
      case '30d':
        setGranularity('1d')
        break
      default:
        setGranularity(undefined)
    }
  }

  const handleGenerateMockData = async () => {
    try {
      await generateMockData()
      toast.success('Mock data generated successfully!')
      // Refresh the data
      refetchConsumption()
      refetchStats()
    } catch (error) {
      toast.error('Failed to generate mock data')
    }
  }

  const formatTime = (value: string) => {
    return value
  }

  const formatConsumption = (value: number) => {
    return `${value.toFixed(2)} kWh`
  }

  const formatCurrency = (value: number) => {
    return `₹${value.toFixed(2)}`
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-white">Loading Dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Time Series Analytics
            </h1>
            <p className="text-gray-400 mt-2">Real-time electricity consumption monitoring</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Auto-refresh toggle */}
            <Button
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`border-green-500/30 ${autoRefresh ? 'bg-green-500/20 text-green-400' : 'text-gray-400'}`}
            >
              {autoRefresh ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {autoRefresh ? 'Pause' : 'Resume'}
            </Button>

            {/* Manual refresh */}
            <Button
              variant="outline"
              onClick={() => {
                refetchConsumption()
                refetchStats()
                toast.success('Data refreshed!')
              }}
              disabled={consumptionLoading || statsLoading}
              className="border-green-500/30 text-green-400 hover:bg-green-500/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(consumptionLoading || statsLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {/* Generate mock data */}
            <Button
              onClick={handleGenerateMockData}
              disabled={ingestionLoading}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-black font-medium"
            >
              <Database className={`h-4 w-4 mr-2 ${ingestionLoading ? 'animate-pulse' : ''}`} />
              Generate Mock Data
            </Button>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-sm border border-green-500/20 rounded-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">Time Range:</span>
            </div>
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-32 bg-black/60 border-green-500/30 text-green-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-green-500/30">
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-green-500/30 text-green-400">
              {chartData.length} data points
            </Badge>
            {stats && (
              <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                Last updated: {format(stats.timestamp, 'HH:mm:ss')}
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Real-time Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="bg-black/40 backdrop-blur-sm border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Current Usage</CardTitle>
              <Zap className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {formatConsumption(currentConsumption)}
              </div>
              <div className="flex items-center mt-1">
                {trendPercentage > 0 ? (
                  <TrendingUp className="h-3 w-3 text-red-400 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-400 mr-1" />
                )}
                <p className={`text-xs ${trendPercentage > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {Math.abs(trendPercentage).toFixed(1)}% from last reading
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Today's Total</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {formatConsumption(stats?.todayTotal || 0)}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Since midnight
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Estimated Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {formatCurrency(stats?.estimatedCost || 0)}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Today's bill estimate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Devices</CardTitle>
              <Settings className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {stats?.activeDevices || 0}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Currently monitoring
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Display */}
        {(consumptionError || statsError) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
          >
            <div className="text-red-400 font-medium">Data Loading Error</div>
            <div className="text-red-300 text-sm mt-1">
              {consumptionError || statsError}
            </div>
          </motion.div>
        )}

        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-black/40 backdrop-blur-sm border-green-500/20">
            <CardHeader>
              <CardTitle className="text-xl text-green-400">
                Consumption Timeline
              </CardTitle>
              <p className="text-gray-400">Real-time electricity usage over time</p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af' }}
                      tickFormatter={formatTime}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af' }}
                      tickFormatter={formatConsumption}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #10b981',
                        borderRadius: '8px',
                        color: '#f3f4f6'
                      }}
                      labelFormatter={(label) => `Time: ${label}`}
                      formatter={(value: number, name: string) => [
                        name === 'consumption' ? formatConsumption(value) : formatCurrency(value),
                        name === 'consumption' ? 'Consumption' : 'Cost'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="consumption"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#consumptionGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cost Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-black/40 backdrop-blur-sm border-green-500/20">
            <CardHeader>
              <CardTitle className="text-xl text-yellow-400">
                Cost Analysis
              </CardTitle>
              <p className="text-gray-400">Electricity cost breakdown over time</p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af' }}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #f59e0b',
                        borderRadius: '8px',
                        color: '#f3f4f6'
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Cost']}
                    />
                    <Bar 
                      dataKey="cost" 
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
