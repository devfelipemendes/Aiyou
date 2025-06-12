import type { Middleware, PayloadAction, Action } from '@reduxjs/toolkit'

import { disconnectEcho, getEcho, registerReconnectListener } from '../websocket/echo'
import { setWebsocketError, setWebsocketStatus } from '../slices/webSocket'
import { listenProtocolEvents, cleanupProtocolEvents } from '@/redux-store/websocket/listeners/chatlistener'

// ✅ Tipos adaptados para sua store com redux-persist
interface WebSocketInitPayload {
  token: string
  userId: string | number
  protocolId?: string
  clientId?: string
}

type WebSocketInitAction = PayloadAction<WebSocketInitPayload, 'WEBSOCKET/INIT'>
type WebSocketDisconnectAction = PayloadAction<undefined, 'WEBSOCKET/DISCONNECT'>
type WebSocketListenProtocolAction = PayloadAction<
  { protocolId: string; clientId: string },
  'WEBSOCKET/LISTEN_PROTOCOL'
>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type WebSocketAction = WebSocketInitAction | WebSocketDisconnectAction | WebSocketListenProtocolAction

// ✅ Tipo do RootState adaptado para sua store
interface RootState {
  websocketReducer: {
    status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
    lastConnectedAt: string | null
    error?: string | null
  }
  protocolsReducer: {
    list: any[]
  }
  questionsReducer: {
    questions: any[]
    replies: any[]
  }

  // Outros reducers...
  authReducer: any
  chatReducer: any
  monitoringReducer: any
  registration: any
  [key: string]: any
}

// Variáveis para controlar listeners ativos
let activeListeners: { protocolId: string; clientId: string }[] = []

const websocketMiddleware: Middleware<{}, RootState> = store => next => (action: unknown) => {
  // ✅ Verificar se é uma ação válida
  if (typeof action !== 'object' || action === null || !('type' in action)) {
    return next(action)
  }

  const actionType = (action as Action).type

  // ✅ Log de debug para ver todas as ações (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development' && actionType.startsWith('WEBSOCKET/')) {
    console.log('🔧 WebSocket Middleware - Action:', actionType, action)
  }

  // ✅ Inicializar WebSocket
  if (actionType === 'WEBSOCKET/INIT') {
    const initAction = action as WebSocketInitAction
    const { userId, protocolId, clientId } = initAction.payload

    console.log('🔌 Iniciando WebSocket...', { userId, protocolId, clientId })

    store.dispatch(setWebsocketStatus('connecting'))

    try {
      const echo = getEcho()

      // ✅ Event handlers
      echo.connector.pusher.connection.bind('connected', () => {
        console.log('✅ WebSocket conectado')
        store.dispatch(setWebsocketStatus('connected'))

        // Se temos protocolId e clientId, inicia os listeners
        if (protocolId && clientId) {
          console.log('🎧 Iniciando listeners para protocolo:', protocolId)
          listenProtocolEvents(echo, protocolId, clientId, store.dispatch)
          activeListeners.push({ protocolId, clientId })
        }
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

      // ✅ Registrar callback de reconexão
      registerReconnectListener(() => {
        console.log('🔁 Restaurando listeners após reconexão...')
        activeListeners.forEach(({ protocolId, clientId }) => {
          listenProtocolEvents(echo, protocolId, clientId, store.dispatch)
        })
      })
    } catch (error: any) {
      console.error('💥 Erro ao inicializar WebSocket:', error)
      store.dispatch(setWebsocketError(error?.message || 'Erro ao inicializar WebSocket'))
      store.dispatch(setWebsocketStatus('disconnected'))
    }
  }

  // ✅ Adicionar listeners para protocolo específico
  if (actionType === 'WEBSOCKET/LISTEN_PROTOCOL') {
    const listenAction = action as WebSocketListenProtocolAction
    const { protocolId, clientId } = listenAction.payload

    console.log('🎧 Adicionando listeners para protocolo:', protocolId)

    try {
      const echo = getEcho()

      if (echo && echo.connector.pusher.connection.state === 'connected') {
        listenProtocolEvents(echo, protocolId, clientId, store.dispatch)

        // Evitar listeners duplicados
        const exists = activeListeners.some(l => l.protocolId === protocolId && l.clientId === clientId)

        if (!exists) {
          activeListeners.push({ protocolId, clientId })
        }
      } else {
        console.warn('⚠️ WebSocket não está conectado. Listeners serão adicionados na próxima conexão.')
      }
    } catch (error: any) {
      console.error('💥 Erro ao adicionar listeners:', error)
      store.dispatch(setWebsocketError(error?.message || 'Erro ao adicionar listeners'))
    }
  }

  // ✅ Desconectar WebSocket
  if (actionType === 'WEBSOCKET/DISCONNECT') {
    console.log('🔌 Desconectando WebSocket...')

    try {
      // Limpar listeners ativos
      const echo = getEcho()

      activeListeners.forEach(({ protocolId, clientId }) => {
        cleanupProtocolEvents(echo, protocolId, clientId)
      })

      activeListeners = []
      disconnectEcho()
      store.dispatch(setWebsocketStatus('disconnected'))
    } catch (error: any) {
      console.error('💥 Erro ao desconectar WebSocket:', error)
    }
  }

  return next(action)
}

export default websocketMiddleware

// ✅ Action creators
export const initWebSocket = (token: string, userId: string | number, protocolId?: string, clientId?: string) => ({
  type: 'WEBSOCKET/INIT' as const,
  payload: { token, userId, protocolId, clientId }
})

export const listenToProtocol = (protocolId: string, clientId: string) => ({
  type: 'WEBSOCKET/LISTEN_PROTOCOL' as const,
  payload: { protocolId, clientId }
})

export const disconnectWebSocket = () => ({
  type: 'WEBSOCKET/DISCONNECT' as const
})

// ✅ Action para reconectar manualmente
export const reconnectWebSocket = () => (dispatch: any, getState: any) => {
  const { websocketReducer } = getState()

  if (websocketReducer.status !== 'disconnected') {
    dispatch(disconnectWebSocket())

    // Aguardar um pouco antes de reconectar
    setTimeout(() => {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')

      if (token && userId) {
        dispatch(initWebSocket(token, userId))
      }
    }, 1000)
  }
}
