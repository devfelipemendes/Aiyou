// src/api/endpoints/statistics/statistics.ts
import { apiSlice } from '@/api/ApiCreate/apiSlice'

/* ------------------------- 🎯 TYPES ------------------------- */

export type StatisticsRequest = {
  assistant_id?: string
  project_id?: string
}

// estatísticas individuais por assistant
export type AssistantStatistics = {
  called_operators: number
  opened_protocols: number
  assistant: {
    id: string
    name: string
    project: {
      id: string
      name: string
    }
  }
}

// agregados por projeto
export type ProjectTotals = {
  project_id: string
  project_name: string
  total_called_operators: number
  total_opened_protocols: number
  assistants_count: number
}

// total geral
export type OverallTotals = {
  total_called_operators: number
  total_opened_protocols: number
  total_assistants: number
  total_projects: number
}

export type StatisticsResponse = {
  statistics: AssistantStatistics[]
  project_totals: ProjectTotals[]
  overall_total: OverallTotals
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
        const params: Record<string, string> = {}

        if (filters.assistant_id) params['filter[assistant_id]'] = filters.assistant_id
        if (filters.project_id) params['filter[project_id]'] = filters.project_id

        return {
          url: '/chat/statistics',
          method: 'GET',
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            Accept: 'application/json'
          }
        }
      },

      transformResponse: (response: any): GetStatisticsResponse => {
        console.log('🔍 DEBUG - Statistics response:', response)

        if (response && response.data) {
          return response as GetStatisticsResponse
        }

        // fallback vazio (estrutura coerente)
        return {
          message: 'OK',
          status: 200,
          data: {
            statistics: [],
            project_totals: [],
            overall_total: {
              total_called_operators: 0,
              total_opened_protocols: 0,
              total_assistants: 0,
              total_projects: 0
            }
          }
        }
      },

      transformErrorResponse: (response: any) => {
        console.error('❌ Erro ao carregar statistics:', response)

        return {
          status: response?.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar statistics',
          data: {
            statistics: [],
            project_totals: [],
            overall_total: {
              total_called_operators: 0,
              total_opened_protocols: 0,
              total_assistants: 0,
              total_projects: 0
            }
          }
        }
      },

      providesTags: ['Statistics']
    })
  })
})

/* ------------------------- 🎯 EXPORT HOOKS ------------------------- */
export const { useGetStatisticsQuery } = statisticsApi
