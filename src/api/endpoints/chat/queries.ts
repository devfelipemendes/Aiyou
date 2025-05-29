import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// src/api/chat/queries.ts

import type { ChatDataType, ContactType, StatusType } from '@/types/chatTypes'
import { apiClient } from '@/api/AxiosCreate/apiClient'

// Buscar todos os chats
export const useChats = () => {
  return useQuery<ChatDataType>({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await apiClient.get('/chats')

      return response.data
    }
  })
}

// Buscar um contato específico
export const useContact = (id: number) => {
  return useQuery<ContactType>({
    queryKey: ['contact', id],
    queryFn: async () => {
      const response = await apiClient.get(`/contacts/${id}`)

      return response.data
    }
  })
}

// Enviar mensagem
export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, message }: { userId: number; message: string }) => {
      const response = await apiClient.post('/messages', { userId, message })

      return response.data
    },
    onSuccess: () => {
      // Invalidar a query de chats para forçar atualização
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    }
  })
}

// Atualizar status do usuário
export const useUpdateStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (status: StatusType) => {
      const response = await apiClient.patch('/profile/status', { status })

      return response.data
    },
    onSuccess: () => {
      // Invalidar a query de perfil para forçar atualização
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })
}
