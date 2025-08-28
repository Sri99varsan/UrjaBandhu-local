'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  Zap, 
  BarChart3, 
  TrendingDown, 
  Users, 
  DollarSign,
  Activity,
  Lightbulb,
  Home,
  LogOut
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import DashboardNavigation from '@/components/navigation/DashboardNavigation'

interface DashboardStats {
  currentConsumption: number
  monthlyUsage: number
  monthlyCost: number
  devicesActive: number
  efficiencyScore: number
  savingsPotential: number
}

interface Device {
  id: string
  name: string
  type: string
  powerRating: number
  currentConsumption: number
  status: 'active' | 'inactive'
  room: string
  efficiency: number
}

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, loading, router])

  const fetchDashboardData = async () => {
    if (!user) {
      console.log('No user found, skipping data fetch')
      return
    }

    console.log('Fetching dashboard data for user:', user.id)
    
    try {
      setLoadingData(true)
      
      // Fetch devices from Supabase
      const { data: devicesData, error: devicesError } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (devicesError) {
        console.error('Error fetching devices:', devicesError)
        console.error('Devices error details:', JSON.stringify(devicesError, null, 2))
        toast.error('Failed to load devices')
      } else {
        console.log('Devices data fetched:', devicesData)
        // Transform the data to match our interface
        const transformedDevices: Device[] = devicesData?.map((device: any) => ({
          id: device.id,
          name: device.name,
          type: device.type, // Changed from device_type to type
          powerRating: device.power_rating || 0,
          currentConsumption: Math.floor(Math.random() * 500) + 100, // Generate random current consumption since it's not in DB
          status: device.status as 'active' | 'inactive',
          room: device.room || 'Unknown', // Changed from location to room
          efficiency: device.efficiency_score || 75
        })) || []
        
        setDevices(transformedDevices)
      }

      // Fetch recent consumption data for stats
      const { data: consumptionData, error: consumptionError } = await supabase
        .from('consumption_data')
        .select('*')
        .eq('user_id', user?.id)
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .order('timestamp', { ascending: false })

      if (consumptionError) {
        console.error('Error fetching consumption data:', consumptionError)
        console.error('Consumption error details:', JSON.stringify(consumptionError, null, 2))
        toast.error('Failed to load consumption data')
      } else {
        console.log('Consumption data fetched:', consumptionData)
      }

      // Calculate dashboard stats
      const activeDevices = devicesData?.filter((d: any) => d.status === 'active').length || 0
      const totalConsumption = devicesData?.reduce((sum: number, d: any) => {
        // Generate random current consumption since it's not stored in the database
        return sum + (Math.floor(Math.random() * 500) + 100)
      }, 0) || 0
      const monthlyUsage = consumptionData?.reduce((sum: number, c: any) => sum + (c.consumption_kwh || 0), 0) || 0
      
      // Calculate monthly cost (assuming ₹8 per kWh as average Indian rate)
      const ratePerKwh = 8
      const monthlyCost = monthlyUsage * ratePerKwh

      // Calculate efficiency score (average of all devices)
      const avgEfficiency = devicesData?.length
        ? devicesData.reduce((sum: number, d: any) => sum + (d.efficiency_score || 75), 0) / devicesData.length
        : 85      // Calculate savings potential (simplified calculation)
      const savingsPotential = Math.max(0, (100 - avgEfficiency) * 0.3)
      
      setStats({
        currentConsumption: Math.round(totalConsumption * 100) / 100,
        monthlyUsage: Math.round(monthlyUsage * 100) / 100,
        monthlyCost: Math.round(monthlyCost * 100) / 100,
        devicesActive: activeDevices,
        efficiencyScore: Math.round(avgEfficiency),
        savingsPotential: Math.round(savingsPotential * 100) / 100
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
      
      // Fallback to sample data if real data fails
      setStats({
        currentConsumption: 2.45,
        monthlyUsage: 456.78,
        monthlyCost: 3840.50,
        devicesActive: 8,
        efficiencyScore: 85,
        savingsPotential: 15.2
      })

      setDevices([
        {
          id: '1',
          name: 'Air Conditioner',
          type: 'cooling',
          powerRating: 1500,
          currentConsumption: 1.45,
          status: 'active',
          room: 'Living Room',
          efficiency: 78
        },
        {
          id: '2',
          name: 'Refrigerator',
          type: 'appliance',
          powerRating: 200,
          currentConsumption: 0.18,
          status: 'active',
          room: 'Kitchen',
          efficiency: 92
        },
        {
          id: '3',
          name: 'LED Lights',
          type: 'lighting',
          powerRating: 120,
          currentConsumption: 0.12,
          status: 'active',
          room: 'All Rooms',
          efficiency: 95
        },
        {
          id: '4',
          name: 'Washing Machine',
          type: 'appliance',
          powerRating: 800,
          currentConsumption: 0.0,
          status: 'inactive',
          room: 'Utility Room',
          efficiency: 88
        }
      ])
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-electricity-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Energy Dashboard</h1>
            <p className="mt-2 text-gray-600">Monitor and optimize your electricity consumption</p>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Activity className="h-6 w-6 text-electricity-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Current Usage</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.currentConsumption} kW</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BarChart3 className="h-6 w-6 text-energy-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Monthly Usage</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.monthlyUsage} kWh</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Monthly Cost</dt>
                        <dd className="text-lg font-medium text-gray-900">₹{stats.monthlyCost.toFixed(2)}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Devices</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.devicesActive}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Zap className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Efficiency Score</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.efficiencyScore}%</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingDown className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Savings Potential</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.savingsPotential}%</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Devices List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Connected Devices</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Monitor your appliances and their power consumption</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {devices.map((device) => (
                <li key={device.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            device.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <Activity className={`h-6 w-6 ${
                              device.status === 'active' ? 'text-green-600' : 'text-gray-400'
                            }`} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{device.name}</div>
                            <div className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              device.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {device.status}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">{device.room} • {device.powerRating}W rated</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{device.currentConsumption} kW</div>
                          <div className="text-sm text-gray-500">Efficiency: {device.efficiency}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
