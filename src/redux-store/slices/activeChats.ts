import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { ActiveChat } from '@/types/chatTypes'

interface ActiveChatsState {
  chats: ActiveChat[]
  chatsByProtocol: Record<string, ActiveChat>
  connectedChannels: Set<string>
  loading: boolean
  error: string | null
  lastFetched: number | null
  stats: {
    total: number
    bySource: Record<string, number>
    operatorMode: 0 | 1
    aiMode: number
  }
}

const initialState: ActiveChatsState = {
  chats: [],
  chatsByProtocol: {},
  connectedChannels: new Set(),
  loading: false,
  error: null,
  lastFetched: null,
  stats: {
    total: 0,
    bySource: {},
    operatorMode: 0,
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
      state.stats.operatorMode = 0
      state.stats.aiMode = 0

      chats.forEach(chat => {
        // Contar por fonte (whatsapp, telegram, etc)
        state.stats.bySource[chat.source] = (state.stats.bySource[chat.source] || 0) + 1

        // Contar por modo
        if (chat.operator === 1) {
          state.stats.operatorMode++
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

        if (newChat.operator === 1) {
          state.stats.operatorMode++
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

      if (chat.operator === 1) {
        state.stats.operatorMode--
      } else {
        state.stats.aiMode--
      }

      console.log('Chat removido:', protocol)
    },
    markChannelConnected: (state, action: PayloadAction<string>) => {
      const protocol = action.payload

      state.connectedChannels.add(protocol)
      console.log('🔌 Canal conectado:', protocol)
    },

    // 🔧 ACTION: Marcar canal como desconectado
    markChannelDisconnected: (state, action: PayloadAction<string>) => {
      const protocol = action.payload

      state.connectedChannels.delete(protocol)
      console.log('🔌 Canal desconectado:', protocol)
    },

    // 🔧 ACTIONS: Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
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
  setError
} = activeChatsSlice.actions

export const selectActiveChats = (state: any) => state.activeChats.chats
export const selectChatByProtocol = (state: any, protocol: string) => state.activeChats.chatsByProtocol[protocol]
export const selectActiveChatsStats = (state: any) => state.activeChats.stats
export const selectConnectedChannels = (state: any) => state.activeChats.connectedChannels
export const selectActiveChatsLoading = (state: any) => state.activeChats.loading
export const selectActiveChatsError = (state: any) => state.activeChats.error

export default activeChatsSlice.reducer
