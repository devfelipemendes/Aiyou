import { apiSlice } from '@/api/ApiCreate/apiSlice'

// 🎯 TIPOS PARA INTERVENÇÃO DO OPERADOR
export interface OperatorInterventionRequest {
  content: string
}

export interface OperatorInterventionResponse {
  message: string
  success: boolean
}

interface OperatorInterventionError {
  status: number
  message: string
}

// 🎯 ENDPOINT DO OPERADOR
export const operatorApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    operatorIntervention: builder.mutation<OperatorInterventionResponse, { questionId: string; content: string }>({
      query: ({ questionId, content }) => ({
        url: `/chat/operator/${questionId}`,
        method: 'POST',
        body: {
          content
        }
      }),

      transformResponse: (response: OperatorInterventionResponse) => {
        console.log('✅ Intervenção do operador enviada:', response)

        return response
      },

      transformErrorResponse: (response: any): OperatorInterventionError => {
        console.error('❌ Erro na intervenção do operador:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao enviar intervenção do operador'
        }
      },

      invalidatesTags: (result, error, { questionId }) => [
        'ActiveChats',
        { type: 'Chat', id: 'LIST' },
        { type: 'Chat', id: questionId },
        'ProtocolHistory',
        { type: 'ProtocolHistoryItem', id: questionId }
      ]
    })
  })
})

export const { useOperatorInterventionMutation } = operatorApi
