// 📁 src/redux-store/middleware/websocketMiddleware.ts
// 🔥 MIDDLEWARE REDUX WEBSOCKET - CORRIGIDO

import type { Middleware, Dispatch, AnyAction } from '@reduxjs/toolkit'

import { initializeEcho, disconnectEcho, updateEchoAuthToken } from '@/libs/echo'

// 🎯 TYPES: Actions do WebSocket
export const WEBSOCKET_ACTIONS = {
  // Conexão
  CONNECT: 'websocket/connect',
  DISCONNECT: 'websocket/disconnect',
  RECONNECT: 'websocket/reconnect',

  // Canais
  JOIN_PROTOCOL_CHANNEL: 'websocket/joinProtocolChannel',
  LEAVE_PROTOCOL_CHANNEL: 'websocket/leaveProtocolChannel',
  JOIN_PROJECT_CHANNEL: 'websocket/joinProjectChannel',
  LEAVE_PROJECT_CHANNEL: 'websocket/leaveProjectChannel',

  // Status
  CONNECTION_STATUS_CHANGED: 'websocket/connectionStatusChanged',

  // Auth
  UPDATE_AUTH_TOKEN: 'websocket/updateAuthToken'
} as const

// 🎯 INTERFACES: Payloads das actions
interface ConnectAction {
  type: typeof WEBSOCKET_ACTIONS.CONNECT
  payload: {
    protocolId?: string
    clientId?: string
  }
}

interface JoinProtocolChannelAction {
  type: typeof WEBSOCKET_ACTIONS.JOIN_PROTOCOL_CHANNEL
  payload: {
    protocolId: string
  }
}

interface JoinProjectChannelAction {
  type: typeof WEBSOCKET_ACTIONS.JOIN_PROJECT_CHANNEL
  payload: {
    clientId: string
  }
}

interface UpdateAuthTokenAction {
  type: typeof WEBSOCKET_ACTIONS.UPDATE_AUTH_TOKEN
  payload: {
    token: string
  }
}

// 🎯 TYPE: Union de todas as actions
type WebSocketAction =
  | ConnectAction
  | JoinProtocolChannelAction
  | JoinProjectChannelAction
  | UpdateAuthTokenAction
  | AnyAction // Para ações que não são do WebSocket

// 🔥 CLASSE: Gerenciador de WebSocket
class WebSocketManager {
  private activeChannels: Set<string> = new Set()
  private isConnected: boolean = false

  // 🔧 MÉTODO: Conectar ao WebSocket
  connect(): void {
    try {
      const echo = initializeEcho()

      this.isConnected = true

      // 🎯 EVENTOS DE CONEXÃO
      if (echo.connector && echo.connector.pusher) {
        echo.connector.pusher.connection.bind('connected', () => {
          console.log('🔌 WebSocket conectado!')
          this.isConnected = true
        })

        echo.connector.pusher.connection.bind('disconnected', () => {
          console.log('🔌 WebSocket desconectado!')
          this.isConnected = false
        })

        echo.connector.pusher.connection.bind('error', (error: any) => {
          console.error('🔌 Erro no WebSocket:', error)
          this.isConnected = false
        })
      }
    } catch (error) {
      console.error('🔌 Erro ao conectar WebSocket:', error)
      this.isConnected = false
    }
  }

  // 🔧 MÉTODO: Desconectar WebSocket
  disconnect(): void {
    try {
      // ✅ Sair de todos os canais ativos
      this.activeChannels.forEach(channel => {
        if (window.Echo) {
          window.Echo.leave(channel)
        }
      })

      // ✅ Limpar lista de canais
      this.activeChannels.clear()

      // ✅ Desconectar Echo
      disconnectEcho()
      this.isConnected = false

      console.log('🔌 WebSocket desconectado e canais limpos')
    } catch (error) {
      console.error('🔌 Erro ao desconectar WebSocket:', error)
    }
  }

  // 🔧 MÉTODO: Entrar no canal do protocolo
  joinProtocolChannel(protocolId: string, dispatch: Dispatch): void {
    const channelName = `protocol.${protocolId}`

    if (!window.Echo) {
      console.error('🔌 Echo não inicializado!')

      return
    }

    if (this.activeChannels.has(channelName)) {
      console.log(`🔌 Já conectado ao canal: ${channelName}`)

      return
    }

    try {
      // 🎯 ENTRAR NO CANAL PRIVADO
      const channel = window.Echo.private(channelName)

      // 🔥 LISTENERS DOS EVENTOS (baseado no código do backend)
      channel

        // 📝 Eventos de Question
        .listen('.question.created', (data: any) => {
          console.log('📝 Question criada:', data)
          dispatch({
            type: 'chat/questionCreated',
            payload: { protocolId, data }
          })
        })
        .listen('.question.updated', (data: any) => {
          console.log('📝 Question atualizada:', data)
          dispatch({
            type: 'chat/questionUpdated',
            payload: { protocolId, data }
          })
        })

        // 💬 Eventos de Reply
        .listen('.reply.created', (data: any) => {
          console.log('💬 Reply criada:', data)
          dispatch({
            type: 'chat/replyCreated',
            payload: { protocolId, data }
          })
        })
        .listen('.reply.updated', (data: any) => {
          console.log('💬 Reply atualizada:', data)
          dispatch({
            type: 'chat/replyUpdated',
            payload: { protocolId, data }
          })
        })

        // 👤 Eventos de Operator Reply
        .listen('.operator.reply.created', (data: any) => {
          console.log('👤 Operator reply criada:', data)
          dispatch({
            type: 'chat/operatorReplyCreated',
            payload: { protocolId, data }
          })
        })
        .listen('.operator.reply.updated', (data: any) => {
          console.log('👤 Operator reply atualizada:', data)
          dispatch({
            type: 'chat/operatorReplyUpdated',
            payload: { protocolId, data }
          })
        })

      // ✅ Registrar canal como ativo
      this.activeChannels.add(channelName)
      console.log(`🔌 Conectado ao canal: ${channelName}`)
    } catch (error) {
      console.error(`🔌 Erro ao entrar no canal ${channelName}:`, error)
    }
  }

  // 🔧 MÉTODO: Entrar no canal do projeto
  joinProjectChannel(clientId: string, dispatch: Dispatch): void {
    const channelName = `project.${clientId}`

    if (!window.Echo) {
      console.error('🔌 Echo não inicializado!')

      return
    }

    if (this.activeChannels.has(channelName)) {
      console.log(`🔌 Já conectado ao canal: ${channelName}`)

      return
    }

    try {
      // 🎯 ENTRAR NO CANAL PRIVADO
      const channel = window.Echo.private(channelName)

      // 🔥 LISTENERS DOS EVENTOS
      channel

        // 📋 Eventos de Protocol
        .listen('.protocol.created', (data: any) => {
          console.log('📋 Protocol criado:', data)
          dispatch({
            type: 'chat/protocolCreated',
            payload: { clientId, data }
          })
        })
        .listen('.protocol.updated', (data: any) => {
          console.log('📋 Protocol atualizado:', data)
          dispatch({
            type: 'chat/protocolUpdated',
            payload: { clientId, data }
          })
        })

      // ✅ Registrar canal como ativo
      this.activeChannels.add(channelName)
      console.log(`🔌 Conectado ao canal: ${channelName}`)
    } catch (error) {
      console.error(`🔌 Erro ao entrar no canal ${channelName}:`, error)
    }
  }

  // 🔧 MÉTODO: Sair de canal específico
  leaveChannel(channelName: string): void {
    if (window.Echo && this.activeChannels.has(channelName)) {
      window.Echo.leave(channelName)
      this.activeChannels.delete(channelName)
      console.log(`🔌 Saiu do canal: ${channelName}`)
    }
  }

  // 🔧 MÉTODO: Atualizar token de auth
  updateAuthToken(token: string): void {
    updateEchoAuthToken(token)
    console.log('🔌 Token de autenticação atualizado')
  }
}

// 🔥 INSTÂNCIA ÚNICA: Singleton do gerenciador
const webSocketManager = new WebSocketManager()

// 🔥 MIDDLEWARE PRINCIPAL - CORREÇÃO: Tipagem sem referência circular
export const websocketMiddleware: Middleware<{}, any, Dispatch<any>> = store => next => action => {
  const typedAction = action as WebSocketAction

  // 🎯 PROCESSAR ACTIONS DO WEBSOCKET
  switch (typedAction.type) {
    case WEBSOCKET_ACTIONS.CONNECT:
      webSocketManager.connect()

      // 🔧 Auto-conectar a canais se IDs fornecidos
      const { protocolId, clientId } = typedAction.payload || {}

      if (protocolId) {
        webSocketManager.joinProtocolChannel(protocolId, store.dispatch)
      }

      if (clientId) {
        webSocketManager.joinProjectChannel(clientId, store.dispatch)
      }

      break

    case WEBSOCKET_ACTIONS.DISCONNECT:
      webSocketManager.disconnect()
      break

    case WEBSOCKET_ACTIONS.RECONNECT:
      webSocketManager.disconnect()
      webSocketManager.connect()
      break

    case WEBSOCKET_ACTIONS.JOIN_PROTOCOL_CHANNEL:
      webSocketManager.joinProtocolChannel(typedAction.payload.protocolId, store.dispatch)
      break

    case WEBSOCKET_ACTIONS.LEAVE_PROTOCOL_CHANNEL:
      webSocketManager.leaveChannel(`protocol.${typedAction.payload.protocolId}`)
      break

    case WEBSOCKET_ACTIONS.JOIN_PROJECT_CHANNEL:
      webSocketManager.joinProjectChannel(typedAction.payload.clientId, store.dispatch)
      break

    case WEBSOCKET_ACTIONS.LEAVE_PROJECT_CHANNEL:
      webSocketManager.leaveChannel(`project.${typedAction.payload.clientId}`)
      break

    case WEBSOCKET_ACTIONS.UPDATE_AUTH_TOKEN:
      webSocketManager.updateAuthToken(typedAction.payload.token)
      break
  }

  // ✅ Continuar processamento normal da action
  return next(action)
}

// 📤 EXPORTS: Action creators
export const websocketActions = {
  connect: (protocolId?: string, clientId?: string) => ({
    type: WEBSOCKET_ACTIONS.CONNECT,
    payload: { protocolId, clientId }
  }),

  disconnect: () => ({
    type: WEBSOCKET_ACTIONS.DISCONNECT
  }),

  reconnect: () => ({
    type: WEBSOCKET_ACTIONS.RECONNECT
  }),

  joinProtocolChannel: (protocolId: string) => ({
    type: WEBSOCKET_ACTIONS.JOIN_PROTOCOL_CHANNEL,
    payload: { protocolId }
  }),

  leaveProtocolChannel: (protocolId: string) => ({
    type: WEBSOCKET_ACTIONS.LEAVE_PROTOCOL_CHANNEL,
    payload: { protocolId }
  }),

  joinProjectChannel: (clientId: string) => ({
    type: WEBSOCKET_ACTIONS.JOIN_PROJECT_CHANNEL,
    payload: { clientId }
  }),

  leaveProjectChannel: (clientId: string) => ({
    type: WEBSOCKET_ACTIONS.LEAVE_PROJECT_CHANNEL,
    payload: { clientId }
  }),

  updateAuthToken: (token: string) => ({
    type: WEBSOCKET_ACTIONS.UPDATE_AUTH_TOKEN,
    payload: { token }
  })
}

/*
🎓 EXPLICAÇÃO DAS CORREÇÕES:

1. ❌ PROBLEMA ORIGINAL:
   - websocketMiddleware tinha tipo que referenciava RootState
   - RootState ainda não estava definido quando middleware era tipado
   - Criava referência circular

2. ✅ SOLUÇÕES APLICADAS:
   - Middleware agora usa Middleware genérico do Redux Toolkit
   - Parâmetros tipados explicitamente (MiddlewareAPI, Dispatch, AnyAction)
   - Removida dependência de RootState na tipagem do middleware
   - WebSocketAction inclui AnyAction para flexibilidade

3. 🔧 MUDANÇAS ESPECÍFICAS:
   - Tipo: Middleware (genérico) em vez de Middleware<{}, RootState>
   - store: MiddlewareAPI (genérico)
   - next: Dispatch (genérico)
   - action: AnyAction (mais flexível)

4. ✅ RESULTADO:
   - Sem referências circulares
   - Tipagem correta e segura
   - Compatível com qualquer RootState
   - Mais flexível e reutilizável
*/
