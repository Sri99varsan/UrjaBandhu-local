'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  Wifi,
  Database,
  Download,
  RefreshCw,
  BarChart3,
  Clock,
  DollarSign,
  Leaf
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  dataPipeline, 
  useRealTimeData, 
  EnergyDataPoint, 
  RealTimeMetrics 
} from '@/lib/data-pipeline/real-time-service'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import toast from 'react-hot-toast'

export default function RealTimeMonitoringPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { data: realTimeData, metrics, isConnected } = useRealTimeData()
  
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h')
  const [historicalData, setHistoricalData] = useState<EnergyDataPoint[]>([])
  const [anomalies, setAnomalies] = useState<Array<{deviceId: string, anomaly: string, severity: 'low' | 'medium' | 'high'}>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
  }, [user, loading, router])

  useEffect(() => {
    loadHistoricalData()
  }, [timeRange])

  useEffect(() => {
    if (realTimeData.length > 0) {
      const detected = dataPipeline.detectAnomalies(realTimeData)
      setAnomalies(detected)
      setLastUpdated(new Date())
      setIsLoading(false)
    }
  }, [realTimeData])

  const loadHistoricalData = async () => {
    setIsLoading(true)
    try {
      const data = dataPipeline.generateTimeSeriesData(timeRange)
      setHistoricalData(data)
    } catch (error) {
      console.error('Failed to load historical data:', error)
      toast.error('Failed to load historical data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = () => {
    const csvData = dataPipeline.exportData(historicalData, 'csv')
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `energy-data-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Data exported successfully!')
  }

  const handleRefresh = () => {
    loadHistoricalData()
    toast.success('Data refreshed!')
  }

  // Prepare chart data
  const chartData = historicalData.reduce((acc, dp) => {
    const timeKey = dp.timestamp.toLocaleTimeString()
    const existing = acc.find(item => item.time === timeKey)
    
    if (existing) {
      existing.consumption += dp.consumption
      existing.cost += dp.cost
    } else {
      acc.push({
        time: timeKey,
        consumption: dp.consumption,
        cost: dp.cost,
        timestamp: dp.timestamp
      })
    }
    return acc
  }, [] as Array<{time: string, consumption: number, cost: number, timestamp: Date}>)

  // Device consumption breakdown
  const deviceData = realTimeData.map(dp => ({
    name: dp.deviceName,
    consumption: dp.consumption,
    cost: dp.cost,
    efficiency: dp.efficiency || 0,
    location: dp.location
  }))

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ff0000']

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-4"
          >
            <Activity className="h-8 w-8 text-blue-500" />
          </motion.div>
          <span className="text-lg font-medium text-white">Loading real-time data...</span>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Activity className="h-8 w-8 text-blue-500" />
                Real-Time Energy Monitoring
              </h1>
              <p className="text-gray-400 mt-1">
                Live data pipeline • Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {/* Controls */}
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Real-Time Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Current Consumption</p>
                      <p className="text-2xl font-bold text-white">
                        {metrics.totalConsumption.toFixed(2)} kWh
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Current Cost</p>
                      <p className="text-2xl font-bold text-white">
                        ₹{metrics.totalCost.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Active Devices</p>
                      <p className="text-2xl font-bold text-white">
                        {metrics.activeDevices}
                      </p>
                    </div>
                    <Database className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Carbon Footprint</p>
                      <p className="text-2xl font-bold text-white">
                        {metrics.carbonFootprint.toFixed(2)} kg CO₂
                      </p>
                    </div>
                    <Leaf className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Time Range Selector */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Historical Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              {(['1h', '6h', '24h', '7d', '30d'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9CA3AF"
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="consumption" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Consumption (kWh)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Cost (₹)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Breakdown */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Device Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deviceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9CA3AF"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Bar dataKey="consumption" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Anomalies & Alerts */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Energy Anomalies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {anomalies.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No anomalies detected</p>
                ) : (
                  anomalies.map((anomaly, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg"
                    >
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                        anomaly.severity === 'high' ? 'text-red-500' : 
                        anomaly.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={anomaly.severity === 'high' ? 'destructive' : 'secondary'}>
                            {anomaly.severity}
                          </Badge>
                          <span className="text-sm text-gray-400">{anomaly.deviceId}</span>
                        </div>
                        <p className="text-white text-sm mt-1">{anomaly.anomaly}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
