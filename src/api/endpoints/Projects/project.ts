// src/api/endpoints/Projects/project.ts
import { apiSlice } from '@/api/ApiCreate/apiSlice'

// 🎯 TIPOS PARA O REQUEST DE CRIAÇÃO
export type CreateProjectRequest = {
  name: string
  description: string
  img_url?: string // Opcional se enviarmos arquivo
  image?: File // Para upload de arquivo
}

// 🎯 TIPOS PARA O REQUEST DE UPDATE
export type UpdateProjectRequest = {
  id: string // ID do projeto a ser atualizado
  name?: string
  description?: string
  img_url?: string
  image?: File
}

// 🎯 TIPOS PARA O REQUEST DE DELETE
export type DeleteProjectRequest = {
  id: string // ID do projeto a ser deletado
}

// 🎯 TIPOS PARA A RESPONSE DE DELETE
export type DeleteProjectResponse = {
  message: string
  status: number
}

// 🎯 TIPOS PARA UM PROJETO INDIVIDUAL
export type Project = {
  id: string
  user_id: string
  name: string
  description: string
  img_url: string | null
  created_at: string
  updated_at: string
  used_tokens: number
  assistants?: any
}

// 🎯 TIPOS PARA A RESPONSE DE GET (listagem)
export type GetProjectsResponse = {
  message: string
  status: number
  data: Project[]
}

// 🎯 TIPO PARA A RESPONSE DE GET BY ID
export type GetProjectByIdResponse = {
  message: string
  status: number
  data: Project
}

// 🎯 TIPOS PARA A RESPONSE DE CREATE
export type CreateProjectResponse = {
  message: string
  status: number
  data: Project
}

// 🎯 TIPOS PARA A RESPONSE DE UPDATE
export type UpdateProjectResponse = {
  message: string
  status: number
  data: Project
}

// 🎯 TIPO PARA ERROS (estrutura real do backend)
type ProjectError = {
  status: number
  message: string
}

// 🎯 API ENDPOINTS
export const projectApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // 🎯 NOVO ENDPOINT - GET PROJECTS (listagem)
    getProjects: builder.query<GetProjectsResponse, void>({
      query: () => ({
        url: '/project',
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetProjectsResponse) => {
        console.log('🔍 DEBUG - Estrutura da resposta GET:', response)
        const count = response?.data?.length || 0

        console.log('✅ Projetos carregados:', count, count === 1 ? 'projeto' : 'projetos')

        return response
      },

      transformErrorResponse: (response: any): ProjectError => {
        console.error('❌ Erro ao carregar projetos:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar projetos'
        }
      },

      providesTags: result =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Project' as const, id })), { type: 'Project', id: 'LIST' }]
          : [{ type: 'Project', id: 'LIST' }]
    }),

    // 🎯 NOVO ENDPOINT - GET PROJECT BY ID
    getProjectById: builder.query<GetProjectByIdResponse, string>({
      query: id => ({
        url: `/project/${id}`,
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: GetProjectByIdResponse) => {
        console.log('🔍 Projeto carregado pelo ID:', response)

        return response
      },

      transformErrorResponse: (response: any): ProjectError => {
        console.error('❌ Erro ao buscar projeto pelo ID:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao buscar projeto'
        }
      },

      providesTags: (result, error, id) => [{ type: 'Project', id }]
    }),

    // 🎯 ENDPOINT EXISTENTE - CREATE PROJECT
    createProject: builder.mutation<CreateProjectResponse, CreateProjectRequest>({
      query: projectData => {
        if (projectData.image) {
          const formData = new FormData()

          formData.append('name', projectData.name)
          formData.append('description', projectData.description)
          formData.append('image', projectData.image)

          return {
            url: '/project',
            method: 'POST',
            body: formData
          }
        }

        return {
          url: '/project',
          method: 'POST',
          body: {
            name: projectData.name,
            description: projectData.description,
            img_url: projectData.img_url
          },
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        }
      },

      transformResponse: (response: CreateProjectResponse) => {
        console.log('🔍 DEBUG - Estrutura da resposta CREATE:', response)
        console.log('✅ Projeto criado com sucesso:', response?.data?.name || '')

        return response
      },

      transformErrorResponse: (response: any): ProjectError => {
        console.error('❌ Erro ao criar projeto:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao criar projeto'
        }
      },

      invalidatesTags: [{ type: 'Project', id: 'LIST' }]
    }),

    // 🎯 ENDPOINT EXISTENTE - UPDATE PROJECT
    updateProject: builder.mutation<UpdateProjectResponse, UpdateProjectRequest>({
      query: ({ id, ...projectData }) => {
        if (projectData.image) {
          const formData = new FormData()

          if (projectData.name) formData.append('name', projectData.name)
          if (projectData.description) formData.append('description', projectData.description)
          formData.append('image', projectData.image)
          formData.append('_method', 'PUT')

          return {
            url: `/project/${id}`,
            method: 'POST',
            body: formData
          }
        }

        const updateData: any = {}

        if (projectData.name) updateData.name = projectData.name
        if (projectData.description) updateData.description = projectData.description
        if (projectData.img_url) updateData.img_url = projectData.img_url

        return {
          url: `/project/${id}`,
          method: 'PUT',
          body: updateData,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        }
      },

      transformResponse: (response: UpdateProjectResponse) => {
        console.log('🔍 DEBUG - Estrutura da resposta UPDATE:', response)
        console.log('✅ Projeto atualizado com sucesso:', response?.data?.name || '')

        return response
      },

      transformErrorResponse: (response: any): ProjectError => {
        console.error('❌ Erro ao atualizar projeto:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao atualizar projeto'
        }
      },

      invalidatesTags: (result, error, arg) => [
        { type: 'Project', id: arg.id },
        { type: 'Project', id: 'LIST' }
      ]
    }),

    // 🎯 NOVO ENDPOINT - DELETE PROJECT
    deleteProject: builder.mutation<DeleteProjectResponse, DeleteProjectRequest>({
      query: ({ id }) => ({
        url: `/project/${id}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: DeleteProjectResponse) => {
        console.log('🔍 DEBUG - Estrutura da resposta DELETE:', response)
        console.log('✅ Projeto deletado com sucesso!')

        return response
      },

      transformErrorResponse: (response: any): ProjectError => {
        console.error('❌ Erro ao deletar projeto:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao deletar projeto'
        }
      },

      invalidatesTags: (result, error, arg) => [
        { type: 'Project', id: arg.id },
        { type: 'Project', id: 'LIST' }
      ]
    })
  })
})

// 🎯 EXPORT DOS HOOKS
export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery, // 🆕 Hook para GET por ID
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation
} = projectApi
