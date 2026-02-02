"use client"
import React from 'react'
import { Mic, MicOff, Volume2, Loader2, AlertCircle, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VoiceMicButtonProps {
  isListening: boolean
  isProcessing: boolean
  isSupported: boolean
  error: string | null
  onClick: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
}

export function VoiceMicButton({
  isListening,
  isProcessing,
  isSupported,
  error,
  onClick,
  className,
  size = 'md',
  variant = 'default'
}: VoiceMicButtonProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  if (!isSupported) {
    return (
      <div className="relative group">
        <Button
          variant="ghost"
          size="icon"
          disabled
          className={cn(sizeClasses[size], 'opacity-50 cursor-not-allowed', className)}
        >
          <AlertCircle className={cn(iconSizeClasses[size], "text-destructive")} />
        </Button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-destructive text-destructive-foreground text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          Voice not supported in this browser
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-destructive" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative group">
      <Button
        variant={variant}
        size="icon"
        onClick={onClick}
        disabled={isProcessing}
        className={cn(
          sizeClasses[size],
          'transition-all duration-200',
          {
            'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/30': isListening,
            'bg-blue-500 hover:bg-blue-600 text-white': isProcessing,
            'hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-800': !isListening && !isProcessing && variant === 'ghost',
            'border-destructive text-destructive hover:bg-destructive/10': !!error
          },
          className
        )}
      >
        {isProcessing ? (
          <Loader2 className={cn(iconSizeClasses[size], 'animate-spin')} />
        ) : isListening ? (
          <MicOff className={iconSizeClasses[size]} />
        ) : error ? (
          <AlertCircle className={cn(iconSizeClasses[size])} />
        ) : (
          <Mic className={iconSizeClasses[size]} />
        )}
      </Button>

      {/* Pulse animation for listening state */}
      {isListening && (
        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20 pointer-events-none" />
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {error ? error : isListening ? 'Stop listening' : isProcessing ? 'Processing request...' : 'Voice Search'}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
      </div>

      {/* Error indicator dot */}
      {error && (
        <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background animate-bounce" />
      )}
    </div>
  )
}

interface VoiceVisualizerProps {
  isListening: boolean
  isProcessing: boolean
  confidence: number
  className?: string
}

export function VoiceVisualizer({
  isListening,
  isProcessing,
  confidence,
  className
}: VoiceVisualizerProps) {
  const bars = Array.from({ length: 5 }, (_, i) => i)

  if (!isListening && !isProcessing) {
    return null
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {bars.map((_, index) => (
        <div
          key={index}
          className={cn(
            'w-1 bg-primary rounded-full transition-all duration-150',
            {
              'animate-pulse': isListening,
              'opacity-30': !isListening
            }
          )}
          style={{
            height: isListening
              ? `${Math.random() * 16 + 8}px`
              : '4px',
            animationDelay: `${index * 100}ms`
          }}
        />
      ))}

      {confidence > 0 && (
        <div className="ml-2 text-xs text-muted-foreground">
          {Math.round(confidence * 100)}%
        </div>
      )}
    </div>
  )
}

interface VoiceStatusProps {
  isListening: boolean
  isProcessing: boolean
  transcript: string
  confidence: number
  error: string | null
  className?: string
}

export function VoiceStatus({
  isListening,
  isProcessing,
  transcript,
  confidence,
  error,
  className
}: VoiceStatusProps) {
  if (!isListening && !isProcessing && !transcript && !error) {
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm justify-center md:justify-start">
        {isProcessing && (
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Processing your request...</span>
          </div>
        )}

        {isListening && !isProcessing && (
          <div className="flex items-center gap-2 text-red-600 font-medium animate-pulse">
            <div className="h-2 w-2 bg-red-600 rounded-full" />
            <span>Listening...</span>
            <VoiceVisualizer
              isListening={isListening}
              isProcessing={isProcessing}
              confidence={confidence}
            />
          </div>
        )}

        {error && (
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium animate-in fade-in slide-in-from-bottom-2",
            error.includes('network') || error.includes('temporarily unavailable')
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
          )}>
            {error.includes('network') ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" />
            )}
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Transcript preview */}
      {transcript && (
        <div className="p-3 bg-muted/50 rounded-xl border border-border/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Live Transcript
            </div>
            {confidence > 0 && (
              <div className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm",
                confidence >= 0.8 ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                  confidence >= 0.6 ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
                    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
              )}>
                {Math.round(confidence * 100)}% CONFIDENCE
              </div>
            )}
          </div>
          <div className="text-sm font-medium leading-relaxed">{transcript}</div>
        </div>
      )}
    </div>
  )
}

interface VoiceCommandsHelpProps {
  className?: string
}

export function VoiceCommandsHelp({ className }: VoiceCommandsHelpProps) {
  const commands = [
    { phrase: "Create a trip to [destination]", description: "Start planning a new trip" },
    { phrase: "I want to travel from [city]", description: "Set departure location" },
    { phrase: "Solo trip / Family vacation", description: "Specify group size" },
    { phrase: "Cheap / Luxury budget", description: "Set budget preference" },
    { phrase: "5 days trip", description: "Specify trip duration" }
  ]

  return (
    <div className={cn('p-4 bg-muted/50 rounded-lg border', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Volume2 className="h-4 w-4 text-primary" />
        <h3 className="font-medium text-sm">Voice Commands</h3>
      </div>

      <div className="space-y-2">
        {commands.map((command, index) => (
          <div key={index} className="text-xs">
            <div className="font-medium text-primary">"{command.phrase}"</div>
            <div className="text-muted-foreground">{command.description}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        💡 Tip: Speak clearly and pause briefly between commands
      </div>
    </div>
  )
}