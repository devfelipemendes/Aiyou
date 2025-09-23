// src/api/endpoints/statistics/statistics.ts
import { apiSlice } from '@/api/ApiCreate/apiSlice'

/* ------------------------- 🎯 TYPES ------------------------- */
export type StatisticsRequest = {
  assistant_id?: string
  project_id?: string
}

export type StatisticsResponse = {
  total_chats: number
  total_messages: number
  total_users: number

  // adicione outros campos que o backend retornar
}

export type GetStatisticsResponse = {
  message?: string
  status?: number
  data: StatisticsResponse
}

/* ------------------------- 🎯 API ENDPOINT ------------------------- */
export const statisticsApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getStatistics: builder.query<GetStatisticsResponse, StatisticsRequest>({
      query: filters => {
        // transforma os filtros no formato query param correto
        const params: Record<string, string> = {}

        if (filters.assistant_id) params['filter[assistant_id]'] = filters.assistant_id
        if (filters.project_id) params['filter[project_id]'] = filters.project_id

        return {
          url: '/chat/statistics',
          method: 'GET',
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`, // se precisar auth
            Accept: 'application/json'
          }
        }
      },

      transformResponse: (response: any): GetStatisticsResponse => {
        console.log('🔍 DEBUG - Statistics response:', response)

        if (response && response.data) {
          return response as GetStatisticsResponse
        }

        // fallback
        return {
          message: 'OK',
          status: 200,
          data: {
            total_chats: 0,
            total_messages: 0,
            total_users: 0
          }
        }
      },

      transformErrorResponse: (response: any) => {
        console.error('❌ Erro ao carregar statistics:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar statistics',
          data: {
            total_chats: 0,
            total_messages: 0,
            total_users: 0
          }
        }
      },

      providesTags: ['Statistics']
    })
  })
})

/* ------------------------- 🎯 EXPORT HOOKS ------------------------- */
export const { useGetStatisticsQuery } = statisticsApi
