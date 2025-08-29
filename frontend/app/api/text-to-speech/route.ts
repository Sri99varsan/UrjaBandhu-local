import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'en-US-AriaNeural', speed = 1.0, pitch = 1.0 } = await request.json()
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
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

    // Create SSML for better voice control
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voice}">
          <prosody rate="${speed}" pitch="${pitch > 1 ? '+' : ''}${((pitch - 1) * 50).toFixed(0)}%">
            ${text}
          </prosody>
        </voice>
      </speak>
    `

    // Azure Text-to-Speech API call
    const response = await fetch(
      `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        },
        body: ssml,
      }
    )

    if (!response.ok) {
      throw new Error(`Azure Speech API error: ${response.status}`)
    }

    const audioBuffer = await response.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString('base64')
    
    return NextResponse.json({
      audioData: `data:audio/mp3;base64,${audioBase64}`,
      voice,
      speed,
      pitch,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Text-to-speech error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to list available voices
export async function GET() {
  try {
    const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY
    const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION

    if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
      return NextResponse.json(
        { error: 'Azure Speech services not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Azure Speech API error: ${response.status}`)
    }

    const voices = await response.json()
    
    // Filter to most common English voices
    const popularVoices = voices.filter((voice: any) => 
      voice.Locale.startsWith('en-') && 
      (voice.VoiceType === 'Neural' || voice.VoiceType === 'Standard')
    ).map((voice: any) => ({
      name: voice.ShortName,
      displayName: voice.DisplayName,
      gender: voice.Gender,
      locale: voice.Locale,
      type: voice.VoiceType
    }))

    return NextResponse.json({
      voices: popularVoices,
      total: popularVoices.length
    })
    
  } catch (error) {
    console.error('Get voices error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
