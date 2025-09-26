// file: src/components/AudioPlayer/AudioPlayer.tsx
import React, { useState, useRef, useEffect } from 'react'

import { Box, IconButton, Typography, LinearProgress, Chip, CircularProgress } from '@mui/material'
import { Play, Pause, Volume2, Download } from 'lucide-react'

interface AudioPlayerProps {
  audioUrl: string
  messageId: string
  compact?: boolean
  onError?: (error: Error) => void
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, compact = false, onError }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleError = () => {
      const errorMessage = 'Erro ao carregar áudio'

      setError(errorMessage)
      setLoading(false)

      if (onError) {
        onError(new Error(errorMessage))
      }
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [onError])

  const togglePlayPause = async () => {
    const audio = audioRef.current

    if (!audio) return

    try {
      if (isPlaying) {
        await audio.pause()
        setIsPlaying(false)
      } else {
        setLoading(true)
        await audio.play()
        setIsPlaying(true)
        setLoading(false)
      }
    } catch (err) {
      console.error('Erro ao reproduzir áudio:', err)
      setError('Erro ao reproduzir')
      setLoading(false)
    }
  }

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)

    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          bgcolor: 'error.light',
          borderRadius: 1
        }}
      >
        <Volume2 size={16} />
        <Typography variant='caption' color='error'>
          {error}
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minWidth: compact ? 200 : 250,
        p: 1,
        bgcolor: 'action.hover',
        borderRadius: 1
      }}
    >
      <audio ref={audioRef} src={audioUrl} preload='metadata' />

      <IconButton
        size='small'
        onClick={togglePlayPause}
        disabled={loading}
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          '&:hover': { bgcolor: 'primary.dark' }
        }}
      >
        {loading ? (
          <CircularProgress size={16} color='inherit' />
        ) : isPlaying ? (
          <Pause size={16} />
        ) : (
          <Play size={16} />
        )}
      </IconButton>

      <Box sx={{ flex: 1 }}>
        <LinearProgress variant='determinate' value={progress} sx={{ height: 4, borderRadius: 2 }} />
        {!compact && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant='caption'>{formatTime(currentTime)}</Typography>
            <Typography variant='caption'>{formatTime(duration)}</Typography>
          </Box>
        )}
      </Box>

      <Chip label='Áudio' size='small' color='primary' variant='outlined' icon={<Volume2 size={12} />} />

      <IconButton size='small' component='a' href={audioUrl} download target='_blank'>
        <Download size={16} />
      </IconButton>
    </Box>
  )
}
