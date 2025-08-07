// src/api/endpoints/chat/protocolHistory.ts - ADICIONANDO getAllHistoryByProtocol

import { apiSlice } from '@/api/ApiCreate/apiSlice'

// Tipos existentes (mantidos)
export interface ProtocolHistoryMessage {
  id: string
  content: string
  role: 'user' | 'assistant' | 'operator'
  operator: number | null
  created_at: string
}

export interface ProtocolHistoryItem {
  identifier: string
  source: string
  assistant_name: string
  operator_name: string
  history: ProtocolHistoryMessage[]
}

export interface ProtocolHistoryApiResponse {
  message: string
  status: number
  data: Record<string, ProtocolHistoryItem>
}

export interface ProcessedProtocolHistoryItem extends ProtocolHistoryItem {
  protocol: string
  messageCount: number
  lastActivity: string
  createdAt?: string
}

export interface ProcessedProtocolHistoryResponse {
  data: ProcessedProtocolHistoryItem[]
  stats: {
    totalProtocols: number
    totalMessages: number
    oldestProtocol?: string
    newestProtocol?: string
  }
}

export interface MultipleProtocolHistoryResponse {
  data: Record<string, ProtocolHistoryItem>
  stats: {
    totalProtocols: number
    totalMessages: number
    clientsCount: number
  }
}

// 🆕 NOVO TIPO: Para compatibilidade com ChatWithHistory
export interface AllProtocolHistoryResponse {
  totalChats: any
  totalMessages: any
  protocols: ProcessedProtocolHistoryItem[]
  protocolsMap: Record<string, ProcessedProtocolHistoryItem>
  stats: {
    totalProtocols: number
    totalMessages: number
    activeProtocols: number
    oldestProtocol?: string
    newestProtocol?: string
  }
}

export const protocolHistoryApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // Endpoints existentes (mantidos)
    getProtocolHistory: builder.query<ProcessedProtocolHistoryResponse, string>({
      query: protocol => ({
        url: `/chat/${protocol}/history/protocol`,
        method: 'GET'
      }),

      transformResponse: (response: ProtocolHistoryApiResponse): ProcessedProtocolHistoryResponse => {
        const processedData = Object.entries(response.data).map(([protocol, item]) => {
          const sortedHistory = item.history.sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )

          return {
            ...item,
            protocol,
            history: sortedHistory,
            createdAt: sortedHistory[0]?.created_at || '',
            messageCount: sortedHistory.length,
            lastActivity: sortedHistory[sortedHistory.length - 1]?.created_at || ''
          }
        })

        const sortedProtocols = processedData.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )

        const stats = {
          totalProtocols: sortedProtocols.length,
          totalMessages: sortedProtocols.reduce((acc, protocol) => acc + protocol.messageCount, 0),
          oldestProtocol: sortedProtocols[sortedProtocols.length - 1]?.protocol,
          newestProtocol: sortedProtocols[0]?.protocol
        }

        return {
          data: sortedProtocols,
          stats
        }
      },

      transformErrorResponse: (error: any) => {
        console.error('Erro ao buscar histórico de protocolo:', error)

        return {
          status: error.status || 500,
          message: error.data?.message || 'Erro desconhecido ao buscar histórico de protocolo'
        }
      },

      providesTags: (result, error, protocol) => {
        const tags: any[] = [
          { type: 'ProtocolHistory', id: 'LIST' },
          { type: 'ProtocolHistory', id: protocol }
        ]

        if (result) {
          result.data.forEach(item => {
            tags.push({ type: 'ProtocolHistoryItem', id: item.protocol })
          })
        }

        return tags
      },

      keepUnusedDataFor: 3600
    }),

    getMultipleProtocolHistories: builder.query<MultipleProtocolHistoryResponse, string[]>({
      queryFn: async (protocols, api, extraOptions, baseQuery) => {
        try {
          console.log(`🚀 Buscando históricos de ${protocols.length} protocolos...`)

          const promises = protocols.map(async protocolId => {
            const result = await baseQuery({
              url: `/chat/${protocolId}/history/protocol`,
              method: 'GET'
            })

            if (result.error) {
              console.warn(`⚠️ Erro no protocolo ${protocolId}:`, result.error)

              return { protocolId, data: null }
            }

            return {
              protocolId,
              data: (result.data as ProtocolHistoryApiResponse).data
            }
          })

          const results = await Promise.all(promises)
          const consolidatedData: Record<string, ProtocolHistoryItem> = {}

          results.forEach(({ data }) => {
            if (data) {
              Object.assign(consolidatedData, data)
            }
          })

          const uniqueClients = new Set(Object.values(consolidatedData).map(item => item.identifier)).size

          const stats = {
            totalProtocols: Object.keys(consolidatedData).length,
            totalMessages: Object.values(consolidatedData).reduce((sum, item) => sum + item.history.length, 0),
            clientsCount: uniqueClients
          }

          console.log(`✅ ${stats.totalProtocols} históricos consolidados`)

          return {
            data: {
              data: consolidatedData,
              stats
            }
          }
        } catch (error) {
          console.error('💥 Erro ao buscar múltiplos históricos:', error)

          return {
            error: {
              status: 500,
              data: { message: 'Erro ao buscar históricos' }
            }
          }
        }
      },

      providesTags: result => [
        { type: 'ProtocolHistory', id: 'LIST' },
        ...(result?.data
          ? Object.keys(result.data).map(protocol => ({
              type: 'ProtocolHistory' as const,
              id: protocol
            }))
          : [])
      ],

      keepUnusedDataFor: 300
    }),

    // 🆕 NOVO ENDPOINT: Buscar TODOS os históricos de protocolos ativos
    getAllHistoryByProtocol: builder.query<AllProtocolHistoryResponse, void>({
      //@ts-ignore
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        try {
          console.log('🚀 Buscando TODOS os históricos de protocolos ativos...')

          // 📋 PASSO 1: Buscar chats ativos para extrair protocolos
          console.log('📋 Passo 1: Buscando chats ativos...')

          const chatsResult = await baseQuery({
            url: '/chat',
            method: 'GET'
          })

          if (chatsResult.error) {
            return { error: { status: chatsResult.error.status, data: chatsResult.error.data } }
          }

          const chatsData = (chatsResult.data as any)?.data || []
          const activeChats = chatsData.filter((chat: any) => chat.status === 'active')
          const activeProtocols = activeChats.map((chat: any) => chat.protocol)

          console.log(`✅ ${activeProtocols.length} protocolos ativos encontrados:`, activeProtocols)

          if (activeProtocols.length === 0) {
            return {
              data: {
                protocols: [],
                protocolsMap: {},
                stats: {
                  totalProtocols: 0,
                  totalMessages: 0,
                  activeProtocols: 0
                }
              }
            }
          }

          // 📨 PASSO 2: Buscar histórico de cada protocolo em PARALELO
          console.log('📨 Passo 2: Buscando históricos em paralelo...')

          const historyPromises = activeProtocols.map(async (protocol: string) => {
            try {
              console.log(`  → Buscando histórico do protocolo: ${protocol}`)

              const historyResult = await baseQuery({
                url: `/chat/${protocol}/history/protocol`,
                method: 'GET'
              })

              if (historyResult.error) {
                console.warn(`  ⚠️ Erro no protocolo ${protocol}:`, historyResult.error)

                return { protocol, data: null, error: historyResult.error }
              }

              const protocolHistoryData = historyResult.data as ProtocolHistoryApiResponse

              // Pegar dados do protocolo específico
              const protocolData = protocolHistoryData.data[protocol] || Object.values(protocolHistoryData.data)[0]

              if (!protocolData) {
                console.warn(`  ⚠️ Dados não encontrados para protocolo: ${protocol}`)

                return { protocol, data: null, error: 'Dados não encontrados' }
              }

              // Processar dados
              const sortedHistory = protocolData.history.sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )

              const processedData: ProcessedProtocolHistoryItem = {
                ...protocolData,
                protocol,
                history: sortedHistory,
                messageCount: sortedHistory.length,
                lastActivity: sortedHistory[sortedHistory.length - 1]?.created_at || '',
                createdAt: sortedHistory[0]?.created_at || ''
              }

              console.log(`  ✅ Protocolo ${protocol}: ${processedData.messageCount} mensagens`)

              return { protocol, data: processedData, error: null }
            } catch (error) {
              console.error(`  💥 Erro ao processar protocolo ${protocol}:`, error)

              return {
                protocol,
                data: null,
                error: error instanceof Error ? error.message : 'Erro desconhecido'
              }
            }
          })

          // 🔄 AGUARDAR TODAS AS PROMISES
          const results = await Promise.allSettled(historyPromises)

          const protocolsResult: ProcessedProtocolHistoryItem[] = []
          const protocolsMap: Record<string, ProcessedProtocolHistoryItem> = {}
          let totalMessages = 0

          results.forEach(result => {
            if (result.status === 'fulfilled') {
              const { protocol, data, error } = result.value

              if (data) {
                protocolsResult.push(data)
                protocolsMap[protocol] = data
                totalMessages += data.messageCount
              } else {
                console.warn(`⚠️ Protocolo ${protocol} sem dados:`, error)
              }
            } else {
              console.error(`💥 Promise rejeitada para protocolo:`, result.reason)
            }
          })

          // Ordenar por data de criação (mais recente primeiro)
          const sortedProtocols = protocolsResult.sort(
            (a: ProcessedProtocolHistoryItem, b: ProcessedProtocolHistoryItem) =>
              new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          )

          const stats = {
            totalProtocols: protocolsResult.length,
            totalMessages,
            activeProtocols: protocolsResult.length,
            oldestProtocol: sortedProtocols[sortedProtocols.length - 1]?.protocol,
            newestProtocol: sortedProtocols[0]?.protocol
          }

          console.log('✅ Busca de históricos concluída:', stats)

          return {
            data: {
              protocols: sortedProtocols,
              protocolsMap,
              stats
            }
          }
        } catch (error) {
          console.error('💥 Erro geral na busca de históricos:', error)

          return {
            error: {
              status: 500,
              data: {
                message: error instanceof Error ? error.message : 'Erro desconhecido na busca de históricos'
              }
            }
          }
        }
      },

      providesTags: result => [
        { type: 'ProtocolHistory', id: 'ALL_ACTIVE' },
        { type: 'ProtocolHistory', id: 'LIST' },
        ...(result?.protocols || []).map(protocolItem => ({
          type: 'ProtocolHistory' as const,
          id: protocolItem.protocol
        }))
      ],

      keepUnusedDataFor: 300 // 5 minutos - dados podem mudar frequentemente
    })
  })
})

export const {
  useGetProtocolHistoryQuery,
  useGetMultipleProtocolHistoriesQuery,
  useGetAllHistoryByProtocolQuery, // 🆕 NOVO HOOK

  useLazyGetProtocolHistoryQuery,
  useLazyGetMultipleProtocolHistoriesQuery,
  useLazyGetAllHistoryByProtocolQuery
} = protocolHistoryApi
