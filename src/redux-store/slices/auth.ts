import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'

export interface User {
  name: string
  email: string
  token: string
  permissions: string[]
  device: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  token?: string
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  token: undefined
}

const authReducer = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: state => {
      state.loading = true
      state.error = null
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.loading = false

      // if (typeof window !== 'undefined') {
      //   localStorage.setItem('authToken', action.payload.token)
      // }
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.loading = false
      state.error = null
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    logout: state => {
      state.user = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
    }
  }
})

export default authReducer.reducer

export const useAuthUser = () => useSelector((state: any) => state.auth.user)

export const useIsAuthenticated = () => useSelector((state: any) => state.auth.isAuthenticated)

export const useAuthLoading = () => useSelector((state: any) => state.auth.loading)

export const useAuthError = () => useSelector((state: any) => state.auth.error)

export const useAuthToken = () => useSelector((state: any) => state.auth.token)

export const { setCredentials, logout, loginSuccess, loginFailure, loginStart } = authReducer.actions
