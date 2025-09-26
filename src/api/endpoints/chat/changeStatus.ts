// src/api/endpoints/chat/status.ts
import { toast } from 'react-toastify'

import { apiSlice } from '@/api/ApiCreate/apiSlice'

// 🎯 TIPOS PARA O REQUEST
export type UpdateChatStatusRequest = {
  protocol: string
  status: 'inactive' | 'active' | 'resolved' | 'unresolved'
}

// 🎯 TIPOS PARA A RESPONSE
export type UpdateChatStatusResponse = {
  message: string
  status: number
  data: {
    content: string
  }
}

// 🎯 TIPO PARA ERROS
type ChatStatusError = {
  status: number
  message: string
}

// 🎯 API ENDPOINT
export const chatStatusApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // 🎯 UPDATE CHAT STATUS
    updateChatStatus: builder.mutation<UpdateChatStatusResponse, UpdateChatStatusRequest>({
      query: ({ protocol, status }) => ({
        url: `/chat/${protocol}/status`,
        method: 'POST',
        body: { status },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: UpdateChatStatusResponse, meta: any, arg: UpdateChatStatusRequest) => {
        console.log('🔍 DEBUG - Resposta do update status:', response)

        // Mapear status para mensagens mais amigáveis
        const statusMessages = {
          inactive: 'Chat marcado como inativo',
          active: 'Chat marcado como ativo',
          resolved: 'Chat marcado como resolvido',
          unresolved: 'Chat marcado como não resolvido'
        }

        // Usar mensagem personalizada baseada no status ou mensagem do backend
        const customMessage = statusMessages[arg.status]
        const message = response.data?.content || customMessage || 'Status alterado com sucesso'

        // Toast de sucesso
        toast.success(message, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        })

        return response
      },

      transformErrorResponse: (response: any): ChatStatusError => {
        console.error('❌ Erro ao alterar status do chat:', response)

        const errorMessage = response?.data?.message || response?.message || 'Erro ao alterar status do chat'

        toast.error(`❌ Erro ao alterar status: ${errorMessage}`, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        })

        return {
          status: response.status || 500,
          message: errorMessage
        }
      },

      invalidatesTags: (result, error, { protocol }) => [
        { type: 'Chat', id: protocol },
        { type: 'Chat', id: 'LIST' }
      ]
    })
  })
})

// 🎯 EXPORT DO HOOK
export const { useUpdateChatStatusMutation } = chatStatusApi
