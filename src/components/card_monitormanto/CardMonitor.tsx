'use client'

import React from 'react'

import { Avatar, Box, Button, Card, CardContent, CardHeader, Chip, Typography } from '@mui/material'

import { useSettings } from '@core/hooks/useSettings'

interface Message {
  id: string
  sender: 'operador' | 'client' | 'IA'
  content: string
  timestamp: Date
}

interface CardMonitorProps {
  clientId: string
  buttonName: string
  channel?: 'web' | 'whatsapp' | 'telegram' | 'email' | string
  messages: Message[]

  operatorName?: string
}

export default function CardMonitor({
  clientId,
  channel,
  messages,

  operatorName,
  buttonName
}: CardMonitorProps) {
  const getSenderLabel = (sender: Message['sender']) => {
    switch (sender) {
      case 'IA':
        return 'IA'
      case 'operador':
        return 'Operador'
      case 'client':
        return 'Cliente'
      default:
        return sender
    }
  }

  const lastFourMessages = messages.slice(-4)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return '📱'
      case 'telegram':
        return '✈️'
      case 'email':
        return '📧'
      default:
        return '🌐'
    }
  }

  const getSenderColor = (sender: Message['sender']) => {
    switch (sender) {
      case 'IA':
        return 'var(--mui-palette-primary-main)' // azul
      case 'operador':
        return 'var(--mui-palette-warning-main)' // verde
      case 'client':
        return '#ed6c02' // laranja
      default:
        return 'var(--mui-palette-secondary-main)'
    }
  }

  const { settings } = useSettings()

  return (
    <Card className='h-80 flex flex-col'>
      <CardHeader
        title={clientId}
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{getChannelIcon(channel ?? '')}</span>
            <Typography variant='body2' color='text.secondary'>
              {channel}
            </Typography>
            {operatorName && (
              <Chip label={operatorName} size='small' variant='outlined' sx={{ fontSize: '0.7rem', height: '20px' }} />
            )}
          </Box>
        }
        action={<Button>{buttonName}</Button>}
      />
      <CardContent
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          pb: 2
        }}
      >
        {lastFourMessages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              color: 'text.secondary'
            }}
          >
            <Typography variant='body2'>Nenhuma mensagem</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              overflow: 'auto'
            }}
          >
            {lastFourMessages.map(message => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  flexDirection: message.sender === 'client' ? 'row' : 'row-reverse',
                  alignItems: 'flex-start',
                  gap: 1
                }}
              >
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: '0.75rem',
                    bgcolor: getSenderColor(message.sender)
                  }}
                >
                  {message.sender === 'IA' ? 'IA' : message.sender === 'operador' ? 'OP' : 'CL'}
                </Avatar>

                <Box
                  sx={{
                    flex: 1,
                    maxWidth: '80%'
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor:
                        message.sender === 'client'
                          ? settings.mode === 'dark'
                            ? '#838383'
                            : '#e4e4e4'
                          : getSenderColor(message.sender),
                      borderRadius: 2,

                      padding: '8px 12px',
                      wordWrap: 'break-word',
                      fontSize: '0.875rem',
                      lineHeight: 1.3
                    }}
                  >
                    <Typography
                      variant='body2'
                      component='div'
                      color={
                        message.sender === 'operador' || message.sender === 'IA'
                          ? settings.mode === 'dark'
                            ? 'black'
                            : '#ffffff'
                          : undefined
                      }
                    >
                      {message.content}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      mt: 0.5,
                      alignItems: 'center',
                      justifyContent: message.sender === 'client' ? 'flex-start' : 'flex-end'
                    }}
                  >
                    <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.7rem' }}>
                      {getSenderLabel(message.sender)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.7rem' }}>
                      {formatTime(message.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
