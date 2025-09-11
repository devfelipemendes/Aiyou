// redux-store/slices/assistants.ts
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import type { ProcessedAssistant } from '@/api/endpoints/assistant/assistant'

export type Assistant = ProcessedAssistant // 🔥 Use ProcessedAssistant

interface AssistantsState {
  list: Assistant[]
  loading: boolean
  error: string | null
}

const initialState: AssistantsState = {
  list: [],
  loading: false,
  error: null
}

const assistantsSlice = createSlice({
  name: 'assistants',
  initialState,
  reducers: {
    setAssistants(state, action: PayloadAction<Assistant[]>) {
      state.list = action.payload
    },
    addAssistant(state, action: PayloadAction<Assistant>) {
      state.list.push(action.payload)
    },
    updateAssistant(state, action: PayloadAction<Assistant>) {
      const index = state.list.findIndex(a => a.id === action.payload.id)

      if (index >= 0) state.list[index] = action.payload
    },
    deleteAssistant(state, action: PayloadAction<string>) {
      state.list = state.list.filter(a => a.id !== action.payload)
    }
  }
})

export const { setAssistants, addAssistant, updateAssistant, deleteAssistant } = assistantsSlice.actions
export default assistantsSlice.reducer
