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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Energy Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.user_metadata?.full_name || user?.email}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-500">
            <Bell className="h-6 w-6" />
            {stats.unreadAlerts > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Consumption */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Current Usage</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.currentConsumption} kWh</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Monthly Cost */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Monthly Cost</dt>
                <dd className="text-lg font-medium text-gray-900">₹{stats.monthlyCost}</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Active Devices */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Devices</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.devicesActive}</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Efficiency Score */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-purple-600" />
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Trends */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Energy Usage Trends</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <BarChart3 className="h-16 w-16 text-gray-300" />
              <span className="ml-2">Chart visualization would go here</span>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Alerts</h3>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    alert.severity === 'high' ? 'text-red-500' : 
                    alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">{new Date(alert.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/devices')}
                className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-900">Manage Devices</span>
                <Zap className="h-4 w-4 text-gray-400" />
              </button>
              <button 
                onClick={() => router.push('/analytics')}
                className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-900">View Analytics</span>
                <BarChart3 className="h-4 w-4 text-gray-400" />
              </button>
              <button 
                onClick={() => router.push('/automation')}
                className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-900">Set Automation</span>
                <Target className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Goals */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Energy Goals</h3>
          <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.slice(0, 3).map((goal) => (
            <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 capitalize">{goal.goal_type} Goal</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  goal.status === 'on_track' ? 'bg-green-100 text-green-800' : 
                  goal.status === 'at_risk' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {goal.status.replace('_', ' ')}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Target:</span>
                  <span className="text-gray-900">₹{goal.target_cost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current:</span>
                  <span className="text-gray-900">₹{goal.current_cost}</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((goal.current_cost / goal.target_cost) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Efficiency Tips */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Efficiency Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deviceCategories.slice(0, 3).map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-900">{category.name}</span>
              </div>
              <ul className="space-y-1">
                {category.efficiency_tips.slice(0, 2).map((tip, index) => (
                  <li key={index} className="text-xs text-gray-600">• {tip}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
