import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image_url, user_id } = body

    if (!image_url) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Call your Supabase Edge Function
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ocr-device-detection`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          image_url,
          user_id
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('OCR function error:', error)
      return NextResponse.json(
        { error: 'OCR processing failed' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
