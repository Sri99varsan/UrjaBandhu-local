'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Filter,
  Zap,
  DollarSign,
  Clock,
  Target
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface ConsumptionData {
  timestamp: string
  consumption: number
  cost: number
  peak_demand: number
}

interface DeviceUsageData {
  device_name: string
  total_consumption: number
  average_consumption: number
  runtime_hours: number
  efficiency_score: number
}

interface MonthlyTrend {
  month: string
  consumption: number
  cost: number
  savings: number
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [loadingData, setLoadingData] = useState(true)
  const [timeRange, setTimeRange] = useState('30d') // 7d, 30d, 90d, 1y
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([])
  const [deviceUsage, setDeviceUsage] = useState<DeviceUsageData[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])
  const [totalConsumption, setTotalConsumption] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [avgEfficiency, setAvgEfficiency] = useState(0)
  const [peakDemand, setPeakDemand] = useState(0)

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoadingData(true)
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      // Fetch consumption data
      const { data: consumptionData, error: consumptionError } = await supabase
        .from('consumption_data')
        .select('*')
        .eq('user_id', user?.id)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: true })

      if (consumptionError) {
        console.error('Error fetching consumption data:', consumptionError)
        toast.error('Failed to load consumption data')
      } else {
        setConsumptionData(consumptionData || [])
        
        // Calculate totals
        const total = consumptionData?.reduce((sum: number, item: any) => sum + (item.consumption || 0), 0) || 0
        const totalCostCalc = consumptionData?.reduce((sum: number, item: any) => sum + (item.cost || 0), 0) || 0
        const maxPeak = Math.max(...(consumptionData?.map((item: any) => item.peak_demand || 0) || [0]))
        
        setTotalConsumption(Math.round(total * 100) / 100)
        setTotalCost(Math.round(totalCostCalc * 100) / 100)
        setPeakDemand(Math.round(maxPeak * 100) / 100)
      }

      // Fetch device usage analytics - simplified approach
      const { data: deviceData, error: deviceError } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user?.id)

      if (deviceError) {
        console.error('Error fetching device data:', deviceError)
        toast.error('Failed to load device analytics')
      } else {
        // Process device usage data with mock consumption data
        const deviceUsageMap = new Map()
        
        deviceData?.forEach((device: any) => {
          // Generate mock consumption data for each device
          const mockConsumption = Math.random() * 100 + 20 // 20-120 kWh
          const mockRuntimeHours = Math.random() * 24 * 30 // 0-720 hours per month
          
          deviceUsageMap.set(device.id, {
            device_name: device.name || 'Unknown Device',
            total_consumption: Math.round(mockConsumption * 100) / 100,
            average_consumption: Math.round((mockConsumption / 30) * 100) / 100, // Daily average
            runtime_hours: Math.round(mockRuntimeHours * 100) / 100,
            efficiency_score: device.efficiency_score || Math.floor(Math.random() * 40) + 60 // 60-100%
          })
        })
        
        setDeviceUsage(Array.from(deviceUsageMap.values()))
        
        // Calculate average efficiency
        const avgEff = Array.from(deviceUsageMap.values()).reduce((sum: number, device: any) => 
          sum + device.efficiency_score, 0) / deviceUsageMap.size || 85
        setAvgEfficiency(Math.round(avgEff))
      }

      // Generate monthly trends (mock data for now - would be calculated from historical data)
      const trends: MonthlyTrend[] = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        
        // This would be calculated from actual historical data
        const baseConsumption = 400 + Math.random() * 200
        trends.push({
          month: monthName,
          consumption: Math.round(baseConsumption * 100) / 100,
          cost: Math.round(baseConsumption * 8 * 100) / 100, // ₹8 per kWh
          savings: Math.round((Math.random() * 20 + 5) * 100) / 100
        })
      }
      setMonthlyTrends(trends)

    } catch (error) {
      console.error('Error fetching analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoadingData(false)
    }
  }, [user?.id, timeRange])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }

    if (user?.id) {
      fetchAnalyticsData()
    }
  }, [user?.id, loading, timeRange])

  const downloadReport = () => {
    const csvContent = [
      ['Date', 'Consumption (kWh)', 'Cost (₹)', 'Peak Demand (kW)'],
      ...consumptionData.map(item => [
        new Date(item.timestamp).toLocaleDateString(),
        item.consumption,
        item.cost,
        item.peak_demand
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `electricity-analytics-${timeRange}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report downloaded successfully')
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse [animation-delay:2s]" />
        </div>
        
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-white">Loading analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse [animation-delay:2s]" />
      </div>
      
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Analytics</h1>
                <p className="mt-2 text-gray-300">
                  Detailed insights into your electricity consumption patterns
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500/50 hover:bg-white/15 hover:border-white/30 transition-all duration-200 shadow-lg"
                  title="Select time range for analytics"
                  aria-label="Select time range for analytics"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <button
                  onClick={downloadReport}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold rounded-lg shadow-lg shadow-green-500/25 transition-all duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6 hover:bg-gray-800/40 hover:border-yellow-400/40 transition-all duration-300 hover:shadow-yellow-400/10">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Zap className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total Consumption</p>
                  <p className="text-2xl font-semibold text-white">{totalConsumption} kWh</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6 hover:bg-gray-800/40 hover:border-green-400/40 transition-all duration-300 hover:shadow-green-400/10">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total Cost</p>
                  <p className="text-2xl font-semibold text-white">₹{totalCost}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6 hover:bg-gray-800/40 hover:border-blue-400/40 transition-all duration-300 hover:shadow-blue-400/10">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Avg Efficiency</p>
                  <p className="text-2xl font-semibold text-white">{avgEfficiency}%</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6 hover:bg-gray-800/40 hover:border-red-400/40 transition-all duration-300 hover:shadow-red-400/10">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Peak Demand</p>
                  <p className="text-2xl font-semibold text-white">{peakDemand} kW</p>
                </div>
              </div>
            </div>
          </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Consumption Trend Chart */}
          <div className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6 hover:bg-gray-800/40 hover:border-green-500/40 transition-all duration-300">
            <h3 className="text-lg font-medium text-white mb-4">Consumption Trend</h3>
            <div className="h-64 flex items-center justify-center bg-gray-700/20 backdrop-blur-sm rounded-xl border border-white/10">
              <p className="text-gray-300">Chart will be implemented with Chart.js</p>
            </div>
          </div>

          {/* Device Usage Breakdown */}
          <div className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6 hover:bg-gray-800/40 hover:border-green-500/40 transition-all duration-300">
            <h3 className="text-lg font-medium text-white mb-4">Device Usage Breakdown</h3>
            <div className="space-y-4">
              {deviceUsage.slice(0, 5).map((device, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-700/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{device.device_name}</p>
                    <p className="text-xs text-gray-300">{device.total_consumption} kWh total</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ProgressBar 
                      value={device.efficiency_score}
                      className="w-20 bg-gray-600/50 backdrop-blur-sm rounded-full h-2"
                      barClassName="bg-green-400 h-2 rounded-full"
                    />
                    <span className="text-xs text-gray-300">{device.efficiency_score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trends Table */}
        <div className="bg-gray-800/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden hover:bg-gray-800/40 hover:border-green-500/40 transition-all duration-300">
          <div className="px-6 py-4 border-b border-white/20 bg-gray-700/30 backdrop-blur-sm">
            <h3 className="text-lg font-medium text-white">Monthly Trends</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-gray-700/40 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Consumption (kWh)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Cost (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Savings (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800/20 backdrop-blur-sm divide-y divide-white/10">
                {monthlyTrends.map((trend, index) => (
                  <tr key={index} className="hover:bg-gray-700/30 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {trend.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {trend.consumption}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      ₹{trend.cost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {trend.savings}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {index > 0 && monthlyTrends[index - 1] && trend.consumption > monthlyTrends[index - 1].consumption ? (
                        <TrendingUp className="h-4 w-4 text-red-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-green-400" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
