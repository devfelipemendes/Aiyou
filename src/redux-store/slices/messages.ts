// redux-store/slices/messages.ts
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

interface Message {
  id: string
  protocol_id: string
  content: string
  type: 'user' | 'operator' | 'system' | 'ai'
  sender_name?: string
  sender_id?: string
  timestamp: string
  is_read: boolean
  metadata?: {
    channel?: string
    media_type?: string
    file_url?: string
    reply_to?: string
  }
}

interface MessagesState {
  messagesByProtocol: Record<string, Message[]>
  loading: Record<string, boolean>
  error: string | null
  totalMessages: number
}

const initialState: MessagesState = {
  messagesByProtocol: {},
  loading: {},
  error: null,
  totalMessages: 0
}

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    // 🔧 Definir mensagens para um protocolo
    setMessages: (state, action: PayloadAction<{ protocolId: string; messages: Message[] }>) => {
      const { protocolId, messages } = action.payload

      state.messagesByProtocol[protocolId] = messages.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )

      state.loading[protocolId] = false

      // Recalcular total
      state.totalMessages = Object.values(state.messagesByProtocol).flat().length
    },

    // 🔧 Adicionar nova mensagem
    addMessage: (state, action: PayloadAction<{ protocolId: string; message: Message }>) => {
      const { protocolId, message } = action.payload

      if (!state.messagesByProtocol[protocolId]) {
        state.messagesByProtocol[protocolId] = []
      }

      // Verificar se mensagem já existe
      const exists = state.messagesByProtocol[protocolId].some(m => m.id === message.id)

      if (!exists) {
        state.messagesByProtocol[protocolId].push(message)

        // Manter ordenação por timestamp
        state.messagesByProtocol[protocolId].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )

        state.totalMessages++
      }
    },

    // 🔧 Atualizar mensagem existente
    updateMessage: (state, action: PayloadAction<Partial<Message> & { id: string; protocol_id: string }>) => {
      const { protocol_id, id, ...updateData } = action.payload

      const protocolMessages = state.messagesByProtocol[protocol_id]

      if (protocolMessages) {
        const messageIndex = protocolMessages.findIndex(m => m.id === id)

        if (messageIndex !== -1) {
          protocolMessages[messageIndex] = {
            ...protocolMessages[messageIndex],
            ...updateData
          }
        }
      }
    },

    // 🔧 Marcar mensagens como lidas
    markMessagesAsRead: (state, action: PayloadAction<{ protocolId: string; messageIds?: string[] }>) => {
      const { protocolId, messageIds } = action.payload

      const protocolMessages = state.messagesByProtocol[protocolId]

      if (protocolMessages) {
        protocolMessages.forEach(message => {
          if (!messageIds || messageIds.includes(message.id)) {
            message.is_read = true
          }
        })
      }
    },

    // 🔧 Remover mensagem
    removeMessage: (state, action: PayloadAction<{ protocolId: string; messageId: string }>) => {
      const { protocolId, messageId } = action.payload

      const protocolMessages = state.messagesByProtocol[protocolId]

      if (protocolMessages) {
        const initialLength = protocolMessages.length

        state.messagesByProtocol[protocolId] = protocolMessages.filter(m => m.id !== messageId)

        if (protocolMessages.length < initialLength) {
          state.totalMessages--
        }
      }
    },

    // 🔧 Limpar mensagens de um protocolo
    clearProtocolMessages: (state, action: PayloadAction<string>) => {
      const protocolId = action.payload

      if (state.messagesByProtocol[protocolId]) {
        const messageCount = state.messagesByProtocol[protocolId].length

        delete state.messagesByProtocol[protocolId]
        state.totalMessages -= messageCount
      }
    },

    // 🔧 Estados de carregamento e erro
    setLoading: (state, action: PayloadAction<{ protocolId: string; loading: boolean }>) => {
      const { protocolId, loading } = action.payload

      state.loading[protocolId] = loading
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})

export const {
  setMessages,
  addMessage,
  updateMessage,
  markMessagesAsRead,
  removeMessage,
  clearProtocolMessages,
  setLoading,
  setError
} = messagesSlice.actions

// 🔧 Selectors
export const selectMessagesByProtocol = (protocolId: string) => (state: any) =>
  state.messagesReducer.messagesByProtocol[protocolId] || []

export const selectLatestMessage = (protocolId: string) => (state: any) => {
  const messages = state.messagesReducer.messagesByProtocol[protocolId] || []

  return messages[messages.length - 1] || null
}

export const selectUnreadMessages = (protocolId: string) => (state: any) => {
  const messages = state.messagesReducer.messagesByProtocol[protocolId] || []

  return messages.filter((m: Message) => !m.is_read)
}

export const selectTotalMessages = (state: any) => state.messagesReducer.totalMessages
export const selectMessagesLoading = (state: any) => state.messagesReducer.loading
export const selectMessagesError = (state: any) => state.messagesReducer.error

export default messagesSlice.reducer
