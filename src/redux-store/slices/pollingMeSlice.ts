// file: src/redux-store/slices/planPolling.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface PlanPollingState {
  isPolling: boolean
  intervalId: number | null
  startedAt: number | null
  attempts: number
  maxAttempts: number
  pollingInterval: number // em ms
}

const initialState: PlanPollingState = {
  isPolling: false,
  intervalId: null,
  startedAt: null,
  attempts: 0,
  maxAttempts: 60, // 60 tentativas * 4s = 4 minutos máximo
  pollingInterval: 4000 // 4 segundos
}

const planPollingSlice = createSlice({
  name: 'planPolling',
  initialState,
  reducers: {
    startPolling: state => {
      state.isPolling = true
      state.startedAt = Date.now()
      state.attempts = 0
      console.log('🔄 Polling iniciado para verificação de plano')
    },

    stopPolling: state => {
      state.isPolling = false
      state.intervalId = null
      state.startedAt = null
      state.attempts = 0
      console.log('✅ Polling finalizado')
    },

    incrementAttempt: state => {
      state.attempts += 1
    },

    setIntervalId: (state, action: PayloadAction<number>) => {
      state.intervalId = action.payload
    }
  }
})

export const { startPolling, stopPolling, incrementAttempt, setIntervalId } = planPollingSlice.actions
export default planPollingSlice.reducer

// Selectors
export const selectIsPolling = (state: any) => state.planPolling.isPolling
export const selectPollingAttempts = (state: any) => state.planPolling.attempts
export const selectMaxAttempts = (state: any) => state.planPolling.maxAttempts
export const selectPollingInterval = (state: any) => state.planPolling.pollingInterval
