/**
 * Time Series Data Query API
 * Retrieves consumption data from InfluxDB for analytics and dashboards
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTimeSeriesService } from '@/lib/influxdb'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user using service role key for API routes
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token or unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '24h'
    const granularity = searchParams.get('granularity') || undefined
    const deviceId = searchParams.get('deviceId') || undefined
    const dataType = searchParams.get('type') || 'consumption' // consumption, devices, stats

    const timeSeriesService = getTimeSeriesService()

    // Route to different data types
    switch (dataType) {
      case 'consumption':
        // Get aggregated consumption data
        const consumptionData = await timeSeriesService.queryConsumption(
          user.id,
          timeRange,
          granularity
        )

        return NextResponse.json({
          success: true,
          data: consumptionData,
          metadata: {
            timeRange: timeRange,
            granularity: granularity || 'auto',
            dataPoints: consumptionData.length,
            userId: user.id
          }
        })

      case 'devices':
        // Get device-specific time series data (fallback to consumption data)
        const deviceData = await timeSeriesService.queryConsumption(
          user.id,
          timeRange,
          granularity
        )

        return NextResponse.json({
          success: true,
          data: deviceData,
          metadata: {
            timeRange: timeRange,
            deviceId: deviceId || 'all',
            deviceCount: deviceData.length,
            userId: user.id
          }
        })

      case 'stats':
        // Get current real-time statistics
        const stats = await timeSeriesService.getRealTimeStats(user.id)

        return NextResponse.json({
          success: true,
          data: stats,
          metadata: {
            timestamp: new Date().toISOString(),
            userId: user.id
          }
        })

      default:
        return NextResponse.json(
          { error: `Unknown data type: ${dataType}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Time series query error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function HEAD() {
  try {
    // Simple ping to check InfluxDB connectivity
    const timeSeriesService = getTimeSeriesService()
    // This will fail gracefully if InfluxDB is not available
    await timeSeriesService.getRealTimeStats('health-check')

    return new NextResponse(null, { 
      status: 200,
      headers: {
        'X-Service': 'time-series-api',
        'X-Status': 'healthy'
      }
    })
  } catch (error) {
    return new NextResponse(null, { 
      status: 503,
      headers: {
        'X-Service': 'time-series-api',
        'X-Status': 'unhealthy',
        'X-Error': error instanceof Error ? error.message : 'unknown'
      }
    })
  }
}
