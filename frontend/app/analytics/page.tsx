'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  Zap, 
  DollarSign,
  Activity,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react'

interface AnalyticsData {
  totalConsumption: number
  totalCost: number
  avgEfficiency: number
  peakDemand: number
  monthlyTrends: Array<{
    month: string
    consumption: number
    cost: number
    savings: number
  }>
  deviceUsage: Array<{
    device_name: string
    total_consumption: number
    efficiency_score: number
  }>
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalConsumption: 0,
    totalCost: 0,
    avgEfficiency: 0,
    peakDemand: 0,
    monthlyTrends: [],
    deviceUsage: []
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      loadAnalyticsData()
    }
  }, [user, loading, router])

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true)
      
      // Mock data - replace with actual API calls
      const mockTrends = [
        { month: 'January 2024', consumption: 1250, cost: 8500, savings: 15 },
        { month: 'February 2024', consumption: 1180, cost: 7800, savings: 18 },
        { month: 'March 2024', consumption: 1320, cost: 9200, savings: 12 },
        { month: 'April 2024', consumption: 1100, cost: 7200, savings: 22 },
        { month: 'May 2024', consumption: 1380, cost: 9800, savings: 8 },
        { month: 'June 2024', consumption: 1420, cost: 10200, savings: 5 }
      ]

      const mockDevices = [
        { device_name: 'Air Conditioner', total_consumption: 850, efficiency_score: 78 },
        { device_name: 'Refrigerator', total_consumption: 320, efficiency_score: 92 },
        { device_name: 'Water Heater', total_consumption: 180, efficiency_score: 65 },
        { device_name: 'Lighting', total_consumption: 120, efficiency_score: 88 },
        { device_name: 'Washing Machine', total_consumption: 95, efficiency_score: 82 }
      ]

      setAnalytics({
        totalConsumption: 1450,
        totalCost: 12250,
        avgEfficiency: 78,
        peakDemand: 3.2,
        monthlyTrends: mockTrends,
        deviceUsage: mockDevices
      })
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-white">Loading analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-emerald-900/20" />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-green-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000" />
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-gray-300">Detailed energy consumption insights</p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Consumption */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-8 w-8 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Total Consumption</dt>
                  <dd className="text-lg font-medium text-white">{analytics.totalConsumption} kWh</dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-emerald-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Total Cost</dt>
                  <dd className="text-lg font-medium text-white">₹{analytics.totalCost}</dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Average Efficiency */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Avg Efficiency</dt>
                  <dd className="text-lg font-medium text-white">{analytics.avgEfficiency}%</dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Peak Demand */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Peak Demand</dt>
                  <dd className="text-lg font-medium text-white">{analytics.peakDemand} kW</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-medium text-white mb-4">Energy Usage Trends</h3>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <BarChart3 className="h-16 w-16 text-gray-500" />
                <span className="ml-2">Chart visualization would go here</span>
              </div>
            </div>
          </div>

          {/* Device Usage Breakdown */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-medium text-white mb-4">Device Usage Breakdown</h3>
              <div className="space-y-4">
                {analytics.deviceUsage.slice(0, 5).map((device, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{device.device_name}</p>
                      <p className="text-xs text-gray-300">{device.total_consumption} kWh total</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-600/50 backdrop-blur-sm rounded-full h-2 overflow-hidden">
                        <div 
                          className={`bg-green-400 h-2 rounded-full transition-all duration-300 ${
                            device.efficiency_score >= 90 ? 'w-full' :
                            device.efficiency_score >= 80 ? 'w-4/5' :
                            device.efficiency_score >= 70 ? 'w-3/4' :
                            device.efficiency_score >= 60 ? 'w-3/5' :
                            device.efficiency_score >= 50 ? 'w-1/2' :
                            device.efficiency_score >= 40 ? 'w-2/5' :
                            device.efficiency_score >= 30 ? 'w-1/3' :
                            device.efficiency_score >= 20 ? 'w-1/4' :
                            device.efficiency_score >= 10 ? 'w-1/5' : 'w-1/12'
                          }`}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-300">{device.efficiency_score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trends Table */}
        <div className="mt-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
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
                  {analytics.monthlyTrends.map((trend, index) => (
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
                        {index > 0 && analytics.monthlyTrends[index - 1] && trend.consumption > analytics.monthlyTrends[index - 1].consumption ? (
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