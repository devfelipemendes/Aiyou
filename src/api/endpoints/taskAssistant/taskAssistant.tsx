// src/api/endpoints/taskAssistantApi.ts
import { toast } from 'react-toastify'

import { apiSlice } from '@/api/ApiCreate/apiSlice'

/* ------------------------- 🎯 TYPES ------------------------- */

// Item individual (relação de um assistente com uma task)
export type TaskAssistant = {
  id: string
  assistant_id: string
  task_id: string
  created_at: string
  updated_at: string
}

// Resposta da API GET /v1/taskassistant/assistant/{id}
export type GetTaskAssistantResponse = {
  message: string
  status: number
  data: TaskAssistant[]
}

// Resposta da API POST /v1/taskassistant
export type CreateTaskAssistantResponse = {
  message: string
  status: number
  data: TaskAssistant
}

// Resposta da API DELETE /v1/taskassistant/{id}
export type DeleteTaskAssistantResponse = {
  message: string
  status: number
}

// Erro
type TaskAssistantError = {
  status: number
  message: string
}

/* ------------------------- 🎯 API ENDPOINTS ------------------------- */
export const taskAssistantApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // GET LIST by Assistant
    getTasksByAssistant: builder.query<GetTaskAssistantResponse, string>({
      query: (assistantId: string) => ({
        url: `/taskassistant/assistant/${assistantId}`,
        method: 'GET',
        headers: { Accept: 'application/json' }
      }),
      transformResponse: (response: GetTaskAssistantResponse) => {
        if (response.data?.length) {
          toast.success(
            `✅ ${response.data.length} ${response.data.length === 1 ? 'tarefa carregada' : 'tarefas carregadas'}`,
            { autoClose: 3000 }
          )
        }

        return response
      },
      transformErrorResponse: (response: any): TaskAssistantError => {
        const msg = response?.data?.message || response?.message || 'Erro ao carregar tarefas do assistente'

        toast.error(`❌ ${msg}`, { autoClose: 5000 })

        return { status: response.status || 500, message: msg }
      },
      providesTags: result =>
        result
          ? [
              ...result.data.map(task => ({ type: 'TaskAssistant' as const, id: task.id })),
              { type: 'TaskAssistant', id: 'LIST' }
            ]
          : [{ type: 'TaskAssistant', id: 'LIST' }]
    }),

    // POST Create TaskAssistant
    createTaskAssistant: builder.mutation<CreateTaskAssistantResponse, { assistant_id: string; task_id: string }>({
      query: body => ({
        url: '/taskassistant',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body
      }),
      transformResponse: (response: any, meta: any) => {
        toast.success(response?.message || '✅ Task atribuída ao assistente!', { autoClose: 3000 })

        return {
          message: response?.message || 'Created',
          status: meta?.response?.status || 201,
          data: response?.data || {}
        }
      },
      transformErrorResponse: (response: any) => {
        const msg = response?.data?.message || response?.message || 'Erro ao atribuir task ao assistente'

        toast.error(`❌ ${msg}`, { autoClose: 5000 })

        return { status: response.status || 500, message: msg }
      },
      invalidatesTags: [{ type: 'TaskAssistant', id: 'LIST' }]
    }),

    // DELETE TaskAssistant
    deleteTaskAssistant: builder.mutation<DeleteTaskAssistantResponse, string>({
      query: (id: string) => ({
        url: `/taskassistant/${id}`,
        method: 'DELETE',
        headers: { Accept: 'application/json' }
      }),
      transformResponse: (response: any, meta: any) => {
        const status = meta?.response?.status || 200
        const message = response?.message || (status === 204 ? 'Task desvinculada com sucesso!' : 'Task removida!')

        toast.success(`✅ ${message}`, { autoClose: 3000 })

        return { message, status }
      },
      transformErrorResponse: (response: any): TaskAssistantError => {
        const msg = response?.data?.message || response?.message || 'Erro ao remover task do assistente'

        toast.error(`❌ ${msg}`, { autoClose: 5000 })

        return { status: response.status || 500, message: msg }
      },
      invalidatesTags: (result, error, id) => [
        { type: 'TaskAssistant', id },
        { type: 'TaskAssistant', id: 'LIST' }
      ]
    })
  })
})

/* ------------------------- 🎯 EXPORT HOOKS ------------------------- */
export const { useGetTasksByAssistantQuery, useCreateTaskAssistantMutation, useDeleteTaskAssistantMutation } =
  taskAssistantApi
