import React, { useEffect, useRef, memo, useCallback, useMemo } from 'react'

import { Card, CardContent, CardHeader, Chip, Typography, Box, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Refresh } from '@mui/icons-material'

import ChatLog from '../chatLog/chatLog'
import CustomIconButton from '@core/components/mui/IconButton'

// 🔧 TIPOS SIMPLIFICADOS
interface CardData {
  protocol: string
  source: string
  identifier: string
  status: string
  messageCount: number
  lastMessage: any
  history: any[]
  assistant: any
  created_at: string
  updated_at: string
  historyError?: any
  historyLoading?: boolean
}

interface ChatMonitorOptimizedProps {
  chatData: CardData
  isDragging?: boolean
  dragListeners?: any
  dragAttributes?: any
  onChatSelect?: (protocol: string) => void
  onChatDoubleClick?: (protocol: string) => void
  isSelected?: boolean

  // 🆕 NOVOS PROPS PARA OTIMIZAÇÃO
  isWebSocketConnected?: boolean
  isInModal?: boolean
}

// 🔧 FUNÇÕES HELPER MOVIDAS PARA FORA (não recriam a cada render)
const getStatusColor = (status: string, callOperator: boolean): string => {
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

const getStatusProtocol = (status: string, callOperator: boolean) => {
  if (callOperator) {
    return <Chip label='Chamada do Operador' color='error' variant='outlined' className='mr-2' />
  }

  const config = {
    active: { label: 'Ativo', color: 'primary' },
    inactive: { label: 'Inativo', color: 'warning', sx: { bgcolor: '#797979' } },
    resolved: { label: 'Resolvido', color: 'success' },
    unresolved: { label: 'Não resolvido', color: 'warning' }
  }[status] ?? { label: 'Ativo', color: 'success' }

  return <Chip label={config.label} color={config.color as any} variant='outlined' sx={config.sx} className='mr-2' />
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

// 🔥 COMPONENTE OTIMIZADO COM MEMO
const CardMonitorOptimized = memo<ChatMonitorOptimizedProps>(
  ({
    chatData,
    dragListeners,
    dragAttributes,
    onChatSelect,
    isDragging = false,
    onChatDoubleClick,
    isSelected = false,
    isWebSocketConnected = false,
    isInModal = false
  }) => {
    // 🔧 REFS
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const clickTimeout = useRef<NodeJS.Timeout | null>(null)
    const clickCount = useRef(0)

    // 🎨 THEME
    const theme = useTheme()
    const modeTheme = theme.palette.mode

    // 📊 DADOS EXTRAÍDOS (memoizados se necessário)
    const {
      protocol,
      assistant,
      identifier,
      status,
      historyError,
      historyLoading,
      lastMessage,
      created_at,
      updated_at,
      messageCount
    } = chatData

    // 🔧 VALORES CALCULADOS MEMOIZADOS
    const callOperator = useMemo(() => !!historyError, [historyError])

    const progressTime = useMemo(() => calculateProgressTime(created_at, updated_at), [created_at, updated_at])

    const attendant = useMemo(() => assistant?.name || 'Sistema', [assistant?.name])

    const statusColor = useMemo(() => getStatusColor(status, callOperator), [status, callOperator])

    // 🎨 ESTILOS MEMOIZADOS
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

        // 🆕 DESTAQUE SE ESTIVER NO MODAL
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
          '&:hover': { background: theme.palette.text.secondary }
        }
      }),
      [modeTheme, theme.palette.divider, theme.palette.text.secondary]
    )

    // 🎛️ CALLBACKS OTIMIZADOS
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
      // 🔧 LIMPAR TIMEOUT DO CLIQUE SIMPLES
      if (clickTimeout.current) {
        clearTimeout(clickTimeout.current)
        clickCount.current = 0
      }

      if (onChatDoubleClick) {
        onChatDoubleClick(protocol)
      }
    }, [onChatDoubleClick, protocol])

    // 🔄 AUTO SCROLL (otimizado com useCallback)
    const scrollToBottom = useCallback(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
      }
    }, [])

    // 🔄 EFEITO DE SCROLL (só roda quando messageCount muda)
    useEffect(() => {
      scrollToBottom()
    }, [messageCount, scrollToBottom])

    // 📊 DEBUG RE-RENDER (remover em produção)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 CardMonitor ${protocol} re-renderizou`, {
        messageCount,
        lastUpdate: updated_at,
        isSelected,
        isInModal
      })
    }

    return (
      <Card onClick={handleCardClick} onDoubleClick={handleCardDoubleClick} sx={cardStyles}>
        <CardHeader
          title={
            <Box display='flex' alignItems='center' gap={1}>
              <Typography variant='h4' sx={{ color: statusColor }}>
                # {identifier}
              </Typography>

              {/* 🆕 INDICADORES DE STATUS */}
              {isWebSocketConnected && (
                <Chip
                  size='small'
                  label='●'
                  color='success'
                  sx={{ minWidth: 'unset', px: 0.5, fontSize: '0.7rem' }}
                  title='Tempo real ativo'
                />
              )}

              {isInModal && (
                <Chip
                  size='small'
                  label='👁️'
                  color='primary'
                  sx={{ minWidth: 'unset', px: 0.5, fontSize: '0.7rem' }}
                  title='Aberto no modal'
                />
              )}
            </Box>
          }
          subheader={
            <Box>
              <Typography variant='body2' color='text.secondary'>
                Protocolo: {protocol}
              </Typography>

              {/* 🆕 CONTADOR DE MENSAGENS EM TEMPO REAL */}
              <Typography variant='caption' color='text.secondary'>
                {messageCount || 0} mensagem{messageCount !== 1 ? 's' : ''}
              </Typography>

              {lastMessage && (
                <Typography variant='caption' color='text.secondary' display='block'>
                  Última: {new Date(lastMessage.created_at).toLocaleString()}
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
                  {!historyLoading && !callOperator && (
                    <Box className='flex flex-row'>
                      {/* ✅ CHATLOG EXISTENTE - Dados já atualizados pelo WebSocket */}
                      <ChatLog
                        chatData={chatData}
                        isBelowLgScreen={false}
                        isBelowMdScreen={false}
                        isBelowSmScreen={false}
                      />
                    </Box>
                  )}

                  {/* 🆕 LOADING STATE */}
                  {historyLoading && (
                    <Box display='flex' justifyContent='center' alignItems='center' minHeight='100px'>
                      <Typography variant='body2' color='text.secondary'>
                        Carregando mensagens...
                      </Typography>
                    </Box>
                  )}

                  {/* 🆕 ERROR STATE */}
                  {callOperator && (
                    <Box display='flex' justifyContent='center' alignItems='center' minHeight='100px'>
                      <Typography variant='body2' color='error'>
                        ⚠️ Operador solicitado
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
  },
  (prevProps, nextProps) => {
    // 🔥 COMPARAÇÃO CUSTOMIZADA - Performance Critical

    // 1. 📊 Dados principais do chat mudaram?
    const prevData = prevProps.chatData
    const nextData = nextProps.chatData

    if (
      prevData.protocol !== nextData.protocol ||
      prevData.messageCount !== nextData.messageCount ||
      prevData.status !== nextData.status ||
      prevData.updated_at !== nextData.updated_at ||
      prevData.historyLoading !== nextData.historyLoading ||
      prevData.historyError !== nextData.historyError
    ) {
      return false // Re-renderizar
    }

    // 2. 📝 Última mensagem mudou?
    const prevLastMsg = prevData.lastMessage
    const nextLastMsg = nextData.lastMessage

    if (prevLastMsg?.id !== nextLastMsg?.id) {
      return false // Re-renderizar
    }

    // 3. 🎨 Props visuais mudaram?
    if (
      prevProps.isDragging !== nextProps.isDragging ||
      prevProps.isSelected !== nextProps.isSelected ||
      prevProps.isInModal !== nextProps.isInModal ||
      prevProps.isWebSocketConnected !== nextProps.isWebSocketConnected
    ) {
      return false // Re-renderizar
    }

    // 4. 🎛️ Callbacks mudaram? (não deveria acontecer se bem implementado)
    if (
      prevProps.onChatSelect !== nextProps.onChatSelect ||
      prevProps.onChatDoubleClick !== nextProps.onChatDoubleClick
    ) {
      return false // Re-renderizar
    }

    // 5. 🔧 Props de drag mudaram?
    if (prevProps.dragListeners !== nextProps.dragListeners || prevProps.dragAttributes !== nextProps.dragAttributes) {
      return false // Re-renderizar
    }

    // ✅ Nenhuma mudança relevante detectada
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Card ${nextData.protocol} evitou re-render desnecessário`)
    }

    return true // NÃO re-renderizar
  }
)

CardMonitorOptimized.displayName = 'CardMonitorOptimized'

export default CardMonitorOptimized
