import { apiSlice } from '@/api/ApiCreate/apiSlice'

interface ChatListError {
  status: number
  message: string
}

export interface ChatAssistantPhone {
  id: string
  phone: string
}

export interface ChatAssistant {
  id: string
  name: string
  img_url: string | null
  description: string | null
  phones: ChatAssistantPhone[]
}

export interface ChatItem {
  protocol: string
  assistant: ChatAssistant
  project_id: string
  source: 'whatsapp' | 'telegram' | 'webchat' | 'email' | 'sms'
  identifier: string
  operator: number
  error: string | null
  question_operator: number
  status: string
  updated_at: string
  created_at: string
}

export interface ChatListResponse {
  data: ChatItem[]
}

export const chatApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getActiveChats: builder.query<ChatListResponse, void>({
      query: () => ({
        url: '/v1/chat',
        method: 'GET'
      }),

      transformResponse: (response: ChatListResponse) => {
        console.log('Chats ativos recebidos:', response.data.length)

        const activeChats = response.data.filter((chat: ChatItem) => chat.status === 'active')

        return {
          data: activeChats
        }
      },
      transformErrorResponse: (response: any): ChatListError => {
        console.error('Erro ao buscar chats ativos:', response)

        return {
          status: response.status || 500,
          message: response?.message || 'Erro ao buscar chats ativos'
        }
      },
      providesTags: result => {
        const tags: Array<{ type: 'ActiveChats' } | { type: 'Chat'; id: string }> = [{ type: 'ActiveChats' }]

        if (result?.data) {
          result.data.forEach(chat => {
            tags.push({ type: 'Chat', id: chat.protocol })
          })
        }

        return tags
      },

      keepUnusedDataFor: 30 // 30 segundos
    }),

    getChatByProtocol: builder.query<ChatItem, string>({
      query: protocol => ({
        url: `/v1/chat/${protocol}`,
        method: 'GET'
      }),
      providesTags: (result, error, protocol) => [{ type: 'Chat', id: protocol }]
    })
  })
})

export const { useGetActiveChatsQuery, useGetChatByProtocolQuery } = chatApi

export const selectActiveChatsData = (state: any) => chatApi.endpoints.getActiveChats.select()(state)?.data?.data || []

export const selectActiveChatsCount = (state: any) => selectActiveChatsData(state).length

export const selectChatsBySource = (state: any, source: ChatItem['source']) =>
  selectActiveChatsData(state).filter(chat => chat.source === source)
