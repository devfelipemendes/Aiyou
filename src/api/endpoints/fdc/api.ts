import { apiSlice } from '@/api/ApiCreate/apiSlice'

// 🎯 TIPOS PARA O REQUEST DE CRIAÇÃO
export type CreateApiRequest = {
  name: string
  description: string
  url: string
  token: string
}

// 🎯 TIPOS PARA O REQUEST DE UPDATE
export type UpdateApiRequest = {
  id: string // ID da API a ser atualizada
  name: string
  description: string
  url: string
  token: string
}

// 🎯 TIPOS PARA O REQUEST DE DELETE
export type DeleteApiRequest = {
  id: string // ID da API a ser deletada
}

// 🎯 TIPOS PARA A RESPONSE DE DELETE (pode ser vazia com status 204)
export type DeleteApiResponse = {
  message: string
  status: number
  data?: any // Opcional, pois pode ser vazio com status 204
}

// 🎯 TIPOS PARA UMA API INDIVIDUAL (baseado na resposta real do backend)
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

// 🎯 TIPOS PARA A RESPONSE DE GET (listagem) - estrutura real do backend
export type GetApisResponse = {
  message: string
  status: number
  data: Api[]
}

// 🎯 TIPOS PARA A RESPONSE DE CREATE (estrutura real do backend)
export type CreateApiResponse = {
  message: string
  status: number
  data: Api
}

// 🎯 TIPOS PARA A RESPONSE DE UPDATE
export type UpdateApiResponse = {
  message: string
  status: number
  data: Api
}

// 🎯 TIPOS PARA A RESPONSE DE GET SINGLE
export type GetSingleApiResponse = {
  message: string
  status: number
  data: Api
}

// 🎯 TIPO PARA ERROS (estrutura real do backend)
type ApiError = {
  status: number
  message: string
}

// 🎯 API ENDPOINTS
export const apiApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // 🎯 GET APIS (listagem)
    getApis: builder.query<GetApisResponse, void>({
      query: () => ({
        url: '/v1/api',
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetApisResponse) => {
        console.log('🔍 DEBUG - APIs carregadas:', response.data.length, 'itens')
        console.log('🔍 DEBUG - Primeira API:', response.data[0]?.name)

        return response
      },

      transformErrorResponse: (response: any): ApiError => {
        console.error('❌ Erro ao carregar APIs:', response)

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

    // 🎯 GET SINGLE API
    getSingleApi: builder.query<GetSingleApiResponse, string>({
      query: id => ({
        url: `/api/${id}`,
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetSingleApiResponse) => {
        console.log('🔍 DEBUG - API única carregada:', response.data.name, 'ID:', response.data.id)

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

    // 🎯 CREATE API
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
        console.log('🔍 DEBUG - Resposta RAW do CREATE API:', response)
        console.log('🔍 DEBUG - Meta do CREATE:', meta)
        console.log('🔍 DEBUG - Status HTTP:', meta?.response?.status)

        const httpStatus = meta?.response?.status

        // ✅ STATUS 201/200 com dados (estrutura padrão)
        if (response && response.data && response.message) {
          console.log('✅ CREATE estrutura padrão detectada (status', httpStatus, ')')
          console.log('✅ API criada:', response.data.name, 'ID:', response.data.id)

          return response
        }

        // ⚠️ STATUS 201/200 mas sem estrutura padrão (dados diretos)
        if (httpStatus === 201 || httpStatus === 200) {
          console.log('⚠️ CREATE dados diretos detectados (status', httpStatus, ')')

          const normalizedResponse = {
            message: 'Created',
            status: httpStatus,
            data: response.id ? response : response.data || response
          }

          console.log('✅ API criada (normalizada):', normalizedResponse.data.name)

          return normalizedResponse
        }

        // ❌ Outros casos são considerados erro
        console.error('❌ CREATE falhou - Status:', httpStatus, 'Response:', response)
        throw new Error(response?.message || 'Erro na criação da API')
      },

      transformErrorResponse: (response: any): ApiError => {
        console.error('❌ Erro detalhado CREATE API:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao criar API'
        }
      },

      invalidatesTags: [{ type: 'Api', id: 'LIST' }]
    }),

    // 🎯 UPDATE API
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
        console.log('🔍 DEBUG - Resposta RAW do UPDATE API:', response)
        console.log('🔍 DEBUG - Meta do UPDATE:', meta)
        console.log('🔍 DEBUG - Status HTTP:', meta?.response?.status)

        const httpStatus = meta?.response?.status

        // ✅ STATUS 200 com dados (estrutura padrão)
        if (response && response.data && response.message) {
          console.log('✅ UPDATE estrutura padrão detectada (status', httpStatus, ')')
          console.log('✅ API atualizada:', response.data.name, 'ID:', response.data.id)

          return response
        }

        // ⚠️ STATUS 200 mas sem estrutura padrão (dados diretos)
        if (httpStatus === 200) {
          console.log('⚠️ UPDATE dados diretos detectados (status', httpStatus, ')')

          const normalizedResponse = {
            message: 'Updated',
            status: httpStatus,
            data: response.id ? response : response.data || response
          }

          console.log('✅ API atualizada (normalizada):', normalizedResponse.data.name)

          return normalizedResponse
        }

        // ❌ Outros casos são considerados erro
        console.error('❌ UPDATE falhou - Status:', httpStatus, 'Response:', response)
        throw new Error(response?.message || 'Erro na atualização da API')
      },

      transformErrorResponse: (response: any): ApiError => {
        console.error('❌ Erro detalhado UPDATE API:', response)

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

    // 🎯 DELETE API
    deleteApi: builder.mutation<DeleteApiResponse, DeleteApiRequest>({
      query: ({ id }) => ({
        url: `/api/${id}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: any, meta: any) => {
        console.log('🔍 DEBUG - Resposta RAW do DELETE API:', response)
        console.log('🔍 DEBUG - Meta do DELETE:', meta)
        console.log('🔍 DEBUG - Status HTTP:', meta?.response?.status)

        const httpStatus = meta?.response?.status

        // ✅ STATUS 204 (No Content) - padrão para DELETE
        if (httpStatus === 204) {
          console.log('✅ DELETE bem-sucedido (status 204 - No Content)')

          return {
            message: 'Deleted',
            status: 204,
            data: null
          }
        }

        // ✅ STATUS 200 com dados
        if (httpStatus === 200 && response) {
          console.log('✅ DELETE bem-sucedido (status 200 com dados)')

          return response.message
            ? response
            : {
                message: 'Deleted',
                status: 200,
                data: response
              }
        }

        // ❌ Outros casos são considerados erro
        console.error('❌ DELETE falhou - Status:', httpStatus, 'Response:', response)
        throw new Error(response?.message || 'Erro ao deletar API')
      },

      transformErrorResponse: (response: any): ApiError => {
        console.error('❌ Erro detalhado DELETE API:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao deletar API'
        }
      },

      invalidatesTags: (result, error, { id }) => [
        { type: 'Api', id },
        { type: 'Api', id: 'LIST' }
      ]
    })
  })
})

// 🎯 EXPORT DOS HOOKS
export const {
  useGetApisQuery,
  useGetSingleApiQuery,
  useCreateApiMutation,
  useUpdateApiMutation,
  useDeleteApiMutation
} = apiApi
