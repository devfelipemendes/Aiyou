// src/api/endpoints/method/method.ts
import { toast } from 'react-toastify'

import { apiSlice } from '@/api/ApiCreate/apiSlice'

// 🎯 TIPOS PARA MÉTODO HTTP (baseado na resposta real da API)
export type HttpMethod = {
  id: string
  name: string
  created_at: string
  updated_at: string
}

// 🎯 TIPOS PARA O REQUEST DE CRIAÇÃO (se necessário no futuro)
export type CreateMethodRequest = {
  name: string
}

// 🎯 TIPOS PARA O REQUEST DE UPDATE (se necessário no futuro)
export type UpdateMethodRequest = {
  id: string
  name: string
}

// 🎯 TIPOS PARA O REQUEST DE DELETE (se necessário no futuro)
export type DeleteMethodRequest = {
  id: string
}

// 🎯 TIPOS PARA A RESPONSE DE DELETE
export type DeleteMethodResponse = {
  message: string
  status: number
  data?: any
}

// 🎯 TIPOS PARA A RESPONSE DE GET (listagem)
export type GetMethodsResponse = {
  message: string
  status: number
  data: HttpMethod[]
}

// 🎯 TIPOS PARA A RESPONSE DE CREATE
export type CreateMethodResponse = {
  message: string
  status: number
  data: HttpMethod
}

// 🎯 TIPOS PARA A RESPONSE DE UPDATE
export type UpdateMethodResponse = {
  message: string
  status: number
  data: HttpMethod
}

// 🎯 TIPOS PARA A RESPONSE DE GET SINGLE
export type GetSingleMethodResponse = {
  message: string
  status: number
  data: HttpMethod
}

// 🎯 TIPO PARA ERROS (estrutura padrão do backend)
type MethodError = {
  status: number
  message: string
}

// 🎯 API ENDPOINTS
export const methodApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // 🎯 GET METHODS (listagem) - Principal endpoint que você precisa
    getMethods: builder.query<GetMethodsResponse, void>({
      query: () => ({
        url: '/method',
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetMethodsResponse) => {
        console.log('🔍 DEBUG - Estrutura da resposta GET methods:', response)
        const count = response?.data?.length || 0
        const methodNames = response?.data?.map(m => m.name) || []

        console.log('✅ Métodos HTTP carregados:', count, 'métodos')
        console.log('📋 Métodos disponíveis:', methodNames.join(', '))

        return response
      },

      transformErrorResponse: (response: any): MethodError => {
        console.error('❌ Erro ao carregar métodos HTTP:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar métodos HTTP'
        }
      },

      // 🎯 TAG PARA CACHE E INVALIDAÇÃO
      providesTags: result =>
        result?.data
          ? [
              { type: 'HttpMethod', id: 'LIST' },
              ...result.data.map(method => ({ type: 'HttpMethod' as const, id: method.id }))
            ]
          : [{ type: 'HttpMethod', id: 'LIST' }],

      // 🎯 CACHE LONGO (métodos HTTP raramente mudam)
      keepUnusedDataFor: 3600 // 1 hora
    }),

    // 🎯 GET SINGLE METHOD (se necessário no futuro)
    getSingleMethod: builder.query<GetSingleMethodResponse, string>({
      query: id => ({
        url: `/method/${id}`,
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetSingleMethodResponse) => {
        console.log('🔍 DEBUG - Método individual carregado:', response.data.name)

        return response
      },

      transformErrorResponse: (response: any): MethodError => {
        console.error('❌ Erro ao carregar método individual:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar método'
        }
      },

      providesTags: (result, error, id) => [{ type: 'HttpMethod', id }]
    }),

    // 🎯 CREATE METHOD (se você precisar permitir criação de novos métodos)
    createMethod: builder.mutation<CreateMethodResponse, CreateMethodRequest>({
      query: newMethod => ({
        url: '/method',
        method: 'POST',
        body: newMethod,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }),

      transformResponse: (response: CreateMethodResponse) => {
        console.log('✅ Método HTTP criado com sucesso:', response.data.name)
        toast.success(`Método "${response.data.name}" criado com sucesso!`)

        return response
      },

      transformErrorResponse: (response: any): MethodError => {
        const errorMsg = response?.data?.message || response?.message || 'Erro ao criar método HTTP'

        console.error('❌ Erro ao criar método HTTP:', response)
        toast.error('Erro ao criar método: ' + errorMsg)

        return {
          status: response.status || 500,
          message: errorMsg
        }
      },

      invalidatesTags: [{ type: 'HttpMethod', id: 'LIST' }]
    }),

    // 🎯 UPDATE METHOD (se você precisar permitir edição de métodos)
    updateMethod: builder.mutation<UpdateMethodResponse, UpdateMethodRequest>({
      query: ({ id, ...updateData }) => ({
        url: `/method/${id}`,
        method: 'PUT',
        body: updateData,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }),

      transformResponse: (response: UpdateMethodResponse) => {
        console.log('✅ Método HTTP atualizado com sucesso:', response.data.name)
        toast.success(`Método "${response.data.name}" atualizado com sucesso!`)

        return response
      },

      transformErrorResponse: (response: any): MethodError => {
        const errorMsg = response?.data?.message || response?.message || 'Erro ao atualizar método HTTP'

        console.error('❌ Erro ao atualizar método HTTP:', response)
        toast.error('Erro ao atualizar método: ' + errorMsg)

        return {
          status: response.status || 500,
          message: errorMsg
        }
      },

      invalidatesTags: (result, error, { id }) => [
        { type: 'HttpMethod', id },
        { type: 'HttpMethod', id: 'LIST' }
      ]
    }),

    // 🎯 DELETE METHOD (se você precisar permitir exclusão de métodos)
    deleteMethod: builder.mutation<DeleteMethodResponse, DeleteMethodRequest>({
      query: ({ id }) => ({
        url: `/method/${id}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: any, meta: any) => {
        const httpStatus = meta?.response?.status

        try {
          // 🎯 LÓGICA PARA STATUS 204 (No Content)
          if (httpStatus === 204) {
            toast.success('Método HTTP deletado com sucesso!')

            return {
              message: 'Método HTTP deletado com sucesso',
              status: 204,
              data: null
            }
          }

          // 🎯 RESPOSTA VAZIA MAS SUCESSO
          if (
            (response === null || response === undefined || response === '') &&
            (httpStatus === undefined || httpStatus === null)
          ) {
            toast.success('Método HTTP deletado com sucesso!')

            return {
              message: 'Método HTTP deletado com sucesso',
              status: 204,
              data: null
            }
          }

          // 🎯 STATUS 200 COM CONTEÚDO
          if (httpStatus === 200) {
            toast.success('Método HTTP deletado com sucesso!')

            return response?.message
              ? response
              : {
                  message: 'Método HTTP deletado com sucesso',
                  status: 200,
                  data: response
                }
          }

          // 🎯 OUTROS STATUS DE SUCESSO (2xx)
          if (httpStatus >= 200 && httpStatus < 300) {
            toast.success('Método HTTP deletado com sucesso!')

            return {
              message: 'Método HTTP deletado com sucesso',
              status: httpStatus,
              data: response || null
            }
          }

          // 🎯 ERROS 4xx/5xx
          if (httpStatus >= 400) {
            toast.error('Erro ao deletar método: ' + (response?.message || `Erro HTTP ${httpStatus}`))
            throw new Error(response?.message || `Erro HTTP ${httpStatus}`)
          }

          // 🎯 FALLBACK DE SUCESSO
          toast.success('Método HTTP deletado com sucesso!')

          return {
            message: 'Método HTTP deletado com sucesso',
            status: httpStatus || 204,
            data: response || null
          }
        } catch (error) {
          toast.error('Erro ao deletar método: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
          throw error
        }
      },

      transformErrorResponse: (response: any): MethodError => {
        toast.error('Erro ao deletar método: ' + (response?.data?.message || response?.message || 'Erro desconhecido'))

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao deletar método HTTP'
        }
      },

      invalidatesTags: (result, error, { id }) => [
        { type: 'HttpMethod', id },
        { type: 'HttpMethod', id: 'LIST' }
      ]
    })
  }),
  overrideExisting: true
})

// 🎯 EXPORT DOS HOOKS GERADOS
export const {
  useGetMethodsQuery,
  useGetSingleMethodQuery,
  useCreateMethodMutation,
  useUpdateMethodMutation,
  useDeleteMethodMutation
} = methodApi
