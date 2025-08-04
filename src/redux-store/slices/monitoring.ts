import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { ChatWithHistory, ChatHistoryMessage } from '@/api/endpoints/chat/history'

// 🎯 INTERFACE DO ESTADO (Estrutura Normalizada)
interface MonitoringState {
  chatsByProtocol: Record<string, ChatWithHistory>

  // ✅ ORDEM DOS CARDS - Array simples com protocolos
  chatOrder: string[]

  // ✅ ESTADOS DE CONTROLE
  isLoading: boolean
  isRefreshing: boolean
  error: string | null

  // ✅ ESTADOS DE UI
  selectedProtocol: string | null

  // ✅ CONEXÕES WEBSOCKET
  connectedChannels: string[]
  isWebSocketConnected: boolean
}

const initialState: MonitoringState = {
  chatsByProtocol: {},
  chatOrder: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  selectedProtocol: null,
  connectedChannels: [],
  isWebSocketConnected: false
}

export const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState,
  reducers: {
    // 🔥 REDUCER 1: Inicializar todos os chats (primeira carga da API)
    initializeChats: (state, action: PayloadAction<ChatWithHistory[]>) => {
      console.log('🔄 Inicializando chats no Redux:', action.payload.length)

      // Limpar estado anterior
      state.chatsByProtocol = {}
      state.chatOrder = []

      // Normalizar dados: array → objeto + ordem
      action.payload.forEach(chat => {
        state.chatsByProtocol[chat.protocol] = chat
        state.chatOrder.push(chat.protocol)
      })

      state.isLoading = false
      state.error = null

      console.log('✅ Chats inicializados:', {
        total: action.payload.length,
        protocolos: action.payload.map(c => c.protocol)
      })
    },

    // 🔥 REDUCER 2: Adicionar UM novo chat (WebSocket: protocol.created)
    addNewChat: (state, action: PayloadAction<ChatWithHistory>) => {
      const chat = action.payload

      // Verificar se já existe
      if (state.chatsByProtocol[chat.protocol]) {
        console.warn('⚠️ Chat já existe:', chat.protocol)

        return
      }

      // Adicionar à estrutura normalizada
      state.chatsByProtocol[chat.protocol] = chat
      state.chatOrder.unshift(chat.protocol) // Novo chat no topo

      console.log('✅ Novo chat adicionado:', chat.protocol)
    },

    // 🔥 REDUCER 3: Atualizar UM chat específico (WebSocket: protocol.updated)
    updateChatInfo: (
      state,
      action: PayloadAction<{
        protocol: string
        updates: Partial<ChatWithHistory>
      }>
    ) => {
      const { protocol, updates } = action.payload
      const existingChat = state.chatsByProtocol[protocol]

      if (!existingChat) {
        console.warn('⚠️ Chat não encontrado para atualização:', protocol)

        return
      }

      // ✅ ATUALIZAÇÃO CIRÚRGICA - só o chat específico muda
      Object.assign(state.chatsByProtocol[protocol], updates)

      console.log('✅ Chat atualizado:', protocol, updates)
    },

    updatedQuestionOperator: (state, action: PayloadAction<{ protocol: string; question_operator: boolean }>) => {
      const { protocol, question_operator } = action.payload
      const chat = state.chatsByProtocol[protocol]

      if (!chat) {
        console.warn('⚠️ Chat não encontrado para atualização de operador:', protocol)

        return
      }

      chat.question_operator = question_operator
      chat.updated_at = new Date().toISOString()
    },

    // 🔥 REDUCER 4: Adicionar mensagem a UM chat (WebSocket: message.created)
    addMessageToChat: (
      state,
      action: PayloadAction<{
        protocol: string
        message: ChatHistoryMessage
      }>
    ) => {
      const { protocol, message } = action.payload
      const chat = state.chatsByProtocol[protocol]

      if (!chat) {
        console.warn('⚠️ Chat não encontrado para mensagem:', protocol)

        return
      }

      // Verificar duplicata
      const messageExists = chat.history.some(msg => msg.id === message.id)

      if (messageExists) {
        console.warn('⚠️ Mensagem duplicada ignorada:', message.id)

        return
      }

      // ✅ ATUALIZAÇÃO CIRÚRGICA - só este chat muda
      chat.history.push(message)
      chat.messageCount = (chat.messageCount || 0) + 1
      chat.lastMessage = message
      chat.updated_at = message.created_at

      console.log('✅ Mensagem adicionada ao chat:', protocol)
    },

    // 🔥 REDUCER 5: Remover chat (WebSocket: protocol.deleted)
    removeChat: (state, action: PayloadAction<string>) => {
      const protocol = action.payload

      if (!state.chatsByProtocol[protocol]) {
        console.warn('⚠️ Chat não encontrado para remoção:', protocol)

        return
      }

      // Remover do objeto normalizado
      delete state.chatsByProtocol[protocol]

      // Remover da ordem
      state.chatOrder = state.chatOrder.filter(p => p !== protocol)

      console.log('✅ Chat removido:', protocol)
    },

    // 🔥 REDUCER 6: Reordenar chats (Drag & Drop)
    reorderChats: (
      state,
      action: PayloadAction<{
        oldIndex: number
        newIndex: number
      }>
    ) => {
      const { oldIndex, newIndex } = action.payload

      // Validar índices
      if (oldIndex < 0 || oldIndex >= state.chatOrder.length || newIndex < 0 || newIndex >= state.chatOrder.length) {
        console.warn('⚠️ Índices inválidos:', { oldIndex, newIndex })

        return
      }

      // ✅ REORDENAÇÃO SIMPLES - só o array de ordem muda
      const [movedProtocol] = state.chatOrder.splice(oldIndex, 1)

      state.chatOrder.splice(newIndex, 0, movedProtocol)

      console.log('✅ Chats reordenados:', { oldIndex, newIndex })
    },

    // 🔧 REDUCERS DE CONTROLE
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload

      if (action.payload) {
        state.isLoading = false
        state.isRefreshing = false
      }
    },

    setSelectedChat: (state, action: PayloadAction<string | null>) => {
      state.selectedProtocol = action.payload
    },

    // 🔌 REDUCERS WEBSOCKET
    setWebSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.isWebSocketConnected = action.payload
    },

    addConnectedChannel: (state, action: PayloadAction<string>) => {
      const channel = action.payload

      if (!state.connectedChannels.includes(channel)) {
        state.connectedChannels.push(channel)
      }
    },

    removeConnectedChannel: (state, action: PayloadAction<string>) => {
      const channel = action.payload

      state.connectedChannels = state.connectedChannels.filter(ch => ch !== channel)
    },

    clearConnectedChannels: state => {
      state.connectedChannels = []
    },

    clearAllChats: state => {
      state.chatsByProtocol = {}
      state.chatOrder = []
      state.selectedProtocol = null
      state.error = null
    }
  }
})

// 🎯 EXPORT DAS ACTIONS
export const {
  initializeChats,
  addNewChat,
  updateChatInfo,
  addMessageToChat,
  removeChat,
  reorderChats,
  setLoading,
  setRefreshing,
  setError,
  setSelectedChat,
  setWebSocketConnected,
  addConnectedChannel,
  removeConnectedChannel,
  clearConnectedChannels,
  clearAllChats,
  updatedQuestionOperator
} = monitoringSlice.actions

// 🎯 SELETORES BÁSICOS (vamos expandir na Etapa 2)
export const selectChatsByProtocol = (state: any) => state.monitoring.chatsByProtocol
export const selectChatOrder = (state: any) => state.monitoring.chatOrder
export const selectMonitoringLoading = (state: any) => state.monitoring.isLoading
export const selectMonitoringError = (state: any) => state.monitoring.error
export const selectSelectedProtocol = (state: any) => state.monitoring.selectedProtocol

export const selectCallOperator = (state: any) => {
  state.monitoring.selectedProtocol
}

export default monitoringSlice.reducer
