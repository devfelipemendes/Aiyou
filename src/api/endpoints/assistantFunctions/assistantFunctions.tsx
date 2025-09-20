// src/api/endpoints/instructionAssistant.ts
import { apiSlice } from '@/api/ApiCreate/apiSlice'

/* ------------------------- 🎯 TYPES ------------------------- */
export type InstructionRequest = {
  assistant_id: string
  about: string
  company: string
  first_contact: string
  about_functions: string
  special_conditions: string
  steps: string
  output_format: string
  notes: string
}

export type InstructionResponse = {
  message: string
  status: number
  data: {
    success: boolean
  }
}

type InstructionError = {
  status: number
  message: string
}

/* ------------------------- 🎯 API ENDPOINTS ------------------------- */
export const instructionAssistantApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    updateInstruction: builder.mutation<InstructionResponse, InstructionRequest>({
      query: body => ({
        url: '/assistant/instruction/update',
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }),
      transformResponse: (response: InstructionResponse) => {
        console.log('🔍 DEBUG - UPDATE INSTRUCTION:', response)

        return response
      },
      transformErrorResponse: (response: any): InstructionError => ({
        status: response?.status || 500,
        message: response?.data?.message || response?.message || 'Erro ao atualizar instruções'
      }),
      invalidatesTags: ['Instruction']
    })
  })
})

/* ------------------------- 🎯 EXPORT HOOKS ------------------------- */
export const { useUpdateInstructionMutation } = instructionAssistantApi
