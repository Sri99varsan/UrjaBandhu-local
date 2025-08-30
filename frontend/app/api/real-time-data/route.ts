import { NextRequest, NextResponse } from 'next/server'
import { dataPipeline } from '@/lib/data-pipeline/real-time-service'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const range = searchParams.get('range') as '1h' | '6h' | '24h' | '7d' | '30d' || '24h'

        // Generate time series data for the requested range
        const data = dataPipeline.generateTimeSeriesData(range)

        // Calculate metrics
        const metrics = dataPipeline.calculateRealTimeMetrics(data)

        // Detect anomalies
        const anomalies = dataPipeline.detectAnomalies(data)

        return NextResponse.json({
            success: true,
            data: data,
            metrics: metrics,
            anomalies: anomalies,
            timestamp: new Date().toISOString(),
            range: range
        })

    } catch (error) {
        console.error('Error fetching time series data:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch time series data' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { dataPoints } = body

        // Validate incoming data points
        const validData = dataPoints.filter((dp: any) => dataPipeline.validateDataPoint(dp))

        if (validData.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No valid data points provided' },
                { status: 400 }
            )
        }

        // In a real implementation, this would save to InfluxDB
        console.log(`Received ${validData.length} valid data points`)

        return NextResponse.json({
            success: true,
            message: `Processed ${validData.length} data points`,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Error processing data points:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to process data points' },
            { status: 500 }
        )
    }
}
