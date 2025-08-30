import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        message: 'Test API is working!',
        timestamp: new Date().toISOString(),
        env_check: {
            gemini_key_present: !!process.env.GOOGLE_GEMINI_API_KEY,
            gemini_key_prefix: process.env.GOOGLE_GEMINI_API_KEY?.substring(0, 10) || 'Not found'
        }
    })
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        return NextResponse.json({
            message: 'Test API POST is working!',
            received: body,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
}
