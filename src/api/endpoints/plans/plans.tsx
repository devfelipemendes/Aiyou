// src/api/endpoints/plan/plan.ts
import { apiSlice } from '@/api/ApiCreate/apiSlice'

// 🎯 TIPOS PARA PLANO (baseado na resposta real da API)
export type Plan = {
  id: string
  name: string
  description: string
  max_assistants: number
  max_tokens: number
  price: string
  created_at: string
  updated_at: string
  max_seconds: number
}

// 🎯 TIPOS PARA O REQUEST DE CRIAÇÃO (se necessário no futuro)
export type CreatePlanRequest = {
  name: string
  description: string
  max_assistants: number
  max_tokens: number
  price: string
  max_seconds: number
}

// 🎯 TIPOS PARA O REQUEST DE UPDATE (se necessário no futuro)
export type UpdatePlanRequest = {
  id: string
  name: string
  description: string
  max_assistants: number
  max_tokens: number
  price: string
  max_seconds: number
}

// 🎯 TIPOS PARA O REQUEST DE DELETE (se necessário no futuro)
export type DeletePlanRequest = {
  id: string
}

// 🎯 TIPOS PARA A RESPONSE DE DELETE
export type DeletePlanResponse = {
  message: string
  status: number
  data?: any
}

// 🎯 TIPOS PARA A RESPONSE DE GET (listagem) - Principal endpoint
export type GetPlansResponse = {
  message: string
  status: number
  data: Plan[]
}

// 🎯 TIPOS PARA A RESPONSE DE CREATE
export type CreatePlanResponse = {
  message: string
  status: number
  data: Plan
}

// 🎯 TIPOS PARA A RESPONSE DE UPDATE
export type UpdatePlanResponse = {
  message: string
  status: number
  data: Plan
}

// 🎯 TIPOS PARA A RESPONSE DE GET SINGLE
export type GetSinglePlanResponse = {
  message: string
  status: number
  data: Plan
}

// 🎯 TIPO PARA ERROS (estrutura padrão do backend)
type PlanError = {
  status: number
  message: string
}

// 🎯 API ENDPOINTS
export const planApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // 🎯 GET PLANS (listagem) - Principal endpoint que você precisa
    getPlans: builder.query<GetPlansResponse, void>({
      query: () => ({
        url: '/plan',
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetPlansResponse) => {
        console.log('🔍 DEBUG - Estrutura da resposta GET plans:', response)
        const count = response?.data?.length || 0
        const planNames = response?.data?.map(p => `${p.name} (R$ ${p.price})`) || []

        console.log('✅ Planos carregados:', count, count === 1 ? 'plano' : 'planos')
        console.log('💰 Planos disponíveis:', planNames.join(', '))

        return response
      },

      transformErrorResponse: (response: any): PlanError => {
        console.error('❌ Erro ao carregar planos:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar planos'
        }
      },

      // 🎯 TAG PARA CACHE E INVALIDAÇÃO
      providesTags: result =>
        result?.data
          ? [
              ...result.data.map(plan => ({ type: 'Plan' as const, id: plan.id })),
              { type: 'Plan' as const, id: 'LIST' }
            ]
          : [{ type: 'Plan' as const, id: 'LIST' }],

      // 🎯 CACHE: Manter dados por 5 minutos (planos não mudam frequentemente)
      keepUnusedDataFor: 300
    }),

    // 🎯 GET SINGLE PLAN (opcional - caso precise de detalhes específicos)
    getPlan: builder.query<GetSinglePlanResponse, string>({
      query: planId => ({
        url: `/plan/${planId}`,
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetSinglePlanResponse) => {
        console.log(`✅ Plano ${response.data.name} carregado com sucesso`)

        return response
      },

      transformErrorResponse: (response: any): PlanError => {
        console.error('❌ Erro ao carregar plano específico:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar plano'
        }
      },

      providesTags: (result, error, planId) => [{ type: 'Plan' as const, id: planId }],
      keepUnusedDataFor: 300
    }),

    // 🎯 CREATE PLAN (opcional - para futuras funcionalidades admin)
    createPlan: builder.mutation<CreatePlanResponse, CreatePlanRequest>({
      query: planData => ({
        url: '/plan',
        method: 'POST',
        body: planData,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: CreatePlanResponse) => {
        console.log(`✅ Plano ${response.data.name} criado com sucesso`)

        return response
      },

      transformErrorResponse: (response: any): PlanError => {
        console.error('❌ Erro ao criar plano:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao criar plano'
        }
      },

      invalidatesTags: [{ type: 'Plan', id: 'LIST' }]
    }),

    // 🎯 UPDATE PLAN (opcional - para futuras funcionalidades admin)
    updatePlan: builder.mutation<UpdatePlanResponse, UpdatePlanRequest>({
      query: ({ id, ...planData }) => ({
        url: `/plan/${id}`,
        method: 'PUT',
        body: planData,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: UpdatePlanResponse) => {
        console.log(`✅ Plano ${response.data.name} atualizado com sucesso`)

        return response
      },

      transformErrorResponse: (response: any): PlanError => {
        console.error('❌ Erro ao atualizar plano:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao atualizar plano'
        }
      },

      invalidatesTags: (result, error, { id }) => [
        { type: 'Plan', id },
        { type: 'Plan', id: 'LIST' }
      ]
    }),

    // 🎯 DELETE PLAN (opcional - para futuras funcionalidades admin)
    deletePlan: builder.mutation<DeletePlanResponse, DeletePlanRequest>({
      query: ({ id }) => ({
        url: `/plan/${id}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: DeletePlanResponse) => {
        console.log('✅ Plano excluído com sucesso')

        return response
      },

      transformErrorResponse: (response: any): PlanError => {
        console.error('❌ Erro ao excluir plano:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao excluir plano'
        }
      },

      invalidatesTags: (result, error, { id }) => [
        { type: 'Plan', id },
        { type: 'Plan', id: 'LIST' }
      ]
    })
  })
})

// 🎯 EXPORT DOS HOOKS (seguindo padrão do RTK Query)
export const {
  useGetPlansQuery, // Principal - para listar todos os planos
  useGetPlanQuery, // Para buscar plano específico
  useCreatePlanMutation, // Para criar plano (admin)
  useUpdatePlanMutation, // Para atualizar plano (admin)
  useDeletePlanMutation // Para deletar plano (admin)
} = planApi
