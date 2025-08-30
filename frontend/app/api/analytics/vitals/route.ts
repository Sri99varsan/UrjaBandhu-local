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
        const vital = await request.json()

        // Validate vital data
        if (!vital.name || typeof vital.value !== 'number') {
            return NextResponse.json(
                { error: 'Invalid vital data' },
                { status: 400 }
            )
        }

        // Store vital in database
        const { error } = await supabase
            .from('web_vitals')
            .insert([{
                name: vital.name,
                value: vital.value,
                rating: vital.rating,
                timestamp: new Date(vital.timestamp || Date.now()).toISOString(),
                session_id: vital.sessionId,
                user_id: vital.userId,
                url: vital.url,
                user_agent: vital.userAgent
            }])

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json(
                { error: 'Failed to store vital' },
                { status: 500 }
            )
        }

        // Send to external services in production
        if (process.env.NODE_ENV === 'production') {
            // Send to Google Analytics 4
            await sendVitalToGA4(vital)

            // Send to web performance monitoring services
            // await sendToWebVitalsService(vital)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Vitals API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

async function sendVitalToGA4(vital: any) {
    const measurementId = process.env.GA4_MEASUREMENT_ID
    const apiSecret = process.env.GA4_API_SECRET

    if (!measurementId || !apiSecret) return

    try {
        await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
            method: 'POST',
            body: JSON.stringify({
                client_id: vital.sessionId || 'anonymous',
                events: [{
                    name: 'web_vital',
                    parameters: {
                        metric_name: vital.name,
                        metric_value: vital.value,
                        metric_rating: vital.rating,
                        page_location: vital.url
                    }
                }]
            })
        })
    } catch (error) {
        console.error('Failed to send vital to GA4:', error)
    }
}
