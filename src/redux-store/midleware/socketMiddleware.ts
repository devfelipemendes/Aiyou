// redux-store/websocket/socketMiddleware.ts (VERSÃO CORRIGIDA)
import type { Middleware, PayloadAction, Action } from '@reduxjs/toolkit'

import { disconnectEcho, getEcho, registerReconnectListener } from '../websocket/echo'
import { setWebsocketError, setWebsocketStatus } from '../slices/webSocket'

interface WebSocketInitPayload {
  token: string
  userId: string | number
  clients: Array<{
    id: string
    name: string
    [key: string]: any
  }>
}

type WebSocketInitAction = PayloadAction<WebSocketInitPayload, 'WEBSOCKET/INIT'>
type WebSocketDisconnectAction = PayloadAction<undefined, 'WEBSOCKET/DISCONNECT'>

interface RootState {
  websocketReducer: {
    status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
    lastConnectedAt: string | null
    error?: string | null
  }
  authReducer: any
  protocolsReducer: any
  messagesReducer: any
  [key: string]: any
}

// 🔧 Armazenar clients para reconexão
let connectedClients: any[] = []

// 🔧 Função auxiliar para verificar se um canal é válido
const isValidChannel = (channel: any): boolean => {
  return (
    channel &&
    typeof channel.listen === 'function' &&
    (typeof channel.bind_global === 'function' || typeof channel.bind === 'function')
  )
}

// 🔧 Função auxiliar para bind seguro de eventos globais
const safeBindGlobal = (channel: any, channelName: string, callback: (eventName: string, data: any) => void) => {
  try {
    if (!isValidChannel(channel)) {
      console.error('💥 Canal inválido para bind global:', channelName)

      return false
    }

    if (typeof channel.bind_global === 'function') {
      // Método padrão do Pusher
      channel.bind_global(callback)
      console.log(`✅ Bind global configurado para: ${channelName}`)

      return true
    } else if (typeof channel.bind === 'function') {
      // Fallback: usar bind com eventos específicos
      console.warn(`⚠️ bind_global não disponível para ${channelName}, usando método alternativo`)

      // Lista de eventos comuns para escutar
      const commonEvents = [
        'protocol.created',
        'protocol.updated',
        'protocol.deleted',
        'question.created',
        'question.updated',
        'reply.created',
        'reply.updated',
        'operator.reply.created',
        'operator.reply.updated'
      ]

      // Bind individual para cada evento comum
      commonEvents.forEach(eventName => {
        try {
          channel.bind(eventName, (data: any) => {
            callback(eventName, data)
          })
        } catch (bindError) {
          console.warn(`⚠️ Erro ao fazer bind do evento ${eventName}:`, bindError)
        }
      })

      return true
    } else {
      console.error(`💥 Nenhum método de bind disponível para: ${channelName}`)

      return false
    }
  } catch (error) {
    console.error(`💥 Erro ao configurar bind global para ${channelName}:`, error)

    return false
  }
}

// 🔧 Função para conectar a um client com verificações de segurança
const connectToClient = (echo: any, client: any, store: any) => {
  try {
    const channelName = `project.${client.id}`

    console.log('🔌 Conectando ao canal:', channelName)

    const channel = echo.private(channelName)

    // Verificar se o canal foi criado corretamente
    if (!isValidChannel(channel)) {
      console.error('💥 Canal inválido criado para:', channelName)

      return false
    }

    // 📋 Configurar listeners básicos com tratamento de erro
    try {
      channel
        .listen('.protocol.created', (e: any) => {
          console.log('📋 Novo protocolo criado:', e.data || e)
          store.dispatch({
            type: 'protocols/addProtocol',
            payload: { ...(e.data || e), client_id: client.id }
          })
        })
        .listen('.protocol.updated', (e: any) => {
          console.log('📋 Protocolo atualizado:', e.data || e)
          store.dispatch({
            type: 'protocols/updateProtocol',
            payload: e.data || e
          })
        })
        .listen('.protocol.deleted', (e: any) => {
          console.log('🗑️ Protocolo removido:', e.data || e)
          const protocolId = (e.data || e).id

          if (protocolId) {
            store.dispatch({
              type: 'protocols/removeProtocol',
              payload: protocolId
            })
          }
        })

      console.log(`✅ Listeners básicos configurados para: ${channelName}`)
    } catch (listenError) {
      console.error(`💥 Erro ao configurar listeners para ${channelName}:`, listenError)
    }

    // 🔧 Debug de todos os eventos (com verificação de segurança)
    const debugSuccess = safeBindGlobal(channel, channelName, (eventName: string, data: any) => {
      if (!eventName.startsWith('pusher:') && !eventName.startsWith('pusher_internal:')) {
        console.log(`📡 [${channelName}] ${eventName}:`, data)
      }
    })

    if (!debugSuccess) {
      console.warn(`⚠️ Debug global não pôde ser configurado para: ${channelName}`)
    }

    console.log(`✅ Conectado ao canal: ${channelName}`)

    return true
  } catch (error) {
    console.error(`💥 Erro ao conectar client ${client.id}:`, error)

    return false
  }
}

// 🔧 Função para reconectar todos os clients
const reconnectAllClients = (echo: any, store: any) => {
  console.log('🔄 Reconectando aos clients após reconexão...')

  let successCount = 0

  connectedClients.forEach(client => {
    try {
      const success = connectToClient(echo, client, store)

      if (success) successCount++
    } catch (error) {
      console.error(`💥 Erro ao reconectar client ${client.id}:`, error)
    }
  })

  console.log(`🔄 Reconexão concluída: ${successCount}/${connectedClients.length} clients`)
}

const websocketMiddleware: Middleware<{}, RootState> = store => next => (action: unknown) => {
  if (typeof action !== 'object' || action === null || !('type' in action)) {
    return next(action)
  }

  const actionType = (action as Action).type

  // 🔧 Inicializar WebSocket com clients
  if (actionType === 'WEBSOCKET/INIT') {
    const initAction = action as WebSocketInitAction
    const { token, userId, clients } = initAction.payload

    console.log('🔌 Inicializando WebSocket...', {
      userId,
      clientsCount: clients.length,
      clients: clients.map(c => ({ id: c.id, name: c.name }))
    })

    // Armazenar clients para reconexão
    connectedClients = clients

    store.dispatch(setWebsocketStatus('connecting'))

    try {
      const echo = getEcho()

      // Verificar se Echo foi inicializado corretamente
      if (!echo || !echo.connector || !echo.connector.pusher) {
        throw new Error('Echo não foi inicializado corretamente')
      }

      // 🎧 Event handlers principais
      echo.connector.pusher.connection.bind('connected', () => {
        console.log('✅ WebSocket conectado - conectando aos clients...')
        store.dispatch(setWebsocketStatus('connected'))

        // 🔧 Conectar aos canais dos clients com verificações de segurança
        let successCount = 0

        clients.forEach(client => {
          try {
            const success = connectToClient(echo, client, store)

            if (success) successCount++
          } catch (error) {
            console.error(`💥 Erro crítico ao conectar client ${client.id}:`, error)
          }
        })

        console.log(`🎉 Conexão concluída: ${successCount}/${clients.length} clients conectados`)
      })

      echo.connector.pusher.connection.bind('disconnected', () => {
        console.log('❌ WebSocket desconectado')
        store.dispatch(setWebsocketStatus('disconnected'))
      })

      echo.connector.pusher.connection.bind('connecting', () => {
        console.log('🔄 WebSocket reconectando...')
        store.dispatch(setWebsocketStatus('reconnecting'))
      })

      echo.connector.pusher.connection.bind('error', (err: any) => {
        console.error('💥 Erro no WebSocket:', err)
        store.dispatch(setWebsocketError(err?.message || 'Erro na conexão WebSocket'))
      })

      // 🔧 Registrar callback de reconexão
      registerReconnectListener(() => {
        try {
          reconnectAllClients(echo, store)
        } catch (error) {
          console.error('💥 Erro durante reconexão:', error)
        }
      })
    } catch (error: any) {
      console.error('💥 Erro ao inicializar WebSocket:', error)
      store.dispatch(setWebsocketError(error?.message || 'Erro ao inicializar WebSocket'))
      store.dispatch(setWebsocketStatus('disconnected'))
    }
  }

  // 🔧 Desconectar WebSocket
  if (actionType === 'WEBSOCKET/DISCONNECT') {
    console.log('🔌 Desconectando WebSocket...')

    try {
      connectedClients = []
      disconnectEcho()
      store.dispatch(setWebsocketStatus('disconnected'))
    } catch (error: any) {
      console.error('💥 Erro ao desconectar WebSocket:', error)
    }
  }

  return next(action)
}

export default websocketMiddleware

// 🔧 Action creators atualizados
export const initWebSocket = (token: string, userId: string | number, clients: any[] = []) => ({
  type: 'WEBSOCKET/INIT' as const,
  payload: { token, userId, clients }
})

export const disconnectWebSocket = () => ({
  type: 'WEBSOCKET/DISCONNECT' as const
})

// 🔧 Action para reconectar manualmente
export const reconnectWebSocket = () => (dispatch: any, getState: any) => {
  const { websocketReducer } = getState()

  if (websocketReducer.status !== 'disconnected') {
    dispatch(disconnectWebSocket())

    // Aguardar um pouco antes de reconectar
    setTimeout(() => {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      const userDataStr = localStorage.getItem('userData')

      if (token && userId) {
        let clients = []

        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr)

            clients = userData.clients || []
          } catch (error) {
            console.warn('⚠️ Erro ao parse dos dados do usuário:', error)
          }
        }

        dispatch(initWebSocket(token, userId, clients))
      }
    }, 1000)
  }
}

// 🔧 Função de debug para verificar estado das conexões
export const debugWebSocketConnections = () => {
  try {
    const echo = getEcho()

    if (!echo) {
      console.log('💥 Echo não inicializado')

      return
    }

    if (!echo.connector || !echo.connector.pusher) {
      console.log('💥 Connector ou Pusher não disponível')

      return
    }

    const connection = echo.connector.pusher.connection
    const channels = echo.connector.pusher.channels.channels

    console.group('🔍 Debug WebSocket Connections')
    console.log('Connection State:', connection.state)
    console.log('Socket ID:', connection.socket_id)
    console.log(
      'Connected Clients:',
      connectedClients.map(c => ({ id: c.id, name: c.name }))
    )
    console.log('Active Channels:', Object.keys(channels))
    console.log(
      'Channel Details:',
      Object.entries(channels).map(([name, channel]: [string, any]) => ({
        name,
        subscribed: channel.subscribed,
        state: channel.subscription_state
      }))
    )
    console.groupEnd()
  } catch (error) {
    console.error('💥 Erro ao fazer debug das conexões:', error)
  }
}
