// src/api/endpoints/dashboard/dashboard.ts
// 🎯 TIPOS BASEADOS NA RESPOSTA REAL DO BACKEND

import { apiSlice } from '@/api/ApiCreate/apiSlice'

/* ------------------------- 🎯 REQUEST TYPES ------------------------- */
export type DashboardRequest = {
  year: string
  month: string
}

/* ------------------------- 🎯 RESPONSE TYPES ------------------------- */
export type DashboardResponse = {
  total_clients: number
  total_protocols: number
  total_operators_called: number
}

/* ------------------------- 🎯 RESPONSE PADRÃO ------------------------- */
export type GetDashboardResponse = {
  message?: string
  status?: number
  data: DashboardResponse
}

/* ------------------------- 🎯 API ENDPOINT ------------------------- */
export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getDashboard: builder.query<GetDashboardResponse, DashboardRequest>({
      query: body => ({
        url: '/dashboard',
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: any): GetDashboardResponse => {
        console.log('🔍 DEBUG - Dashboard response:', response)

        // Caso backend já devolva diretamente os números
        if (
          response &&
          typeof response.total_clients === 'number' &&
          typeof response.total_protocols === 'number' &&
          typeof response.total_operators_called === 'number'
        ) {
          return {
            message: 'OK',
            status: 200,
            data: response as DashboardResponse
          }
        }

        // Caso venha no padrão com `data`
        if (response && response.data) {
          return response as GetDashboardResponse
        }

        // Fallback
        return {
          message: 'OK',
          status: 200,
          data: {
            total_clients: 0,
            total_protocols: 0,
            total_operators_called: 0
          }
        }
      },

      transformErrorResponse: (response: any) => {
        console.error('❌ Erro ao carregar dashboard:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar dashboard',
          data: {
            total_clients: 0,
            total_protocols: 0,
            total_operators_called: 0
          }
        }
      },

      providesTags: ['Dashboard']
    })
  })
})

/* ------------------------- 🎯 EXPORT HOOKS ------------------------- */
export const { useGetDashboardQuery } = dashboardApi
