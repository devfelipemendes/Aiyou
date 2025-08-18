// src/api/endpoints/Projects/createProject.ts
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

// 🎯 TIPOS PARA A RESPONSE DE UPDATE
export type UpdateProjectResponse = {
  message: string
  status: number
  data: {
    id: string
    user_id: string
    name: string
    description: string
    img_url: string
    created_at: string
    updated_at: string
  }
}

// 🎯 TIPOS PARA A RESPONSE (baseado na resposta real que você mostrou)
export type CreateProjectResponse = {
  message: string
  status: number
  data: {
    id: string
    user_id: string
    name: string
    description: string
    img_url: string
    created_at: string
    updated_at: string
  }
}

// 🎯 TIPO PARA ERROS (estrutura real do backend)
type CreateProjectError = {
  status: number
  message: string
}

// 🎯 API ENDPOINT
export const projectApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createProject: builder.mutation<CreateProjectResponse, CreateProjectRequest>({
      query: projectData => {
        // 🎯 SE TEM ARQUIVO, USAR FORMDATA
        if (projectData.image) {
          const formData = new FormData()

          formData.append('name', projectData.name)
          formData.append('description', projectData.description)
          formData.append('image', projectData.image)

          return {
            url: '/project',
            method: 'POST',
            body: formData

            // NÃO definir Content-Type, deixar o browser definir automaticamente para multipart/form-data
          }
        }

        // 🎯 SE TEM APENAS URL, USAR JSON
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
        console.log('✅ Projeto criado com sucesso:', response)

        return response
      },

      transformErrorResponse: (response: any): CreateProjectError => {
        console.error('❌ Erro ao criar projeto:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao criar projeto'
        }
      },

      // 🎯 INVALIDAR CACHE SE TIVER LISTAGEM DE PROJETOS FUTURAMENTE
      invalidatesTags: ['Project']
    }),

    // 🎯 NOVO ENDPOINT DE UPDATE
    updateProject: builder.mutation<UpdateProjectResponse, UpdateProjectRequest>({
      query: ({ id, ...projectData }) => {
        // 🎯 SE TEM ARQUIVO, USAR FORMDATA
        if (projectData.image) {
          const formData = new FormData()

          // Adicionar campos apenas se foram fornecidos
          if (projectData.name) formData.append('name', projectData.name)
          if (projectData.description) formData.append('description', projectData.description)
          formData.append('image', projectData.image)

          // 🎯 MÉTODO SPOOFING PARA PUT COM FORMDATA
          formData.append('_method', 'PUT')

          return {
            url: `/project/${id}`,
            method: 'POST', // Laravel method spoofing
            body: formData
          }
        }

        // 🎯 SE TEM APENAS DADOS JSON, USAR PUT NORMAL
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
        console.log('✅ Projeto atualizado com sucesso:', response)

        return response
      },

      transformErrorResponse: (response: any): CreateProjectError => {
        console.error('❌ Erro ao atualizar projeto:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao atualizar projeto'
        }
      },

      // 🎯 INVALIDAR CACHE APÓS UPDATE
      invalidatesTags: (result, error, arg) => ['Project', { type: 'Project', id: arg.id }]
    })
  })
})

// 🎯 EXPORT DOS HOOKS
export const { useCreateProjectMutation, useUpdateProjectMutation } = projectApi
