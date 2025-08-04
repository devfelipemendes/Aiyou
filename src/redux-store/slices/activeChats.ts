import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { ActiveChat } from '@/types/chatTypes'
import type { ProcessedProtocolHistoryResponse } from '@/api/endpoints/chat/protocolHistory'

interface ActiveChatsState {
  chats: ActiveChat[]
  chatsByProtocol: Record<string, ActiveChat>
  connectedChannels: string[]
  protocolHistory: {
    data: Record<string, ProcessedProtocolHistoryResponse>
    loading: Record<string, boolean>
    error: Record<string, string | null>
    lastFetched: Record<string, number>
  }
  loading: boolean
  error: string | null
  lastFetched: number | null
  stats: {
    total: number
    bySource: Record<string, number>
    operatorMode: boolean
    aiMode: number
  }
}

const initialState: ActiveChatsState = {
  chats: [],
  chatsByProtocol: {},
  connectedChannels: [],
  protocolHistory: {
    data: {},
    loading: {},
    error: {},
    lastFetched: {}
  },
  loading: false,
  error: null,
  lastFetched: null,
  stats: {
    total: 0,
    bySource: {},
    operatorMode: false,
    aiMode: 0
  }
}

const activeChatsSlice = createSlice({
  name: 'activeChats',
  initialState,
  reducers: {
    initializeChats: (state, action: PayloadAction<ActiveChat[]>) => {
      const chats = action.payload

      console.log('🔥 Inicializando chats:', chats.length)

      state.chats = chats
      state.lastFetched = Date.now()
      state.loading = false
      state.error = null

      // 🎯 DIDÁTICA: Por que criar um index?
      // Para acesso O(1) ao buscar chat por protocol ID
      state.chatsByProtocol = {}
      chats.forEach(chat => {
        state.chatsByProtocol[chat.protocol] = chat
      })

      // 🔧 CALCULAR: Estatísticas
      state.stats.total = chats.length
      state.stats.bySource = {}
      state.stats.operatorMode = false
      state.stats.aiMode = 0

      chats.forEach(chat => {
        // Contar por fonte (whatsapp, telegram, etc)
        state.stats.bySource[chat.source] = (state.stats.bySource[chat.source] || 0) + 1

        // Contar por modo
        if (chat.operator) {
          state.stats.operatorMode
        } else {
          state.stats.aiMode++
        }
      })

      console.log('📊 Estatísticas calculadas:', state.stats)
    },
    addNewChat: (state, action: PayloadAction<ActiveChat>) => {
      const newChat = action.payload

      // Verificar se já existe
      if (!state.chatsByProtocol[newChat.protocol]) {
        console.log('➕ Novo chat adicionado:', newChat.protocol)

        state.chats.unshift(newChat) // Adicionar no início (mais recente)
        state.chatsByProtocol[newChat.protocol] = newChat

        // Atualizar estatísticas
        state.stats.total++
        state.stats.bySource[newChat.source] = (state.stats.bySource[newChat.source] || 0) + 1

        if (newChat.operator) {
          state.stats.operatorMode
        } else {
          state.stats.aiMode++
        }
      }
    },
    updateChat: (state, action: PayloadAction<ActiveChat>) => {
      const { protocol, ...updatedChat } = action.payload
      const existingChat = state.chatsByProtocol[protocol]

      if (existingChat) {
        Object.assign(existingChat, updatedChat)

        const index = state.chats.findIndex(chat => chat.protocol === protocol)

        if (index !== -1) {
          Object.assign(state.chats[index], updatedChat)
        }

        console.log('Chat atualizado:', protocol)
      }
    },
    removeChat: (state, action: PayloadAction<string>) => {
      const protocol = action.payload

      const chat = state.chatsByProtocol[protocol]

      if (chat) {
        state.chats = state.chats.filter(c => c.protocol !== protocol)
        delete state.chatsByProtocol[protocol]

        state.stats.total--
        state.stats.bySource[chat.source] = (state.stats.bySource[chat.source] || 0) - 1
      }

      if (chat.operator) {
        state.stats.operatorMode
      } else {
        state.stats.aiMode--
      }

      console.log('Chat removido:', protocol)
    },
    markChannelConnected: (state, action: PayloadAction<string>) => {
      const protocol = action.payload

      // Só adiciona se não existir
      if (!state.connectedChannels.includes(protocol)) {
        state.connectedChannels.push(protocol)
      }

      console.log('🔌 Canal conectado:', protocol)
    },

    markChannelDisconnected: (state, action: PayloadAction<string>) => {
      const protocol = action.payload

      // Remove do array
      state.connectedChannels = state.connectedChannels.filter(p => p !== protocol)

      console.log('🔌 Canal desconectado:', protocol)
    },

    // 🔧 ACTIONS: Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },

    // 🔧 ACTIONS: Protocol History

    setProtocolHistoryLoading: (state, action: PayloadAction<{ protocol: string; isLoading: boolean }>) => {
      const { protocol, isLoading } = action.payload

      state.protocolHistory.loading[protocol] = isLoading

      if (isLoading) {
        state.protocolHistory.error[protocol] = null
      }

      console.log(`Histórico do protocolo ${protocol} ${isLoading ? 'carregando' : 'pronto'}`)
    },

    setProtocolHistoryData: (
      state,
      action: PayloadAction<{
        protocol: string
        data: ProcessedProtocolHistoryResponse
      }>
    ) => {
      const { protocol, data } = action.payload

      // Salvar os dados
      state.protocolHistory.data[protocol] = data
      state.protocolHistory.loading[protocol] = false
      state.protocolHistory.error[protocol] = null
      state.protocolHistory.lastFetched[protocol] = Date.now()

      console.log(`✅ Histórico salvo para protocolo ${protocol}:`, data.stats)
    },

    // 🎯 ACTION 3: Salvar erro
    setProtocolHistoryError: (state, action: PayloadAction<{ protocol: string; error: string }>) => {
      const { protocol, error } = action.payload

      state.protocolHistory.error[protocol] = error
      state.protocolHistory.loading[protocol] = false

      console.log(`❌ Erro no protocolo ${protocol}:`, error)
    },

    // 🎯 ACTION 4: Limpar histórico de um protocolo específico
    clearProtocolHistory: (state, action: PayloadAction<string>) => {
      const protocol = action.payload

      delete state.protocolHistory.data[protocol]
      delete state.protocolHistory.loading[protocol]
      delete state.protocolHistory.error[protocol]
      delete state.protocolHistory.lastFetched[protocol]

      console.log(`🗑️ Histórico limpo para protocolo: ${protocol}`)
    },

    // 🎯 ACTION 5: Limpar TODOS os históricos
    clearAllProtocolHistory: state => {
      state.protocolHistory = {
        data: {},
        loading: {},
        error: {},
        lastFetched: {}
      }

      console.log('🗑️ Todos os históricos foram limpos')
    },

    // 🎯 ACTION 6: Atualizar timestamp de último acesso
    updateProtocolHistoryAccess: (state, action: PayloadAction<string>) => {
      const protocol = action.payload

      state.protocolHistory.lastFetched[protocol] = Date.now()

      console.log(`👁️ Último acesso atualizado para protocolo: ${protocol}`)
    }
  }
})

export const {
  initializeChats,
  addNewChat,
  updateChat,
  removeChat,
  markChannelConnected,
  markChannelDisconnected,
  setLoading,
  setError,
  setProtocolHistoryLoading,
  setProtocolHistoryData,
  setProtocolHistoryError,
  clearProtocolHistory,
  clearAllProtocolHistory,
  updateProtocolHistoryAccess
} = activeChatsSlice.actions

export const selectActiveChats = (state: any) => state.activeChats.chats
export const selectChatByProtocol = (state: any, protocol: string) => state.activeChats.chatsByProtocol[protocol]
export const selectActiveChatsStats = (state: any) => state.activeChats.stats
export const selectConnectedChannels = (state: any) => state.activeChats.connectedChannels
export const selectActiveChatsLoading = (state: any) => state.activeChats.loading
export const selectActiveChatsError = (state: any) => state.activeChats.error

// 🔥 ADICIONAR no final do arquivo, junto com os outros selectors

// 📋 SELECTOR: Pegar histórico de um protocolo específico
export const selectProtocolHistory = (state: any, protocol: string) =>
  state.activeChats.protocolHistory.data[protocol] || null

// 📋 SELECTOR: Verificar se está carregando
export const selectProtocolHistoryLoading = (state: any, protocol: string) =>
  state.activeChats.protocolHistory.loading[protocol] || false

// 📋 SELECTOR: Pegar erro de um protocolo
export const selectProtocolHistoryError = (state: any, protocol: string) =>
  state.activeChats.protocolHistory.error[protocol] || null

// 📋 SELECTOR: Verificar se tem dados em cache
export const selectHasProtocolHistoryCache = (state: any, protocol: string) => {
  const lastFetched = state.activeChats.protocolHistory.lastFetched[protocol]

  if (!lastFetched) return false

  // Cache válido por 1 hora (3600000 ms)
  const oneHour = 60 * 60 * 1000

  return Date.now() - lastFetched < oneHour
}

// 📋 SELECTOR: Estatísticas gerais de todos os históricos
export const selectProtocolHistoryStats = (state: any) => {
  const allHistories = Object.values(state.activeChats.protocolHistory.data)

  return {
    totalCachedProtocols: allHistories.length,
    totalCachedMessages: allHistories.reduce(
      (acc: number, history: any) => acc + (history.stats?.totalMessages || 0),
      0
    )
  }
}

export default activeChatsSlice.reducer
