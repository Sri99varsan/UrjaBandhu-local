import { createClient } from './supabase'
import type { 
  Database, 
  Profile, 
  Device, 
  ConsumptionData, 
  Recommendation,
  EnergyAlert,
  EnergyGoal,
  BillingData 
} from './supabase'

// Additional Phase 2 Types
interface DeviceCategory {
  id: string
  name: string
  description: string
  icon: string
  average_power_min: number
  average_power_max: number
  efficiency_tips: string[]
  created_at: string
}

interface UserNotification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success' | 'tip'
  is_read: boolean
  action_url?: string
  action_text?: string
  expires_at?: string
  created_at: string
}

const supabase = createClient()

// Profile Services
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return data
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating profile:', error)
      throw error
    }
    return data
  },

  async createProfile(profile: Database['public']['Tables']['profiles']['Insert']) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating profile:', error)
      throw error
    }
    return data
  }
}

// Device Services
export const deviceService = {
  async getUserDevices(userId: string): Promise<Device[]> {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching devices:', error)
      return []
    }
    return data || []
  },

  async addDevice(device: Database['public']['Tables']['devices']['Insert']) {
    const { data, error } = await supabase
      .from('devices')
      .insert(device)
      .select()
      .single()
    
    if (error) {
      console.error('Error adding device:', error)
      throw error
    }
    return data
  },

  async updateDevice(deviceId: string, updates: Partial<Device>) {
    const { data, error } = await supabase
      .from('devices')
      .update(updates)
      .eq('id', deviceId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating device:', error)
      throw error
    }
    return data
  },

  async deleteDevice(deviceId: string) {
    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('id', deviceId)
    
    if (error) {
      console.error('Error deleting device:', error)
      throw error
    }
  },

  async searchDevicesInCatalog(searchText: string) {
    const { data, error } = await supabase
      .rpc('search_devices_by_keywords', { search_text: searchText })
    
    if (error) {
      console.error('Error searching device catalog:', error)
      return []
    }
    return data || []
  }
}

// Consumption Data Services
export const consumptionService = {
  async getUserConsumption(userId: string, startDate?: string, endDate?: string): Promise<ConsumptionData[]> {
    let query = supabase
      .from('consumption_data')
      .select('*, devices(name, type)')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
    
    if (startDate) {
      query = query.gte('timestamp', startDate)
    }
    if (endDate) {
      query = query.lte('timestamp', endDate)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching consumption data:', error)
      return []
    }
    return data || []
  },

  async addConsumptionData(consumption: Database['public']['Tables']['consumption_data']['Insert']) {
    const { data, error } = await supabase
      .from('consumption_data')
      .insert(consumption)
      .select()
      .single()
    
    if (error) {
      console.error('Error adding consumption data:', error)
      throw error
    }
    return data
  },

  async getDeviceConsumption(deviceId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('consumption_data')
      .select('*')
      .eq('device_id', deviceId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true })
    
    if (error) {
      console.error('Error fetching device consumption:', error)
      return []
    }
    return data || []
  }
}

// Recommendations Services
export const recommendationService = {
  async getUserRecommendations(userId: string): Promise<Recommendation[]> {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*, devices(name)')
      .eq('user_id', userId)
      .eq('is_applied', false)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching recommendations:', error)
      return []
    }
    return data || []
  },

  async markRecommendationApplied(recommendationId: string) {
    const { data, error } = await supabase
      .from('recommendations')
      .update({ 
        is_applied: true, 
        applied_at: new Date().toISOString() 
      })
      .eq('id', recommendationId)
      .select()
      .single()
    
    if (error) {
      console.error('Error marking recommendation as applied:', error)
      throw error
    }
    return data
  },

  async addRecommendation(recommendation: Database['public']['Tables']['recommendations']['Insert']) {
    const { data, error } = await supabase
      .from('recommendations')
      .insert(recommendation)
      .select()
      .single()
    
    if (error) {
      console.error('Error adding recommendation:', error)
      throw error
    }
    return data
  }
}

// Energy Alerts Services
export const alertService = {
  async getUserAlerts(userId: string, onlyUnread: boolean = false): Promise<EnergyAlert[]> {
    let query = supabase
      .from('energy_alerts')
      .select('*, devices(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (onlyUnread) {
      query = query.eq('is_read', false)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching alerts:', error)
      return []
    }
    return data || []
  },

  async markAlertAsRead(alertId: string) {
    const { data, error } = await supabase
      .from('energy_alerts')
      .update({ is_read: true })
      .eq('id', alertId)
      .select()
      .single()
    
    if (error) {
      console.error('Error marking alert as read:', error)
      throw error
    }
    return data
  },

  async createAlert(alert: Database['public']['Tables']['energy_alerts']['Insert']) {
    const { data, error } = await supabase
      .from('energy_alerts')
      .insert(alert)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating alert:', error)
      throw error
    }
    return data
  }
}

// Energy Goals Services
export const goalService = {
  async getUserGoals(userId: string): Promise<EnergyGoal[]> {
    const { data, error } = await supabase
      .from('energy_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching goals:', error)
      return []
    }
    return data || []
  },

  async createGoal(goal: Database['public']['Tables']['energy_goals']['Insert']) {
    const { data, error } = await supabase
      .from('energy_goals')
      .insert(goal)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating goal:', error)
      throw error
    }
    return data
  },

  async updateGoalProgress(goalId: string, currentValue: number) {
    const { data, error } = await supabase
      .from('energy_goals')
      .update({ current_value: currentValue })
      .eq('id', goalId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating goal progress:', error)
      throw error
    }
    return data
  }
}

// Billing Services
export const billingService = {
  async getUserBills(userId: string): Promise<BillingData[]> {
    const { data, error } = await supabase
      .from('billing_data')
      .select('*')
      .eq('user_id', userId)
      .order('bill_month', { ascending: false })
    
    if (error) {
      console.error('Error fetching bills:', error)
      return []
    }
    return data || []
  },

  async addBill(bill: Database['public']['Tables']['billing_data']['Insert']) {
    const { data, error } = await supabase
      .from('billing_data')
      .insert(bill)
      .select()
      .single()
    
    if (error) {
      console.error('Error adding bill:', error)
      throw error
    }
    return data
  },

  async getLatestBill(userId: string) {
    const { data, error } = await supabase
      .from('billing_data')
      .select('*')
      .eq('user_id', userId)
      .order('bill_month', { ascending: false })
      .limit(1)
      .single()
    
    if (error) {
      console.error('Error fetching latest bill:', error)
      return null
    }
    return data
  }
}

// OCR Service for device detection
export const ocrService = {
  async detectDeviceFromImage(imageUrl: string, userId?: string) {
    try {
      const response = await fetch('/api/ocr-detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          user_id: userId
        })
      })
      
      if (!response.ok) {
        throw new Error(`OCR service error: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error detecting device from image:', error)
      throw error
    }
  }
}

// Analytics helper functions
export const analyticsService = {
  async getDashboardStats(userId: string) {
    try {
      // Get total devices
      const devices = await deviceService.getUserDevices(userId)
      
      // Get this month's consumption
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const consumption = await consumptionService.getUserConsumption(
        userId, 
        thisMonth.toISOString()
      )
      
      // Get unread alerts
      const alerts = await alertService.getUserAlerts(userId, true)
      
      // Get active recommendations
      const recommendations = await recommendationService.getUserRecommendations(userId)
      
      // Calculate total consumption and cost this month
      const totalConsumption = consumption.reduce((sum, record) => sum + record.consumption_kwh, 0)
      const totalCost = consumption.reduce((sum, record) => sum + record.cost, 0)
      
      return {
        totalDevices: devices.length,
        activeDevices: devices.filter(d => d.status === 'active').length,
        monthlyConsumption: totalConsumption,
        monthlyCost: totalCost,
        unreadAlerts: alerts.length,
        activeRecommendations: recommendations.length,
        averageEfficiency: devices.reduce((sum, d) => sum + (d.efficiency_score || 0), 0) / devices.length || 0
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalDevices: 0,
        activeDevices: 0,
        monthlyConsumption: 0,
        monthlyCost: 0,
        unreadAlerts: 0,
        activeRecommendations: 0,
        averageEfficiency: 0
      }
    }
  }
}

// Phase 2: Energy Goals Service
export const energyGoalService = {
  async getUserGoals(userId: string): Promise<EnergyGoal[]> {
    const { data, error } = await supabase
      .from('energy_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching energy goals:', error)
      return []
    }
    return data || []
  },

  async createGoal(goalData: {
    user_id: string
    goal_type: 'daily' | 'weekly' | 'monthly' | 'yearly'
    target_consumption: number
    target_cost: number
    start_date: string
    end_date: string
  }) {
    const { data, error } = await supabase
      .from('energy_goals')
      .insert(goalData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating energy goal:', error)
      throw error
    }
    return data
  },

  async updateGoalProgress(goalId: string, consumption: number, cost: number) {
    const { data, error } = await supabase
      .from('energy_goals')
      .update({
        current_consumption: consumption,
        current_cost: cost
      })
      .eq('id', goalId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating goal progress:', error)
      throw error
    }
    return data
  },

  async deactivateGoal(goalId: string) {
    const { error } = await supabase
      .from('energy_goals')
      .update({ is_active: false })
      .eq('id', goalId)
    
    if (error) {
      console.error('Error deactivating goal:', error)
      throw error
    }
  }
}

// Phase 2: Energy Alerts Service
export const energyAlertService = {
  async getUserAlerts(userId: string, unreadOnly: boolean = false): Promise<EnergyAlert[]> {
    let query = supabase
      .from('energy_alerts')
      .select('*, devices(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (unreadOnly) {
      query = query.eq('is_read', false)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching energy alerts:', error)
      return []
    }
    return data || []
  },

  async createAlert(alertData: {
    user_id: string
    alert_type: 'high_consumption' | 'unusual_pattern' | 'device_offline' | 'cost_threshold'
    title: string
    message: string
    priority?: 'high' | 'medium' | 'low'
    threshold_value?: number
    device_id?: string
  }) {
    const { data, error } = await supabase
      .from('energy_alerts')
      .insert(alertData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating energy alert:', error)
      throw error
    }
    return data
  },

  async markAsRead(alertId: string) {
    const { error } = await supabase
      .from('energy_alerts')
      .update({ is_read: true })
      .eq('id', alertId)
    
    if (error) {
      console.error('Error marking alert as read:', error)
      throw error
    }
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('energy_alerts')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    
    if (error) {
      console.error('Error marking all alerts as read:', error)
      throw error
    }
  }
}

// Phase 2: Device Categories Service
export const deviceCategoryService = {
  async getAllCategories(): Promise<DeviceCategory[]> {
    const { data, error } = await supabase
      .from('device_categories')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching device categories:', error)
      return []
    }
    return data || []
  },

  async getCategoryById(categoryId: string): Promise<DeviceCategory | null> {
    const { data, error } = await supabase
      .from('device_categories')
      .select('*')
      .eq('id', categoryId)
      .single()
    
    if (error) {
      console.error('Error fetching device category:', error)
      return null
    }
    return data
  },

  async getCategoryByName(categoryName: string): Promise<DeviceCategory | null> {
    const { data, error } = await supabase
      .from('device_categories')
      .select('*')
      .eq('name', categoryName)
      .single()
    
    if (error) {
      console.error('Error fetching device category by name:', error)
      return null
    }
    return data
  }
}

// Phase 2: Enhanced Analytics Service
export const enhancedAnalyticsService = {
  async getDashboardStats(userId: string) {
    try {
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      // Get this month's data
      const { data: thisMonthData } = await supabase
        .from('consumption_data')
        .select('consumption_kwh, cost')
        .eq('user_id', userId)
        .gte('timestamp', thisMonthStart.toISOString())

      // Get last month's data
      const { data: lastMonthData } = await supabase
        .from('consumption_data')
        .select('consumption_kwh, cost')
        .eq('user_id', userId)
        .gte('timestamp', lastMonthStart.toISOString())
        .lte('timestamp', lastMonthEnd.toISOString())

      // Get devices count
      const { count: devicesCount } = await supabase
        .from('devices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Get active goals count
      const { count: activeGoalsCount } = await supabase
        .from('energy_goals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true)

      // Get unread alerts count
      const { count: unreadAlertsCount } = await supabase
        .from('energy_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      // Calculate stats
      const thisMonthConsumption = thisMonthData?.reduce((sum: number, record: any) => sum + record.consumption_kwh, 0) || 0
      const thisMonthCost = thisMonthData?.reduce((sum: number, record: any) => sum + record.cost, 0) || 0
      const lastMonthConsumption = lastMonthData?.reduce((sum: number, record: any) => sum + record.consumption_kwh, 0) || 0
      const lastMonthCost = lastMonthData?.reduce((sum: number, record: any) => sum + record.cost, 0) || 0

      const savings = lastMonthCost > 0 ? lastMonthCost - thisMonthCost : 0
      const efficiency = lastMonthConsumption > 0 ? 
        Math.max(0, Math.min(100, (1 - thisMonthConsumption / lastMonthConsumption) * 100)) : 85

      return {
        totalDevices: devicesCount || 0,
        totalConsumption: thisMonthConsumption,
        totalCost: thisMonthCost,
        avgDaily: thisMonthConsumption / new Date().getDate(),
        peakDemand: Math.max(...(thisMonthData?.map((d: any) => d.consumption_kwh) || [0])),
        efficiency,
        savings,
        activeGoals: activeGoalsCount || 0,
        unreadAlerts: unreadAlertsCount || 0,
        thisMonth: {
          consumption: thisMonthConsumption,
          cost: thisMonthCost,
          savings
        },
        lastMonth: {
          consumption: lastMonthConsumption,
          cost: lastMonthCost
        }
      }
    } catch (error) {
      console.error('Error fetching enhanced dashboard stats:', error)
      throw error
    }
  },

  async getConsumptionTrends(userId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('consumption_data')
      .select('timestamp, consumption_kwh, cost')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Error fetching consumption trends:', error)
      return []
    }

    return data || []
  }
}
