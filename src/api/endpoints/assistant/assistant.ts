// src/api/endpoints/assistant/assistant.ts
import { toast } from 'react-toastify'

import { apiSlice } from '@/api/ApiCreate/apiSlice'

// 🎯 TIPOS PARA O REQUEST DE CRIAÇÃO
export type CreateAssistantRequest = {
  project_id: string
  name: string
}

// 🎯 TIPOS PARA O REQUEST DE UPDATE
export type UpdateAssistantRequest = {
  id: string // ID do assistente a ser atualizado
  project_id: string
  name: string
}

// 🎯 TIPOS PARA O REQUEST DE DELETE
export type DeleteAssistantRequest = {
  id: string // ID do assistente a ser deletado
}

// 🎯 TIPOS PARA A RESPONSE DE DELETE (pode ser vazia com status 204)
export type DeleteAssistantResponse = {
  message: string
  status: number
  data?: any // Opcional, pois pode ser vazio com status 204
}

// 🎯 TIPOS PARA UM ASSISTENTE INDIVIDUAL (baseado na resposta real do backend)

// Assistant no CREATE/UPDATE/GET_SINGLE (estrutura completa)
export type Assistant = {
  id: string
  project_id: string
  name: string
  openai_id: string
  created_at: string
  updated_at: string
  about: string
  company: string
  first_contact: string
  about_functions: string
  special_conditions: string
  steps: string
  output_format: string
  notes: string
  phones: any[]
}

// Assistant no GET_ALL (estrutura simplificada dentro do projeto)
export type AssistantInList = {
  id: string
  name: string
  img_url: string | null
  description: string | null
  phones: any[] // Array de telefones (pode ser tipado melhor depois)
}

// Projeto com seus assistentes (estrutura do GET_ALL)
export type ProjectWithAssistants = {
  project_name: string
  project_id: string
  assistants: AssistantInList[]
}

// Assistant processado para a UI (combinando dados do projeto + assistente)
export type ProcessedAssistant = {
  id: string
  name: string
  img_url: string | null
  description: string | null
  phones: any[]
  project_id: string
  project_name: string
}

// 🎯 TIPOS PARA FUNÇÕES (para uso futuro, quando implementar functions no assistente)
export type ApiFunction = {
  name: string
  description?: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  return_message?: string
  method_id: string
  api_id: string
  active: boolean
  working: boolean
  parameters: Parameter[]
  paramReturns: string[]
}

export type Parameter = {
  id: string
  name: string
  description?: string
  type: 'String' | 'Number' | 'Boolean' | 'Array' | 'Object'
  required: boolean
  in_api: boolean
  is_header: boolean
  is_subparameter: boolean
  example_value?: string
}

// 🎯 TIPOS PARA A RESPONSE DE GET (listagem)
export type GetAssistantsResponse = {
  message: string
  status: number
  data: ProjectWithAssistants[]
}

// Response processada (lista de assistentes "achatada" para a UI)
export type ProcessedGetAssistantsResponse = {
  message: string
  status: number
  data: ProcessedAssistant[]
}

// 🎯 TIPOS PARA A RESPONSE DE CREATE
export type CreateAssistantResponse = {
  message: string
  status: number
  data: Assistant
}

// 🎯 TIPOS PARA A RESPONSE DE UPDATE
export type UpdateAssistantResponse = {
  message: string
  status: number
  data: Assistant
}

// 🎯 TIPOS PARA A RESPONSE DE GET SINGLE
export type GetSingleAssistantResponse = {
  message: string
  status: number
  data: Assistant
}

// 🎯 TIPO PARA ERROS (estrutura real do backend)
type AssistantError = {
  status: number
  message: string
}

// 🎯 API ENDPOINTS
export const assistantApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // 🎯 GET ASSISTANTS (listagem)
    getAssistants: builder.query<ProcessedGetAssistantsResponse, void>({
      query: () => ({
        url: '/assistant',
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetAssistantsResponse): ProcessedGetAssistantsResponse => {
        console.log('🔍 DEBUG - Estrutura da resposta GET assistants:', response)

        // "Achatar" os dados: extrair assistentes de todos os projetos e adicionar info do projeto
        const processedAssistants: ProcessedAssistant[] = []

        response.data.forEach(project => {
          project.assistants.forEach(assistant => {
            processedAssistants.push({
              ...assistant,
              project_id: project.project_id,
              project_name: project.project_name
            })
          })
        })

        const count = processedAssistants.length
        const projectsWithAssistants = response.data.filter(p => p.assistants.length > 0)

        console.log('✅ Assistentes carregados:', count, count === 1 ? 'assistente' : 'assistentes')
        console.log('📊 Projetos com assistentes:', projectsWithAssistants.length)

        // Toast de sucesso apenas quando há assistentes
        if (count > 0) {
          toast.success(`🤖 ${count} ${count === 1 ? 'assistente carregado' : 'assistentes carregados'} com sucesso!`, {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          })
        }

        return {
          message: response.message,
          status: response.status,
          data: processedAssistants
        }
      },

      transformErrorResponse: (response: any): AssistantError => {
        console.error('❌ Erro ao carregar assistentes:', response)

        const errorMessage = response?.data?.message || response?.message || 'Erro ao carregar assistentes'

        toast.error(`❌ Erro ao carregar assistentes: ${errorMessage}`, {
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

      providesTags: result =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Assistant' as const, id })), { type: 'Assistant', id: 'LIST' }]
          : [{ type: 'Assistant', id: 'LIST' }]
    }),

    // 🎯 GET SINGLE ASSISTANT
    getSingleAssistant: builder.query<GetSingleAssistantResponse, string>({
      query: id => ({
        url: `/assistant/${id}`,
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetSingleAssistantResponse) => {
        console.log('🔍 DEBUG - Assistente único carregado:', response.data.name, 'OpenAI ID:', response.data.openai_id)

        // Toast de sucesso para assistente específico
        toast.success(`🤖 Assistente "${response.data.name}" carregado com sucesso!`, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        })

        return response
      },

      transformErrorResponse: (response: any): AssistantError => {
        console.error('❌ Erro ao carregar assistente:', response)

        const errorMessage = response?.data?.message || response?.message || 'Erro ao carregar assistente'

        toast.error(`❌ Erro ao carregar assistente: ${errorMessage}`, {
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

      providesTags: (result, error, id) => [{ type: 'Assistant', id }]
    }),

    // 🎯 CREATE ASSISTANT
    createAssistant: builder.mutation<CreateAssistantResponse, CreateAssistantRequest>({
      query: data => ({
        url: '/assistant',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: any, meta: any) => {
        console.log('🔍 DEBUG - Resposta RAW do CREATE assistant:', response)
        console.log('🔍 DEBUG - Meta do CREATE:', meta)
        console.log('🔍 DEBUG - Status HTTP:', meta?.response?.status)

        const httpStatus = meta?.response?.status

        // ✅ STATUS 201/200 com dados (estrutura padrão)
        if (response && response.data && response.message) {
          console.log('✅ CREATE estrutura padrão detectada (status', httpStatus, ')')
          console.log('✅ Assistente criado:', response.data.name, 'OpenAI ID:', response.data.openai_id)

          // Toast de sucesso para criação
          toast.success(`🎉 Assistente "${response.data.name}" criado com sucesso!`, {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          })

          return response as CreateAssistantResponse
        }

        // ✅ STATUS 201/200 com dados diretos (sem wrapper)
        if (response && response.id) {
          console.log('✅ CREATE estrutura alternativa detectada (dados diretos, status', httpStatus, ')')

          // Toast de sucesso para criação
          toast.success(`🎉 Assistente "${response.name || 'Novo assistente'}" criado com sucesso!`, {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          })

          return {
            message: 'Created',
            status: httpStatus || 201,
            data: response
          } as CreateAssistantResponse
        }

        // ✅ QUALQUER STATUS 2xx é considerado sucesso
        if (httpStatus >= 200 && httpStatus < 300) {
          console.log('✅ CREATE bem-sucedido - Status 2xx:', httpStatus)

          // Toast de sucesso genérico
          toast.success('🎉 Assistente criado com sucesso!', {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          })

          return {
            message: 'Created successfully',
            status: httpStatus,
            data: response || { id: 'unknown' }
          } as CreateAssistantResponse
        }

        // ❌ STATUS INESPERADO
        console.error('❌ CREATE: Status inesperado:', httpStatus)
        console.error('❌ CREATE: Response completa:', JSON.stringify(response, null, 2))

        return {
          message: 'Created',
          status: httpStatus || 201,
          data: response || {}
        } as CreateAssistantResponse
      },

      transformErrorResponse: (response: any): AssistantError => {
        console.error('❌ Erro ao criar assistente:', response)

        const errorMessage = response?.data?.error || response?.message || 'Erro ao criar assistente'

        toast.error(`❌ Erro ao criar assistente: ${errorMessage}`, {
          position: 'top-right',
          autoClose: 6000,
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

      invalidatesTags: [{ type: 'Assistant', id: 'LIST' }]
    }),

    // 🎯 UPDATE ASSISTANT
    updateAssistant: builder.mutation<UpdateAssistantResponse, UpdateAssistantRequest>({
      query: ({ id, ...data }) => ({
        url: `/assistant/${id}`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: any, meta: any) => {
        console.log('🔍 DEBUG - Resposta RAW do PUT assistant:', response)
        console.log('🔍 DEBUG - Meta do PUT (com status HTTP):', meta)
        console.log('🔍 DEBUG - Status HTTP:', meta?.response?.status)

        const httpStatus = meta?.response?.status

        console.log('🔍 HTTP Status recebido:', httpStatus)

        // ✅ STATUS 200/201 com dados (estrutura padrão)
        if (response && response.data && response.message) {
          console.log('✅ Estrutura padrão detectada (status', httpStatus, ')')
          console.log('✅ Assistente atualizado:', response.data.name || 'Nome não encontrado')

          // Toast de sucesso para atualização
          toast.success(`✏️ Assistente "${response.data.name || 'assistente'}" atualizado com sucesso!`, {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          })

          return response as UpdateAssistantResponse
        }

        // ✅ STATUS 200/201 com dados diretos (sem wrapper)
        if (response && response.id) {
          console.log('✅ Estrutura alternativa detectada (dados diretos, status', httpStatus, ')')

          // Toast de sucesso para atualização
          toast.success(`✏️ Assistente "${response.name || 'assistente'}" atualizado com sucesso!`, {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          })

          return {
            message: 'Updated',
            status: httpStatus || 200,
            data: response
          } as UpdateAssistantResponse
        }

        // ✅ STATUS 204 (No Content) - sucesso sem dados
        if (httpStatus === 204) {
          console.log('✅ UPDATE bem-sucedido - Status 204 (No Content)')

          // Toast de sucesso genérico
          toast.success('✏️ Assistente atualizado com sucesso!', {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          })

          return {
            message: 'Updated successfully',
            status: 204,
            data: { id: 'unknown' }
          } as UpdateAssistantResponse
        }

        // ✅ QUALQUER STATUS 2xx é considerado sucesso
        if (httpStatus >= 200 && httpStatus < 300) {
          console.log('✅ UPDATE bem-sucedido - Status 2xx genérico:', httpStatus)

          // Toast de sucesso genérico
          toast.success('✏️ Assistente atualizado com sucesso!', {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          })

          return {
            message: 'Updated successfully',
            status: httpStatus,
            data: response || { id: 'unknown' }
          } as UpdateAssistantResponse
        }

        // ❌ STATUS INESPERADO
        console.error('❌ ATENÇÃO: Status inesperado:', httpStatus)
        console.error('❌ Response completa:', JSON.stringify(response, null, 2))

        return {
          message: 'Updated',
          status: httpStatus || 200,
          data: response || {}
        } as UpdateAssistantResponse
      },

      transformErrorResponse: (response: any): AssistantError => {
        console.error('❌ transformErrorResponse - Erro ao atualizar assistente:', response)

        const errorMessage = response?.data?.message || response?.message || 'Erro ao atualizar assistente'

        toast.error(`❌ Erro ao atualizar assistente: ${errorMessage}`, {
          position: 'top-right',
          autoClose: 6000,
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

      invalidatesTags: (result, error, { id }) => [
        { type: 'Assistant', id },
        { type: 'Assistant', id: 'LIST' }
      ]
    }),

    // 🎯 DELETE ASSISTANT
    deleteAssistant: builder.mutation<DeleteAssistantResponse, DeleteAssistantRequest>({
      query: ({ id }) => ({
        url: `/assistant/${id}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: any, meta: any) => {
        console.log('🔍 DEBUG - Resposta RAW do DELETE assistant:', response)
        console.log('🔍 DEBUG - Meta do DELETE (com status HTTP):', meta)

        // ✅ STATUS 204 (No Content) é sucesso padrão para DELETE
        if (meta?.response?.status === 204) {
          console.log('✅ DELETE bem-sucedido - Status 204 (No Content)')

          // Toast de sucesso para exclusão
          toast.success('🗑️ Assistente deletado com sucesso!', {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          })

          return {
            message: 'Deleted successfully',
            status: 204
          } as DeleteAssistantResponse
        }

        // ✅ STATUS 200 com conteúdo (estrutura padrão)
        if (response && response.message) {
          console.log('✅ DELETE bem-sucedido - Status 200 com dados')

          // Toast de sucesso para exclusão
          toast.success('🗑️ Assistente deletado com sucesso!', {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          })

          return response as DeleteAssistantResponse
        }

        // ✅ FALLBACK: Qualquer resposta com status 2xx é considerada sucesso
        console.log('✅ DELETE bem-sucedido - Fallback')

        // Toast de sucesso genérico
        toast.success('🗑️ Assistente deletado com sucesso!', {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        })

        return {
          message: 'Deleted successfully',
          status: meta?.response?.status || 200
        } as DeleteAssistantResponse
      },

      transformErrorResponse: (response: any): AssistantError => {
        console.error('❌ transformErrorResponse - Erro ao deletar assistente:', response)

        const errorMessage = response?.data?.message || response?.message || 'Erro ao deletar assistente'

        toast.error(`❌ Erro ao deletar assistente: ${errorMessage}`, {
          position: 'top-right',
          autoClose: 6000,
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

      invalidatesTags: (result, error, { id }) => [
        { type: 'Assistant', id },
        { type: 'Assistant', id: 'LIST' }
      ]
    })
  })
})

// 🎯 EXPORTAR HOOKS
export const {
  useGetAssistantsQuery,
  useGetSingleAssistantQuery,
  useCreateAssistantMutation,
  useUpdateAssistantMutation,
  useDeleteAssistantMutation
} = assistantApi

// 🎯 SELETORES (opcional, seguindo padrão dos projetos)
export const selectAssistantsData = (state: any): ProcessedAssistant[] =>
  assistantApi.endpoints.getAssistants.select()(state)?.data?.data || []

export const selectAssistantsCount = (state: any): number => selectAssistantsData(state).length

export const selectAssistantsByProject = (state: any, projectId: string): ProcessedAssistant[] =>
  selectAssistantsData(state).filter(assistant => assistant.project_id === projectId)
