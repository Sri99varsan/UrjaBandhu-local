'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      fetchAnalyticsData()
    }
  }, [user, loading, router, timeRange])

  const fetchAnalyticsData = async () => {
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

      // Fetch device usage analytics
      const { data: deviceData, error: deviceError } = await supabase
        .from('devices')
        .select(`
          *,
          consumption_data!inner(consumption, timestamp)
        `)
        .eq('user_id', user?.id)
        .gte('consumption_data.timestamp', startDate.toISOString())
        .lte('consumption_data.timestamp', endDate.toISOString())

      if (deviceError) {
        console.error('Error fetching device data:', deviceError)
        toast.error('Failed to load device analytics')
      } else {
        // Process device usage data
        const deviceUsageMap = new Map()
        
        deviceData?.forEach((device: any) => {
          if (!deviceUsageMap.has(device.name)) {
            deviceUsageMap.set(device.name, {
              device_name: device.name,
              total_consumption: 0,
              data_points: 0,
              efficiency_score: device.efficiency_score || 75
            })
          }
          
          const deviceStats = deviceUsageMap.get(device.name)
          deviceStats.total_consumption += device.consumption_data?.consumption || 0
          deviceStats.data_points += 1
        })

        const processedDeviceUsage: DeviceUsageData[] = Array.from(deviceUsageMap.values()).map(device => ({
          device_name: device.device_name,
          total_consumption: Math.round(device.total_consumption * 100) / 100,
          average_consumption: Math.round((device.total_consumption / Math.max(device.data_points, 1)) * 100) / 100,
          runtime_hours: Math.round((device.data_points * 24 / Math.max(parseInt(timeRange), 1)) * 100) / 100,
          efficiency_score: device.efficiency_score
        }))

        setDeviceUsage(processedDeviceUsage)
        
        // Calculate average efficiency
        const avgEff = processedDeviceUsage.length 
          ? processedDeviceUsage.reduce((sum, device) => sum + device.efficiency_score, 0) / processedDeviceUsage.length
          : 85
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
  }

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="mt-2 text-gray-600">
                Detailed insights into your electricity consumption patterns
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={downloadReport}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Consumption</p>
                <p className="text-2xl font-semibold text-gray-900">{totalConsumption} kWh</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Cost</p>
                <p className="text-2xl font-semibold text-gray-900">₹{totalCost}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Efficiency</p>
                <p className="text-2xl font-semibold text-gray-900">{avgEfficiency}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Peak Demand</p>
                <p className="text-2xl font-semibold text-gray-900">{peakDemand} kW</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Consumption Trend Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Consumption Trend</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart will be implemented with Chart.js</p>
            </div>
          </div>

          {/* Device Usage Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Device Usage Breakdown</h3>
            <div className="space-y-4">
              {deviceUsage.slice(0, 5).map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{device.device_name}</p>
                    <p className="text-xs text-gray-500">{device.total_consumption} kWh total</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(device.efficiency_score / 100) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{device.efficiency_score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trends Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Monthly Trends</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consumption (kWh)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Savings (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyTrends.map((trend, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trend.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trend.consumption}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{trend.cost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trend.savings}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index > 0 && monthlyTrends[index - 1] && trend.consumption > monthlyTrends[index - 1].consumption ? (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-green-500" />
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
  )
}
