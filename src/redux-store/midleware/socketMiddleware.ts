import type { Middleware, PayloadAction, Action } from '@reduxjs/toolkit'
import type { Dispatch } from 'redux'

import { disconnectEcho, getEcho } from '../websocket/echo'
import { setWebsocketError, setWebsocketStatus } from '../slices/webSocket'

// Tipos para os payloads das ações
interface WebSocketInitPayload {
  token: string
  userId: string | number
}

// Tipos das ações usando PayloadAction
type WebSocketInitAction = PayloadAction<WebSocketInitPayload, 'WEBSOCKET/INIT'>
type WebSocketDisconnectAction = PayloadAction<undefined, 'WEBSOCKET/DISCONNECT'>

// Union type para ações do WebSocket
type WebSocketAction = WebSocketInitAction | WebSocketDisconnectAction

// Tipo para o estado da store (ajuste conforme necessário)
interface RootState {
  [key: string]: any
}

const websocketMiddleware: Middleware<{}, RootState> = store => next => (action: unknown) => {
  if (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    (action as Action).type === 'WEBSOCKET/INIT'
  ) {
    const initAction = action as WebSocketInitAction
    const { userId } = initAction.payload

    store.dispatch(setWebsocketStatus('connecting'))

    const echo = getEcho()

    echo.connector.pusher.connection.bind('conncted', () => {
      store.dispatch(setWebsocketStatus('connected'))
    })

    echo.connector.pusher.connection.bind('disconnected', () => {
      store.dispatch(setWebsocketStatus('disconnected'))
    })

    echo.connector.pusher.connection.bind('connecting', () => {
      store.dispatch(setWebsocketStatus('reconnecting'))
    })

    echo.connector.pusher.connection.bind('error', (err: any) => {
      store.dispatch(setWebsocketError(err?.message || 'Erro na conexão WebSocket'))
    })

    //? Aqui Virão os Listners do ECHO
    // listenChatEvents(userId, store.dispatch, token)
    // listenNotificationEvents(userId, store.dispatch, token)
    // listenRechargeEvents(userId, store.dispatch, token)
  }

  if (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    (action as Action).type === 'WEBSOCKET/DISCONNECT'
  ) {
    disconnectEcho()
  }

  return next(action)
}

export default websocketMiddleware

// Tipos que você pode exportar para usar em outros arquivos
export type { WebSocketInitAction, WebSocketDisconnectAction, WebSocketAction, WebSocketInitPayload }

// Tipos auxiliares para os listeners (quando você implementar)
export type ListenerFunction = (userId: string | number, dispatch: Dispatch, token: string) => void
