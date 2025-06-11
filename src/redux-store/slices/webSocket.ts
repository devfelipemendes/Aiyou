// 📁 src/redux-store/slices/websocket.ts
// 🔥 SLICE DO WEBSOCKET

import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

// 🎯 TYPES: Estado do WebSocket
interface WebSocketState {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastConnected: string | null
  reconnectAttempts: number

  // 📡 Canais
  activeChannels: string[]
  protocolChannels: Record<string, boolean> // protocolId -> isActive
  projectChannels: Record<string, boolean> // clientId -> isActive

  // 📨 Mensagens recebidas (buffer temporário)
  recentMessages: Array<{
    id: string
    type: string
    channel: string
    data: any
    timestamp: number
  }>

  // 📊 Estatísticas
  totalMessagesReceived: number
  messagesByType: Record<string, number>

  // ❌ Erros
  lastError: string | null
  errors: Array<{
    message: string
    timestamp: number
  }>
}

// 🔧 ESTADO INICIAL
const initialState: WebSocketState = {
  // Conexão
  isConnected: false,
  connectionStatus: 'disconnected',
  lastConnected: null,
  reconnectAttempts: 0,

  // Canais
  activeChannels: [],
  protocolChannels: {},
  projectChannels: {},

  // Mensagens
  recentMessages: [],

  // Estatísticas
  totalMessagesReceived: 0,
  messagesByType: {},

  // Erros
  lastError: null,
  errors: []
}

// 🔥 SLICE PRINCIPAL
const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    // 🔌 CONEXÃO
    connectionStatusChanged: (
      state,
      action: PayloadAction<{
        status: WebSocketState['connectionStatus']
        error?: string
      }>
    ) => {
      state.connectionStatus = action.payload.status
      state.isConnected = action.payload.status === 'connected'

      if (action.payload.status === 'connected') {
        state.lastConnected = new Date().toISOString()
        state.reconnectAttempts = 0
        state.lastError = null
      }

      if (action.payload.error) {
        state.lastError = action.payload.error
        state.errors.push({
          message: action.payload.error,
          timestamp: Date.now()
        })

        // Manter apenas últimos 10 erros
        if (state.errors.length > 10) {
          state.errors = state.errors.slice(-10)
        }
      }
    },

    reconnectAttempted: state => {
      state.reconnectAttempts += 1
    },

    // 📡 CANAIS
    channelJoined: (
      state,
      action: PayloadAction<{
        channelName: string
        channelType: 'protocol' | 'project'
        id: string
      }>
    ) => {
      const { channelName, channelType, id } = action.payload

      // Adicionar à lista de canais ativos
      if (!state.activeChannels.includes(channelName)) {
        state.activeChannels.push(channelName)
      }

      // Marcar canal específico como ativo
      if (channelType === 'protocol') {
        state.protocolChannels[id] = true
      } else if (channelType === 'project') {
        state.projectChannels[id] = true
      }
    },

    channelLeft: (
      state,
      action: PayloadAction<{
        channelName: string
        channelType: 'protocol' | 'project'
        id: string
      }>
    ) => {
      const { channelName, channelType, id } = action.payload

      // Remover da lista de canais ativos
      state.activeChannels = state.activeChannels.filter(c => c !== channelName)

      // Marcar canal específico como inativo
      if (channelType === 'protocol') {
        state.protocolChannels[id] = false
      } else if (channelType === 'project') {
        state.projectChannels[id] = false
      }
    },

    allChannelsCleared: state => {
      state.activeChannels = []
      state.protocolChannels = {}
      state.projectChannels = {}
    },

    // 📨 MENSAGENS
    messageReceived: (
      state,
      action: PayloadAction<{
        messageType: string
        channel: string
        data: any
        protocolId?: string
        clientId?: string
      }>
    ) => {
      const { messageType, channel, data, protocolId, clientId } = action.payload
      const messageId = `${messageType}_${Date.now()}_${Math.random()}`

      // 📊 Estatísticas
      state.totalMessagesReceived += 1
      state.messagesByType[messageType] = (state.messagesByType[messageType] || 0) + 1

      // 📨 Adicionar ao buffer de mensagens recentes
      state.recentMessages.unshift({
        id: messageId,
        type: messageType,
        channel,
        data,
        timestamp: Date.now()
      })

      // Manter apenas últimas 50 mensagens no buffer
      if (state.recentMessages.length > 50) {
        state.recentMessages = state.recentMessages.slice(0, 50)
      }
    },

    // 🗑️ LIMPEZA
    clearRecentMessages: state => {
      state.recentMessages = []
    },

    clearErrors: state => {
      state.errors = []
      state.lastError = null
    },

    resetStatistics: state => {
      state.totalMessagesReceived = 0
      state.messagesByType = {}
    },

    // 🔄 RESET COMPLETO
    resetWebSocketState: () => initialState
  },

  // 🔧 EXTRA REDUCERS: Para lidar com eventos do middleware
  extraReducers: builder => {
    builder

      // 📝 QUESTION EVENTS
      .addCase('chat/questionCreated' as any, (state, action: any) => {
        websocketSlice.caseReducers.messageReceived(state, {
          type: 'messageReceived',
          payload: {
            messageType: 'question.created',
            channel: `protocol.${action.payload.protocolId}`,
            data: action.payload.data,
            protocolId: action.payload.protocolId
          }
        })
      })
      .addCase('chat/questionUpdated' as any, (state, action: any) => {
        websocketSlice.caseReducers.messageReceived(state, {
          type: 'messageReceived',
          payload: {
            messageType: 'question.updated',
            channel: `protocol.${action.payload.protocolId}`,
            data: action.payload.data,
            protocolId: action.payload.protocolId
          }
        })
      })

      // 💬 REPLY EVENTS
      .addCase('chat/replyCreated' as any, (state, action: any) => {
        websocketSlice.caseReducers.messageReceived(state, {
          type: 'messageReceived',
          payload: {
            messageType: 'reply.created',
            channel: `protocol.${action.payload.protocolId}`,
            data: action.payload.data,
            protocolId: action.payload.protocolId
          }
        })
      })
      .addCase('chat/replyUpdated' as any, (state, action: any) => {
        websocketSlice.caseReducers.messageReceived(state, {
          type: 'messageReceived',
          payload: {
            messageType: 'reply.updated',
            channel: `protocol.${action.payload.protocolId}`,
            data: action.payload.data,
            protocolId: action.payload.protocolId
          }
        })
      })

      // 👤 OPERATOR REPLY EVENTS
      .addCase('chat/operatorReplyCreated' as any, (state, action: any) => {
        websocketSlice.caseReducers.messageReceived(state, {
          type: 'messageReceived',
          payload: {
            messageType: 'operator.reply.created',
            channel: `protocol.${action.payload.protocolId}`,
            data: action.payload.data,
            protocolId: action.payload.protocolId
          }
        })
      })
      .addCase('chat/operatorReplyUpdated' as any, (state, action: any) => {
        websocketSlice.caseReducers.messageReceived(state, {
          type: 'messageReceived',
          payload: {
            messageType: 'operator.reply.updated',
            channel: `protocol.${action.payload.protocolId}`,
            data: action.payload.data,
            protocolId: action.payload.protocolId
          }
        })
      })

      // 📋 PROTOCOL EVENTS
      .addCase('chat/protocolCreated' as any, (state, action: any) => {
        websocketSlice.caseReducers.messageReceived(state, {
          type: 'messageReceived',
          payload: {
            messageType: 'protocol.created',
            channel: `project.${action.payload.clientId}`,
            data: action.payload.data,
            clientId: action.payload.clientId
          }
        })
      })
      .addCase('chat/protocolUpdated' as any, (state, action: any) => {
        websocketSlice.caseReducers.messageReceived(state, {
          type: 'messageReceived',
          payload: {
            messageType: 'protocol.updated',
            channel: `project.${action.payload.clientId}`,
            data: action.payload.data,
            clientId: action.payload.clientId
          }
        })
      })
  }
})

// 📤 EXPORTS: Actions
export const {
  connectionStatusChanged,
  reconnectAttempted,
  channelJoined,
  channelLeft,
  allChannelsCleared,
  messageReceived,
  clearRecentMessages,
  clearErrors,
  resetStatistics,
  resetWebSocketState
} = websocketSlice.actions

// 📤 EXPORTS: Selectors
export const selectWebSocketState = (state: { websocketReducer: WebSocketState }) => state.websocketReducer
export const selectIsConnected = (state: { websocketReducer: WebSocketState }) => state.websocketReducer.isConnected
export const selectActiveChannels = (state: { websocketReducer: WebSocketState }) =>
  state.websocketReducer.activeChannels
export const selectRecentMessages = (state: { websocketReducer: WebSocketState }) =>
  state.websocketReducer.recentMessages
export const selectConnectionStatus = (state: { websocketReducer: WebSocketState }) =>
  state.websocketReducer.connectionStatus
export const selectMessageStatistics = (state: { websocketReducer: WebSocketState }) => ({
  total: state.websocketReducer.totalMessagesReceived,
  byType: state.websocketReducer.messagesByType
})

// 📤 EXPORT DEFAULT: Reducer
export default websocketSlice.reducer

/*
🎓 EXPLICAÇÃO DIDÁTICA:

1. 📊 ESTADO GERENCIADO:
   - Status da conexão WebSocket
   - Lista de canais ativos
   - Buffer de mensagens recebidas
   - Estatísticas de uso
   - Histórico de erros

2. 🔄 FLUXO DE DADOS:
   - WebSocket recebe evento → Middleware dispatcha action → Reducer atualiza estado
   - Componentes podem acessar o estado via useAppSelector

3. 📡 CANAIS RASTREADOS:
   - protocolChannels: Mapeia protocolId → status ativo
   - projectChannels: Mapeia clientId → status ativo
   - activeChannels: Lista simples de todos os canais

4. 📨 BUFFER DE MENSAGENS:
   - Últimas 50 mensagens para debug/análise
   - Não substitui o state principal do chat
   - Útil para logs e monitoramento

5. 📊 ESTATÍSTICAS:
   - Total de mensagens recebidas
   - Contagem por tipo de evento
   - Útil para monitoring e performance

6. 🔧 INTEGRAÇÃO:
   - extraReducers escuta eventos do chat
   - Atualiza estatísticas automaticamente
   - Mantém histórico de atividade
*/
