/**
 * React Hooks for Time Series Data
 * Custom hooks for consuming InfluxDB time series data in React components
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'

// Types from InfluxDB service
export interface ConsumptionPoint {
  timestamp: Date
  consumption: number
  cost: number
  deviceId?: string | null
}

export interface DeviceTimeSeriesPoint {
  timestamp: Date
  deviceId: string
  consumption: number
  efficiency: number
  status: string
  temperature?: number | null
}

export interface RealTimeStats {
  timestamp: Date
  currentConsumption: number
  todayTotal: number
  activeDevices: number
  estimatedCost: number
}

interface TimeSeriesApiResponse<T> {
  success: boolean
  data: T
  metadata?: any
}

// Custom hook for consumption data
export function useConsumptionData(
  timeRange: string = '24h',
  granularity?: string,
  autoRefresh: boolean = false,
  refreshInterval: number = 30000 // 30 seconds
) {
  const { user, session } = useAuth()
  const [data, setData] = useState<ConsumptionPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    if (!user) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const token = session?.access_token
      if (!token) {
        throw new Error('No authentication token available')
      }

      const params = new URLSearchParams({
        timeRange,
        type: 'consumption'
      })
      
      if (granularity) {
        params.append('granularity', granularity)
      }

      const response = await fetch(`/api/time-series/query?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const result: TimeSeriesApiResponse<ConsumptionPoint[]> = await response.json()
      
      if (!result.success) {
        throw new Error('API returned error status')
      }

      // Convert timestamp strings to Date objects
      const processedData = result.data.map(point => ({
        ...point,
        timestamp: new Date(point.timestamp)
      }))

      setData(processedData)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch consumption data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [user, session, timeRange, granularity])

  // Initial load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchData])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  }
}

// Custom hook for device time series
export function useDeviceTimeSeries(
  deviceId?: string,
  timeRange: string = '24h',
  autoRefresh: boolean = false
) {
  const { user, session } = useAuth()
  const [data, setData] = useState<DeviceTimeSeriesPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!user) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const token = session?.access_token
      const params = new URLSearchParams({
        timeRange,
        type: 'devices'
      })
      
      if (deviceId) {
        params.append('deviceId', deviceId)
      }

      const response = await fetch(`/api/time-series/query?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result: TimeSeriesApiResponse<DeviceTimeSeriesPoint[]> = await response.json()
      
      if (!result.success) {
        throw new Error('API returned error')
      }

      const processedData = result.data.map(point => ({
        ...point,
        timestamp: new Date(point.timestamp)
      }))

      setData(processedData)
    } catch (err) {
      console.error('Failed to fetch device time series:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [user, session, deviceId, timeRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh for real-time device monitoring
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchData, 15000) // 15 seconds for device data
    return () => clearInterval(interval)
  }, [autoRefresh, fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

// Custom hook for real-time statistics
export function useRealTimeStats(autoRefresh: boolean = true) {
  const { user, session } = useAuth()
  const [stats, setStats] = useState<RealTimeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!user) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const token = session?.access_token
      const response = await fetch('/api/time-series/query?type=stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result: TimeSeriesApiResponse<RealTimeStats> = await response.json()
      
      if (!result.success) {
        throw new Error('API returned error')
      }

      setStats({
        ...result.data,
        timestamp: new Date(result.data.timestamp)
      })
    } catch (err) {
      console.error('Failed to fetch real-time stats:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Auto-refresh every 10 seconds for real-time stats
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}

// Hook for ingesting time series data
export function useTimeSeriesIngestion() {
  const { user, session } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ingestData = useCallback(async (readings: any[]) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      setLoading(true)
      setError(null)

      const token = session?.access_token
      const response = await fetch('/api/time-series/ingest', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ readings })
      })

      if (!response.ok) {
        throw new Error(`Ingestion failed: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Ingestion failed')
      }

      return result
    } catch (err) {
      console.error('Failed to ingest time series data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, session])

  const generateMockData = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      setLoading(true)
      setError(null)

      const token = session?.access_token
      const response = await fetch('/api/time-series/ingest', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Mock data generation failed: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Mock data generation failed')
      }

      return result
    } catch (err) {
      console.error('Failed to generate mock data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, session])

  return {
    loading,
    error,
    ingestData,
    generateMockData
  }
}
