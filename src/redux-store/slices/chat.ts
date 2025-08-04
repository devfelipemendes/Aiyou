import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { ChatItem } from '@/api/endpoints/chat/queries'

// 🎯 IMPORT DOS TIPOS REAIS

// 🎯 INTERFACE PARA MENSAGEM
interface ChatMessage {
  id: string
  message: string
  time: number // timestamp
  senderId: string
  senderType: 'user' | 'assistant' | 'operator'
  msgStatus?: {
    isSent: boolean
    isDelivered: boolean
    isSeen: boolean
  }
}

// 🎯 INTERFACE PARA CHAT ATIVO (baseado na API real)
interface ActiveChat extends ChatItem {
  messages: ChatMessage[]
  unseenMsgs: number
  isTyping: boolean
  lastActivity: number

  isAssumed: boolean
}

// 🎯 ESTADO DO SLICE
interface ChatState {
  activeChats: ActiveChat[]

  // UI State
  activeProtocol: string | null
  selectedChat: ActiveChat | null
  isLoading: boolean
  error: string | null

  // Chat Interface State
  isUserProfileOpen: boolean
  isEmojiPickerOpen: boolean

  // Filtros e busca
  searchTerm: string
  statusFilter: 'all' | 'active' | 'inactive'
  sourceFilter: 'all' | 'whatsapp' | 'telegram' | 'webchat' | 'email' | 'sms'
}

const initialState: ChatState = {
  activeChats: [],
  activeProtocol: null,
  selectedChat: null,
  isLoading: false,
  error: null,
  isUserProfileOpen: false,
  isEmojiPickerOpen: false,
  searchTerm: '',
  statusFilter: 'all',
  sourceFilter: 'all'
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // 🎯 CARREGAR CHATS DA API (integração com RTK Query)
    setActiveChats: (state, action: PayloadAction<ChatItem[]>) => {
      state.activeChats = action.payload.map(chat => ({
        ...chat,
        messages: [], // Inicialmente vazio, carregado depois
        unseenMsgs: 0,
        isTyping: false,
        isAssumed: false,
        lastActivity: Date.now()
      }))
      state.isLoading = false
      state.error = null
    },

    // 🎯 MARCAR MENSAGENS COMO LIDAS
    markMessagesAsRead: (state, action: PayloadAction<string>) => {
      const protocol = action.payload
      const chat = state.activeChats.find(c => c.protocol === protocol)

      if (chat) {
        chat.unseenMsgs = 0
        chat.messages.forEach(msg => {
          if (msg.msgStatus) {
            msg.msgStatus.isSeen = true
          }
        })
      }
    },

    // 🎯 MARCAR MENSAGENS COMO ENTREGUES
    markMessagesAsDelivered: (
      state,
      action: PayloadAction<{
        protocol: string
        messageIds?: string[] // Se não fornecido, marca todas
      }>
    ) => {
      const { protocol, messageIds } = action.payload
      const chat = state.activeChats.find(c => c.protocol === protocol)

      if (chat) {
        chat.messages.forEach(msg => {
          if (msg.msgStatus && (!messageIds || messageIds.includes(msg.id))) {
            msg.msgStatus.isDelivered = true
          }
        })
      }
    },

    // 🎯 INDICADOR DE DIGITAÇÃO
    setTypingIndicator: (
      state,
      action: PayloadAction<{
        protocol: string
        isTyping: boolean
      }>
    ) => {
      const { protocol, isTyping } = action.payload
      const chat = state.activeChats.find(c => c.protocol === protocol)

      if (chat) {
        chat.isTyping = isTyping
      }
    },

    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },

    setStatusFilter: (state, action: PayloadAction<ChatState['statusFilter']>) => {
      state.statusFilter = action.payload
    },

    setSourceFilter: (state, action: PayloadAction<ChatState['sourceFilter']>) => {
      state.sourceFilter = action.payload
    },

    openUserProfile: state => {
      state.isUserProfileOpen = true
    },

    closeUserProfile: state => {
      state.isUserProfileOpen = false
    },

    toggleEmojiPicker: state => {
      state.isEmojiPickerOpen = !state.isEmojiPickerOpen
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },

    // 🎯 LIMPAR TODOS OS DADOS (útil para logout)
    clearAllChats: state => {
      state.activeChats = []
      state.activeProtocol = null
      state.selectedChat = null
      state.searchTerm = ''
      state.error = null
    }
  }
})

// 🎯 EXPORT DAS ACTIONS
export const {
  setActiveChats,
  markMessagesAsRead,
  markMessagesAsDelivered,
  setTypingIndicator,
  setSearchTerm,
  setStatusFilter,
  setSourceFilter,
  openUserProfile,
  closeUserProfile,
  toggleEmojiPicker,
  setLoading,
  setError,
  clearAllChats
} = chatSlice.actions

export default chatSlice.reducer

// 🎯 SELECTORS AVANÇADOS
export const selectActiveChats = (state: any) => state.chatReducer.activeChats

export const selectActiveChatsList = (state: any) => {
  const chats = state.chatReducer.activeChats
  const searchTerm = state.chatReducer.searchTerm
  const statusFilter = state.chatReducer.statusFilter
  const sourceFilter = state.chatReducer.sourceFilter

  return chats.filter((chat: ActiveChat) => {
    // Filtro por busca
    const matchesSearch =
      !searchTerm ||
      chat.assistant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.identifier.includes(searchTerm) ||
      chat.protocol.includes(searchTerm)

    // Filtro por status
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter

    // Filtro por source
    const matchesSource = sourceFilter === 'all' || chat.source === sourceFilter

    return matchesSearch && matchesStatus && matchesSource
  })
}

export const selectSelectedChat = (state: any) => state.chatReducer.selectedChat
export const selectActiveProtocol = (state: any) => state.chatReducer.activeProtocol

export const selectChatMessages = (state: any, protocol: string) => {
  const chat = state.chatReducer.activeChats.find((c: ActiveChat) => c.protocol === protocol)

  return chat?.messages || []
}

export const selectUnreadMessagesCount = (state: any) => {
  return state.chatReducer.activeChats.reduce((total: number, chat: ActiveChat) => total + chat.unseenMsgs, 0)
}

export const selectChatsBySource = (state: any, source: ChatItem['source']) => {
  return state.chatReducer.activeChats.filter((chat: ActiveChat) => chat.source === source)
}

export const selectIsLoading = (state: any) => state.chatReducer.isLoading
export const selectError = (state: any) => state.chatReducer.error
export const selectSearchTerm = (state: any) => state.chatReducer.searchTerm
export const selectFilters = (state: any) => ({
  status: state.chatReducer.statusFilter,
  source: state.chatReducer.sourceFilter,
  search: state.chatReducer.searchTerm
})

// 🎯 SELECTOR PARA ESTATÍSTICAS
export const selectChatStats = (state: any) => {
  const chats = state.chatReducer.activeChats

  return {
    total: chats.length,
    active: chats.filter((c: ActiveChat) => c.status === 'active').length,
    unread: chats.reduce((total: number, chat: ActiveChat) => total + chat.unseenMsgs, 0),
    bySource: {
      whatsapp: chats.filter((c: ActiveChat) => c.source === 'whatsapp').length,
      telegram: chats.filter((c: ActiveChat) => c.source === 'telegram').length,
      webchat: chats.filter((c: ActiveChat) => c.source === 'webchat').length,
      email: chats.filter((c: ActiveChat) => c.source === 'email').length,
      sms: chats.filter((c: ActiveChat) => c.source === 'sms').length
    }
  }
}
