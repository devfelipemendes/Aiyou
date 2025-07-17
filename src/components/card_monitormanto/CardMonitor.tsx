import React, { useEffect, useRef } from 'react'

import { Card, CardContent, CardHeader, Chip, Typography, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import ChatLog from '../chatLog/chatLog'
import CustomIconButton from '@core/components/mui/IconButton'

import type { ChatMonitorProps } from '@/types/newChatypes'
import type { ChatWithHistory } from '@/api/endpoints/chat/history'

interface ChatMonitorAdaptedProps {
  chatData: ChatWithHistory
  isDragging?: boolean
  dragListeners?: any
  dragAttributes?: any
  onChatSelect?: (protocol: string) => void
  isSelected?: boolean
}

const getStatusColor = (status: ChatMonitorProps['statusChat'], callOperator: boolean): string => {
  if (callOperator) return 'error.main'

  switch (status) {
    case 'active':
      return 'primary.main'
    case 'inactive':
      return '#797979'
    case 'resolved':
      return 'success.main'
    case 'unresolved':
      return 'warning.main'
    default:
      return 'text.primary'
  }
}

const getStatusProtocol = (status: ChatMonitorProps['statusChat'], callOperator: boolean) => {
  if (callOperator) {
    return <Chip label='Chamada do Operador' color='error' variant='tonal' className='mr-2' />
  }

  const config = {
    active: { label: 'Ativo', color: 'primary' },
    inactive: { label: 'Inativo', color: 'warning', sx: { bgcolor: '#797979' } },
    resolved: { label: 'Resolvido', color: 'success' },
    unresolved: { label: 'Não resolvido', color: 'warning' }
  }[status] ?? { label: 'Ativo', color: 'success' }

  return <Chip label={config.label} color={config.color as any} variant='tonal' sx={config.sx} className='mr-2' />
}

const getCardShadowByStatus = (status: ChatMonitorProps['statusChat'], isDragging: boolean) => {
  const defaultShadow = { boxShadow: isDragging ? 8 : 4 }

  const shadows: Record<string, { boxShadow: string }> = {
    unresolved: { boxShadow: '0px 0px 15px var(--mui-palette-warning-main)' },
    resolved: { boxShadow: '0px 0px 15px var(--mui-palette-success-main)' },
    inactive: { boxShadow: '0px 0px 15px #353535' }
  }

  return shadows[status] ?? defaultShadow
}

const calculateProgressTime = (createdAt: string, updatedAt: string) => {
  const start = new Date(createdAt).getTime()
  const end = updatedAt ? new Date(updatedAt).getTime() : Date.now()
  const diffMs = end - start

  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`

  return `${minutes}m`
}

export default function CardMonitor({
  chatData,
  dragListeners,
  dragAttributes,
  onChatSelect,
  isDragging = false
}: ChatMonitorAdaptedProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const theme = useTheme()
  const modeTheme = theme.palette.mode

  const {
    protocol,
    assistant,
    source,
    identifier,
    status,

    historyError,
    historyLoading,
    messageCount,
    lastMessage,
    created_at,
    updated_at
  } = chatData

  const callOperator = !!historyError

  // const clientProtocolName = assistant?.name || `Chat ${protocol.slice(-6)}`
  const progressTime = calculateProgressTime(created_at, updated_at)
  const attendant = assistant?.name || 'Sistema'

  const handleCardClick = () => {
    if (onChatSelect) {
      onChatSelect(protocol)
    }
  }

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [chatData])

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        cursor: isDragging ? 'grabbing' : 'default',
        transform: isDragging ? 'rotate(5deg)' : 'none',
        transition: 'all 0.2s ease',
        boxShadow: callOperator
          ? '0 0 12px var(--mui-palette-error-main)'
          : getCardShadowByStatus(status, isDragging).boxShadow,
        animation: callOperator ? 'pulseShadow 2s cubic-bezier(0.66, 0, 0, 1) infinite' : 'none',
        '@keyframes pulseShadow': {
          '0%': {
            boxShadow: '0 0 6px var(--mui-palette-error-main)'
          },
          '50%': {
            boxShadow: '0 0 20px var(--mui-palette-error-main)'
          },
          '100%': {
            boxShadow: '0 0 6px var(--mui-palette-error-main)'
          }
        }
      }}
    >
      <CardHeader
        title={
          <Typography variant='h5' sx={{ color: getStatusColor(status, callOperator) }}>
            {identifier} • {protocol || 'N/A'}
          </Typography>
        }
        subheader={
          <Box>
            <Typography variant='body2' color='text.secondary'>
              {identifier} • {protocol}
            </Typography>
            {lastMessage && (
              <Typography variant='caption' color='text.secondary'>
                Última mensagem: {new Date(lastMessage.created_at).toLocaleString()}
              </Typography>
            )}
          </Box>
        }
        action={
          <Box>
            {getStatusProtocol(status, callOperator)}
            <CustomIconButton
              color='primary'
              variant='outlined'
              {...dragListeners}
              {...dragAttributes}
              sx={{
                cursor: isDragging ? 'grabbing' : 'grab',
                '&:hover': {
                  transform: 'scale(1.05)',
                  transition: 'transform 0.2s ease'
                }
              }}
              title='Clique e arraste para reordenar'
              onCli
            >
              <i className='ri-drag-move-2-fill' />
            </CustomIconButton>
          </Box>
        }
      />
      <CardContent>
        <Card>
          <CardContent
            ref={scrollContainerRef}
            sx={{
              position: 'relative',
              minHeight: '200px',
              maxHeight: '300px',
              overflowY: 'auto',
              backgroundImage: `${
                modeTheme === 'light'
                  ? 'linear-gradient(rgba(241, 241, 241, 0.95), rgba(255,255,255,0.95))'
                  : 'linear-gradient( rgba(28, 24, 48, 0.95), rgba(40,36,61,0.95))'
              }, url("/images/identidadeVisual/bgChat.png")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              overflowX: 'hidden',
              width: '100%',
              scrollBehavior: 'smooth',
              cursor: 'default',
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.divider,
                borderRadius: '3px',
                '&:hover': {
                  background: theme.palette.text.secondary
                }
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box className='flex flex-row'>
                {!historyLoading && !callOperator && (
                  <Box className='flex flex-row'>
                    {/* ✅ USANDO CHATLOG ADAPTADO */}
                    <ChatLog
                      chatData={chatData}
                      isBelowLgScreen={false}
                      isBelowMdScreen={false}
                      isBelowSmScreen={false}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box className='flex flex-row justify-between mt-5'>
          <Typography variant='subtitle2' color='textDisabled'>
            Em andamento há: {progressTime}
          </Typography>
          <Typography variant='subtitle2' color='textDisabled'>
            Sendo atendido por: {attendant}
          </Typography>
          <Typography variant='caption' color='textDisabled'>
            {messageCount} mensagens • {source}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
