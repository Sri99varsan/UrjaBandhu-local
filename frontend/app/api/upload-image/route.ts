import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, imageData } = body

    if (!fileName || !imageData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Extract base64 data
    const base64Data = imageData.split(',')[1]
    if (!base64Data) {
      return NextResponse.json(
        { error: 'Invalid image data' },
        { status: 400 }
      )
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64')

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('device-images')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('device-images')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      publicUrl: urlData.publicUrl,
      path: data.path
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
