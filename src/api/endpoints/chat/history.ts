import { apiSlice } from '@/api/ApiCreate/apiSlice'

// 🎯 TIPOS PARA O HISTÓRICO DE MENSAGENS
export interface ChatHistoryMessage {
  id: string
  content: string
  role: 'assistant' | 'user' | 'operator'
  operator: string | null
  created_at: string
}

export interface ChatHistoryResponse {
  message: string
  data: ChatHistoryMessage[]
}

// 🎯 TIPOS PARA O RESULTADO COMBINADO
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
  operator: 0 | 1
  question_operator: 0 | 1
  updated_at: string
  created_at: string
}

// 🎯 RESULTADO FINAL CONSOLIDADO
export interface ChatWithHistoryListResponse {
  chats: ChatWithHistory[]
  totalChats: number
  totalMessages: number
  loadingChats: ChatWithHistory[]
  erroredChats: ChatWithHistory[]
  successChats: ChatWithHistory[]
}

// 🎯 EXTEND DO CHAT API
export const chatHistoryApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // 🔥 ENDPOINT INDIVIDUAL: Buscar histórico de um chat específico
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

      keepUnusedDataFor: 300 // 5 minutos - histórico não muda muito
    }),

    // 🚀 ENDPOINT PRINCIPAL: Buscar TODOS os históricos (método otimizado)
    getAllChatsWithHistory: builder.query<ChatWithHistoryListResponse, void>({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        try {
          console.log('🚀 Iniciando busca completa: chats + históricos...')

          // 📋 PASSO 1: Buscar lista de chats ativos
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

          // 📨 PASSO 2: Buscar históricos em PARALELO (muito mais rápido!)
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

              // Ordenar mensagens por data
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

          // ⏳ AGUARDAR TODOS OS HISTÓRICOS
          console.log('⏳ Aguardando todos os históricos...')
          const chatsWithHistory = await Promise.all(historyPromises)

          // 📊 CALCULAR ESTATÍSTICAS
          const totalMessages = chatsWithHistory.reduce((sum, chat) => sum + chat.messageCount, 0)
          const loadingChats = chatsWithHistory.filter(chat => chat.historyLoading)
          const erroredChats = chatsWithHistory.filter(chat => chat.historyError)
          const successChats = chatsWithHistory.filter(chat => !chat.historyError && !chat.historyLoading)

          console.log('📊 Estatísticas finais:', {
            totalChats: chatsWithHistory.length,
            totalMessages,
            successCount: successChats.length,
            errorCount: erroredChats.length
          })

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
          console.error('💥 Erro crítico na operação completa:', error)

          return {
            error: {
              status: 500,
              data: { message: 'Erro crítico ao carregar chats e históricos' }
            }
          }
        }
      },

      // 🎯 TAGS PARA INVALIDAÇÃO
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

      // ⚡ CONFIGURAÇÕES DE CACHE
      keepUnusedDataFor: 60 // 1 minuto - dados mais dinâmicos
    }),

    // 🔄 MUTATION: Atualizar histórico de um chat específico
    refreshChatHistory: builder.mutation<ChatHistoryResponse, string>({
      query: protocol => ({
        url: `/chat/${protocol}/history`,
        method: 'GET'
      }),

      // 🎯 INVALIDAR CACHE ESPECÍFICO
      invalidatesTags: (result, error, protocol) => [
        { type: 'Chat' as const, id: `${protocol}-history` },
        'ActiveChats' // Para re-fetch geral se necessário
      ]
    })
  })
})

// 🎯 HOOKS EXPORTADOS
export const { useGetChatHistoryQuery, useGetAllChatsWithHistoryQuery, useRefreshChatHistoryMutation } = chatHistoryApi
