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
        const errorInfo = await request.json()

        // Validate error data
        if (!errorInfo.message) {
            return NextResponse.json(
                { error: 'Invalid error data' },
                { status: 400 }
            )
        }

        // Store error in database
        const { error } = await supabase
            .from('error_logs')
            .insert([{
                message: errorInfo.message,
                stack: errorInfo.stack,
                component_stack: errorInfo.componentStack,
                timestamp: new Date(errorInfo.timestamp || Date.now()).toISOString(),
                severity: errorInfo.severity || 'medium',
                tags: errorInfo.tags || {},
                session_id: errorInfo.sessionId,
                user_id: errorInfo.userId,
                url: errorInfo.url,
                user_agent: errorInfo.userAgent
            }])

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json(
                { error: 'Failed to store error' },
                { status: 500 }
            )
        }

        // Send to external error tracking services in production
        if (process.env.NODE_ENV === 'production') {
            // Send to Sentry, LogRocket, or other error tracking services
            await sendToErrorTrackingService(errorInfo)
        }

        // Send alerts for critical errors
        if (errorInfo.severity === 'critical') {
            await sendCriticalErrorAlert(errorInfo)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error tracking API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

async function sendToErrorTrackingService(errorInfo: any) {
    // Example integration with error tracking services

    // Sentry integration example
    const sentryDsn = process.env.SENTRY_DSN
    if (sentryDsn) {
        try {
            // This would typically use the Sentry SDK
            // For now, we'll use a direct API call as an example
            await fetch(`${sentryDsn}/api/store/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Sentry-Auth': `Sentry sentry_key=${process.env.SENTRY_KEY}`
                },
                body: JSON.stringify({
                    message: errorInfo.message,
                    level: errorInfo.severity,
                    platform: 'javascript',
                    sdk: { name: 'urjabandhu-frontend', version: '1.0.0' },
                    exception: {
                        values: [{
                            type: 'Error',
                            value: errorInfo.message,
                            stacktrace: errorInfo.stack ? {
                                frames: parseStackTrace(errorInfo.stack)
                            } : undefined
                        }]
                    },
                    tags: errorInfo.tags,
                    user: errorInfo.userId ? { id: errorInfo.userId } : undefined,
                    request: {
                        url: errorInfo.url,
                        headers: {
                            'User-Agent': errorInfo.userAgent
                        }
                    },
                    timestamp: new Date(errorInfo.timestamp).toISOString()
                })
            })
        } catch (error) {
            console.error('Failed to send to Sentry:', error)
        }
    }
}

async function sendCriticalErrorAlert(errorInfo: any) {
    // Send alerts via email, Slack, Discord, etc. for critical errors

    const webhookUrl = process.env.SLACK_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL

    if (webhookUrl) {
        try {
            const isSlack = webhookUrl.includes('slack.com')

            const payload = isSlack ? {
                text: `🚨 Critical Error in UrjaBandhu`,
                attachments: [{
                    color: 'danger',
                    fields: [
                        { title: 'Error Message', value: errorInfo.message, short: false },
                        { title: 'URL', value: errorInfo.url, short: true },
                        { title: 'User ID', value: errorInfo.userId || 'Anonymous', short: true },
                        { title: 'Timestamp', value: new Date(errorInfo.timestamp).toISOString(), short: true },
                        { title: 'Session ID', value: errorInfo.sessionId, short: true }
                    ]
                }]
            } : {
                content: `🚨 **Critical Error in UrjaBandhu**\n\n**Message:** ${errorInfo.message}\n**URL:** ${errorInfo.url}\n**User:** ${errorInfo.userId || 'Anonymous'}\n**Time:** ${new Date(errorInfo.timestamp).toISOString()}`
            }

            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
        } catch (error) {
            console.error('Failed to send critical error alert:', error)
        }
    }
}

function parseStackTrace(stack: string) {
    // Simple stack trace parser for Sentry format
    return stack.split('\n').map(line => {
        const match = line.match(/at (.+) \((.+):(\d+):(\d+)\)/)
        if (match) {
            return {
                function: match[1],
                filename: match[2],
                lineno: parseInt(match[3]),
                colno: parseInt(match[4])
            }
        }
        return { function: line.trim() }
    }).filter(frame => frame.function)
}
