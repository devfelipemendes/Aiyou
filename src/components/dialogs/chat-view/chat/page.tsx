'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// MUI Imports
import Backdrop from '@mui/material/Backdrop'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import classNames from 'classnames'

// Type Imports
import { Alert, Box, Chip, Typography } from '@mui/material'

import { useAppDispatch, useAppSelector, type RootState } from '@/redux-store'

// Slice Imports
import { getActiveUserData } from '@/redux-store/slices/chat'

// Component Imports
import SidebarLeft from './SidebarLeft'
import ChatContent from './ChatContent'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { commonLayoutClasses } from '@layouts/utils/layoutClasses'
import { useChatWebSocket, useWebSocketStats } from '@/hooks/useWebSoccket'

interface ChatWrapperProps {
  protocolId?: string | null
  clientId?: string | null
  autoConnct?: boolean
  showDebugInfo?: boolean
}

const ChatWrapper = ({ autoConnct, clientId, protocolId, showDebugInfo }: ChatWrapperProps) => {
  // States
  const [backdropOpen, setBackdropOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Refs
  const messageInputRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { settings } = useSettings()
  const dispatch = useAppDispatch()
  const chatStore = useAppSelector((state: RootState) => state.chatReducer)
  const isBelowLgScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  const chatWebSocket = useChatWebSocket(protocolId ?? null, clientId ?? null)
  const webSocketStats = useWebSocketStats()

  useEffect(() => {
    // Se tiver uma ultima mensagem este If irá debugar
    if (chatWebSocket.latestMessage) {
      const { type, timestamp, data } = chatWebSocket.latestMessage

      console.log('Nova Mensagem WebSocket', { type, data, timestamp: new Date(timestamp).toLocaleTimeString() })

      switch (type) {
        case 'question.created':
          // Atualizar estado do chat com nova pergunta
          // dispatch(addNewQuestion(data))
          break

        case 'reply.created':
          // Atualizar estado do chat com nova resposta
          // dispatch(addNewReply(data))
          break

        case 'operator.reply.created':
          // Atualizar estado do chat com resposta do operador
          // dispatch(addOperatorReply(data))
          break

        // Adicionar outros tipos conforme necessário
        default:
          console.log('📨 Tipo de mensagem não tratado:', type)
      }
    }
  }, [chatWebSocket.latestMessage, dispatch])

  // Get active user’s data
  const activeUser = (id: number) => {
    dispatch(getActiveUserData(id))
  }

  // Focus on message input when active user changes
  useEffect(() => {
    if (chatStore.activeUser?.id !== null && messageInputRef.current) {
      messageInputRef.current.focus()
    }
  }, [chatStore.activeUser])

  // Close backdrop when sidebar is open on below md screen
  useEffect(() => {
    if (!isBelowMdScreen && backdropOpen && sidebarOpen) {
      setBackdropOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBelowMdScreen])

  // Open backdrop when sidebar is open on below sm screen
  useEffect(() => {
    if (!isBelowSmScreen && sidebarOpen) {
      setBackdropOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBelowSmScreen])

  // Close sidebar when backdrop is closed on below md screen
  useEffect(() => {
    if (!backdropOpen && sidebarOpen) {
      setSidebarOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backdropOpen])

  const DebugInfo = () => {
    if (!showDebugInfo) return null

    return (
      <Box sx={{ position: 'fixed', top: 10, right: 10, zIndex: 9999 }}>
        <Alert severity='info' sx={{ mb: 1, maxWidth: 300 }}>
          <Typography variant='caption' component='div'>
            <strong>🔌 WebSocket Status</strong>
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
            <Chip
              label={chatWebSocket.connectionStatus}
              color={chatWebSocket.isConnected ? 'success' : 'error'}
              size='small'
            />
            {chatWebSocket.protocolChannel.isActive && (
              <Chip label={`Protocol: ${protocolId}`} color='primary' size='small' />
            )}
            {chatWebSocket.projectChannel.isActive && (
              <Chip label={`Project: ${clientId}`} color='secondary' size='small' />
            )}
          </Box>
          <Typography variant='caption' display='block' sx={{ mt: 0.5 }}>
            📨 Mensagens: {chatWebSocket.messageCount} | 🔄 Reconexões: {webSocketStats.reconnectAttempts}
          </Typography>
        </Alert>
      </Box>
    )
  }

  // 🎨 COMPONENTE: Status de Conexão
  const ConnectionStatus = () => {
    if (chatWebSocket.isConnected) return null

    return (
      <Alert
        severity='warning'
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          borderRadius: 0
        }}
      >
        <Box display='flex' alignItems='center' gap={1}>
          <Typography variant='body2'>🔌 Conectando ao chat em tempo real...</Typography>
          {chatWebSocket.connectionStatus === 'error' && (
            <Chip label='Tentar Reconectar' color='error' size='small' onClick={chatWebSocket.reconnect} clickable />
          )}
        </Box>
      </Alert>
    )
  }

  return (
    <>
      {/* 🔥 NOVO: Debug Info */}
      <DebugInfo />

      {/* 🔥 NOVO: Status de Conexão */}
      <ConnectionStatus />

      {/* 🔧 LAYOUT PRINCIPAL: Mantido igual */}
      <div
        className={classNames(commonLayoutClasses.contentHeightFixed, 'flex is-full overflow-hidden rounded relative', {
          border: settings.skin === 'bordered',
          'shadow-md': settings.skin !== 'bordered'
        })}
        style={{
          // Ajustar margem se houver status de conexão
          marginTop: chatWebSocket.isConnected ? 0 : 48
        }}
      >
        <SidebarLeft
          chatStore={chatStore}
          getActiveUserData={activeUser}
          dispatch={dispatch}
          backdropOpen={backdropOpen}
          setBackdropOpen={setBackdropOpen}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isBelowLgScreen={isBelowLgScreen}
          isBelowMdScreen={isBelowMdScreen}
          isBelowSmScreen={isBelowSmScreen}
          messageInputRef={messageInputRef}
        />

        <ChatContent
          chatStore={chatStore}
          dispatch={dispatch}
          backdropOpen={backdropOpen}
          setBackdropOpen={setBackdropOpen}
          setSidebarOpen={setSidebarOpen}
          isBelowMdScreen={isBelowMdScreen}
          isBelowLgScreen={isBelowLgScreen}
          isBelowSmScreen={isBelowSmScreen}
          messageInputRef={messageInputRef}
          mode={'system'}
          webSocketStatus={{
            isConnected: chatWebSocket.isConnected,
            protocolChannelActive: chatWebSocket.protocolChannel.isActive,
            projectChannelActive: chatWebSocket.projectChannel.isActive,
            messageCount: chatWebSocket.messageCount,
            latestMessage: chatWebSocket.latestMessage
          }}
        />

        <Backdrop open={backdropOpen} onClick={() => setBackdropOpen(false)} className='absolute z-10' />
      </div>
    </>
  )
}

export default ChatWrapper
