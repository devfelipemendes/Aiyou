import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export interface Question {
  id: string | number
  content: string

  // ... outros campos relevantes
}

export interface Reply {
  id: string | number
  question_id: string | number
  content: string
  isOperator?: boolean

  // ... outros campos relevantes
}

interface QuestionsState {
  questions: Question[]
  replies: Reply[]
}

const initialState: QuestionsState = {
  questions: [],
  replies: []
}

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    addQuestion: (state, action: PayloadAction<Question>) => {
      const exists = state.questions.some(q => q.id === action.payload.id)

      if (!exists) {
        state.questions.push(action.payload)
      }
    },
    updateQuestion: (state, action: PayloadAction<Question>) => {
      const index = state.questions.findIndex(q => q.id === action.payload.id)

      if (index !== -1) {
        state.questions[index] = action.payload
      }
    },
    addReply: (state, action: PayloadAction<Reply>) => {
      const exists = state.replies.some(r => r.id === action.payload.id)

      if (!exists) {
        state.replies.push(action.payload)
      }
    },
    updateReply: (state, action: PayloadAction<Reply>) => {
      const index = state.replies.findIndex(r => r.id === action.payload.id)

      if (index !== -1) {
        state.replies[index] = action.payload
      }
    },
    addOperatorReply: (state, action: PayloadAction<Reply>) => {
      const exists = state.replies.some(r => r.id === action.payload.id)

      if (!exists) {
        state.replies.push({ ...action.payload, isOperator: true })
      }
    },
    updateOperatorReply: (state, action: PayloadAction<Reply>) => {
      const index = state.replies.findIndex(r => r.id === action.payload.id)

      if (index !== -1) {
        state.replies[index] = { ...action.payload, isOperator: true }
      }
    }
  }
})

export const { addQuestion, updateQuestion, addReply, updateReply, addOperatorReply, updateOperatorReply } =
  questionsSlice.actions

export default questionsSlice.reducer
