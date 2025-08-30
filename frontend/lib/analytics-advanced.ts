import { createClient } from './supabase'
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

const supabase = createClient()

export interface TimeSeriesData {
  timestamp: string
  consumption: number
  cost: number
  device_count: number
  peak_demand: number
}

export interface ConsumptionPrediction {
  date: string
  predicted_consumption: number
  predicted_cost: number
  confidence: number
}

export interface UsagePattern {
  hour: number
  average_consumption: number
  peak_probability: number
  cost_per_hour: number
}

export interface DeviceAnalytics {
  device_id: string
  device_name: string
  device_type: string
  total_consumption: number
  average_consumption: number
  efficiency_score: number
  cost_contribution: number
  usage_hours: number
  peak_usage_time: string
}

export interface EnergyInsight {
  id: string
  type: 'optimization' | 'anomaly' | 'prediction' | 'efficiency' | 'cost'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  savings_potential: number
  action_required: boolean
  recommendations: string[]
  created_at: string
}

export const advancedAnalyticsService = {
  // Time Series Data Analysis
  async getTimeSeriesData(userId: string, timeRange: '7d' | '30d' | '90d' | '1y'): Promise<TimeSeriesData[]> {
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case '7d':
        startDate = subDays(now, 7)
        break
      case '30d':
        startDate = subDays(now, 30)
        break
      case '90d':
        startDate = subDays(now, 90)
        break
      case '1y':
        startDate = subDays(now, 365)
        break
    }

    const { data, error } = await supabase
      .from('consumption_data')
      .select('timestamp, consumption_kwh, cost, device_id')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Error fetching time series data:', error)
      return this.generateDemoTimeSeriesData(timeRange)
    }

    if (!data || data.length === 0) {
      return this.generateDemoTimeSeriesData(timeRange)
    }

    // Aggregate data by day
    const aggregatedData = this.aggregateTimeSeriesData(data)
    return aggregatedData
  },

  // Generate demo time series data for testing
  generateDemoTimeSeriesData(timeRange: '7d' | '30d' | '90d' | '1y'): TimeSeriesData[] {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    const data: TimeSeriesData[] = []
    const now = new Date()

    for (let i = days; i >= 0; i--) {
      const date = subDays(now, i)
      const baseConsumption = 25 + Math.sin(i * 0.1) * 10 // Seasonal variation
      const randomVariation = (Math.random() - 0.5) * 10
      const consumption = Math.max(0, baseConsumption + randomVariation)
      
      data.push({
        timestamp: date.toISOString(),
        consumption: Math.round(consumption * 100) / 100,
        cost: Math.round(consumption * 8 * 100) / 100, // ₹8 per kWh
        device_count: Math.floor(Math.random() * 5) + 8,
        peak_demand: Math.round((consumption * 1.2 + Math.random() * 5) * 100) / 100
      })
    }

    return data
  },

  // Aggregate consumption data by day
  aggregateTimeSeriesData(rawData: any[]): TimeSeriesData[] {
    const dailyData = new Map<string, {
      consumption: number
      cost: number
      device_count: Set<string>
      peak_demand: number
      records: number
    }>()

    rawData.forEach((record: any) => {
      const date = format(new Date(record.timestamp), 'yyyy-MM-dd')
      
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          consumption: 0,
          cost: 0,
          device_count: new Set(),
          peak_demand: 0,
          records: 0
        })
      }

      const dayData = dailyData.get(date)!
      dayData.consumption += record.consumption_kwh || 0
      dayData.cost += record.cost || 0
      dayData.device_count.add(record.device_id)
      dayData.peak_demand = Math.max(dayData.peak_demand, record.consumption_kwh || 0)
      dayData.records++
    })

    return Array.from(dailyData.entries()).map(([date, data]) => ({
      timestamp: new Date(date).toISOString(),
      consumption: Math.round(data.consumption * 100) / 100,
      cost: Math.round(data.cost * 100) / 100,
      device_count: data.device_count.size,
      peak_demand: Math.round(data.peak_demand * 100) / 100
    }))
  },

  // Consumption Prediction using Simple Statistical Methods
  async getPredictedConsumption(userId: string, days: number = 7): Promise<ConsumptionPrediction[]> {
    const historicalData = await this.getTimeSeriesData(userId, '30d')
    
    if (historicalData.length < 7) {
      return this.generateDemoPredictions(days)
    }

    const predictions: ConsumptionPrediction[] = []
    const recentData = historicalData.slice(-14) // Use last 14 days for prediction

    // Calculate moving average and trend
    const movingAverage = this.calculateMovingAverage(recentData.map(d => d.consumption), 7)
    const trend = this.calculateTrend(recentData.map(d => d.consumption))
    
    for (let i = 1; i <= days; i++) {
      const lastAverage = movingAverage[movingAverage.length - 1] || 0
      const predictedConsumption = Math.max(0, lastAverage + (trend * i))
      const confidence = Math.max(0.6, 1 - (i * 0.05)) // Confidence decreases with time
      
      predictions.push({
        date: format(subDays(new Date(), -i), 'yyyy-MM-dd'),
        predicted_consumption: Math.round(predictedConsumption * 100) / 100,
        predicted_cost: Math.round(predictedConsumption * 8 * 100) / 100,
        confidence: Math.round(confidence * 100) / 100
      })
    }

    return predictions
  },

  // Generate demo predictions for testing
  generateDemoPredictions(days: number): ConsumptionPrediction[] {
    const predictions: ConsumptionPrediction[] = []
    const baseConsumption = 25

    for (let i = 1; i <= days; i++) {
      const variation = (Math.random() - 0.5) * 5
      const consumption = baseConsumption + variation
      
      predictions.push({
        date: format(subDays(new Date(), -i), 'yyyy-MM-dd'),
        predicted_consumption: Math.round(consumption * 100) / 100,
        predicted_cost: Math.round(consumption * 8 * 100) / 100,
        confidence: Math.max(0.6, 1 - (i * 0.05))
      })
    }

    return predictions
  },

  // Calculate moving average
  calculateMovingAverage(data: number[], windowSize: number): number[] {
    const result: number[] = []
    
    for (let i = windowSize - 1; i < data.length; i++) {
      const window = data.slice(i - windowSize + 1, i + 1)
      const average = window.reduce((sum, val) => sum + val, 0) / windowSize
      result.push(average)
    }
    
    return result
  },

  // Calculate simple linear trend
  calculateTrend(data: number[]): number {
    if (data.length < 2) return 0

    const n = data.length
    const xSum = (n * (n - 1)) / 2 // Sum of indices
    const ySum = data.reduce((sum, val) => sum + val, 0)
    const xySum = data.reduce((sum, val, index) => sum + (val * index), 0)
    const x2Sum = data.reduce((sum, _, index) => sum + (index * index), 0)

    // Linear regression slope
    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum)
    return isNaN(slope) ? 0 : slope
  },

  // Usage Pattern Analysis
  async getUsagePatterns(userId: string): Promise<UsagePattern[]> {
    const { data, error } = await supabase
      .from('consumption_data')
      .select('timestamp, consumption_kwh, cost')
      .eq('user_id', userId)
      .gte('timestamp', subDays(new Date(), 30).toISOString())

    if (error || !data || data.length === 0) {
      return this.generateDemoUsagePatterns()
    }

    // Analyze patterns by hour of day
    const hourlyData = new Map<number, { consumption: number[], costs: number[] }>()

    data.forEach((record: any) => {
      const hour = new Date(record.timestamp).getHours()
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, { consumption: [], costs: [] })
      }
      hourlyData.get(hour)!.consumption.push(record.consumption_kwh || 0)
      hourlyData.get(hour)!.costs.push(record.cost || 0)
    })

    const patterns: UsagePattern[] = []
    const allConsumption = data.map((d: any) => d.consumption_kwh || 0)
    const maxConsumption = Math.max(...allConsumption)

    for (let hour = 0; hour < 24; hour++) {
      const hourData = hourlyData.get(hour)
      if (hourData && hourData.consumption.length > 0) {
        const avgConsumption = hourData.consumption.reduce((sum, val) => sum + val, 0) / hourData.consumption.length
        const avgCost = hourData.costs.reduce((sum, val) => sum + val, 0) / hourData.costs.length
        const peakProbability = avgConsumption / maxConsumption

        patterns.push({
          hour,
          average_consumption: Math.round(avgConsumption * 100) / 100,
          peak_probability: Math.round(peakProbability * 100) / 100,
          cost_per_hour: Math.round(avgCost * 100) / 100
        })
      } else {
        patterns.push({
          hour,
          average_consumption: 0,
          peak_probability: 0,
          cost_per_hour: 0
        })
      }
    }

    return patterns
  },

  // Generate demo usage patterns
  generateDemoUsagePatterns(): UsagePattern[] {
    const patterns: UsagePattern[] = []
    
    for (let hour = 0; hour < 24; hour++) {
      let baseConsumption = 15 // Base consumption
      
      // Morning peak (7-9 AM)
      if (hour >= 7 && hour <= 9) baseConsumption += 15
      // Evening peak (6-10 PM)
      if (hour >= 18 && hour <= 22) baseConsumption += 20
      // Night low (11 PM - 5 AM)
      if (hour >= 23 || hour <= 5) baseConsumption -= 8
      
      const consumption = Math.max(5, baseConsumption + (Math.random() - 0.5) * 5)
      
      patterns.push({
        hour,
        average_consumption: Math.round(consumption * 100) / 100,
        peak_probability: Math.round((consumption / 35) * 100) / 100,
        cost_per_hour: Math.round(consumption * 8 * 100) / 100
      })
    }
    
    return patterns
  },

  // Device Analytics
  async getDeviceAnalytics(userId: string): Promise<DeviceAnalytics[]> {
    const { data: devices, error: deviceError } = await supabase
      .from('devices')
      .select('id, name, type, power_rating, efficiency_score')
      .eq('user_id', userId)

    if (deviceError || !devices) {
      return this.generateDemoDeviceAnalytics()
    }

    const { data: consumption, error: consumptionError } = await supabase
      .from('consumption_data')
      .select('device_id, consumption_kwh, cost, timestamp')
      .eq('user_id', userId)
      .gte('timestamp', subDays(new Date(), 30).toISOString())

    if (consumptionError || !consumption) {
      return this.generateDemoDeviceAnalytics()
    }

    // Aggregate by device
    const deviceData = new Map<string, {
      consumption: number[]
      costs: number[]
      timestamps: string[]
    }>()

    consumption.forEach((record: any) => {
      if (!deviceData.has(record.device_id)) {
        deviceData.set(record.device_id, { consumption: [], costs: [], timestamps: [] })
      }
      const data = deviceData.get(record.device_id)!
      data.consumption.push(record.consumption_kwh || 0)
      data.costs.push(record.cost || 0)
      data.timestamps.push(record.timestamp)
    })

    const analytics: DeviceAnalytics[] = devices.map((device: any) => {
      const data = deviceData.get(device.id)
      if (!data || data.consumption.length === 0) {
        return {
          device_id: device.id,
          device_name: device.name,
          device_type: device.type,
          total_consumption: 0,
          average_consumption: 0,
          efficiency_score: device.efficiency_score || 75,
          cost_contribution: 0,
          usage_hours: 0,
          peak_usage_time: '12:00'
        }
      }

      const totalConsumption = data.consumption.reduce((sum, val) => sum + val, 0)
      const totalCost = data.costs.reduce((sum, val) => sum + val, 0)
      const avgConsumption = totalConsumption / data.consumption.length

      // Find peak usage time (hour with highest consumption)
      const hourlyUsage = new Map<number, number>()
      data.timestamps.forEach((timestamp, index) => {
        const hour = new Date(timestamp).getHours()
        hourlyUsage.set(hour, (hourlyUsage.get(hour) || 0) + data.consumption[index])
      })

      const peakHour = Array.from(hourlyUsage.entries())
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 12

      return {
        device_id: device.id,
        device_name: device.name,
        device_type: device.type,
        total_consumption: Math.round(totalConsumption * 100) / 100,
        average_consumption: Math.round(avgConsumption * 100) / 100,
        efficiency_score: device.efficiency_score || 75,
        cost_contribution: Math.round(totalCost * 100) / 100,
        usage_hours: data.consumption.length,
        peak_usage_time: `${peakHour.toString().padStart(2, '0')}:00`
      }
    })

    return analytics
  },

  // Generate demo device analytics
  generateDemoDeviceAnalytics(): DeviceAnalytics[] {
    const demoDevices = [
      { name: 'Air Conditioner', type: 'cooling', power: 1500 },
      { name: 'Refrigerator', type: 'appliance', power: 200 },
      { name: 'LED Lights', type: 'lighting', power: 100 },
      { name: 'Television', type: 'entertainment', power: 150 },
      { name: 'Washing Machine', type: 'appliance', power: 800 },
      { name: 'Water Heater', type: 'heating', power: 2000 }
    ]

    return demoDevices.map((device, index) => {
      const usage = 200 + Math.random() * 300
      const efficiency = 70 + Math.random() * 25
      
      return {
        device_id: `demo-${index}`,
        device_name: device.name,
        device_type: device.type,
        total_consumption: Math.round(usage * 100) / 100,
        average_consumption: Math.round((usage / 30) * 100) / 100,
        efficiency_score: Math.round(efficiency),
        cost_contribution: Math.round(usage * 8 * 100) / 100,
        usage_hours: Math.floor(usage / (device.power / 1000)),
        peak_usage_time: `${Math.floor(Math.random() * 12) + 8}:00`
      }
    })
  },

  // Generate Intelligent Insights
  async generateInsights(userId: string): Promise<EnergyInsight[]> {
    const [timeSeriesData, predictions, patterns, deviceAnalytics] = await Promise.all([
      this.getTimeSeriesData(userId, '30d'),
      this.getPredictedConsumption(userId, 7),
      this.getUsagePatterns(userId),
      this.getDeviceAnalytics(userId)
    ])

    const insights: EnergyInsight[] = []

    // Consumption trend analysis
    if (timeSeriesData.length >= 7) {
      const recent = timeSeriesData.slice(-7)
      const previous = timeSeriesData.slice(-14, -7)
      const recentAvg = recent.reduce((sum, d) => sum + d.consumption, 0) / recent.length
      const previousAvg = previous.reduce((sum, d) => sum + d.consumption, 0) / previous.length
      
      if (recentAvg > previousAvg * 1.15) {
        insights.push({
          id: 'consumption-increase',
          type: 'anomaly',
          title: 'Consumption Increase Detected',
          description: `Your energy consumption has increased by ${Math.round(((recentAvg - previousAvg) / previousAvg) * 100)}% compared to last week.`,
          impact: 'high',
          savings_potential: (recentAvg - previousAvg) * 8 * 30, // Monthly impact
          action_required: true,
          recommendations: [
            'Check for devices left running continuously',
            'Review recent changes in usage patterns',
            'Consider device efficiency upgrades'
          ],
          created_at: new Date().toISOString()
        })
      }
    }

    // Peak usage optimization
    const peakHours = patterns.filter(p => p.peak_probability > 0.7)
    if (peakHours.length > 0) {
      insights.push({
        id: 'peak-optimization',
        type: 'optimization',
        title: 'Peak Usage Optimization Opportunity',
        description: `High consumption detected during ${peakHours.length} peak hours. Shifting usage could reduce costs.`,
        impact: 'medium',
        savings_potential: peakHours.reduce((sum, h) => sum + h.cost_per_hour, 0) * 0.2 * 30,
        action_required: false,
        recommendations: [
          'Schedule high-power devices during off-peak hours',
          'Use timers for water heaters and dishwashers',
          'Consider time-of-use electricity plans'
        ],
        created_at: new Date().toISOString()
      })
    }

    // Device efficiency insights
    const inefficientDevices = deviceAnalytics.filter(d => d.efficiency_score < 70)
    if (inefficientDevices.length > 0) {
      const totalSavings = inefficientDevices.reduce((sum, d) => sum + d.cost_contribution, 0) * 0.25
      
      insights.push({
        id: 'device-efficiency',
        type: 'efficiency',
        title: 'Low Efficiency Devices Identified',
        description: `${inefficientDevices.length} devices are operating below optimal efficiency.`,
        impact: 'high',
        savings_potential: totalSavings,
        action_required: true,
        recommendations: [
          'Schedule maintenance for low-efficiency devices',
          'Consider upgrading old appliances',
          'Check for proper ventilation and placement'
        ],
        created_at: new Date().toISOString()
      })
    }

    // Prediction-based insights
    const futureIncrease = predictions.some(p => p.predicted_consumption > timeSeriesData[timeSeriesData.length - 1]?.consumption * 1.1)
    if (futureIncrease) {
      insights.push({
        id: 'predicted-increase',
        type: 'prediction',
        title: 'Consumption Increase Predicted',
        description: 'Our analysis predicts higher energy consumption in the coming week.',
        impact: 'medium',
        savings_potential: 150,
        action_required: false,
        recommendations: [
          'Monitor daily consumption closely',
          'Implement energy-saving measures proactively',
          'Review and adjust device schedules'
        ],
        created_at: new Date().toISOString()
      })
    }

    return insights
  }
}
