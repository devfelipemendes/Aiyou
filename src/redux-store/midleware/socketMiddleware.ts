import type { Middleware, PayloadAction, Action } from '@reduxjs/toolkit'

import { disconnectEcho, getEcho, registerReconnectListener } from '../websocket/echo'
import { setWebsocketError, setWebsocketStatus } from '../slices/webSocket'

import { cleanupProtocolEvents, listenProtocolEvents } from '@/redux-store/websocket/listeners/chatlistener'

// Tipos para os payloads das ações
interface WebSocketInitPayload {
  token: string
  userId: string | number
  protocolId?: string | undefined
  clientId?: string | undefined
}

// Tipos das ações usando PayloadAction
type WebSocketInitAction = PayloadAction<WebSocketInitPayload, 'WEBSOCKET/INIT'>
type WebSocketDisconnectAction = PayloadAction<undefined, 'WEBSOCKET/DISCONNECT'>
type WebSocketListenProtocolAction = PayloadAction<
  { protocolId: string; clientId: string },
  'WEBSOCKET/LISTEN_PROTOCOL'
>

// Union type para ações do WebSocket
type WebSocketAction = WebSocketInitAction | WebSocketDisconnectAction | WebSocketListenProtocolAction

// Tipo para o estado da store (ajuste conforme necessário)
interface RootState {
  websocket: {
    status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
    lastConnectedAt: string | null
    error?: string | null
  }
  [key: string]: any
}

let activeListeners: { protocolId: string; clientId: string }[] = []

const websocketMiddleware: Middleware<{}, RootState> = store => next => (action: unknown) => {
  if (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    (action as Action).type === 'WEBSOCKET/INIT'
  ) {
    const initAction = action as WebSocketAction
    const { protocolId, clientId }: any = initAction.payload

    store.dispatch(setWebsocketStatus('connecting'))

    try {
      const echo = getEcho()

      echo.connector.pusher.connection.bind('connected', () => {
        store.dispatch(setWebsocketStatus('connected'))

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

      registerReconnectListener(() => {
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

  if (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    (action as Action).type === 'WEBSOCKET/DISCONNECT'
  ) {
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

// Action creators atualizados
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

// Tipos exportados
export type {
  WebSocketInitAction,
  WebSocketDisconnectAction,
  WebSocketAction,
  WebSocketInitPayload,
  WebSocketListenProtocolAction
}
