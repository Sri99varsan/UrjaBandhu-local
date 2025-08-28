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
  LogOut,
  Target,
  Bell,
  AlertTriangle,
  TrendingUp,
  Award,
  Plus
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DashboardStats {
  currentConsumption: number
  monthlyUsage: number
  monthlyCost: number
  devicesActive: number
  efficiencyScore: number
  savingsPotential: number
  // Phase 2 additions
  totalDevices: number
  activeGoals: number
  unreadAlerts: number
  savings: number
  thisMonth: {
    consumption: number
    cost: number
    savings: number
  }
}

interface EnergyGoal {
  id: string
  goal_type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  target_consumption: number
  target_cost: number
  current_consumption: number
  current_cost: number
  status: string
  created_at: string
}

interface EnergyAlert {
  id: string
  alert_type: string
  message: string
  severity: 'low' | 'medium' | 'high'
  is_read: boolean
  created_at: string
}

interface DeviceCategory {
  id: string
  name: string
  description: string
  average_power: number
  typical_usage_hours: number
  efficiency_tips: string[]
}

// The original dashboard content moved to this full dashboard page
export default function FullDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    currentConsumption: 0,
    monthlyUsage: 0,
    monthlyCost: 0,
    devicesActive: 0,
    efficiencyScore: 0,
    savingsPotential: 0,
    totalDevices: 0,
    activeGoals: 0,
    unreadAlerts: 0,
    savings: 0,
    thisMonth: {
      consumption: 0,
      cost: 0,
      savings: 0
    }
  })
  const [goals, setGoals] = useState<EnergyGoal[]>([])
  const [alerts, setAlerts] = useState<EnergyAlert[]>([])
  const [deviceCategories, setDeviceCategories] = useState<DeviceCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      loadDashboardData()
    }
  }, [user, loading, router])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Simulate real data for demonstration
      setStats({
        currentConsumption: 2.4,
        monthlyUsage: 78.5,
        monthlyCost: 1250,
        devicesActive: 12,
        efficiencyScore: 78,
        savingsPotential: 320,
        totalDevices: 15,
        activeGoals: 3,
        unreadAlerts: 2,
        savings: 150,
        thisMonth: {
          consumption: 78.5,
          cost: 1250,
          savings: 150
        }
      })
      
      // Mock goals data
      setGoals([
        {
          id: '1',
          goal_type: 'monthly',
          target_consumption: 80,
          target_cost: 1200,
          current_consumption: 78.5,
          current_cost: 1250,
          status: 'at_risk',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          goal_type: 'daily',
          target_consumption: 3,
          target_cost: 45,
          current_consumption: 2.4,
          current_cost: 38,
          status: 'on_track',
          created_at: new Date().toISOString()
        }
      ])
      
      // Mock alerts data
      setAlerts([
        {
          id: '1',
          alert_type: 'high_consumption',
          message: 'Your AC usage is 20% higher than usual',
          severity: 'medium',
          is_read: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          alert_type: 'cost_threshold',
          message: 'Monthly budget limit approaching',
          severity: 'high',
          is_read: false,
          created_at: new Date().toISOString()
        }
      ])
      
      // Mock device categories
      setDeviceCategories([
        {
          id: '1',
          name: 'Air Conditioning',
          description: 'Cooling appliances',
          average_power: 1500,
          typical_usage_hours: 8,
          efficiency_tips: [
            'Set temperature to 24°C or higher',
            'Use timer function to avoid overnight running'
          ]
        },
        {
          id: '2',
          name: 'Lighting',
          description: 'LED and CFL bulbs',
          average_power: 60,
          typical_usage_hours: 6,
          efficiency_tips: [
            'Switch to LED bulbs',
            'Use motion sensors in corridors'
          ]
        }
      ])
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-white">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Energy Dashboard</h1>
            <p className="text-gray-300">Welcome back, {user?.user_metadata?.full_name || user?.email}</p>
          </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-300 hover:text-green-400 transition-colors">
            <Bell className="h-6 w-6" />
            {stats.unreadAlerts > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-black" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Consumption */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Zap className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-300 truncate">Current Usage</dt>
                <dd className="text-lg font-medium text-white">{stats.currentConsumption} kWh</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Monthly Cost */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-300 truncate">Monthly Cost</dt>
                <dd className="text-lg font-medium text-white">₹{stats.monthlyCost}</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Active Devices */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-300 truncate">Active Devices</dt>
                <dd className="text-lg font-medium text-white">{stats.devicesActive}</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Efficiency Score */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-purple-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-300 truncate">Efficiency Score</dt>
                <dd className="text-lg font-medium text-white">{stats.efficiencyScore}%</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Trends */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-medium text-white mb-4">Energy Usage Trends</h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <BarChart3 className="h-16 w-16 text-gray-500" />
              <span className="ml-2">Chart visualization would go here</span>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-medium text-white mb-4">Recent Alerts</h3>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    alert.severity === 'high' ? 'text-red-400' : 
                    alert.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{alert.message}</p>
                    <p className="text-xs text-gray-400">{new Date(alert.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/devices')}
                className="w-full flex items-center justify-between p-3 text-left bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                <span className="text-sm font-medium text-white">Manage Devices</span>
                <Zap className="h-4 w-4 text-green-400" />
              </button>
              <button 
                onClick={() => router.push('/analytics')}
                className="w-full flex items-center justify-between p-3 text-left bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                <span className="text-sm font-medium text-white">View Analytics</span>
                <BarChart3 className="h-4 w-4 text-green-400" />
              </button>
              <button 
                onClick={() => router.push('/automation')}
                className="w-full flex items-center justify-between p-3 text-left bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                <span className="text-sm font-medium text-white">Set Automation</span>
                <Target className="h-4 w-4 text-green-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Goals */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Energy Goals</h3>
          <button className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black text-sm leading-4 font-medium rounded-lg transition-all duration-200">
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.slice(0, 3).map((goal) => (
            <div key={goal.id} className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white capitalize">{goal.goal_type} Goal</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  goal.status === 'on_track' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                  goal.status === 'at_risk' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {goal.status.replace('_', ' ')}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Target:</span>
                  <span className="text-white">₹{goal.target_cost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Current:</span>
                  <span className="text-white">₹{goal.current_cost}</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((goal.current_cost / goal.target_cost) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Efficiency Tips */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-medium text-white mb-4">Efficiency Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deviceCategories.slice(0, 3).map((category) => (
            <div key={category.id} className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center mb-3">
                <Lightbulb className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-white">{category.name}</span>
              </div>
              <ul className="space-y-1">
                {category.efficiency_tips.slice(0, 2).map((tip, index) => (
                  <li key={index} className="text-xs text-gray-300">• {tip}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  )
}
