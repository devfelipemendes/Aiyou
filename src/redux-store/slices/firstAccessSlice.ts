import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export interface FirstAccessStateType {
  firstAccess: boolean
  modalOpen: boolean
  currentStep: number
}

const initialState: FirstAccessStateType = {
  firstAccess: true, // Vem da API /me
  modalOpen: false,
  currentStep: 0
}

const firstAccessSlice = createSlice({
  name: 'firstAccess',
  initialState,
  reducers: {
    setFirstAccess: (state, action: PayloadAction<boolean>) => {
      state.firstAccess = action.payload

      // Se firstAccess vira false, fecha o modal
      if (!action.payload) {
        state.modalOpen = false
        state.currentStep = 0
      }
    },

    openModal: state => {
      // Só abre se firstAccess for true
      if (state.firstAccess) {
        state.modalOpen = true
      }
    },

    closeModal: state => {
      // Só fecha se firstAccess for false
      if (!state.firstAccess) {
        state.modalOpen = false
        state.currentStep = 0
      }
    },

    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload
    },

    // Ação para finalizar o projeto (primeiro acesso concluído)
    completeFirstAccess: state => {
      state.firstAccess = false
      state.modalOpen = false
      state.currentStep = 0
    }
  }
})

export const { setFirstAccess, openModal, closeModal, setCurrentStep, completeFirstAccess } = firstAccessSlice.actions

export const selectFirstAccessState = (state: { firstAccess: FirstAccessStateType }) => state.firstAccess

export default firstAccessSlice.reducer
