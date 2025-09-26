// src/api/endpoints/assistantPhone/assistantPhone.ts
import { apiSlice } from '@/api/ApiCreate/apiSlice'

/* ------------------------- 🎯 TYPES ------------------------- */

// Request types
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

// Response types
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
    // Get phone by id
    getAssistantPhone: builder.query<AssistantPhoneResponse, string>({
      query: (phone_id: string) => ({
        url: `/assistant/phone/${phone_id}`,
        method: 'GET',
        headers: { Accept: 'application/json' }
      }),
      transformResponse: (response: any) => response,
      transformErrorResponse: (response: any): AssistantPhoneError => ({
        status: response.status || 500,
        message: response?.data?.message || response?.message || 'Erro ao buscar telefone'
      }),
      providesTags: (result, error, id) => [{ type: 'AssistantPhone', id }]
    }),

    // Create phone
    createAssistantPhone: builder.mutation<AssistantPhoneResponse, CreateAssistantPhoneRequest>({
      query: body => ({
        url: '/assistant/phone',
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
      }),
      transformResponse: (response: any, meta: any) => ({
        message: response?.message || 'Created',
        status: meta?.response?.status || 201,
        data: response?.data || {}
      }),
      transformErrorResponse: (response: any): AssistantPhoneError => ({
        status: response.status || 500,
        message: response?.data?.message || response?.message || 'Erro ao criar telefone'
      }),
      invalidatesTags: [{ type: 'AssistantPhone', id: 'LIST' }]
    }),

    // Update phone
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
      transformResponse: (response: any, meta: any) => ({
        message: response?.message || 'Updated',
        status: meta?.response?.status || 200,
        data: response?.data || {}
      }),
      transformErrorResponse: (response: any): AssistantPhoneError => ({
        status: response.status || 500,
        message: response?.data?.message || response?.message || 'Erro ao atualizar telefone'
      }),
      invalidatesTags: (result, error, { phone_id }) => [
        { type: 'AssistantPhone', id: phone_id },
        { type: 'AssistantPhone', id: 'LIST' }
      ]
    }),

    // Delete phone
    deleteAssistantPhone: builder.mutation<AssistantPhoneResponse, string>({
      query: phone_id => ({
        url: `/assistant/phone/${phone_id}`,
        method: 'DELETE',
        headers: { Accept: 'application/json' }
      }),
      transformResponse: (response: any, meta: any) => {
        if (meta?.response?.status === 204) {
          return { message: 'Deleted successfully', status: 204 }
        }

        return response?.message ? response : { message: 'Deleted successfully', status: meta?.response?.status || 200 }
      },
      transformErrorResponse: (response: any): AssistantPhoneError => ({
        status: response.status || 500,
        message: response?.data?.message || response?.message || 'Erro ao deletar telefone'
      }),
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
