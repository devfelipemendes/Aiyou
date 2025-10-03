// src/api/endpoints/creditCard/creditCard.ts
import { toast } from 'react-toastify'

import { apiSlice } from '@/api/ApiCreate/apiSlice'

// 🎯 TIPOS PARA CREDIT CARD (baseado no body fornecido)
export type CreditCard = {
  id: string
  user_id: string
  name: string
  card_name: string
  security_code: string // Será criptografado na resposta
  card_number: string // Será criptografado na resposta
  date: string // Será criptografado na resposta
  active: boolean
  priority?: number
  credit_card_brand: string
  created_at: string
  updated_at: string
}

// 🎯 TIPOS PARA CREDIT CARD LISTAGEM (formato simplificado do GET)
export type CreditCardListItem = {
  id: string
  name: string
  card_name: string
  card_number: string // Apenas últimos 4 dígitos na listagem
  credit_card_brand: string
}

// 🎯 TIPOS PARA O REQUEST DE CRIAÇÃO
export type CreateCreditCuardRequest = {
  user_id: string
  name: string
  card_name: string
  security_code: string
  card_number: string
  date: string
  active: boolean // "true" ou "false" como string
  priority?: number
  credit_card_brand: string
}

// 🎯 TIPOS PARA O REQUEST DE UPDATE
export type UpdateCreditCardRequest = {
  id: string
  user_id?: string
  name?: string
  card_name?: string
  security_code?: string
  card_number?: string
  date?: string
  active?: boolean
  priority?: number
  credit_card_brand?: string
}

// 🎯 TIPOS PARA O REQUEST DE DELETE
export type DeleteCreditCardRequest = {
  id: string
}

// 🎯 TIPOS PARA A RESPONSE DE DELETE
export type DeleteCreditCardResponse = {
  message: string
  status: number
  data?: any
}

// 🎯 TIPOS PARA A RESPONSE DE GET (listagem) - formato simplificado
export type GetCreditCardsResponse = {
  id: number
  message: string
  status: number
  data: CreditCardListItem[]
}

// 🎯 TIPOS PARA A RESPONSE DE CREATE
export type CreateCreditCardResponse = {
  message: string
  status: number
  data: CreditCard
}

// 🎯 TIPOS PARA A RESPONSE DE UPDATE
export type UpdateCreditCardResponse = {
  message: string
  status: number
  data: CreditCard
}

// 🎯 TIPOS PARA A RESPONSE DE GET SINGLE
export type GetSingleCreditCardResponse = {
  message: string
  status: number
  data: CreditCard
}

// 🎯 TIPO PARA ERROS (estrutura padrão do backend)
type CreditCardError = { status: number; message: string }

// 🎯 API ENDPOINTS
export const creditCardApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // 🎯 GET CREDIT CARDS (listagem)
    getCreditCards: builder.query<GetCreditCardsResponse, void>({
      query: () => ({
        url: '/creditCards',
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetCreditCardsResponse) => {
        console.log('🔍 DEBUG - Estrutura da resposta GET credit cards:', response)
        const count = response?.data?.length || 0
        const cardNames = response?.data?.map(card => card.card_name) || []

        console.log('✅ Cartões de crédito carregados:', count, count === 1 ? 'cartão' : 'cartões')
        console.log('📋 Cartões:', cardNames.join(', '))

        return response
      },

      transformErrorResponse: (response: any): CreditCardError => {
        console.error('❌ Erro ao carregar cartões de crédito:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar cartões de crédito'
        }
      },

      // 🎯 TAG PARA CACHE E INVALIDAÇÃO
      providesTags: result =>
        result?.data
          ? [...result.data.map(({ id }) => ({ type: 'CreditCard' as const, id })), { type: 'CreditCard', id: 'LIST' }]
          : [{ type: 'CreditCard', id: 'LIST' }]
    }),

    // 🎯 GET SINGLE CREDIT CARD
    getSingleCreditCard: builder.query<GetSingleCreditCardResponse, string>({
      query: id => ({
        url: `/creditCards/${id}`,
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetSingleCreditCardResponse) => {
        console.log('🔍 DEBUG - Cartão de crédito único carregado:', response.data.card_name, 'ID:', response.data.id)

        return response
      },

      transformErrorResponse: (response: any): CreditCardError => {
        console.error('❌ Erro ao carregar cartão de crédito:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar cartão de crédito'
        }
      },

      providesTags: (result, error, id) => [{ type: 'CreditCard', id }]
    }),

    // 🎯 CREATE CREDIT CARD
    createCreditCard: builder.mutation<CreateCreditCardResponse, CreateCreditCuardRequest>({
      query: data => ({
        url: '/creditCards',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: any, meta: any) => {
        console.log('🔍 DEBUG - Resposta RAW do CREATE credit card:', response)
        console.log('🔍 DEBUG - Meta do CREATE:', meta)
        console.log('🔍 DEBUG - Status HTTP:', meta?.response?.status)

        const httpStatus = meta?.response?.status

        // ✅ STATUS 201/200 com dados (estrutura padrão)
        if (response && response.data && response.message) {
          console.log('✅ CREATE estrutura padrão detectada (status', httpStatus, ')')
          console.log('✅ Cartão de crédito criado:', response.data.card_name, 'para usuário:', response.data.user_id)

          // 🎯 Toast de sucesso
          toast.success(`Cartão "${response.data.card_name}" criado com sucesso!`, {
            position: 'top-right',
            autoClose: 3000
          })

          return response
        }

        // ⚠️ FALLBACK: Se não tem estrutura esperada, retornar como está
        console.warn('⚠️ CREATE estrutura não padrão, retornando response original')

        return response
      },

      transformErrorResponse: (response: any): CreditCardError => {
        console.error('❌ Erro ao criar cartão de crédito:', response)

        // 🎯 Toast de erro
        const errorMessage = response?.data?.message || response?.message || 'Erro ao criar cartão de crédito'

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
        { type: 'CreditCard', id: 'LIST' },
        'CreditCard' // Invalidar todas as tags de CreditCard
      ]
    }),

    // 🎯 UPDATE CREDIT CARD
    updateCreditCard: builder.mutation<UpdateCreditCardResponse, UpdateCreditCardRequest>({
      query: ({ id, ...data }) => ({
        url: `/creditCards/${id}`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: UpdateCreditCardResponse) => {
        console.log('✅ Cartão de crédito atualizado:', response)

        // 🎯 Toast de sucesso
        if (response?.data?.card_name) {
          toast.success(`Cartão "${response.data.card_name}" atualizado com sucesso!`, {
            position: 'top-right',
            autoClose: 3000
          })
        } else {
          toast.success('Cartão de crédito atualizado com sucesso!', {
            position: 'top-right',
            autoClose: 3000
          })
        }

        return response
      },

      transformErrorResponse: (response: any): CreditCardError => {
        console.error('❌ Erro ao atualizar cartão de crédito:', response)

        // 🎯 Toast de erro
        const errorMessage = response?.data?.message || response?.message || 'Erro ao atualizar cartão de crédito'

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
        { type: 'CreditCard', id },
        { type: 'CreditCard', id: 'LIST' }
      ]
    }),

    // 🎯 DELETE CREDIT CARD
    deleteCreditCard: builder.mutation<DeleteCreditCardResponse, string>({
      query: id => ({
        url: `/creditCards/${id}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: DeleteCreditCardResponse) => {
        console.log('✅ Cartão de crédito deletado:', response)

        // 🎯 Toast de sucesso
        toast.success('Cartão de crédito excluído com sucesso!', {
          position: 'top-right',
          autoClose: 3000
        })

        return response
      },

      transformErrorResponse: (response: any): CreditCardError => {
        console.error('❌ Erro ao deletar cartão de crédito:', response)

        // 🎯 Toast de erro
        const errorMessage = response?.data?.error || response?.message || 'Erro ao excluir cartão de crédito'

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
        { type: 'CreditCard', id },
        { type: 'CreditCard', id: 'LIST' }
      ]
    })
  })
})

// 🎯 EXPORT DOS HOOKS GERADOS AUTOMATICAMENTE PELO RTK QUERY
export const {
  useGetCreditCardsQuery,
  useGetSingleCreditCardQuery,
  useCreateCreditCardMutation,
  useUpdateCreditCardMutation,
  useDeleteCreditCardMutation
} = creditCardApi
