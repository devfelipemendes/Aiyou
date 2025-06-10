// Third-party Imports
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Type Imports
import type { StatusType } from '@/types/chatTypes'

// Data Imports
import { db } from '@/fake-db/apps/chat'

interface ChatState {
  activeUserId: number | null
  isUserProfileOpen: boolean

  // Outros estados de UI que precisam ser globais podem ser adicionados aqui
}

const initialState: ChatState = {
  activeUserId: null,
  isUserProfileOpen: false
}

// 🔥 CORRIGIDO: Combinamos o estado inicial com os dados do fake-db
const initialStateWithData = {
  ...initialState,
  ...db
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState: initialStateWithData,
  reducers: {
    // Ações para gerenciar o usuário ativo
    setActiveUser: (state, action: PayloadAction<number>) => {
      state.activeUserId = action.payload
    },

    // Ações para gerenciar UI
    openUserProfile: state => {
      state.isUserProfileOpen = true
    },
    closeUserProfile: state => {
      state.isUserProfileOpen = false
    },

    // Obter dados do usuário ativo e limpar mensagens não vistas
    getActiveUserData: (state, action: PayloadAction<number>) => {
      const activeUser = state.contacts.find(user => user.id === action.payload)
      const chat = state.chats.find(chat => chat.userId === action.payload)

      // Limpa mensagens não vistas quando usuário é selecionado
      if (chat && chat.unseenMsgs > 0) {
        chat.unseenMsgs = 0
      }

      if (activeUser) {
        state.activeUser = activeUser
      }
    },

    // Adicionar novo chat se não existir
    addNewChat: (state, action) => {
      const { id } = action.payload

      state.contacts.find(contact => {
        if (contact.id === id && !state.chats.find(chat => chat.userId === contact.id)) {
          state.chats.unshift({
            id: state.chats.length + 1,
            userId: contact.id,
            unseenMsgs: 0,
            chat: []
          })
        }
      })
    },

    // Atualizar status do usuário
    setUserStatus: (state, action: PayloadAction<{ status: StatusType }>) => {
      state.profileUser = {
        ...state.profileUser,
        status: action.payload.status
      }
    },

    // 🔥 CORRIGIDO: Action principal que estava causando o erro
    sendMsg: (state, action: PayloadAction<{ msg: string }>) => {
      const { msg } = action.payload

      // Encontra o chat ativo
      const existingChat = state.chats.find(chat => chat.userId === state.activeUser?.id)

      if (existingChat) {
        // ✅ MUDANÇA PRINCIPAL: Usar Date.now() em vez de new Date()
        existingChat.chat.push({
          message: msg,
          time: Date.now(), // 🎯 Aqui está a correção! Timestamp é serializável
          senderId: state.profileUser.id,
          msgStatus: {
            isSent: true,
            isDelivered: false,
            isSeen: false
          }
        })

        // Move o chat para o topo da lista (mais recente primeiro)
        state.chats = state.chats.filter(chat => chat.userId !== state.activeUser?.id)
        state.chats.unshift(existingChat)
      }
    },

    // 🔥 NOVA ACTION: Receber mensagem (útil para WebSocket)
    receiveMsg: (
      state,
      action: PayloadAction<{
        msg: string
        senderId: number
        chatId: number
      }>
    ) => {
      const { msg, senderId, chatId } = action.payload

      const existingChat = state.chats.find(chat => chat.id === chatId)

      if (existingChat) {
        existingChat.chat.push({
          message: msg,
          time: Date.now(), // ✅ Sempre usar timestamp
          senderId: senderId,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: false
          }
        })

        // Se não é o chat ativo, incrementar mensagens não vistas
        if (existingChat.userId !== state.activeUserId) {
          existingChat.unseenMsgs += 1
        }

        // Move para o topo
        state.chats = state.chats.filter(chat => chat.id !== chatId)
        state.chats.unshift(existingChat)
      }
    },

    // 🔥 NOVA ACTION: Marcar mensagens como entregues
    markAsDelivered: (state, action: PayloadAction<{ chatId: number }>) => {
      const { chatId } = action.payload
      const chat = state.chats.find(chat => chat.id === chatId)

      if (chat) {
        chat.chat.forEach(message => {
          if (message.senderId === state.profileUser.id && message.msgStatus) {
            message.msgStatus.isDelivered = true
          }
        })
      }
    },

    // 🔥 NOVA ACTION: Marcar mensagens como lidas
    markAsRead: (state, action: PayloadAction<{ chatId: number }>) => {
      const { chatId } = action.payload
      const chat = state.chats.find(chat => chat.id === chatId)

      if (chat) {
        chat.chat.forEach(message => {
          if (message.senderId === state.profileUser.id && message.msgStatus) {
            message.msgStatus.isSeen = true
          }
        })
      }
    }
  }
})

// Export das actions
export const {
  getActiveUserData,
  addNewChat,
  setUserStatus,
  sendMsg,
  receiveMsg, // 🔥 Nova
  markAsDelivered, // 🔥 Nova
  markAsRead, // 🔥 Nova
  setActiveUser,
  openUserProfile,
  closeUserProfile
} = chatSlice.actions

// Export do reducer
export default chatSlice.reducer

// 🔥 NOVOS SELECTORS: Para facilitar o uso nos componentes
export const selectActiveUser = (state: any) => state.chatReducer.activeUser
export const selectActiveUserId = (state: any) => state.chatReducer.activeUserId
export const selectChats = (state: any) => state.chatReducer.chats
export const selectContacts = (state: any) => state.chatReducer.contacts
export const selectProfileUser = (state: any) => state.chatReducer.profileUser
export const selectIsUserProfileOpen = (state: any) => state.chatReducer.isUserProfileOpen

// Selector para obter chat específico
export const selectChatByUserId = (state: any, userId: number) =>
  state.chatReducer.chats.find((chat: any) => chat.userId === userId)

// Selector para contar mensagens não lidas
export const selectUnreadMessagesCount = (state: any) =>
  state.chatReducer.chats.reduce((total: number, chat: any) => total + chat.unseenMsgs, 0)
