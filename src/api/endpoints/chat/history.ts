import { apiSlice } from '@/api/ApiCreate/apiSlice'

export interface ChatHistoryMessage {
  id: string
  content: string
  message_type?: 'text' | 'audio'
  audio_url?: string | null
  role: 'user' | 'assistant' | 'operator'
  operator: boolean | null
  operator_name: string | null
  created_at: string
}

export interface ChatHistoryResponse {
  message: string
  data: ChatHistoryMessage[]
}

export interface ChatWithHistory {
  protocol: string
  assistant: any // Vem do chat ativo
  source: string
  identifier: string
  status: 'active' | 'inactive' | 'resolved' | 'unresolved'
  history: ChatHistoryMessage[]
  historyLoading: boolean
  historyError: string | null
  lastMessage?: ChatHistoryMessage
  messageCount: number
  project_id: string
  operator: boolean
  question_operator: boolean
  isAwaitingHistory: boolean
  updated_at: string
  created_at: string
}

export interface ChatWithHistoryListResponse {
  chats: ChatWithHistory[]
  totalChats: number
  totalMessages: number
  loadingChats: ChatWithHistory[]
  erroredChats: ChatWithHistory[]
  successChats: ChatWithHistory[]
}

export const chatHistoryApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getChatHistory: builder.query<ChatHistoryResponse, string>({
      query: protocol => ({
        url: `/chat/${protocol}/history`,
        method: 'GET'
      }),

      transformResponse: (response: ChatHistoryResponse) => {
        console.log(
          `📥 Histórico do chat ${response.data[0]?.content?.slice(0, 50)}...`,
          response.data.length,
          'mensagens'
        )

        const sortedMessages = response.data.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )

        return {
          ...response,
          data: sortedMessages
        }
      },

      transformErrorResponse: (response: any) => {
        console.error('💥 Erro ao buscar histórico:', response)

        return {
          status: response?.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao buscar histórico'
        }
      },

      providesTags: (result, error, protocol) => [{ type: 'Chat' as const, id: `${protocol}-history` }],

      keepUnusedDataFor: 300
    }),

    getAllChatsWithHistory: builder.query<ChatWithHistoryListResponse, void>({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        try {
          console.log('🚀 Iniciando busca completa: chats + históricos...')

          console.log('📋 Passo 1: Buscando chats ativos...')

          const chatsResult = await baseQuery({
            url: '/chat',
            method: 'GET'
          })

          if (chatsResult.error) {
            return { error: { status: chatsResult.error.status, data: chatsResult.error.data } }
          }

          const activeChats = (chatsResult.data as any)?.data?.filter((chat: any) => chat.status === 'active') || []

          console.log(`✅ ${activeChats.length} chats ativos encontrados`)

          if (activeChats.length === 0) {
            return {
              data: {
                chats: [],
                totalChats: 0,
                totalMessages: 0,
                loadingChats: [],
                erroredChats: [],
                successChats: []
              }
            }
          }

          console.log('📨 Passo 2: Buscando históricos em paralelo...')

          const historyPromises = activeChats.map(async (chat: any, chatIndex: number) => {
            try {
              console.log(`  → Buscando histórico do protocol: ${chat.protocol}`)

              const url = `/chat/${chat.protocol}/history`

              console.log(`🔍 [${chatIndex}] URL construída:`, url)
              console.log(`🔍 [${chatIndex}] Protocol original:`, chat.protocol)

              const historyResult = await baseQuery({
                url: `/chat/${chat.protocol}/history`,
                method: 'GET'
              })

              if (historyResult.error) {
                console.warn(`  ⚠️ Erro no histórico ${chat.protocol}:`, historyResult.error)

                return {
                  ...chat,
                  history: [],
                  historyLoading: false,
                  historyError: (historyResult.error as any)?.message || 'Erro ao carregar histórico',
                  lastMessage: undefined,
                  messageCount: 0
                }
              }

              const historyData = (historyResult.data as ChatHistoryResponse)?.data || []

              console.log(`🔍 [${chatIndex}] RESPOSTA DA API para ${chat.protocol}:`, {
                totalMessages: historyData.length,
                primeiraMensagem: historyData[0]?.content?.slice(0, 50) || 'Sem mensagens',
                ultimaMensagem: historyData[historyData.length - 1]?.content?.slice(0, 50) || 'Sem mensagens',
                todasMensagensIDs: historyData.map(msg => msg.id).join(', ')
              })

              console.log(`🔍 [${chatIndex}] Resposta da API:`, {
                protocol: chat.protocol,
                totalMessages: historyData.length,
                firstMessage: historyData[0]?.content?.slice(0, 30) || 'Vazia',
                lastMessage: historyData[historyData.length - 1]?.content?.slice(0, 30) || 'Vazia'
              })

              const sortedHistory = historyData.sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )

              console.log(`  ✅ ${sortedHistory.length} mensagens carregadas para ${chat.protocol}`)
              console.log(`🔍 [${chatIndex}] Resultado final:`, {
                protocol: chat.protocol,
                historyLength: sortedHistory.length,
                messageCount: sortedHistory.length
              })

              return {
                ...chat,
                history: sortedHistory,
                historyLoading: false,
                historyError: null,
                lastMessage: sortedHistory[sortedHistory.length - 1], // Última mensagem
                messageCount: sortedHistory.length
              }
            } catch (error) {
              console.error(`  💥 Erro crítico no chat ${chat.protocol}:`, error)

              return {
                ...chat,
                history: [],
                historyLoading: false,
                historyError: 'Erro crítico ao carregar histórico',
                lastMessage: undefined,
                messageCount: 0
              }
            }
          })

          console.log('⏳ Aguardando todos os históricos...')
          const chatsWithHistory = await Promise.all(historyPromises)

          const totalMessages = chatsWithHistory.reduce((sum, chat) => sum + chat.messageCount, 0)
          const loadingChats = chatsWithHistory.filter(chat => chat.historyLoading)
          const erroredChats = chatsWithHistory.filter(chat => chat.historyError)
          const successChats = chatsWithHistory.filter(chat => !chat.historyError && !chat.historyLoading)

          return {
            data: {
              chats: chatsWithHistory,
              totalChats: chatsWithHistory.length,
              totalMessages,
              loadingChats,
              erroredChats,
              successChats
            }
          }
        } catch (error) {
          return {
            error: {
              status: 500,
              data: { message: 'Erro crítico ao carregar chats e históricos' }
            }
          }
        }
      },

      providesTags: result => {
        const tags: any[] = ['ActiveChats']

        if (result?.chats) {
          result.chats.forEach(chat => {
            tags.push(
              { type: 'Chat' as const, id: chat.protocol },
              { type: 'Chat' as const, id: `${chat.protocol}-history` }
            )
          })
        }

        return tags
      },

      keepUnusedDataFor: 60
    }),

    refreshChatHistory: builder.mutation<ChatHistoryResponse, string>({
      query: protocol => ({
        url: `/chat/${protocol}/history`,
        method: 'GET'
      }),

      invalidatesTags: (result, error, protocol) => [
        { type: 'Chat' as const, id: `${protocol}-history` },
        'ActiveChats'
      ]
    })
  })
})

export const { useGetChatHistoryQuery, useGetAllChatsWithHistoryQuery, useRefreshChatHistoryMutation } = chatHistoryApi
