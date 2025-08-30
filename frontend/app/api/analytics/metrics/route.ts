import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

export async function POST(request: NextRequest) {
    try {
        const metric = await request.json()

        // Validate metric data
        if (!metric.name || typeof metric.value !== 'number') {
            return NextResponse.json(
                { error: 'Invalid metric data' },
                { status: 400 }
            )
        }

        // Store metric in database
        const { error } = await supabase
            .from('performance_metrics')
            .insert([{
                name: metric.name,
                value: metric.value,
                type: metric.type || 'gauge',
                timestamp: new Date(metric.timestamp || Date.now()).toISOString(),
                tags: metric.tags || {},
                session_id: metric.sessionId,
                user_id: metric.userId
            }])

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json(
                { error: 'Failed to store metric' },
                { status: 500 }
            )
        }

        // In production, you might also send to external analytics services
        if (process.env.NODE_ENV === 'production') {
            // Example: Send to Google Analytics 4
            // await sendToGA4(metric)

            // Example: Send to custom analytics service
            // await sendToAnalyticsService(metric)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Metrics API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Example function to send metrics to Google Analytics 4
async function sendToGA4(metric: any) {
    const measurementId = process.env.GA4_MEASUREMENT_ID
    const apiSecret = process.env.GA4_API_SECRET

    if (!measurementId || !apiSecret) return

    try {
        await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
            method: 'POST',
            body: JSON.stringify({
                client_id: metric.sessionId || 'anonymous',
                events: [{
                    name: 'performance_metric',
                    parameters: {
                        metric_name: metric.name,
                        metric_value: metric.value,
                        metric_type: metric.type,
                        ...metric.tags
                    }
                }]
            })
        })
    } catch (error) {
        console.error('Failed to send to GA4:', error)
    }
}
