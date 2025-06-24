import { apiSlice } from '@/api/ApiCreate/apiSlice'
import type { ProtocolActiveResponse } from '@/types/chatTypes'

export const chatApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getActiveChats: builder.query<ProtocolActiveResponse, void>({
      query: () => ({
        url: '/v1/chat',
        method: 'GET'
      }),

      transformResponse: (response: ProtocolActiveResponse) => {
        console.log('Chats ativos recebidos:', response.data.length)

        const activeChats = response.data.filter(chat => chat.active === 1)

        return {
          data: activeChats
        }
      },
      transformErrorResponse: response => {
        console.error('Erro ao buscar chats ativos:', response)

        return {
          status: response.status,
          message: 'Erro ao buscar chats ativos'
        }
      },
      providesTags: ['ActiveChats']
    })
  })
})

export const { useGetActiveChatsQuery } = chatApi
