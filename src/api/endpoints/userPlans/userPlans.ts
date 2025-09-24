// src/api/endpoints/userPlans/userPlans.ts
import { toast } from 'react-toastify'

import { apiSlice } from '@/api/ApiCreate/apiSlice'

// 🎯 TIPOS PARA USER PLAN
export type UserPlan = {
  id: string
  user_id: string
  plan_id: string
  card_id: string
  date: string
  active: boolean
  expiry_date: string
  created_at: string
  updated_at: string
}

// 🎯 TIPOS PARA O REQUEST DE CRIAÇÃO
export type CreateUserPlanRequest = {
  plan_id: string

  subscription: boolean
}

// 🎯 TIPOS PARA O REQUEST DE UPDATE
export type UpdateUserPlanRequest = {
  id: string
  user_id?: string
  plan_id?: string
  card_id?: string
  date?: string
  active?: boolean
  used_tokens?: number
  subscription?: boolean
  user_plan_id?: string | null
}

// 🎯 TIPOS PARA O REQUEST DE DELETE
export type DeleteUserPlanRequest = {
  id: string
}

// 🎯 TIPOS PARA A RESPONSE DE DELETE
export type DeleteUserPlanResponse = {
  message: string
  status: number
  data?: any
}

// 🎯 TIPOS PARA A RESPONSE DE GET (listagem)
export type GetUserPlansResponse = {
  message: string
  status: number
  data: UserPlan[]
}

// 🎯 TIPOS PARA A RESPONSE DE CREATE
export type CreateUserPlanResponse = {
  message: string
  status: number
  data: UserPlan
}

// 🎯 TIPOS PARA A RESPONSE DE UPDATE
export type UpdateUserPlanResponse = {
  message: string
  status: number
  data: UserPlan
}

// 🎯 TIPOS PARA A RESPONSE DE GET SINGLE
export type GetSingleUserPlanResponse = {
  message: string
  status: number
  data: UserPlan
}

// 🎯 TIPO PARA ERROS (estrutura padrão do backend)
type UserPlanError = {
  status: number
  message: string
}

// 🎯 API ENDPOINTS
export const userPlanApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // 🎯 GET USER PLANS (listagem)
    getUserPlans: builder.query<GetUserPlansResponse, void>({
      query: () => ({
        url: '/userPlans',
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetUserPlansResponse) => {
        console.log('🔍 DEBUG - Estrutura da resposta GET user plans:', response)
        const count = response?.data?.length || 0

        console.log('✅ Planos de usuário carregados:', count, count === 1 ? 'plano' : 'planos')

        return response
      },

      transformErrorResponse: (response: any): UserPlanError => {
        console.error('❌ Erro ao carregar planos de usuário:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar planos de usuário'
        }
      },

      // 🎯 TAGS PARA CACHE E INVALIDAÇÃO
      providesTags: result =>
        result?.data
          ? [...result.data.map(({ id }) => ({ type: 'UserPlan' as const, id })), { type: 'UserPlan', id: 'LIST' }]
          : [{ type: 'UserPlan', id: 'LIST' }]
    }),

    // 🎯 GET SINGLE USER PLAN
    getSingleUserPlan: builder.query<GetSingleUserPlanResponse, string>({
      query: id => ({
        url: `/userPlans/${id}`,
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetSingleUserPlanResponse) => {
        console.log('✅ Plano de usuário carregado:', response.data.id)

        return response
      },

      transformErrorResponse: (response: any): UserPlanError => {
        console.error('❌ Erro ao carregar plano de usuário:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar plano de usuário'
        }
      },

      providesTags: (result, error, id) => [{ type: 'UserPlan', id }]
    }),

    // 🎯 CREATE USER PLAN
    createUserPlan: builder.mutation<CreateUserPlanResponse, CreateUserPlanRequest>({
      query: data => ({
        url: '/userPlans',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: any, meta: any) => {
        console.log('🔍 DEBUG - Resposta RAW do CREATE user plan:', response)
        console.log('🔍 DEBUG - Meta do CREATE:', meta)
        console.log('🔍 DEBUG - Status HTTP:', meta?.response?.status)

        const httpStatus = meta?.response?.status

        // ✅ STATUS 201/200 com dados (estrutura padrão)
        if (response && response.data && response.message) {
          console.log('✅ CREATE estrutura padrão detectada (status', httpStatus, ')')
          console.log('✅ Plano de usuário criado:', response.data.id, 'para usuário:', response.data.user_id)

          // 🎯 Toast de sucesso
          toast.success('Plano de usuário criado com sucesso!', {
            position: 'top-right',
            autoClose: 3000
          })

          return response
        }

        // ⚠️ FALLBACK: Se não tem estrutura esperada, retornar como está
        console.warn('⚠️ CREATE estrutura não padrão, retornando response original')

        return response
      },

      transformErrorResponse: (response: any): UserPlanError => {
        console.error('❌ Erro ao criar plano de usuário:', response)

        // 🎯 Toast de erro
        const errorMessage = response?.data?.message || response?.message || 'Erro ao criar plano de usuário'

        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 4000
        })

        return {
          status: response.status || 500,
          message: errorMessage
        }
      },

      // 🎯 INVALIDAR TAGS APÓS CRIAÇÃO
      invalidatesTags: [
        { type: 'UserPlan', id: 'LIST' },
        'UserPlan' // Invalidar todas as tags de UserPlan
      ]
    }),

    // 🎯 UPDATE USER PLAN
    updateUserPlan: builder.mutation<UpdateUserPlanResponse, UpdateUserPlanRequest>({
      query: ({ id, ...data }) => ({
        url: `/userPlans/${id}`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: UpdateUserPlanResponse) => {
        console.log('✅ Plano de usuário atualizado:', response)

        // 🎯 Toast de sucesso
        toast.success('Plano de usuário atualizado com sucesso!', {
          position: 'top-right',
          autoClose: 3000
        })

        return response
      },

      transformErrorResponse: (response: any): UserPlanError => {
        console.error('❌ Erro ao atualizar plano de usuário:', response)

        // 🎯 Toast de erro
        const errorMessage = response?.data?.message || response?.message || 'Erro ao atualizar plano de usuário'

        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 4000
        })

        return {
          status: response.status || 500,
          message: errorMessage
        }
      },

      // 🎯 INVALIDAR TAGS APÓS UPDATE
      invalidatesTags: (result, error, { id }) => [
        { type: 'UserPlan', id },
        { type: 'UserPlan', id: 'LIST' }
      ]
    }),

    // 🎯 DELETE USER PLAN
    deleteUserPlan: builder.mutation<DeleteUserPlanResponse, string>({
      query: id => ({
        url: `/userPlans/${id}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: DeleteUserPlanResponse) => {
        console.log('✅ Plano de usuário deletado:', response)

        // 🎯 Toast de sucesso
        toast.success('Plano de usuário excluído com sucesso!', {
          position: 'top-right',
          autoClose: 3000
        })

        return response
      },

      transformErrorResponse: (response: any): UserPlanError => {
        console.error('❌ Erro ao deletar plano de usuário:', response)

        // 🎯 Toast de erro
        const errorMessage = response?.data?.message || response?.message || 'Erro ao excluir plano de usuário'

        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 4000
        })

        return {
          status: response.status || 500,
          message: errorMessage
        }
      },

      // 🎯 INVALIDAR TAGS APÓS DELETE
      invalidatesTags: (result, error, id) => [
        { type: 'UserPlan', id },
        { type: 'UserPlan', id: 'LIST' }
      ]
    })
  })
})

// 🎯 EXPORT DOS HOOKS GERADOS AUTOMATICAMENTE PELO RTK QUERY
export const {
  useGetUserPlansQuery,
  useGetSingleUserPlanQuery,
  useCreateUserPlanMutation,
  useUpdateUserPlanMutation,
  useDeleteUserPlanMutation
} = userPlanApi
