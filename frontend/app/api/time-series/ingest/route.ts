/**
 * Time Series Data Ingestion API
 * Handles real-time consumption data collection from devices
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTimeSeriesService, ConsumptionReading } from '@/lib/influxdb'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { readings, source } = body

    // Validate readings
    if (!Array.isArray(readings) || readings.length === 0) {
      return NextResponse.json(
        { error: 'Readings array is required and cannot be empty' },
        { status: 400 }
      )
    }

    // Validate each reading
    const validatedReadings: ConsumptionReading[] = readings.map(reading => {
      if (typeof reading.consumption !== 'number' || reading.consumption < 0) {
        throw new Error('Invalid consumption value')
      }
      if (typeof reading.power !== 'number' || reading.power < 0) {
        throw new Error('Invalid power value')
      }
      if (typeof reading.cost !== 'number' || reading.cost < 0) {
        throw new Error('Invalid cost value')
      }

      return {
        user_id: user.id,
        device_id: reading.deviceId || undefined,
        consumption: reading.consumption,
        cost: reading.cost,
        location: reading.location || undefined,
        timestamp: reading.timestamp ? new Date(reading.timestamp) : new Date()
      }
    })

    // Write to InfluxDB
    const timeSeriesService = getTimeSeriesService()
    
    // Write each reading individually
    for (const reading of validatedReadings) {
      await timeSeriesService.writeConsumption(reading)
    }

    // Log data ingestion (optional)
    console.log(`Successfully ingested ${validatedReadings.length} readings from ${source || 'unknown source'} for user ${user.id}`)

    return NextResponse.json({
      success: true,
      message: `Successfully ingested ${validatedReadings.length} readings`,
      count: validatedReadings.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Time series ingestion error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// Generate mock data for testing
export async function PUT(request: NextRequest) {
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

    // Parse request body for mock data configuration
    const body = await request.json()
    const { deviceCount = 5, batchSize = 1 } = body

    // Generate mock data
    const timeSeriesService = getTimeSeriesService()
    
    for (let i = 0; i < batchSize; i++) {
      await timeSeriesService.generateMockData('1h') // Generate mock data for 1 hour timerange
      
      // Add a small delay between batches to simulate real-time data
      if (i < batchSize - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${batchSize} batches of mock data with ${deviceCount} devices each`,
      deviceCount,
      batchSize,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Mock data generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
