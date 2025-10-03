import { apiSlice } from '@/api/ApiCreate/apiSlice'

export type CompleteFirstAccessResponse = {
  message: string
  status: number
  data?: {
    success: boolean
    user_updated: boolean
  }
}

type FirstAccessError = {
  status: number
  message: string
}

export const firstAccessApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    completeFirstAccess: builder.mutation<CompleteFirstAccessResponse, void>({
      query: () => ({
        url: '/firstAccess',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: CompleteFirstAccessResponse) => {
        console.log('✅ Primeiro acesso marcado como concluído:', response)

        return response
      },

      transformErrorResponse: (response: any): FirstAccessError => {
        console.error('❌ Erro ao marcar primeiro acesso:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao completar primeiro acesso'
        }
      },
      invalidatesTags: ['User']
    })
  })
})

export const { useCompleteFirstAccessMutation } = firstAccessApi
