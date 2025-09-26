// src/api/endpoints/assistantPhone/assistantPhone.ts
import { toast } from 'react-toastify'

import { apiSlice } from '@/api/ApiCreate/apiSlice'

/* ------------------------- 🎯 TYPES ------------------------- */
export interface CreateAssistantPhoneRequest {
  assistant_id: string
  phone: string
  wa_id: string
  wa_key: string
}

export interface UpdateAssistantPhoneRequest {
  assistant_id: string
  phone: string
  wa_id: string
  wa_key: string
}

export interface AssistantPhone {
  id: string
  assistant_id: string
  phone: string
  wa_id: string
  wa_key: string
  created_at: string
  updated_at: string
}

export interface AssistantPhoneResponse {
  message: string
  status: number
  data?: AssistantPhone
}

export interface AssistantPhoneError {
  status: number
  message: string
}

/* ------------------------- 🎯 API ENDPOINTS ------------------------- */
export const assistantPhoneApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getAssistantPhone: builder.query<AssistantPhoneResponse, string>({
      query: (phone_id: string) => ({
        url: `/assistant/phone/${phone_id}`,
        method: 'GET',
        headers: { Accept: 'application/json' }
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          toast.success(`✅ Telefone carregado!`, { autoClose: 3000 })
        }

        return response
      },
      transformErrorResponse: (response: any): AssistantPhoneError => {
        const msg = response?.data?.message || response?.message || 'Erro ao buscar telefone'

        toast.error(`❌ ${msg}`, { autoClose: 5000 })

        return { status: response.status || 500, message: msg }
      },
      providesTags: (result, error, id) => [{ type: 'AssistantPhone', id }]
    }),

    createAssistantPhone: builder.mutation<AssistantPhoneResponse, CreateAssistantPhoneRequest>({
      query: body => ({
        url: '/assistant/phone',
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
      }),
      transformResponse: (response: any, meta: any) => {
        toast.success(response?.message || '✅ Telefone criado!', { autoClose: 3000 })

        return {
          message: response?.message || 'Created',
          status: meta?.response?.status || 201,
          data: response?.data || {}
        }
      },
      transformErrorResponse: (response: any): AssistantPhoneError => {
        const msg = response?.data?.message || response?.message || 'Erro ao criar telefone'

        toast.error(`❌ ${msg}`, { autoClose: 5000 })

        return { status: response.status || 500, message: msg }
      },
      invalidatesTags: [{ type: 'AssistantPhone', id: 'LIST' }]
    }),

    updateAssistantPhone: builder.mutation<
      AssistantPhoneResponse,
      { phone_id: string; data: UpdateAssistantPhoneRequest }
    >({
      query: ({ phone_id, data }) => ({
        url: `/assistant/phone/${phone_id}`,
        method: 'PUT',
        body: data,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
      }),
      transformResponse: (response: any, meta: any) => {
        toast.success(response?.message || '✅ Telefone atualizado!', { autoClose: 3000 })

        return {
          message: response?.message || 'Updated',
          status: meta?.response?.status || 200,
          data: response?.data || {}
        }
      },
      transformErrorResponse: (response: any): AssistantPhoneError => {
        const msg = response?.data?.message || response?.message || 'Erro ao atualizar telefone'

        toast.error(`❌ ${msg}`, { autoClose: 5000 })

        return { status: response.status || 500, message: msg }
      },
      invalidatesTags: (result, error, { phone_id }) => [
        { type: 'AssistantPhone', id: phone_id },
        { type: 'AssistantPhone', id: 'LIST' }
      ]
    }),

    deleteAssistantPhone: builder.mutation<AssistantPhoneResponse, string>({
      query: phone_id => ({
        url: `/assistant/phone/${phone_id}`,
        method: 'DELETE',
        headers: { Accept: 'application/json' }
      }),
      transformResponse: (response: any, meta: any) => {
        const result =
          meta?.response?.status === 204
            ? { message: 'Deleted successfully', status: 204 }
            : response?.message
              ? response
              : { message: 'Deleted successfully', status: meta?.response?.status || 200 }

        toast.success(result.message || '✅ Telefone deletado!', { autoClose: 3000 })

        return result
      },
      transformErrorResponse: (response: any): AssistantPhoneError => {
        const msg = response?.data?.message || response?.message || 'Erro ao deletar telefone'

        toast.error(`❌ ${msg}`, { autoClose: 5000 })

        return { status: response.status || 500, message: msg }
      },
      invalidatesTags: (result, error, id) => [
        { type: 'AssistantPhone', id },
        { type: 'AssistantPhone', id: 'LIST' }
      ]
    })
  })
})

/* ------------------------- 🎯 EXPORT HOOKS ------------------------- */
export const {
  useGetAssistantPhoneQuery,
  useCreateAssistantPhoneMutation,
  useUpdateAssistantPhoneMutation,
  useDeleteAssistantPhoneMutation
} = assistantPhoneApi
