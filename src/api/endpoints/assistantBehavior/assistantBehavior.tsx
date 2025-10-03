// src/api/endpoints/configurationsAssistants.ts
import { toast } from 'react-toastify'

import { apiSlice } from '@/api/ApiCreate/apiSlice'

/* ------------------------- 🎯 TYPES ------------------------- */

// Config individual
export type ConfigurationAssistant = {
  id: string
  assistant_id: string
  type: 'checkbox' | 'options' | string
  name: string
  value: string
  created_at: string
  updated_at: string
}

// GET /v1/config/{id} response
export type GetConfigurationResponse = {
  message: string
  status: number
  data: ConfigurationAssistant[]
}

// PUT /v1/config/{id} request/response
export type UpdateConfigurationRequest = {
  data: {
    assistant_id: string
    type: 'checkbox' | 'options' | string
    name: string
    value: string | number
  }[]
}

export type UpdateConfigurationResponse = {
  message: string
  status: number
  id: string
}

// Error
type ConfigurationError = {
  status: number
  message: string
}

/* ------------------------- 🎯 API ENDPOINTS ------------------------- */
export const configurationsAssistantsApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // GET LIST
    getConfigurations: builder.query<GetConfigurationResponse, string>({
      query: (id: string) => ({
        url: `/assistantConfigs/${id}`,
        method: 'GET',
        headers: { Accept: 'application/json' }
      }),
      transformResponse: (response: GetConfigurationResponse) => {
        console.log('🔍 DEBUG - GET configurations:', response)

        return response
      },
      transformErrorResponse: (response: any): ConfigurationError => ({
        status: response.status || 500,
        message: response?.data?.message || response?.message || 'Erro ao carregar configurações'
      }),
      providesTags: (result, error, id) => [{ type: 'Configuration', id }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled

          toast.success(data.message || 'Configurações carregadas com sucesso')
        } catch (err: any) {
          toast.error(err?.error?.message || 'Erro ao carregar configurações')
        }
      }
    }),

    // PUT / update
    updateConfiguration: builder.mutation<
      UpdateConfigurationResponse,
      { id: string; body: UpdateConfigurationRequest }
    >({
      query: ({ id, body }) => ({
        url: `/assistantConfigs/${id}`,
        method: 'PUT',
        body,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
      }),
      transformResponse: (response: UpdateConfigurationResponse) => {
        console.log('🔍 DEBUG - UPDATE configuration:', response)

        return response
      },
      transformErrorResponse: (response: any): ConfigurationError => ({
        status: response.status || 500,
        message: response?.data?.message || response?.message || 'Erro ao atualizar configuração'
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Configuration', id }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled

          toast.success(data.message || 'Configuração atualizada com sucesso')
        } catch (err: any) {
          toast.error(err?.error?.message || 'Erro ao atualizar configuração')
        }
      }
    })
  })
})

/* ------------------------- 🎯 EXPORT HOOKS ------------------------- */
export const { useGetConfigurationsQuery, useUpdateConfigurationMutation } = configurationsAssistantsApi
