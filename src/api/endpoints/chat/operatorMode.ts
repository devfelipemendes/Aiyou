import { apiSlice } from '@/api/ApiCreate/apiSlice'

// 🎯 TIPOS PARA AS RESPOSTAS
export interface OperatorToggleResponse {
  message: string
  success: boolean
  operator: boolean
}

export interface OperatorReplyResponse {
  message: string
  success: boolean
  messageId: string
}

// 🎯 ENDPOINTS DO OPERADOR
export const operatorApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // API 1: Toggle modo operador
    operatorToggle: builder.mutation<OperatorToggleResponse, { protocol: string; operator: boolean }>({
      query: ({ protocol, operator }) => ({
        url: `/chat/${protocol}/operator`,
        method: 'POST',
        body: { operator }
      }),
      transformResponse: (response: OperatorToggleResponse) => {
        console.log('✅ Modo operador atualizado:', response)

        return response
      },
      transformErrorResponse: (response: any) => {
        console.error('❌ Erro ao atualizar modo operador:', response)

        return response
      }
    }),

    // API 2: Enviar mensagem do operador
    operatorReply: builder.mutation<OperatorReplyResponse, { protocol: string; content: string }>({
      query: ({ protocol, content }) => ({
        url: `/chat/${protocol}/reply`,
        method: 'POST',
        body: { content }
      }),
      transformResponse: (response: OperatorReplyResponse) => {
        console.log('✅ Mensagem do operador enviada:', response)

        return response
      },
      transformErrorResponse: (response: any) => {
        console.error('❌ Erro ao enviar mensagem do operador:', response)

        return response
      }
    })
  })
})

export const { useOperatorToggleMutation, useOperatorReplyMutation } = operatorApi
