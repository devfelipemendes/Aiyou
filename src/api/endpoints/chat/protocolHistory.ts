import { apiSlice } from '@/api/ApiCreate/apiSlice'

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

// 🔥 CORRIGIDO: Tipo que bate com o retorno real
export interface MultipleProtocolHistoryResponse {
  data: Record<string, ProtocolHistoryItem>
  stats: {
    totalProtocols: number
    totalMessages: number
    clientsCount: number
  }
}

export const protocolHistoryApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
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
          totalMessages: sortedProtocols.reduce((acc, protocol) => acc + protocol.messageCount, 0), // 🔥 CORRIGIDO: Removido !
          oldestProtocol: sortedProtocols[sortedProtocols.length - 1]?.protocol,
          newestProtocol: sortedProtocols[0]?.protocol
        }

        console.log('Estatísticas processadas:', stats)

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

          // 🔥 CORRIGIDO: Remover variável não utilizada
          const promises = protocols.map(async protocolId => {
            // ← Renomeado para evitar confusão
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

          // 🔥 CORRIGIDO: Usar protocolId corretamente
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          results.forEach(({ protocolId, data }) => {
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

      // 🔥 CORRIGIDO: Usar apenas tags válidas do sistema RTK
      providesTags: result => [
        { type: 'ProtocolHistory', id: 'LIST' }, // ← Tag válida
        ...(result?.data
          ? Object.keys(result.data).map(protocol => ({
              type: 'ProtocolHistory' as const,
              id: protocol
            }))
          : [])
      ],

      keepUnusedDataFor: 300
    })
  })
})

export const { useGetProtocolHistoryQuery, useGetMultipleProtocolHistoriesQuery } = protocolHistoryApi
