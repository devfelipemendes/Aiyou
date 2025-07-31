import React, { useEffect, useRef, memo, useCallback, useMemo } from 'react'

import { Card, CardContent, CardHeader, Chip, Typography, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { useAppSelector } from '@/redux-store'
import { selectChatByProtocol } from '@/redux-store/selectors/monitoring'

import ChatLog from '../chatLog/chatLog'
import CustomIconButton from '@core/components/mui/IconButton'

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

// 🔧 FUNÇÕES HELPER (mantidas iguais)
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
    return <Chip label='Atenção' color='error' variant='outlined' className='mr-2' />
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

// 🔥 COMPONENTE OTIMIZADO
const CardMonitorOptimized = memo<ChatMonitorOptimizedProps>(
  props => {
    const {
      protocol,
      dragListeners,
      dragAttributes,
      onChatSelect,
      isDragging = false,
      onChatDoubleClick,
      isSelected = false,
      isInModal = false
    } = props

    // 🔥 TODOS OS HOOKS DEVEM VIR PRIMEIRO (antes de qualquer condicional)
    const prevPropsRef = useRef(props)

    if (process.env.NODE_ENV === 'development') {
      // ✅ CORREÇÃO: Type assertion para debugging de props
      const prevProps = prevPropsRef.current as Record<string, any>
      const currentProps = props as Record<string, any>

      const changedProps = Object.keys(props).filter(key => prevProps[key] !== currentProps[key])

      if (changedProps.length > 0) {
        console.log(`🔄 CARD ${protocol} - Props mudaram:`, {
          changedProps,
          prevProps: prevPropsRef.current,
          newProps: props
        })
      }

      prevPropsRef.current = props
    }

    // 🔧 REFS
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const clickTimeout = useRef<NodeJS.Timeout | null>(null)
    const clickCount = useRef(0)

    // 🎨 THEME
    const theme = useTheme()
    const modeTheme = theme.palette.mode

    // 🔥 SELETOR REDUX
    const chatData = useAppSelector(state => selectChatByProtocol(state, protocol))

    const prevChatDataRef = useRef(chatData)

    if (process.env.NODE_ENV === 'development' && prevChatDataRef.current !== chatData) {
      // ✅ CORREÇÃO: Type assertion para debugging de chatData
      const prevData = prevChatDataRef.current as Record<string, any>
      const currentData = chatData as Record<string, any>

      console.log(`📊 CARD ${protocol} - ChatData mudou:`, {
        prevData: prevChatDataRef.current,
        newData: chatData,
        changedFields:
          chatData && prevChatDataRef.current
            ? Object.keys(chatData).filter(key => prevData?.[key] !== currentData[key])
            : []
      })
      prevChatDataRef.current = chatData
    }

    // 📊 EXTRAIR DADOS (com valores padrão para evitar erros)
    const identifier = chatData?.identifier || protocol.slice(-6)
    const status = chatData?.status || 'active'

    const historyLoading = chatData?.historyLoading || false
    const lastMessage = chatData?.lastMessage
    const created_at = chatData?.created_at || new Date().toISOString()
    const updated_at = chatData?.updated_at || new Date().toISOString()
    const messageCount = chatData?.messageCount || 0
    const assistant = chatData?.assistant

    const callOperator = useMemo(() => {
      const isCallOperator = chatData.question_operator

      // 🔍 DEBUG: Log específico para question_operator
      console.log(`🚨 CARD ${protocol} - CallOperator Debug:`, {
        question_operator: chatData.question_operator,
        isCallOperator,
        chatDataTimestamp: chatData.updated_at,
        fullChatData: chatData
      })

      return isCallOperator
    }, [chatData])

    // 🔧 VALORES CALCULADOS MEMOIZADOS (SEMPRE EXECUTADOS)
    // const callOperator = useMemo(() => !!historyError, [historyError])

    const progressTime = useMemo(() => calculateProgressTime(created_at, updated_at), [created_at, updated_at])

    const attendant = useMemo(() => assistant?.name || 'Sistema', [assistant?.name])

    const statusColor = useMemo(() => getStatusColor(status, callOperator), [status, callOperator])

    // 🎨 ESTILOS MEMOIZADOS (SEMPRE EXECUTADOS)
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
      [modeTheme, theme.palette.divider, theme.palette.text.secondary]
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

    // 📊 DEBUG (desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 CardMonitor ${protocol} re-renderizou`, {
        messageCount,
        lastUpdate: updated_at,
        isSelected,
        isInModal,
        isDragging,
        chatDataExists: !!chatData,
        renderReason: 'Props ou ChatData mudaram'
      })
    }

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
  }

  // ✅ MEMO COMPARADOR CORRIGIDO
  // (prevProps, nextProps) => {
  //   // 1. Protocolo mudou? (nunca deveria mudar)
  //   if (prevProps.protocol !== nextProps.protocol) {
  //     console.log(`🔄 MEMO ${nextProps.protocol} - Protocolo mudou`)

  //     return false
  //   }

  //   // 2. Estados visuais mudaram?
  //   if (
  //     prevProps.isSelected !== nextProps.isSelected ||
  //     prevProps.isInModal !== nextProps.isInModal ||
  //     prevProps.isDragging !== nextProps.isDragging ||
  //     prevProps.isWebSocketConnected !== nextProps.isWebSocketConnected
  //   ) {
  //     console.log(`🔄 MEMO ${nextProps.protocol} - Estados visuais mudaram`)

  //     return false
  //   }

  //   // 3. 🔥 DADOS DO CHAT mudaram? (usando store diretamente)
  //   try {
  //     const currentState = store.getState()
  //     const prevChatData = selectChatByProtocol(currentState, prevProps.protocol)
  //     const nextChatData = selectChatByProtocol(currentState, nextProps.protocol)

  //     if (prevChatData !== nextChatData) {
  //       console.log(`🔄 MEMO ${nextProps.protocol} - ChatData mudou`)

  //       return false
  //     }
  //   } catch (error) {
  //     console.warn(`⚠️ MEMO ${nextProps.protocol} - Erro ao comparar chat data:`, error)

  //     return false // Re-renderizar por segurança
  //   }

  //   // ✅ Todos os dados importantes são iguais - bloquear re-render
  //   console.log(`✅ MEMO ${nextProps.protocol} - Bloqueou re-render`)

  //   return true
  // }
)

CardMonitorOptimized.displayName = 'CardMonitorOptimized'

export default CardMonitorOptimized
