'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'

interface SpeechToTextOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  useAzure?: boolean
}

interface TextToSpeechOptions {
  voice?: string
  speed?: number
  pitch?: number
  volume?: number
  useAzure?: boolean
}

interface AudioRecordingState {
  isRecording: boolean
  audioBlob: Blob | null
  mediaRecorder: MediaRecorder | null
  stream: MediaStream | null
}

export function useSpeechServices() {
  // Speech-to-Text state
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)
  
  // Text-to-Speech state
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [availableVoices, setAvailableVoices] = useState<any[]>([])
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  
  // Audio recording state for Azure STT
  const [recording, setRecording] = useState<AudioRecordingState>({
    isRecording: false,
    audioBlob: null,
    mediaRecorder: null,
    stream: null
  })

  // Web Speech API recognition
  const recognitionRef = useRef<any>(null)
  const chunksRef = useRef<Blob[]>([])

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setTranscript(transcript)
          setIsListening(false)
          toast.success('✅ Speech captured successfully!')
        }
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          toast.error('❌ Speech recognition failed. Please try again.')
        }
        
        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [])

  // Load available voices for Azure TTS
  useEffect(() => {
    loadAvailableVoices()
  }, [])

  const loadAvailableVoices = async () => {
    try {
      const response = await fetch('/api/text-to-speech')
      if (response.ok) {
        const data = await response.json()
        setAvailableVoices(data.voices || [])
      }
    } catch (error) {
      console.error('Failed to load voices:', error)
    }
  }

  // Start recording for Azure STT
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })
      
      chunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' })
        setRecording(prev => ({ ...prev, audioBlob, isRecording: false }))
        
        // Convert and send to Azure
        await processAudioWithAzure(audioBlob)
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop())
        setRecording(prev => ({ ...prev, stream: null, mediaRecorder: null }))
      }
      
      setRecording({
        isRecording: true,
        audioBlob: null,
        mediaRecorder,
        stream
      })
      
      mediaRecorder.start()
      toast.success('🎤 Recording started... Speak now!')
      
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast.error('❌ Failed to access microphone')
    }
  }, [])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recording.mediaRecorder && recording.isRecording) {
      recording.mediaRecorder.stop()
      toast.loading('⏹️ Processing audio...')
      setIsProcessingAudio(true)
    }
  }, [recording])

  // Process audio with Azure STT
  const processAudioWithAzure = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Audio = reader.result as string
        
        const response = await fetch('/api/speech-to-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ audioBlob: base64Audio }),
        })
        
        if (response.ok) {
          const data = await response.json()
          setTranscript(data.text)
          toast.success(`✅ Azure STT: "${data.text}"`)
        } else {
          throw new Error('Azure STT failed')
        }
      }
      reader.readAsDataURL(audioBlob)
      
    } catch (error) {
      console.error('Azure STT error:', error)
      toast.error('❌ Azure speech recognition failed')
    } finally {
      setIsProcessingAudio(false)
    }
  }

  // Start speech-to-text (with fallback)
  const startSpeechToText = useCallback(async (options: SpeechToTextOptions = {}) => {
    const { useAzure = true } = options
    
    if (useAzure) {
      await startRecording()
    } else {
      // Fallback to Web Speech API
      if (!recognitionRef.current) {
        toast.error('Speech recognition not supported in this browser')
        return
      }
      
      if (isListening) {
        recognitionRef.current.stop()
        setIsListening(false)
      } else {
        recognitionRef.current.start()
        setIsListening(true)
        toast.success('🎤 Listening... Speak now!')
      }
    }
  }, [isListening, startRecording])

  // Stop speech-to-text
  const stopSpeechToText = useCallback(() => {
    if (recording.isRecording) {
      stopRecording()
    } else if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [recording.isRecording, isListening, stopRecording])

  // Text-to-speech with Azure
  const speakText = useCallback(async (text: string, options: TextToSpeechOptions = {}) => {
    const { 
      voice = 'en-US-AriaNeural', 
      speed = 1.0, 
      pitch = 1.0, 
      volume = 1.0,
      useAzure = true 
    } = options

    if (isSpeaking) {
      stopSpeaking()
      return
    }

    if (useAzure) {
      try {
        setIsSpeaking(true)
        toast.loading('🗣️ Generating speech...')
        
        const response = await fetch('/api/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, voice, speed, pitch }),
        })
        
        if (response.ok) {
          const data = await response.json()
          const audio = new Audio(data.audioData)
          audio.volume = volume
          
          audio.onended = () => {
            setIsSpeaking(false)
            setCurrentAudio(null)
            toast.dismiss()
          }
          
          audio.onerror = () => {
            setIsSpeaking(false)
            setCurrentAudio(null)
            toast.dismiss()
            toast.error('❌ Audio playback failed')
          }
          
          setCurrentAudio(audio)
          await audio.play()
          toast.dismiss()
          toast.success('🗣️ Playing AI response')
          
        } else {
          throw new Error('TTS API failed')
        }
        
      } catch (error) {
        console.error('Azure TTS error:', error)
        setIsSpeaking(false)
        toast.dismiss()
        toast.error('❌ Text-to-speech failed')
      }
    } else {
      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = speed
        utterance.pitch = pitch
        utterance.volume = volume
        
        utterance.onstart = () => {
          setIsSpeaking(true)
          toast.success('🗣️ Speaking...')
        }
        
        utterance.onend = () => {
          setIsSpeaking(false)
        }
        
        utterance.onerror = () => {
          setIsSpeaking(false)
          toast.error('❌ Speech synthesis failed')
        }
        
        speechSynthesis.speak(utterance)
      } else {
        toast.error('Text-to-speech not supported in this browser')
      }
    }
  }, [isSpeaking])

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
    }
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
    
    setIsSpeaking(false)
    toast.dismiss()
  }, [currentAudio])

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return {
    // Speech-to-Text
    isListening: isListening || recording.isRecording,
    transcript,
    isProcessingAudio,
    startSpeechToText,
    stopSpeechToText,
    clearTranscript,
    
    // Text-to-Speech
    isSpeaking,
    availableVoices,
    speakText,
    stopSpeaking,
    
    // Audio recording state
    isRecording: recording.isRecording,
    
    // Utility
    isSupported: {
      webSpeechSTT: !!recognitionRef.current,
      webSpeechTTS: 'speechSynthesis' in window,
      mediaRecorder: 'MediaRecorder' in window
    }
  }
}
