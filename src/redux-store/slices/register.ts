// store/slices/registrationSlice.ts
import type { PayloadAction } from '@reduxjs/toolkit'

import { createSlice } from '@reduxjs/toolkit'

import type { RegisterUserType } from '@/app/(blank-layout-pages)/register/(steps)/StepAccountDetails'
import type { StepPersonalInfoType } from '@/app/(blank-layout-pages)/register/(steps)/StepPersonalInfo'

export interface RegistrationState {
  accountDetails: RegisterUserType | null
  personalInfo: StepPersonalInfoType | null
  currentStep: number
  isLoading: boolean
  error: string | null
}

const initialState: RegistrationState = {
  accountDetails: null,
  personalInfo: null,
  currentStep: 0,
  isLoading: false,
  error: null
}

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    setAccountDetails: (state, action: PayloadAction<RegisterUserType>) => {
      state.accountDetails = action.payload
      state.error = null
    },
    setPersonalInfo: (state, action: PayloadAction<StepPersonalInfoType>) => {
      state.personalInfo = action.payload
      state.error = null
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload
    },
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
    resetRegistration: state => {
      return initialState
    }
  }
})

export const {
  setAccountDetails,
  setPersonalInfo,
  setCurrentStep,
  setLoading,
  setError,
  clearError,
  resetRegistration
} = registrationSlice.actions

export default registrationSlice.reducer

// Selectors
export const selectRegistrationState = (state: { registration: RegistrationState }) => state.registration
export const selectAccountDetails = (state: { registration: RegistrationState }) => state.registration.accountDetails
export const selectPersonalInfo = (state: { registration: RegistrationState }) => state.registration.personalInfo
export const selectCurrentStep = (state: { registration: RegistrationState }) => state.registration.currentStep
export const selectIsLoading = (state: { registration: RegistrationState }) => state.registration.isLoading
export const selectError = (state: { registration: RegistrationState }) => state.registration.error
