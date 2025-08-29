import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { audioBlob } = await request.json()
    
    if (!audioBlob) {
      return NextResponse.json(
        { error: 'Audio data is required' },
        { status: 400 }
      )
    }

    const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY
    const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION

    if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
      return NextResponse.json(
        { error: 'Azure Speech services not configured' },
        { status: 500 }
      )
    }

    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(audioBlob.split(',')[1], 'base64')

    // Azure Speech-to-Text API call
    const response = await fetch(
      `https://${AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
          'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
        },
        body: audioBuffer,
      }
    )

    if (!response.ok) {
      throw new Error(`Azure Speech API error: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.RecognitionStatus === 'Success') {
      return NextResponse.json({
        text: result.DisplayText,
        confidence: result.Confidence || 0.9,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json(
        { error: 'Speech recognition failed', details: result },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Speech-to-text error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
