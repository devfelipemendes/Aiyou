import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { ProtocolActiveResponse, ProtocolActive } from '@/types/chatTypes'

interface ActiveChatsState {
  chats: ProtocolActiveResponse[]
  chatsByProtocol: Record<string, ProtocolActiveResponse>
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
    initializeActiveChats: (state, action: PayloadAction<ProtocolActiveResponse[]>) => {
      const chats = action.payload

      console.log('Inicializando chats ativos:', chats.length)
      state.chats = chats
      state.lastFetched = Date.now()
      state.loading = false
      state.error = null

      state.chatsByProtocol = {}

      chats.forEach((chat: any) => {
        state.chatsByProtocol[chat.protocol] = chat
      })

      state.stats.total = chats.length
      state.stats.bySource = {}
      state.stats.operatorMode = 0
      state.stats.aiMode = 0

      chats.forEach((chat: any) => {
        //Consigo contar quantos chats ativos por source (Canal de atendimento )
        state.stats.bySource[chat.source] = (state.stats.bySource[chat.source] || 0) + 1

        //Consigo contar quantos chats ativos por operador (1 = operador humano, 2 = IA)
        if (chat.operator === 1) {
          state.stats.operatorMode++
        } else if (chat.operator === 2) {
          state.stats.aiMode++
        }
      })

      console.log('Estatísticas de chats ativos:', state.stats)
    },
    addNewChat: (state, action: PayloadAction<ProtocolActive>) => {
      const newChat = action.payload

      if (!state.chatsByProtocol[newChat.protocol]) {
        console.log('Novo Chat adicionado:', newChat.protocol)

        state.chats.unshift({ data: [newChat] })
        state.chatsByProtocol[newChat.protocol] = { data: [newChat] }

        state.stats.total++
        state.stats.bySource[newChat.source] = (state.stats.bySource[newChat.source] || 0) + 1

        if (newChat.operator === 1) {
          state.stats.operatorMode++
        } else {
          state.stats.aiMode++
        }
      }
    },
    updateChat: (state, action: PayloadAction<ProtocolActive>) => {
      const { protocol, ...updatedChat } = action.payload
      const existingChat = state.chatsByProtocol[protocol]

      if (existingChat) {
        Object.assign(existingChat, updatedChat)

        const index = state.chats.findIndex(chat => chat.data[0].protocol === protocol)

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
        state.chats = state.chats.filter(c => c.data[0].protocol !== protocol)
        delete state.chatsByProtocol[protocol]

        state.stats.total--
        state.stats.bySource[chat.data[0].source] = (state.stats.bySource[chat.data[0].source] || 0) - 1
      }

      if (chat.data[0].operator === 1) {
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
  initializeActiveChats,
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
