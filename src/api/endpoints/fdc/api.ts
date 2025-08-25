import { toast } from 'react-toastify'

import { apiSlice } from '@/api/ApiCreate/apiSlice'

export type CreateApiRequest = {
  name: string
  description: string
  url: string
  token: string
}

export type UpdateApiRequest = {
  id: string
  name: string
  description: string
  url: string
  token: string
}

export type DeleteApiRequest = {
  id: string
}

export type DeleteApiResponse = {
  message: string
  status: number
  data?: any
}

export type Api = {
  id: string
  name: string
  description: string
  url: string
  token: string
  user_id: string
  created_at: string
  updated_at: string
}

export type GetApisResponse = {
  message: string
  status: number
  data: Api[]
}

export type CreateApiResponse = {
  message: string
  status: number
  data: Api
}

export type UpdateApiResponse = {
  message: string
  status: number
  data: Api
}

export type GetSingleApiResponse = {
  message: string
  status: number
  data: Api
}

type ApiError = {
  status: number
  message: string
}

export const apiApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getApis: builder.query<GetApisResponse, void>({
      query: () => ({
        url: '/api',
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetApisResponse) => {
        return response
      },

      transformErrorResponse: (response: any): ApiError => {
        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar APIs'
        }
      },

      providesTags: result =>
        result?.data
          ? [...result.data.map(({ id }) => ({ type: 'Api' as const, id })), { type: 'Api', id: 'LIST' }]
          : [{ type: 'Api', id: 'LIST' }]
    }),

    getSingleApi: builder.query<GetSingleApiResponse, string>({
      query: id => ({
        url: `/api/${id}`,
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetSingleApiResponse) => {
        return response
      },

      transformErrorResponse: (response: any): ApiError => {
        console.error('❌ Erro ao carregar API:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar API'
        }
      },

      providesTags: (result, error, id) => [{ type: 'Api', id }]
    }),

    createApi: builder.mutation<CreateApiResponse, CreateApiRequest>({
      query: data => ({
        url: '/api',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: any, meta: any) => {
        const httpStatus = meta?.response?.status

        if (response && response.data && response.message) {
          toast.success('API criada com sucesso: ' + response.data.name)

          return response
        }

        if (httpStatus === 201 || httpStatus === 200) {
          console.log('⚠️ CREATE dados diretos detectados (status', httpStatus, ')')

          const normalizedResponse = {
            message: 'Created',
            status: httpStatus,
            data: response.id ? response : response.data || response
          }

          toast.success('API criada com sucesso: ' + normalizedResponse.data.name)

          return normalizedResponse
        }

        throw new Error(response?.message || 'Erro na criação da API')
      },

      transformErrorResponse: (response: any): ApiError => {
        toast.error('Erro ao criar API: ' + (response?.data?.message || response?.message || 'Erro desconhecido'))

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao criar API'
        }
      },

      invalidatesTags: [{ type: 'Api', id: 'LIST' }]
    }),

    updateApi: builder.mutation<UpdateApiResponse, UpdateApiRequest>({
      query: ({ id, ...data }) => ({
        url: `/api/${id}`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: any, meta: any) => {
        const httpStatus = meta?.response?.status

        try {
          if (response && response.data && response.message && response.status) {
            toast.success('API atualizada com sucesso: ' + (response.data.name || response.data.id))

            return response as UpdateApiResponse
          }

          if (response && response.message && response.status && response.id) {
            toast.success('API atualizada com sucesso: ' + (response.name || response.id))

            const normalizedResponse: UpdateApiResponse = {
              message: response.message,
              status: response.status,
              data: {
                id: response.id,
                name: response.name || 'Nome não informado',
                description: response.description || 'Descrição não informada',
                url: response.url || '',
                token: response.token || '',
                user_id: response.user_id || '',
                created_at: response.created_at || new Date().toISOString(),
                updated_at: response.updated_at || new Date().toISOString()
              }
            }

            console.log('✅ [UPDATE API] Response normalizada:', normalizedResponse)

            return normalizedResponse
          }

          if ((httpStatus === 200 || response?.status === 200) && response) {
            toast.success('API atualizada com sucesso: ' + (response.name || response.id || 'ID desconhecido'))

            if (response.id) {
              const normalizedResponse: UpdateApiResponse = {
                message: response.message || 'Updated',
                status: 200,
                data: {
                  id: response.id,
                  name: response.name || 'Nome não informado',
                  description: response.description || 'Descrição não informada',
                  url: response.url || '',
                  token: response.token || '',
                  user_id: response.user_id || '',
                  created_at: response.created_at || new Date().toISOString(),
                  updated_at: response.updated_at || new Date().toISOString()
                }
              }

              return normalizedResponse
            }

            return response.message
              ? response
              : {
                  message: 'Updated',
                  status: 200,
                  data: response
                }
          }

          if (httpStatus >= 200 && httpStatus < 300) {
            toast.success('API atualizada com sucesso: ' + (response.name || response.id || 'ID desconhecido'))

            return {
              message: 'Updated',
              status: httpStatus,
              data: response
            }
          }

          if (response && response.message === 'Updated') {
            toast.success('API atualizada com sucesso: ' + (response.name || response.id || 'ID desconhecido'))

            if (response.id) {
              const normalizedResponse: UpdateApiResponse = {
                message: 'Updated',
                status: response.status || 200,
                data: {
                  id: response.id,
                  name: response.name || 'Nome não informado',
                  description: response.description || 'Descrição não informada',
                  url: response.url || '',
                  token: response.token || '',
                  user_id: response.user_id || '',
                  created_at: response.created_at || new Date().toISOString(),
                  updated_at: response.updated_at || new Date().toISOString()
                }
              }

              return normalizedResponse
            }

            return {
              message: 'Updated',
              status: response.status || 200,
              data: response
            }
          }

          if (httpStatus >= 400) {
            toast.error('Erro ao atualizar API: ' + (response?.message || `Erro HTTP ${httpStatus}`))
            throw new Error(response?.message || `Erro HTTP ${httpStatus}`)
          }

          console.log('✅ [UPDATE API] Fallback - considerando sucesso')

          return {
            message: 'Updated',
            status: httpStatus || response?.status || 200,
            data: response
          }
        } catch (error) {
          toast.error('Erro ao atualizar API: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))

          throw error
        }
      },

      transformErrorResponse: (response: any): ApiError => {
        toast.error('Erro ao atualizar API: ' + (response?.data?.message || response?.message || 'Erro desconhecido'))

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao atualizar API'
        }
      },

      invalidatesTags: (result, error, { id }) => [
        { type: 'Api', id },
        { type: 'Api', id: 'LIST' }
      ]
    }),

    deleteApi: builder.mutation<DeleteApiResponse, DeleteApiRequest>({
      query: ({ id }) => ({
        url: `/api/${id}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: any, meta: any) => {
        const httpStatus = meta?.response?.status

        try {
          if (httpStatus === 204) {
            toast.info('API deletada com sucesso')

            return {
              message: 'API deletada com sucesso',
              status: 204,
              data: null
            }
          }

          if (
            (response === null || response === undefined || response === '') &&
            (httpStatus === undefined || httpStatus === null)
          ) {
            toast.info('API deletada com sucesso')

            return {
              message: 'API deletada com sucesso',
              status: 204,
              data: null
            }
          }

          if (httpStatus === 200) {
            toast.info('API deletada com sucesso')

            return response?.message
              ? response
              : {
                  message: 'API deletada com sucesso',
                  status: 200,
                  data: response
                }
          }

          if (httpStatus >= 200 && httpStatus < 300) {
            toast.info('API deletada com sucesso')

            return {
              message: 'API deletada com sucesso',
              status: httpStatus,
              data: response || null
            }
          }

          if (httpStatus >= 400) {
            toast.error('Erro ao deletar API: ' + (response?.message || `Erro HTTP ${httpStatus}`))
            throw new Error(response?.message || `Erro HTTP ${httpStatus}`)
          }

          toast.info('API deletada com sucesso')

          return {
            message: 'API deletada com sucesso',
            status: httpStatus || 204,
            data: response || null
          }
        } catch (error) {
          toast.error('Erro ao deletar API: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
          throw error
        }
      },

      transformErrorResponse: (response: any): ApiError => {
        toast.error('Erro ao deletar API: ' + (response?.data?.message || response?.message || 'Erro desconhecido'))

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao deletar API'
        }
      },

      invalidatesTags: (result, error, { id }) => {
        return [
          { type: 'Api', id },
          { type: 'Api', id: 'LIST' }
        ]
      }
    })
  }),
  overrideExisting: true
})

export const {
  useGetApisQuery,
  useGetSingleApiQuery,
  useCreateApiMutation,
  useUpdateApiMutation,
  useDeleteApiMutation
} = apiApi
