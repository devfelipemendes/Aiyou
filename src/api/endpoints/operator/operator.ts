// src/api/endpoints/operator/operator.ts
import { toast } from 'react-toastify'

import { apiSlice } from '@/api/ApiCreate/apiSlice'

/* ------------------------- 🎯 REQUEST TYPES ------------------------- */
export type DeleteOperatorRequest = {
  user_id: string
}

export type AddUserToProjectRequest = {
  project_ids: string[]
  user_id: string
}

/* ------------------------- 🎯 MODEL TYPES ------------------------- */
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

export type OperatorInList = {
  id: string
  name: string
  email: string
  identifier: string
  phone_number?: string | null
  whatsapp_number?: string | null
}

/* ------------------------- 🎯 RESPONSE TYPES ------------------------- */
export type GetOperatorsResponse = {
  message: string
  status: number
  data: Operator[]
}

export type DeleteOperatorResponse = {
  message: string
  status: number
  data?: any
}

export type AddUserToProjectResponse = {
  message: string
  status: number
  data?: Operator
}

export interface CreateOperatorRequest {
  project_ids: string[]
  name: string
  identifier: string
  date: string
  email: string
  password: string
  cep?: string
  city?: string
  street?: string
  number?: string
  neighborhood?: string
  complement?: string
  uf?: string
  phone_number?: string | null
  whatsapp_number?: string | null
}

export interface CreateOperatorResponse {
  message: string
  status: number
  data: {
    id: string
    name: string
    email: string
    identifier: string
    project_ids: string[]
    created_at: string
    updated_at: string
    [key: string]: any
  }
}

export interface OperatorError {
  status: number
  message: string
}

/* ------------------------- 🎯 API ENDPOINTS ------------------------- */
export const operatorApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getOperators: builder.query<GetOperatorsResponse, void>({
      query: () => ({
        url: '/project/operator',
        method: 'GET',
        headers: { Accept: 'application/json' }
      }),
      transformResponse: (response: GetOperatorsResponse) => {
        if (response.data?.length) {
          toast.success(
            `✅ ${response.data.length} ${response.data.length === 1 ? 'operador carregado' : 'operadores carregados'}`,
            { autoClose: 3000 }
          )
        }

        return response
      },
      transformErrorResponse: (response: any): OperatorError => {
        const msg = response?.data?.message || response?.message || 'Erro ao carregar operadores'

        toast.error(`❌ ${msg}`, { autoClose: 5000 })

        return { status: response.status || 500, message: msg }
      },
      providesTags: result =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Operator' as const, id })), { type: 'Operator', id: 'LIST' }]
          : [{ type: 'Operator', id: 'LIST' }]
    }),

    createOperator: builder.mutation<CreateOperatorResponse, CreateOperatorRequest>({
      query: body => ({
        url: `/project/user`,
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
      }),
      transformResponse: (response: any, meta: any) => {
        toast.success(response?.message || '✅ Operador criado!', { autoClose: 3000 })

        return {
          message: response?.message || 'Created',
          status: meta?.response?.status || 201,
          data: response?.data || response || {}
        }
      },
      transformErrorResponse: (response: any) => {
        const msg = response?.data?.message || response?.message || 'Erro ao criar operador'

        toast.error(`❌ ${msg}`, { autoClose: 5000 })

        return { status: response.status || 500, message: msg }
      },
      invalidatesTags: [{ type: 'Operator', id: 'LIST' }]
    }),

    deleteOperator: builder.mutation<DeleteOperatorResponse, DeleteOperatorRequest>({
      query: ({ user_id }) => ({
        url: `/project/operator`,
        method: 'DELETE',
        body: { user_id },
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
      }),
      transformResponse: (response: any, meta: any) => {
        const status = meta?.response?.status || 200
        const message = response?.message || (status === 204 ? 'Operador deletado com sucesso!' : 'Operador deletado!')

        toast.success(`✅ ${message}`, { autoClose: 3000 })

        return { message, status, data: response?.data ?? null }
      },
      transformErrorResponse: (response: any): OperatorError => {
        const msg = response?.data?.message || response?.message || 'Erro inesperado ao deletar operador'

        toast.error(`❌ ${msg}`, { autoClose: 5000 })

        return { status: response.status || 500, message: msg }
      },
      invalidatesTags: (result, error, { user_id }) => [
        { type: 'Operator', id: user_id },
        { type: 'Operator', id: 'LIST' }
      ]
    }),

    addUserToProject: builder.mutation<AddUserToProjectResponse, AddUserToProjectRequest>({
      query: ({ project_ids, user_id }) => ({
        url: `/project/operator`,
        method: 'POST',
        body: { project_ids, user_id },
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
      }),
      transformResponse: (response: any, meta: any) => {
        toast.success(response?.message || '✅ Usuário adicionado ao projeto!', { autoClose: 3000 })

        return {
          message: response?.message || 'User added',
          status: meta?.response?.status || 201,
          data: response?.data || {}
        }
      },
      transformErrorResponse: (response: any) => {
        const msg = response?.data?.message || response?.message || 'Erro ao adicionar usuário'

        toast.error(`❌ ${msg}`, { autoClose: 5000 })

        return { status: response.status || 500, message: msg }
      },
      invalidatesTags: [{ type: 'Operator', id: 'LIST' }]
    }),

    // 🔥 Novo endpoint DELETE user from project
    deleteUserFromProject: builder.mutation<AddUserToProjectResponse, AddUserToProjectRequest>({
      query: ({ project_ids, user_id }) => ({
        url: `/project/operator`,
        method: 'DELETE',
        body: { project_ids, user_id },
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
      }),
      transformResponse: (response: any, meta: any) => {
        toast.success(response?.message || '✅ Usuário removido do projeto!', { autoClose: 3000 })

        return {
          message: response?.message || 'User removed',
          status: meta?.response?.status || 200,
          data: response?.data || {}
        }
      },
      transformErrorResponse: (response: any) => {
        const msg = response?.data?.message || response?.message || 'Erro ao remover usuário'

        toast.error(`❌ ${msg}`, { autoClose: 5000 })

        return { status: response.status || 500, message: msg }
      },
      invalidatesTags: [{ type: 'Operator', id: 'LIST' }]
    })
  })
})

/* ------------------------- 🎯 EXPORT HOOKS ------------------------- */
export const {
  useGetOperatorsQuery,
  useCreateOperatorMutation,
  useDeleteOperatorMutation,
  useAddUserToProjectMutation,
  useDeleteUserFromProjectMutation
} = operatorApi

/* ------------------------- 🎯 SELECTORS ------------------------- */
export const selectOperatorsData = (state: any): OperatorInList[] =>
  operatorApi.endpoints.getOperators.select()(state)?.data?.data || []

export const selectOperatorsCount = (state: any): number => selectOperatorsData(state).length
