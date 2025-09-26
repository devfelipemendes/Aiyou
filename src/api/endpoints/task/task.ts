// src/api/endpoints/task/task.ts
import { toast } from 'react-toastify'

import { apiSlice } from '@/api/ApiCreate/apiSlice'

// 🎯 TIPOS PARA PARÂMETROS DA TASK (baseado no JSON que você passou)
export type TaskParameter = {
  id?: string
  name: string
  description: string
  type: 'String' | 'Number' | 'Boolean' | 'Array' | 'Object'
  required: boolean
  in_api: boolean
  is_header: boolean
  is_subparameter: boolean
  paip_id?: string | null
  default_value?: string | null
  data?: TaskParameter[] // Para parâmetros aninhados recursivos
}

// 🎯 TIPOS PARA O REQUEST DE CRIAÇÃO
export type CreateTaskRequest = {
  name: string
  description: string
  endpoint: string
  method_id: string
  api_id: string
  instruction: string
  variable: boolean
  active: boolean
  Parameters: TaskParameter[]
  ParamReturns: string[]
}

// 🎯 TIPOS PARA O REQUEST DE UPDATE
export type UpdateTaskRequest = {
  id: string // ID da task a ser atualizada
  name: string
  description: string
  endpoint: string
  method_id: string
  api_id: string
  instruction: string
  variable: boolean
  Parameters: TaskParameter[]
  ParamReturns: string[]
}

// 🎯 TIPOS PARA O REQUEST DE DELETE
export type DeleteTaskRequest = {
  id: string // ID da task a ser deletada
}

// 🎯 TIPOS PARA A RESPONSE DE DELETE
export type DeleteTaskResponse = {
  message: string
  status: number
  data?: any
}

// 🎯 TIPOS PARA UMA TASK INDIVIDUAL (baseado no JSON que você passou)
export type Task = {
  id: string
  name: string
  description: string
  endpoint: string
  active: boolean
  working: boolean
  variable: boolean
  api_id: string
  method_id: string
  instruction: string
  created_at: string
  updated_at: string

  pai_parameters?: TaskParameterFull[] // Parâmetros completos da API (com IDs do BD)
  returns?: TaskReturn[] // Retornos configurados
}

// 🎯 TIPOS PARA PARÂMETROS COMPLETOS (com dados do BD)
export type TaskParameterFull = {
  id: string
  name: string
  description: string
  type: 'String' | 'Number' | 'Boolean' | 'Array' | 'Object'
  required: boolean
  in_api: boolean
  is_header: boolean
  is_subparameter: boolean
  default_value?: string | null
  created_at: string
  updated_at: string
  paip_id?: string | null
  task_id: string
  sub_parameters_recursivo: TaskParameterFull[] // Filhos recursivos
}

// 🎯 TIPOS PARA RETORNOS CONFIGURADOS
export type TaskReturn = {
  id: string
  name: string
  created_at: string
  updated_at: string
  task_id: string
}

// 🎯 TIPOS PARA A RESPONSE DE GET (listagem)
export type GetTasksResponse = {
  message: string
  status: number
  data: Task[]
}

// 🎯 TIPOS PARA A RESPONSE DE CREATE
export type CreateTaskResponse = {
  message: string
  status: number
  data: Task
}

// 🎯 TIPOS PARA A RESPONSE DE UPDATE
export type UpdateTaskResponse = {
  message: string
  status: number
  data: Task
}

// 🎯 TIPOS PARA A RESPONSE DE GET SINGLE (com parâmetros completos)
export type GetSingleTaskResponse = {
  message: string
  status: number
  data: {
    id: string
    name: string
    description: string
    endpoint: string
    instruction: string
    active: boolean
    working: boolean
    variable: boolean
    created_at: string
    updated_at: string
    method_id: string
    api_id: string
    pai_parameters: TaskParameterFull[]
    returns: TaskReturn[]
  }
}

// 🎯 TIPO PARA ERROS (estrutura padrão do backend)
type TaskError = {
  status: number
  message: string
}

// 🎯 API ENDPOINTS
export const taskApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // 🎯 GET TASKS (listagem)
    getTasks: builder.query<GetTasksResponse, void>({
      query: () => ({
        url: '/task',
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetTasksResponse) => {
        console.log('🔍 DEBUG - Estrutura da resposta GET tasks:', response)
        const count = response?.data?.length || 0

        console.log('✅ Tasks carregadas:', count, count === 1 ? 'task' : 'tasks')

        return response
      },

      transformErrorResponse: (response: any): TaskError => {
        console.error('❌ Erro ao carregar tasks:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar tasks'
        }
      },

      // 🎯 TAG PARA CACHE E INVALIDAÇÃO
      providesTags: result =>
        result?.data
          ? [{ type: 'Task', id: 'LIST' }, ...result.data.map(task => ({ type: 'Task' as const, id: task.id }))]
          : [{ type: 'Task', id: 'LIST' }]
    }),

    // 🎯 GET SINGLE TASK (com parâmetros completos)
    getSingleTask: builder.query<GetSingleTaskResponse, string>({
      query: id => ({
        url: `/task/${id}`,
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetSingleTaskResponse) => {
        console.log('🔍 DEBUG - Task individual carregada:', response.data.name)
        console.log('📋 Parâmetros encontrados:', response.data.pai_parameters.length)
        console.log('📤 Retornos configurados:', response.data.returns.length)

        return response
      },

      transformErrorResponse: (response: any): TaskError => {
        console.error('❌ Erro ao carregar task individual:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar task'
        }
      },

      providesTags: (result, error, id) => [{ type: 'Task', id }]
    }),

    // 🎯 CREATE TASK
    createTask: builder.mutation<CreateTaskResponse, CreateTaskRequest>({
      query: newTask => ({
        url: '/task',
        method: 'POST',
        body: newTask,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }),

      transformResponse: (response: CreateTaskResponse) => {
        console.log('✅ Task criada com sucesso:', response.data.name)
        toast.success(`Task "${response.data.name}" criada com sucesso!`)

        return response
      },

      transformErrorResponse: (response: any): TaskError => {
        const errorMsg = response?.data?.message || response?.message || 'Erro ao criar task'

        console.error('❌ Erro ao criar task:', response)
        toast.error('Erro ao criar task: ' + errorMsg)

        return {
          status: response.status || 500,
          message: errorMsg
        }
      },

      invalidatesTags: [{ type: 'Task', id: 'LIST' }]
    }),

    // 🎯 UPDATE TASK
    updateTask: builder.mutation<UpdateTaskResponse, UpdateTaskRequest>({
      query: ({ id, ...updateData }) => ({
        url: `/task/${id}`,
        method: 'PUT',
        body: updateData,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }),

      transformResponse: (response: UpdateTaskResponse) => {
        console.log('✅ Task atualizada com sucesso:', response.data.name)
        toast.success(`Task "${response.data.name}" atualizada com sucesso!`)

        return response
      },

      transformErrorResponse: (response: any): TaskError => {
        const errorMsg = response?.data?.message || response?.message || 'Erro ao atualizar task'

        console.error('❌ Erro ao atualizar task:', response)
        toast.error('Erro ao atualizar task: ' + errorMsg)

        return {
          status: response.status || 500,
          message: errorMsg
        }
      },

      invalidatesTags: (result, error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' }
      ]
    }),

    // 🎯 DELETE TASK
    deleteTask: builder.mutation<DeleteTaskResponse, DeleteTaskRequest>({
      query: ({ id }) => ({
        url: `/task/${id}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: any, meta: any) => {
        const httpStatus = meta?.response?.status

        try {
          // 🎯 LÓGICA PARA STATUS 204 (No Content)
          if (httpStatus === 204) {
            toast.success('Task deletada com sucesso!')

            return {
              message: 'Task deletada com sucesso',
              status: 204,
              data: null
            }
          }

          // 🎯 RESPOSTA VAZIA MAS SUCESSO
          if (
            (response === null || response === undefined || response === '') &&
            (httpStatus === undefined || httpStatus === null)
          ) {
            toast.success('Task deletada com sucesso!')

            return {
              message: 'Task deletada com sucesso',
              status: 204,
              data: null
            }
          }

          // 🎯 STATUS 200 COM CONTEÚDO
          if (httpStatus === 200) {
            toast.success('Task deletada com sucesso!')

            return response?.message
              ? response
              : {
                  message: 'Task deletada com sucesso',
                  status: 200,
                  data: response
                }
          }

          // 🎯 OUTROS STATUS DE SUCESSO (2xx)
          if (httpStatus >= 200 && httpStatus < 300) {
            toast.success('Task deletada com sucesso!')

            return {
              message: 'Task deletada com sucesso',
              status: httpStatus,
              data: response || null
            }
          }

          // 🎯 ERROS 4xx/5xx
          if (httpStatus >= 400) {
            toast.error('Erro ao deletar task: ' + (response?.message || `Erro HTTP ${httpStatus}`))
            throw new Error(response?.message || `Erro HTTP ${httpStatus}`)
          }

          // 🎯 FALLBACK DE SUCESSO
          toast.success('Task deletada com sucesso!')

          return {
            message: 'Task deletada com sucesso',
            status: httpStatus || 204,
            data: response || null
          }
        } catch (error) {
          toast.error('Erro ao deletar task: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
          throw error
        }
      },

      transformErrorResponse: (response: any): TaskError => {
        toast.error('Erro ao deletar task: ' + (response?.data?.message || response?.message || 'Erro desconhecido'))

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao deletar task'
        }
      },

      invalidatesTags: (result, error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' }
      ]
    })
  }),
  overrideExisting: true
})

// 🎯 EXPORT DOS HOOKS GERADOS
export const {
  useGetTasksQuery,
  useGetSingleTaskQuery,
  useLazyGetSingleTaskQuery, // <-- aqui está o lazy hook
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation
} = taskApi
