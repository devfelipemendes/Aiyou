// src/api/endpoints/taskAssistantApi.ts
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

// Resposta da API GET /v1/tasksassistant/assistant/{id}
export type GetTaskAssistantResponse = {
  message: string
  status: number
  data: TaskAssistant[]
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
        console.log('🔍 DEBUG - GET tasks by assistant:', response)

        return response
      },
      transformErrorResponse: (response: any): TaskAssistantError => ({
        status: response.status || 500,
        message: response?.data?.message || response?.message || 'Erro ao carregar tarefas do assistente'
      }),
      providesTags: result =>
        result
          ? [
              ...result.data.map(task => ({ type: 'TaskAssistant' as const, id: task.id })),
              { type: 'TaskAssistant', id: 'LIST' }
            ]
          : [{ type: 'TaskAssistant', id: 'LIST' }]
    })
  })
})

/* ------------------------- 🎯 EXPORT HOOKS ------------------------- */
export const { useGetTasksByAssistantQuery } = taskAssistantApi
