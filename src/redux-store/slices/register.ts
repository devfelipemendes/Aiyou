// src/redux-store/slices/register.ts
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import type { RegisterUserType } from '@/app/(blank-layout-pages)/register/(steps)/StepAccountDetails'
import type { StepPersonalInfoType } from '@/app/(blank-layout-pages)/register/(steps)/StepPersonalInfo'

export interface RegistrationState {
  accountDetails: RegisterUserType | null
  personalInfo: StepPersonalInfoType | null

  // Controle do stepper
  currentStep: number

  // Estados da API
  isLoading: boolean
  error: string | null

  // Estado de sucesso
  isRegistrationComplete: boolean
  registrationToken: string | null
}

const initialState: RegistrationState = {
  accountDetails: null,
  personalInfo: null,
  currentStep: 0,
  isLoading: false,
  error: null,
  isRegistrationComplete: false,
  registrationToken: null
}

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    // Ação para salvar dados do Step 1 (Account Details)
    setAccountDetails: (state, action: PayloadAction<RegisterUserType>) => {
      state.accountDetails = action.payload
      state.error = null
      console.log('Account details salvos no Redux:', action.payload)
    },

    // Ação para salvar dados do Step 2 (Personal Info)
    setPersonalInfo: (state, action: PayloadAction<StepPersonalInfoType>) => {
      state.personalInfo = action.payload
      state.error = null
      console.log('Personal info salvos no Redux:', action.payload)
    },

    // Controle do stepper
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload
    },

    nextStep: state => {
      state.currentStep += 1
    },

    prevStep: state => {
      if (state.currentStep > 0) {
        state.currentStep -= 1
      }
    },

    // Estados da API
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },

    clearError: state => {
      state.error = null
    },

    // Sucesso no registro
    setRegistrationSuccess: (state, action: PayloadAction<string>) => {
      state.isRegistrationComplete = true
      state.registrationToken = action.payload
      state.isLoading = false
      state.error = null
    },

    // Reset completo
    resetRegistration: () => {
      return initialState
    },

    // Helper para verificar se temos todos os dados necessários
    validateRegistrationData: state => {
      const hasAccountDetails = !!state.accountDetails
      const hasPersonalInfo = !!state.personalInfo

      if (!hasAccountDetails || !hasPersonalInfo) {
        state.error = 'Dados incompletos para o registro'
      } else {
        // Limpa erro se dados estão completos
        state.error = null
      }
    }
  }
})

export const {
  setAccountDetails,
  setPersonalInfo,
  setCurrentStep,
  nextStep,
  prevStep,
  setLoading,
  setError,
  clearError,
  setRegistrationSuccess,
  resetRegistration,
  validateRegistrationData
} = registrationSlice.actions

export default registrationSlice.reducer

// Selectors melhorados
export const selectRegistrationState = (state: { registration: RegistrationState }) => state.registration
export const selectAccountDetails = (state: { registration: RegistrationState }) => state.registration.accountDetails
export const selectPersonalInfo = (state: { registration: RegistrationState }) => state.registration.personalInfo
export const selectCurrentStep = (state: { registration: RegistrationState }) => state.registration.currentStep
export const selectIsLoading = (state: { registration: RegistrationState }) => state.registration.isLoading
export const selectError = (state: { registration: RegistrationState }) => state.registration.error
export const selectIsRegistrationComplete = (state: { registration: RegistrationState }) =>
  state.registration.isRegistrationComplete

// Selector para verificar se temos todos os dados
export const selectHasCompleteData = (state: { registration: RegistrationState }) => {
  const { accountDetails, personalInfo } = state.registration

  return !!(accountDetails && personalInfo)
}

// Selector para combinar todos os dados
export const selectCompleteRegistrationData = (state: { registration: RegistrationState }) => {
  const { accountDetails, personalInfo } = state.registration

  if (!accountDetails || !personalInfo) {
    return null
  }

  return {
    accountDetails,
    personalInfo
  }
}
