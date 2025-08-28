import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image_url, image_data, user_id } = body

    // Accept either image_url or image_data (base64)
    let finalImageUrl = image_url

    if (!finalImageUrl && image_data) {
      // For now, we'll create a temporary mock URL for the OCR function
      // In production, you'd want to upload to storage first
      finalImageUrl = 'data:image/jpeg;base64,' + image_data.split(',')[1]
    }

    if (!finalImageUrl) {
      return NextResponse.json(
        { error: 'Either image_url or image_data is required' },
        { status: 400 }
      )
    }

    // Get service role key properly
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceRoleKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl!, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Call the Edge Function using Supabase client
    const { data, error } = await supabase.functions.invoke('ocr-device-detection', {
      body: { 
        image_url: finalImageUrl,
        user_id: user_id || 'anonymous'
      }
    })

    if (error) {
      console.error('OCR function error:', error)
      return NextResponse.json(
        { error: 'OCR processing failed', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
