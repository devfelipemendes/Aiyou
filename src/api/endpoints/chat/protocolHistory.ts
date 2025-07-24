import { apiSlice } from '@/api/ApiCreate/apiSlice'

export interface ProtocolHistoryMessage {
  id: string
  content: string
  role: 'user' | 'assistant' | 'operator'
  operator: number | null
  created_at: string
}

export interface ProtocolHistoryItem {
  protocol: string
  history: ProtocolHistoryMessage[]
  createdAt?: string
  messageCount: number
  lastActivity: string
}

export interface ProtocolHistoryResponse {
  message: string
  status: number
  data: ProtocolHistoryItem[]
}

export interface ProcessedProtocolHistoryResponse {
  data: ProtocolHistoryItem[]
  stats: {
    totalProtocols: number
    totalMessages: number

    oldestProtocol?: string
    newestProtocol?: string
  }
}

export const protocolHistoryApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getProtocolHistory: builder.query<ProcessedProtocolHistoryResponse, string>({
      query: protocol => ({
        url: `/chat/${protocol}/history/protocol`,
        method: 'GET'
      }),

      transformResponse: (response: ProtocolHistoryResponse): ProcessedProtocolHistoryResponse => {
        const processedData = response.data.map(item => {
          const sortedHistory = item.history.sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )

          return {
            ...item,
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
          totalMessages: sortedProtocols.reduce((acc, protocol) => acc + protocol.messageCount!, 0),
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

      keepUnusedDataFor: 3600 // 1 hour
    })
  })
})

export const { useGetProtocolHistoryQuery } = protocolHistoryApi
