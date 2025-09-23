import { createSelector } from '@reduxjs/toolkit'

import { apiSlice } from '@/api/ApiCreate/apiSlice'

// 🎯 TIPOS PARA PERMISSÕES DO USUÁRIO
export type UserPermission = {
  name: string
  description: string
}

// 🎯 TIPOS PARA O PLANO
export type Plan = {
  id: string
  name: string
  description: string
  max_assistants: number
  max_tokens: number
  price: string
}

// 🎯 TIPOS PARA USO DO PLANO
export type PlanUsage = {
  input_tokens: number
  input_cached_tokens: number
  output_tokens: number
  output_reasoning_tokens: number
  total_tokens: number
}

// 🎯 TIPOS PARA ASSISTENTE (dentro do projeto no /me)
export type AssistantInProject = {
  id: string
  name: string
  img_url: string | null
  description: string | null
  phones: any[]
}

// 🎯 TIPOS PARA PROJETO (dentro do /me)
export type ProjectInMe = {
  id: string
  name: string
  img_url: string | null
  description: string
  used_tokens: number
  assistants: AssistantInProject[]
}

// 🎯 TIPOS PARA O USUÁRIO COMPLETO
export type User = {
  id: string
  name: string
  identifier: string
  date: string
  age: number
  phone_number: string
  whatsapp_number: string
  is_juridic: boolean
  address: string
  cep: string
  uf: string
  city: string
  street: string
  number: string
  neighborhood: string
  complement: string | null
  email: string
  is_operator: boolean
  tokens_left: number
  plan: Plan
  plan_usage: PlanUsage
}

// 🎯 TIPOS PARA OS DADOS COMPLETOS DO /me
export type MeData = {
  user_permissions: UserPermission[]
  user: User
  projects: ProjectInMe[]
  first_access: boolean
}

// 🎯 TIPOS PARA A RESPONSE DO GET /me
export type GetMeResponse = {
  message: string
  status: number
  data: MeData
}

// 🎯 TIPO PARA ERROS
type MeError = {
  status: number
  message: string
}

// 🎯 API ENDPOINT
export const userMeApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // 🎯 GET /me - Informações do usuário autenticado
    getMe: builder.query<GetMeResponse, void>({
      query: () => ({
        url: '/me',
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetMeResponse) => {
        console.log('🔍 DEBUG - Estrutura da resposta GET /me:', response)

        const user = response.data.user
        const projectsCount = response.data.projects.length

        const totalAssistants = response.data.projects.reduce((acc, project) => acc + project.assistants.length, 0)

        console.log('✅ Usuário carregado:', user.name)
        console.log('📊 Projetos:', projectsCount, '| Assistentes:', totalAssistants)
        console.log('🎯 Plano:', user.plan.name, '| Tokens restantes:', user.tokens_left.toLocaleString())
        console.log('📈 Uso de tokens:', user.plan_usage.total_tokens.toLocaleString())

        return response
      },

      transformErrorResponse: (response: any): MeError => {
        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar dados do usuário'
        }
      },

      // 🎯 TAG PARA CACHE E INVALIDAÇÃO
      providesTags: ['User'],

      // 🎯 MANTER CACHE POR 5 MINUTOS (dados não mudam frequentemente)
      keepUnusedDataFor: 300
    })
  }),
  overrideExisting: true
})

// 🎯 EXPORTAR HOOK

export const { useGetMeQuery } = userMeApi

// 🔧 CORREÇÃO: SELETORES MEMOIZADOS COM createSelector
const selectMeResult = userMeApi.endpoints.getMe.select()

// ✅ SELECTOR BASE MEMOIZADO
export const selectMeData = createSelector([selectMeResult], result => result.data?.data)

// ✅ SELECTOR USER MEMOIZADO
export const selectUser = createSelector([selectMeData], meData => meData?.user)

// ✅ SELECTOR PERMISSIONS MEMOIZADO
export const selectUserPermissions = createSelector([selectMeData], meData => meData?.user_permissions || [])

// 🔧 CORREÇÃO PRINCIPAL: SELECTOR PROJECTS MEMOIZADO
export const selectUserProjects = createSelector([selectMeData], meData => {
  // ✅ IMPORTANTE: Sempre retornar a mesma referência para arrays vazios
  const projects = meData?.projects

  return projects && projects.length > 0 ? projects : []
})

// ✅ SELECTOR PLAN MEMOIZADO
export const selectUserPlan = createSelector([selectUser], user => user?.plan)

// ✅ SELECTOR PLAN USAGE MEMOIZADO
export const selectUserPlanUsage = createSelector([selectUser], user => user?.plan_usage)

// ✅ SELECTOR TOKENS LEFT MEMOIZADO
export const selectUserTokensLeft = createSelector([selectUser], user => user?.tokens_left || 0)

// 🔧 SELETORES CALCULADOS MEMOIZADOS
export const selectTotalUserProjects = createSelector([selectUserProjects], projects => projects.length)

export const selectTotalUserAssistants = createSelector([selectUserProjects], projects =>
  projects.reduce((acc, project) => acc + project.assistants.length, 0)
)

export const selectTokensUsagePercentage = createSelector([selectUser], user => {
  if (!user || !user.plan) return 0

  const used = user.plan_usage.total_tokens
  const max = user.plan.max_tokens

  return max > 0 ? (used / max) * 100 : 0
})

export const selectAssistantsUsagePercentage = createSelector(
  [selectUser, selectTotalUserAssistants],
  (user, totalAssistants) => {
    if (!user || !user.plan) return 0

    const max = user.plan.max_assistants

    return max > 0 ? (totalAssistants / max) * 100 : 0
  }
)

// ✅ HELPERS MEMOIZADOS
export const selectIsAdmin = createSelector([selectUserPermissions], permissions =>
  permissions.some(permission => permission.name === 'admin')
)

export const selectIsOperator = createSelector([selectUser], user => user?.is_operator || false)

export const selectFirstAccess = createSelector([selectMeData], meData => meData?.first_access || false)
