"use client"
import { useState, useRef, useEffect, useCallback } from 'react'

interface VoiceConversationState {
  // Speech Recognition
  isListening: boolean
  isProcessing: boolean
  transcript: string
  confidence: number
  error: string | null
  isSupported: boolean

  // Text-to-Speech
  isSpeaking: boolean
  speechQueue: string[]
  voiceEnabled: boolean
}

interface VoiceConversationControls {
  // Speech Recognition
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  toggleListening: () => void

  // Text-to-Speech
  speak: (text: string) => Promise<void>
  stopSpeaking: () => void
  clearSpeechQueue: () => void
  toggleVoice: () => void
  setVoiceEnabled: (enabled: boolean) => void
}

interface UseVoiceConversationOptions {
  // Speech Recognition options
  continuous?: boolean
  interimResults?: boolean
  language?: string
  onResult?: (transcript: string, confidence: number) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
  autoSend?: boolean
  maxDuration?: number

  // Text-to-Speech options
  voiceEnabled?: boolean
  voicePitch?: number
  voiceRate?: number
  voiceVolume?: number
  autoSpeak?: boolean
  onSpeechStart?: () => void
  onSpeechEnd?: () => void
}

export function useVoiceConversation(options: UseVoiceConversationOptions = {}): [VoiceConversationState, VoiceConversationControls] {
  const {
    // Recognition options
    continuous = true,
    interimResults = true,
    language = 'en-US',
    onResult,
    onError,
    onStart,
    onEnd,
    autoSend = false,
    maxDuration = 60000,

    // TTS options
    voiceEnabled: initialVoiceEnabled = false,
    voicePitch = 1,
    voiceRate = 1,
    voiceVolume = 1,
    autoSpeak = true,
    onSpeechStart,
    onSpeechEnd
  } = options

  const [state, setState] = useState<VoiceConversationState>({
    isListening: false,
    isProcessing: false,
    transcript: '',
    confidence: 0,
    error: null,
    isSupported: false,
    isSpeaking: false,
    speechQueue: [],
    voiceEnabled: initialVoiceEnabled
  })

  const recognition = useRef<any>(null)
  const synthesis = useRef<SpeechSynthesis | null>(null)
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      // Check for HTTPS (required for Web Speech API in non-localhost)
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (SpeechRecognition) {
        if (!isSecure) {
          console.warn('Voice recognition requires HTTPS or localhost');
          setState(prev => ({
            ...prev,
            isSupported: false,
            error: 'Voice features require a secure connection (HTTPS)'
          }))
        } else {
          try {
            recognition.current = new SpeechRecognition()
            recognition.current.continuous = continuous
            recognition.current.interimResults = interimResults
            recognition.current.lang = language
            recognition.current.maxAlternatives = 1

            setState(prev => ({ ...prev, isSupported: true, error: null }))
          } catch (error) {
            console.warn('Speech recognition initialization failed:', error)
            setState(prev => ({
              ...prev,
              isSupported: false,
              error: 'Voice recognition initialization failed'
            }))
          }
        }

      } else {
        setState(prev => ({
          ...prev,
          isSupported: false,
          error: 'Your browser does not support voice recognition. Please try Chrome or Edge.'
        }))
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        synthesis.current = window.speechSynthesis
      }
    }

    return () => {
      if (recognition.current) {
        try {
          recognition.current.abort()
        } catch (e) { /* ignore cleanup errors */ }
      }
      if (synthesis.current) {
        synthesis.current.cancel()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
    }
  }, [continuous, interimResults, language])

  // Setup Speech Recognition event listeners
  useEffect(() => {
    if (!recognition.current) return

    const handleResult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''
      let maxConfidence = 0

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript
        const confidence = result[0].confidence

        if (result.isFinal) {
          finalTranscript += transcript
          maxConfidence = Math.max(maxConfidence, confidence)
        } else {
          interimTranscript += transcript
        }
      }

      const currentTranscript = finalTranscript || interimTranscript
      const currentConfidence = maxConfidence || (interimResults ? 0.5 : 0)

      setState(prev => ({
        ...prev,
        transcript: currentTranscript,
        confidence: currentConfidence,
        isProcessing: false,
        error: null // clear errors on successful result
      }))

      if (finalTranscript && onResult) {
        onResult(finalTranscript, maxConfidence)
      }

      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }

      // Auto-stop silence timeout
      silenceTimeoutRef.current = setTimeout(() => {
        if (finalTranscript) {
          stopListening()
        }
      }, 5000) // Increased silence timeout
    }

    const handleStart = () => {
      console.log('🎤 Voice recognition started');
      setState(prev => ({
        ...prev,
        isListening: true,
        isProcessing: true,
        error: null,
        transcript: '',
        confidence: 0
      }))

      onStart?.()

      timeoutRef.current = setTimeout(() => {
        stopListening()
      }, maxDuration)
    }

    const handleEnd = () => {
      console.log('🎤 Voice recognition ended');
      setState(prev => ({
        ...prev,
        isListening: false,
        isProcessing: false
      }))

      onEnd?.()

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
    }

    const handleError = (event: any) => {
      // Only log errors that aren't "no-speech" to avoid console spam during pauses
      if (event.error !== 'no-speech') {
        console.error('🎤 Voice recognition error:', event.error);
      }

      let errorMessage = ''
      let shouldRetry = false;

      switch (event.error) {
        case 'no-speech':
          // This is normal when user pauses. We shouldn't treat it as a hard error.
          // Just silently stop or retry if we want continuous feel.
          // For now, we'll silently stop listening to avoid state conflicts, 
          // or we could implementing auto-restart here if we want "always listening" mode.
          // Let's treat it as a "silence" event rather than an error.
          errorMessage = '' // No visual error
          break
        case 'audio-capture':
          errorMessage = 'Microphone not found. Please check your settings.'
          break
        case 'not-allowed':
        case 'permission-denied':
          errorMessage = 'Microphone access denied. Please allow permission in browser settings.'
          break
        case 'network':
          errorMessage = 'Network error. Voice requires internet connection.'
          break
        case 'service-not-allowed':
          errorMessage = 'Voice service unavailable.'
          break
        case 'aborted':
          // Ignore aborted errors as they are often user-initiated
          return;
        default:
          errorMessage = `Voice Error: ${event.error}`
      }

      // Only update state if there's an actual error to show or if we need to reset state
      if (errorMessage || event.error === 'no-speech') {
        setState(prev => ({
          ...prev,
          error: errorMessage || null, // Clear error on no-speech
          isListening: false,
          isProcessing: false
        }))
      }

      if (errorMessage && onError) {
        onError(errorMessage)
      }
    }

    recognition.current.addEventListener('result', handleResult)
    recognition.current.addEventListener('start', handleStart)
    recognition.current.addEventListener('end', handleEnd)
    recognition.current.addEventListener('error', handleError)

    return () => {
      if (recognition.current) {
        recognition.current.removeEventListener('result', handleResult)
        recognition.current.removeEventListener('start', handleStart)
        recognition.current.removeEventListener('end', handleEnd)
        recognition.current.removeEventListener('error', handleError)
      }
    }
  }, [onResult, onError, onStart, onEnd, maxDuration])

  // Speech Recognition Controls
  const startListening = useCallback(() => {
    if (!recognition.current || !state.isSupported) {
      setState(prev => ({
        ...prev,
        error: prev.error || 'Voice recognition not initialized'
      }))
      return
    }

    if (state.isListening) {
      return
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setState(prev => ({
        ...prev,
        error: 'Voice recognition requires an internet connection'
      }))
      return
    }

    // Stop speaking before listening
    if (synthesis.current && state.isSpeaking) {
      synthesis.current.cancel()
      setState(prev => ({ ...prev, isSpeaking: false }))
    }

    try {
      setState(prev => ({ ...prev, error: null }))
      recognition.current.start()
    } catch (error: any) {
      console.error('Failed to start recognition:', error);
      let errorMessage = 'Failed to start voice recognition'

      if (error.name === 'InvalidStateError') {
        // Already started, ignore
        return;
      } else if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone permission denied'
      }

      setState(prev => ({
        ...prev,
        error: errorMessage
      }))
    }
  }, [state.isSupported, state.isListening, state.isSpeaking, state.error])

  const stopListening = useCallback(() => {
    if (recognition.current && state.isListening) {
      try {
        recognition.current.stop()
      } catch (e) {
        console.warn('Error stopping recognition:', e)
      }
    }
  }, [state.isListening])

  const resetTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      confidence: 0,
      error: null
    }))
  }, [])

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [state.isListening, startListening, stopListening])

  // Text-to-Speech Controls
  const speak = useCallback(async (text: string): Promise<void> => {
    if (!synthesis.current || !state.voiceEnabled) {
      return
    }

    // Stop current speech
    synthesis.current.cancel()

    return new Promise((resolve, reject) => {
      try {
        // Strip out markdown for cleaner speech
        const cleanText = text.replace(/[*#`_]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText)

        // Configure voice settings
        utterance.pitch = voicePitch
        utterance.rate = voiceRate
        utterance.volume = voiceVolume
        utterance.lang = language

        // Get available voices and select best one
        const voices = synthesis.current!.getVoices()
        // Try to find a Google voice first as they are often higher quality
        const preferredVoice = voices.find(voice =>
          voice.lang.startsWith(language.split('-')[0]) && voice.name.includes('Google')
        ) || voices.find(voice =>
          voice.lang.startsWith(language.split('-')[0])
        ) || voices[0]

        if (preferredVoice) {
          utterance.voice = preferredVoice
        }

        utterance.onstart = () => {
          setState(prev => ({ ...prev, isSpeaking: true }))
          onSpeechStart?.()
        }

        utterance.onend = () => {
          setState(prev => ({ ...prev, isSpeaking: false }))
          onSpeechEnd?.()
          resolve()
        }

        utterance.onerror = (event) => {
          setState(prev => ({ ...prev, isSpeaking: false }))
          // Only log actual errors, not interrupted/canceled events
          if (event.error && event.error !== 'interrupted' && event.error !== 'canceled') {
            console.error('Speech synthesis error:', event.error)
          }
          // Don't reject for common interruptions
          resolve()
        }

        synthesis.current!.speak(utterance)
      } catch (error) {
        console.error('Error in text-to-speech:', error)
        resolve() // Don't crash the flow
      }
    })
  }, [state.voiceEnabled, voicePitch, voiceRate, voiceVolume, language, onSpeechStart, onSpeechEnd])

  const stopSpeaking = useCallback(() => {
    if (synthesis.current) {
      synthesis.current.cancel()
      setState(prev => ({ ...prev, isSpeaking: false, speechQueue: [] }))
    }
  }, [])

  const clearSpeechQueue = useCallback(() => {
    setState(prev => ({ ...prev, speechQueue: [] }))
  }, [])

  const toggleVoice = useCallback(() => {
    setState(prev => {
      const newEnabled = !prev.voiceEnabled
      if (!newEnabled && synthesis.current) {
        synthesis.current.cancel()
      }
      return { ...prev, voiceEnabled: newEnabled, isSpeaking: false }
    })
  }, [])

  const setVoiceEnabled = useCallback((enabled: boolean) => {
    setState(prev => {
      if (!enabled && synthesis.current) {
        synthesis.current.cancel()
      }
      return { ...prev, voiceEnabled: enabled, isSpeaking: false }
    })
  }, [])

  return [
    state,
    {
      startListening,
      stopListening,
      resetTranscript,
      toggleListening,
      speak,
      stopSpeaking,
      clearSpeechQueue,
      toggleVoice,
      setVoiceEnabled
    }
  ]
}

// Extend Window interface
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}
