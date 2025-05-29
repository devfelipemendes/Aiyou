// Third-party Imports
import { configureStore } from '@reduxjs/toolkit'

import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'

// Slice Imports
import authReducer from './slices/auth'
import register from './slices/register'

// import chatReducer from '@/redux-store/slices/chat'
import { apiSlice } from '@/api/ApiCreate/apiSlice'
import { externalApi } from '@/api/ApiCreate/cepApi'

export const store = configureStore({
  reducer: {
    authReducer,
    registration: register,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [externalApi.reducerPath]: externalApi.reducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    }).concat(apiSlice.middleware, externalApi.middleware)
})

// Hooks para padronização do uso do Redux
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppDispatch: () => AppDispatch = useDispatch
