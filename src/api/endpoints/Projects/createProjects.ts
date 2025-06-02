// src/api/endpoints/client/index.ts
import { apiSlice } from '../../ApiCreate/apiSlice'

export type CreateClientRequest = {
  name: string
  cnpj: string
  email: string
  description?: string
}

export type CreateClientResponse = {
  data: {
    id: string
    name: string
    cnpj: string
    email: string
    description?: string
    created_at: string
    updated_at: string
  }
  message: string
  success: boolean
}

export const clientApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createClient: builder.mutation<CreateClientResponse, CreateClientRequest>({
      query: clientData => ({
        url: '/v1/client',
        method: 'POST',
        body: clientData
      }),

      transformResponse: (response: CreateClientResponse) => {
        console.log('✅ Cliente criado com sucesso:', response)

        return response
      },
      transformErrorResponse: (response: any) => {
        console.error('❌ Erro ao criar cliente:', response)

        return {
          status: response.status,
          message: response.data?.message || 'Erro ao criar cliente'
        }
      }
    }),

    getClients: builder.query<{ data: CreateClientResponse['data'][] }, void>({
      query: () => ({
        url: '/v1/client',
        method: 'GET'
      })
    })
  })
})

export const { useCreateClientMutation, useGetClientsQuery } = clientApi
