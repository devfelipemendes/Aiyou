// src/api/endpoints/protocolApi.ts
import { apiSlice } from '@/api/ApiCreate/apiSlice'

/* ------------------------- 🎯 TYPES ------------------------- */

// Protocolo individual
export type Protocol = {
  protocol: string
  assistant: {
    id: string
    name: string
    img_url: string | null
    description: string | null
    phones: {
      id: string
      phone: string
    }[]
  }
  project_id: string
  source: string
  identifier: string
  operator: boolean
  error: string | null
  question_operator: boolean
  status: string
  created_at: string
  updated_at: string
}

// GET /v1/chat/protocols response
export type GetProtocolsResponse = {
  data: Protocol[]
  message?: string
  status?: number
}

// Filtros aceitos no endpoint
export type ProtocolFilters = {
  status?: string
  project_id?: string
  assistant_id?: string
  operator?: string
  protocol?: string
  identifier?: string
  sort?: string // ex: "-created_at"
}

// Error
type ProtocolError = {
  status: number
  message: string
}

/* ------------------------- 🎯 API ENDPOINTS ------------------------- */
export const protocolApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // GET LIST protocols
    getProtocols: builder.query<GetProtocolsResponse, ProtocolFilters>({
      query: (filters: ProtocolFilters) => {
        const params = new URLSearchParams()

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (key === 'sort') {
              params.append('sort', value)
            } else {
              params.append(`filter[${key}]`, value)
            }
          }
        })

        return {
          url: `/chat/protocols?${params.toString()}`,
          method: 'GET',
          headers: { Accept: 'application/json' }
        }
      },
      transformResponse: (response: GetProtocolsResponse) => {
        console.log('🔍 DEBUG - GET protocols:', response)

        return response
      },
      transformErrorResponse: (response: any): ProtocolError => ({
        status: response.status || 500,
        message: response?.data?.message || response?.message || 'Erro ao carregar protocolos'
      }),
      providesTags: result =>
        result
          ? [
              ...result.data.map(protocol => ({ type: 'Protocol' as const, id: protocol.protocol })),
              { type: 'Protocol', id: 'LIST' }
            ]
          : [{ type: 'Protocol', id: 'LIST' }]
    })
  })
})

/* ------------------------- 🎯 EXPORT HOOKS ------------------------- */
export const { useGetProtocolsQuery } = protocolApi
