// src/api/endpoints/operator/operator.ts
// 🎯 TIPOS BASEADOS NA RESPOSTA REAL DO BACKEND

import { apiSlice } from '@/api/ApiCreate/apiSlice'

/* ------------------------- 🎯 REQUEST TYPES ------------------------- */

// Criar operador
export type CreateOperatorRequest = {
  name: string
  email: string
  identifier: string
  project_id: string
  password: string
  password_confirmation: string // Adicionado manualmente
  date: string
  cep?: string
  city?: string
  number?: string
  street?: string
  uf?: string
  phone_number?: string | null
  whatsapp_number?: string | null
}

// Deletar operador
export type DeleteOperatorRequest = {
  project_operator_id: string
}

/* ------------------------- 🎯 MODEL TYPES ------------------------- */

// Operador individual
export type Operator = {
  id: string
  project_id: string
  name: string
  email: string
  identifier: string
  date: string
  cep?: string
  city?: string
  number?: string
  street?: string
  uf?: string
  phone_number?: string | null
  whatsapp_number?: string | null
  created_at: string
  updated_at: string
}

// Operador simplificado para listagem
export type OperatorInList = {
  id: string
  name: string
  email: string
  identifier: string
  phone_number?: string | null
  whatsapp_number?: string | null
}

/* ------------------------- 🎯 RESPONSE TYPES ------------------------- */

// Listagem de operadores
export type GetOperatorsResponse = {
  message: string
  status: number
  data: Operator[]
}

// Operador processado para UI
export type ProcessedGetOperatorsResponse = {
  message: string
  status: number
  data: OperatorInList[]
}

// Criar operador
export type CreateOperatorResponse = {
  message: string
  status: number
  data: Operator
}

// Deletar operador
export type DeleteOperatorResponse = {
  message: string
  status: number
  data?: any
}

// trade project
export type AddUserToProjectRequest = {
  project_id: string
  user_id: string
}

export type AddUserToProjectResponse = {
  message: string
  status: number
  data?: Operator // opcional, dependendo do backend
}
export type GetOperatorByIdResponse = {
  message: string
  status: number
  data: {
    user: {
      id: string
      name: string
      identifier: string
      date: string
      phone_number: string | null
      whatsapp_number: string | null
      is_juridic: boolean
      cep?: string
      uf?: string
      city?: string
      street?: string
      number?: string
      neighborhood?: string
      complement?: string
      email: string
      email_verified_at: string | null
      created_at: string
      updated_at: string
      customer_id?: string | null
      subscription_id?: string | null
      address?: string | null
    }
    project: {
      id: string
      user_id: string
      name: string
      img_url?: string
      description?: string
      created_at: string
      updated_at: string
      deleted_at?: string | null
    }
  }
}

/* ------------------------- 🎯 ERROR TYPE ------------------------- */
type OperatorError = {
  status: number
  message: string
}

/* ------------------------- 🎯 API ENDPOINTS ------------------------- */
export const operatorApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // 🎯 GET OPERATORS
    getOperators: builder.query<GetOperatorsResponse, void>({
      query: () => ({
        url: '/project/operator',
        method: 'GET',
        headers: { Accept: 'application/json' }
      }),
      transformResponse: (response: GetOperatorsResponse) => {
        // Aqui você mantém exatamente a estrutura que vem do backend
        console.log('🔍 DEBUG - GET operators completo:', response)

        return response
      },
      transformErrorResponse: (response: any): OperatorError => {
        console.error('❌ Erro ao carregar operadores:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar operadores'
        }
      },
      providesTags: result =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Operator' as const, id })), { type: 'Operator', id: 'LIST' }]
          : [{ type: 'Operator', id: 'LIST' }]
    }),
    getOperatorById: builder.query<GetOperatorByIdResponse, string>({
      query: (project_operator_id: string) => ({
        url: `/project/operator/${project_operator_id}/show`,
        method: 'GET',
        headers: { Accept: 'application/json' }
      }),
      transformResponse: (response: GetOperatorByIdResponse) => {
        console.log('🔍 DEBUG - GET operator único:', response)

        return response
      },
      transformErrorResponse: (response: any): OperatorError => {
        console.error('❌ Erro ao carregar operador único:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar operador'
        }
      },
      providesTags: (result, error, id) => [{ type: 'Operator', id }]
    }),

    // 🎯 CREATE OPERATOR
    createOperator: builder.mutation<CreateOperatorResponse, CreateOperatorRequest>({
      query: ({ project_id, ...body }) => ({
        url: `/project/${project_id}/user`,
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }),
      transformResponse: (response: any, meta: any) => {
        console.log('🔍 DEBUG - Resposta RAW do CREATE operator:', response)

        return {
          message: response?.message || 'Created',
          status: meta?.response?.status || 201,
          data: response?.data || response || {}
        } as CreateOperatorResponse
      },
      transformErrorResponse: (response: any): OperatorError => {
        console.error('❌ Erro ao criar operador:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao criar operador'
        }
      },
      invalidatesTags: [{ type: 'Operator', id: 'LIST' }]
    }),

    deleteOperator: builder.mutation<DeleteOperatorResponse, DeleteOperatorRequest>({
      query: ({ project_operator_id }) => ({
        url: `/project/operator/${project_operator_id}`,
        method: 'DELETE',
        headers: { Accept: 'application/json' }
      }),
      transformResponse: (response: any, meta: any) => {
        console.log('🔍 DEBUG - Resposta RAW do DELETE operator:', response)

        if (meta?.response?.status === 204) {
          return { message: 'Deleted successfully', status: 204 } as DeleteOperatorResponse
        }

        if (response?.message) {
          return response as DeleteOperatorResponse
        }

        return { message: 'Deleted successfully', status: meta?.response?.status || 200 } as DeleteOperatorResponse
      },
      transformErrorResponse: (response: any): OperatorError => {
        console.error('❌ Erro ao deletar operador:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao deletar operador'
        }
      },
      invalidatesTags: (result, error, { project_operator_id }) => [
        { type: 'Operator', id: project_operator_id },
        { type: 'Operator', id: 'LIST' }
      ]
    }),
    addUserToProject: builder.mutation<AddUserToProjectResponse, AddUserToProjectRequest>({
      query: ({ project_id, user_id }) => ({
        url: `/project/${project_id}/operator`,
        method: 'POST',
        body: { user_id },
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
      }),
      transformResponse: (response: any, meta: any) => {
        console.log('🔍 DEBUG - addUserToProject response:', response)

        return {
          message: response?.message || 'User added',
          status: meta?.response?.status || 201,
          data: response?.data || {}
        } as AddUserToProjectResponse
      },
      transformErrorResponse: (response: any) => ({
        status: response.status || 500,
        message: response?.data?.message || response?.message || 'Erro ao adicionar usuário'
      }),
      invalidatesTags: [{ type: 'Operator', id: 'LIST' }]
    })
  })
})

/* ------------------------- 🎯 EXPORT HOOKS ------------------------- */
export const {
  useGetOperatorsQuery,
  useGetOperatorByIdQuery, // 👈 export novo hook
  useCreateOperatorMutation,
  useDeleteOperatorMutation
} = operatorApi

/* ------------------------- 🎯 SELECTORS ------------------------- */
export const selectOperatorsData = (state: any): OperatorInList[] =>
  operatorApi.endpoints.getOperators.select()(state)?.data?.data || []

export const selectOperatorsCount = (state: any): number => selectOperatorsData(state).length
