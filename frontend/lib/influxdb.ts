/**
 * InfluxDB Time Series Service
 * Handles time series data ingestion and querying for UrjaBandhu
 */

import { InfluxDB, Point, WriteApi, QueryApi } from '@influxdata/influxdb-client'

// InfluxDB Configuration
const INFLUX_URL = process.env.INFLUX_URL || 'http://localhost:8086'
const INFLUX_TOKEN = process.env.INFLUX_TOKEN || 'urjabandhu-token'
const INFLUX_ORG = process.env.INFLUX_ORG || 'urjabandhu'
const INFLUX_BUCKET = process.env.INFLUX_BUCKET || 'electricity_data'

export interface ConsumptionReading {
  timestamp: Date
  consumption: number
  cost: number
  device_id?: string
  location?: string
  user_id: string
}

export interface TimeSeriesStats {
  currentConsumption: number
  todayTotal: number
  estimatedCost: number
  activeDevices: number
  timestamp: Date
}

class TimeSeriesService {
  private client: InfluxDB
  private writeApi: WriteApi
  private queryApi: QueryApi

  constructor() {
    this.client = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN })
    this.writeApi = this.client.getWriteApi(INFLUX_ORG, INFLUX_BUCKET)
    this.queryApi = this.client.getQueryApi(INFLUX_ORG)
  }

  /**
   * Write consumption data to InfluxDB
   */
  async writeConsumption(data: ConsumptionReading): Promise<void> {
    try {
      const point = new Point('consumption')
        .tag('user_id', data.user_id)
        .floatField('consumption', data.consumption)
        .floatField('cost', data.cost)
        .timestamp(data.timestamp)

      if (data.device_id) {
        point.tag('device_id', data.device_id)
      }
      if (data.location) {
        point.tag('location', data.location)
      }

      this.writeApi.writePoint(point)
      await this.writeApi.flush()
    } catch (error) {
      console.error('Error writing to InfluxDB:', error)
      throw error
    }
  }

  /**
   * Query consumption data for a time range
   */
  async queryConsumption(
    userId: string,
    timeRange: string = '24h',
    granularity?: string
  ): Promise<ConsumptionReading[]> {
    try {
      const aggregateWindow = granularity || this.getDefaultGranularity(timeRange)
      
      const query = `
        from(bucket: "${INFLUX_BUCKET}")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r._measurement == "consumption")
          |> filter(fn: (r) => r.user_id == "${userId}")
          |> aggregateWindow(every: ${aggregateWindow}, fn: mean, createEmpty: false)
          |> yield(name: "mean")
      `

      const data: ConsumptionReading[] = []
      
      for await (const { values, tableMeta } of this.queryApi.iterateRows(query)) {
        const o = tableMeta.toObject(values)
        data.push({
          timestamp: new Date(o._time),
          consumption: o._value || 0,
          cost: (o._value || 0) * 0.12, // Mock cost calculation
          user_id: userId
        })
      }

      return data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    } catch (error) {
      console.error('Error querying InfluxDB:', error)
      // Return mock data as fallback
      return this.generateFallbackMockData(timeRange)
    }
  }

  /**
   * Get real-time stats
   */
  async getRealTimeStats(userId: string): Promise<TimeSeriesStats> {
    try {
      const query = `
        from(bucket: "${INFLUX_BUCKET}")
          |> range(start: -1h)
          |> filter(fn: (r) => r._measurement == "consumption")
          |> filter(fn: (r) => r.user_id == "${userId}")
          |> last()
      `

      let currentConsumption = 0
      let timestamp = new Date()

      for await (const { values, tableMeta } of this.queryApi.iterateRows(query)) {
        const o = tableMeta.toObject(values)
        currentConsumption = o._value || 0
        timestamp = new Date(o._time)
      }

      // Query today's total
      const todayQuery = `
        from(bucket: "${INFLUX_BUCKET}")
          |> range(start: today())
          |> filter(fn: (r) => r._measurement == "consumption")
          |> filter(fn: (r) => r.user_id == "${userId}")
          |> sum()
      `

      let todayTotal = 0
      for await (const { values, tableMeta } of this.queryApi.iterateRows(todayQuery)) {
        const o = tableMeta.toObject(values)
        todayTotal = o._value || 0
      }

      return {
        currentConsumption,
        todayTotal,
        estimatedCost: todayTotal * 0.12, // Mock cost calculation
        activeDevices: Math.floor(Math.random() * 8) + 5, // Mock active devices
        timestamp
      }
    } catch (error) {
      console.error('Error getting real-time stats:', error)
      // Return mock stats as fallback
      return {
        currentConsumption: Math.random() * 3 + 1,
        todayTotal: Math.random() * 25 + 15,
        estimatedCost: (Math.random() * 25 + 15) * 0.12,
        activeDevices: Math.floor(Math.random() * 8) + 5,
        timestamp: new Date()
      }
    }
  }

  /**
   * Generate mock data for demonstration
   */
  async generateMockData(timeRange: string = '24h'): Promise<void> {
    try {
      const now = new Date()
      const dataPoints = this.getDataPointCount(timeRange)
      const intervalMs = this.getIntervalMs(timeRange, dataPoints)

      for (let i = 0; i < dataPoints; i++) {
        const timestamp = new Date(now.getTime() - (dataPoints - i) * intervalMs)
        const baseConsumption = 2.5 + Math.sin(i / 10) * 1.5 // Sinusoidal pattern
        const consumption = Math.max(0, baseConsumption + (Math.random() - 0.5) * 0.8)
        
        await this.writeConsumption({
          timestamp,
          consumption,
          cost: consumption * 0.12,
          user_id: 'demo-user-1'
        })
      }

      console.log(`Generated ${dataPoints} mock data points for ${timeRange}`)
    } catch (error) {
      console.error('Error generating mock data:', error)
      throw error
    }
  }

  /**
   * Generate mock data as fallback when InfluxDB is not available
   */
  private generateFallbackMockData(timeRange: string): ConsumptionReading[] {
    const now = new Date()
    const dataPoints = this.getDataPointCount(timeRange)
    const intervalMs = this.getIntervalMs(timeRange, dataPoints)
    const data: ConsumptionReading[] = []

    for (let i = 0; i < dataPoints; i++) {
      const timestamp = new Date(now.getTime() - (dataPoints - i) * intervalMs)
      const baseConsumption = 2.5 + Math.sin(i / 10) * 1.5
      const consumption = Math.max(0, baseConsumption + (Math.random() - 0.5) * 0.8)
      
      data.push({
        timestamp,
        consumption,
        cost: consumption * 0.12,
        user_id: 'demo-user-1'
      })
    }

    return data
  }

  private getDefaultGranularity(timeRange: string): string {
    switch (timeRange) {
      case '1h': return '1m'
      case '24h': return '1h'
      case '7d': return '6h'
      case '30d': return '1d'
      default: return '1h'
    }
  }

  private getDataPointCount(timeRange: string): number {
    switch (timeRange) {
      case '1h': return 60
      case '24h': return 24
      case '7d': return 28
      case '30d': return 30
      default: return 24
    }
  }

  private getIntervalMs(timeRange: string, dataPoints: number): number {
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }

    return (timeRangeMs[timeRange as keyof typeof timeRangeMs] || timeRangeMs['24h']) / dataPoints
  }

  /**
   * Close InfluxDB connection
   */
  async close(): Promise<void> {
    try {
      await this.writeApi.close()
    } catch (error) {
      console.error('Error closing InfluxDB connection:', error)
    }
  }
}

// Singleton instance
let timeSeriesService: TimeSeriesService | null = null

export function getTimeSeriesService(): TimeSeriesService {
  if (!timeSeriesService) {
    timeSeriesService = new TimeSeriesService()
  }
  return timeSeriesService
}

export { TimeSeriesService }
