import React, { useEffect, useRef, memo, useCallback, useMemo } from 'react'

import { Card, CardContent, CardHeader, Chip, Typography, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import ChatLog from '../chatLog/chatLog'
import CustomIconButton from '@core/components/mui/IconButton'
import { useChatDataOptimized } from '@/hooks/useChatDataOptmizedReturn'

// 🔧 INTERFACE SIMPLIFICADA
interface ChatMonitorOptimizedProps {
  protocol: string
  isDragging?: boolean
  dragListeners?: any
  dragAttributes?: any
  onChatSelect?: (protocol: string) => void
  onChatDoubleClick?: (protocol: string) => void
  isSelected?: boolean
  isWebSocketConnected?: boolean
  isInModal?: boolean
}
interface StatusConfig {
  label: string

  color: 'primary' | 'warning' | 'success' | 'error'
  sx?: { bgcolor?: string }
}

// 🔧 FUNÇÕES HELPER (mantidas iguais)
const getStatusColor = (status: string, callOperator: boolean): string => {
  if (callOperator) return 'error.main'

  const statusColors = {
    active: 'primary.main',
    inactive: '#797979',
    resolved: 'success.main',
    unresolved: 'warning.main'
  } as const

  return statusColors[status as keyof typeof statusColors] || 'text.primary'
}

const GetStatusProtocol = memo(({ status, callOperator }: { status: string; callOperator: boolean }) => {
  if (callOperator) {
    return <Chip label='Atenção' color='error' variant='outlined' className='mr-2' />
  }

  const statusConfigs: Record<string, StatusConfig> = {
    active: { label: 'Ativo', color: 'primary' },
    inactive: { label: 'Inativo', color: 'warning', sx: { bgcolor: '#797979' } },
    resolved: { label: 'Resolvido', color: 'success' },
    unresolved: { label: 'Não resolvido', color: 'warning' }
  }

  const config = statusConfigs[status as keyof typeof statusConfigs] ?? statusConfigs.active

  return <Chip label={config.label} color={config.color} variant='outlined' sx={config.sx} className='mr-2' />
})

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

// 🔥 COMPONENTE OTIMIZADO
const CardMonitorOptimized = memo<ChatMonitorOptimizedProps>(props => {
  const {
    protocol,
    dragListeners,
    dragAttributes,
    onChatSelect,
    isDragging = false,
    onChatDoubleClick,
    isInModal = false
  } = props

  const { chatData, isLoading, hasError, messageCount, lastMessageId, isAwaitingHistory } = useChatDataOptimized(
    protocol,
    {
      enableDeepComparison: true,
      debugMode: process.env.NODE_ENV === 'development'
    }
  )

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const clickTimeout = useRef<NodeJS.Timeout | null>(null)
  const clickCount = useRef(0)
  const renderCount = useRef(0)

  const theme = useTheme()
  const modeTheme = theme.palette.mode

  renderCount.current++

  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 CardMonitor ${protocol} - Render #${renderCount.current}`, {
      messageCount,
      lastMessageId,
      isLoading,
      hasError,
      isAwaitingHistory,
      optimization: 'Factory Selector'
    })
  }

  // 📊 EXTRAIR DADOS (com valores padrão para evitar erros)
  const { identifier, status, callOperator, attendant, progressTime, statusColor } = useMemo(() => {
    if (!chatData) {
      return {
        identifier: protocol.slice(-6),
        status: 'inactive',
        callOperator: false,
        attendant: 'Sistema',
        progressTime: '0m',
        statusColor: 'text.secondary'
      }
    }

    return {
      identifier: chatData.identifier || protocol.slice(-6),
      status: chatData.status || 'active',
      callOperator: chatData.question_operator || false,
      attendant: 'Sistema', // TODO: Pegar do operador real
      progressTime: calculateProgressTime(chatData.created_at, chatData.updated_at),
      statusColor: getStatusColor(chatData.status || 'active', chatData.question_operator || false)
    }
  }, [chatData, protocol])

  const historyLoading = chatData?.historyLoading || false

  const cardStyles = useMemo(() => {
    return {
      cursor: isDragging ? 'grabbing' : 'pointer',
      transform: isDragging ? 'rotate(5deg)' : 'none',
      transition: 'all 0.2s ease',
      boxShadow: callOperator
        ? '0 0 12px var(--mui-palette-error-main)'
        : isDragging
          ? '0 4px 20px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.1)',
      animation: callOperator ? 'pulseShadow 2s cubic-bezier(0.66, 0, 0, 1) infinite' : 'none',
      border: isInModal ? '2px solid #1976d2' : '1px solid transparent',

      '@keyframes pulseShadow': {
        '0%': { boxShadow: '0 0 6px var(--mui-palette-error-main)' },
        '50%': { boxShadow: '0 0 20px var(--mui-palette-error-main)' },
        '100%': { boxShadow: '0 0 6px var(--mui-palette-error-main)' }
      }
    }
  }, [callOperator, isDragging, isInModal])

  const chatContentStyles = useMemo(
    () => ({
      position: 'relative',
      minHeight: '200px',
      maxHeight: '200px',
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
        '&:hover': { background: theme.palette.text.secondary }
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modeTheme, theme.palette.divider, theme.palette.text.secondary, callOperator]
  )

  // 🎛️ CALLBACKS (SEMPRE EXECUTADOS)
  const handleCardClick = useCallback(() => {
    clickCount.current += 1
    if (clickTimeout.current) clearTimeout(clickTimeout.current)

    clickTimeout.current = setTimeout(() => {
      if (clickCount.current === 1 && onChatSelect) {
        onChatSelect(protocol)
      }

      clickCount.current = 0
    }, 250)
  }, [onChatSelect, protocol])

  const handleCardDoubleClick = useCallback(() => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current)
      clickCount.current = 0
    }

    if (onChatDoubleClick) {
      onChatDoubleClick(protocol)
    }
  }, [onChatDoubleClick, protocol])

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [])

  // 🔄 EFFECTS (SEMPRE EXECUTADOS)
  useEffect(() => {
    scrollToBottom()
  }, [messageCount, scrollToBottom])

  // 🚨 RENDER CONDICIONAL (SÓ DEPOIS DE TODOS OS HOOKS)
  if (!chatData) {
    return (
      <Card sx={{ opacity: 0.5, border: '2px dashed #ccc' }}>
        <CardContent>
          <Typography color='text.secondary' align='center'>
            Chat {protocol} não encontrado
          </Typography>
        </CardContent>
      </Card>
    )
  }

  // 🎨 RENDER PRINCIPAL
  return (
    <Card onClick={handleCardClick} onDoubleClick={handleCardDoubleClick} sx={cardStyles}>
      <CardHeader
        title={
          <Box display='flex' alignItems='center' gap={1}>
            <Typography variant='h5' sx={{ color: statusColor }}>
              # {identifier}
            </Typography>

            {/* 🆕 INDICADORES DE STATUS */}
          </Box>
        }
        subheader={
          <Box>
            <Typography variant='body2' color='text.secondary'>
              Protocolo: {protocol}
            </Typography>

            <Typography variant='caption' color='text.secondary'>
              {messageCount || 0} mensagem{messageCount !== 1 ? 's' : ''}
            </Typography>

            {chatData.lastMessage && (
              <Typography variant='caption' color='text.secondary' display='block'>
                Última: {new Date(chatData.lastMessage.created_at).toLocaleString()}
              </Typography>
            )}
          </Box>
        }
        action={
          <Box>
            <GetStatusProtocol status={status} callOperator={callOperator} />
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
            >
              <i className='ri-drag-move-2-fill' />
            </CustomIconButton>
          </Box>
        }
      />

      <CardContent>
        <Card>
          <CardContent className='cursor-pointer' ref={scrollContainerRef} sx={chatContentStyles}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box className='flex flex-row'>
                {!historyLoading && (
                  <Box className='flex flex-row'>
                    <ChatLog
                      chatData={chatData}
                      isBelowLgScreen={false}
                      isBelowMdScreen={false}
                      isBelowSmScreen={false}
                    />
                  </Box>
                )}

                {historyLoading && (
                  <Box display='flex' justifyContent='center' alignItems='center' minHeight='100px'>
                    <Typography variant='body2' color='text.secondary'>
                      Carregando mensagens...
                    </Typography>
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
        </Box>
      </CardContent>
    </Card>
  )
})

CardMonitorOptimized.displayName = 'CardMonitorOptimized'

export default CardMonitorOptimized
