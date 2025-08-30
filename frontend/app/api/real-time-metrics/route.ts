import { NextRequest, NextResponse } from 'next/server'
import { dataPipeline } from '@/lib/data-pipeline/real-time-service'

export async function GET(request: NextRequest) {
  try {
    // Generate current real-time data
    const currentData = dataPipeline.generateRealtimeData()
    
    // Calculate current metrics
    const metrics = dataPipeline.calculateRealTimeMetrics(currentData)
    
    // Check connection status
    const isConnected = await dataPipeline.connectToInfluxDB()
    
    return NextResponse.json({
      success: true,
      data: currentData,
      metrics: metrics,
      isConnected: isConnected,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error fetching real-time metrics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch real-time metrics' },
      { status: 500 }
    )
  }
}

// Health check endpoint for the data pipeline
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === 'health-check') {
      const isConnected = await dataPipeline.connectToInfluxDB()
      return NextResponse.json({
        success: true,
        status: isConnected ? 'healthy' : 'degraded',
        services: {
          influxdb: isConnected,
          dataGeneration: true,
          anomalyDetection: true
        },
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Error in metrics endpoint:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
