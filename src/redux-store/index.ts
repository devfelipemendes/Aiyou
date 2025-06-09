// store/index.ts - CORRIGIDO
// Third-party Imports
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import storage from 'redux-persist/lib/storage' // localStorage
import { persistStore, persistReducer } from 'redux-persist'

// 🔥 CORRIGIDO: Import path correto
import monitoringReducer from './slices/monitoring'
import chatReducer from '@/redux-store/slices/chat'

// Slice Imports
import authReducer from './slices/auth'
import register from './slices/register'

import { apiSlice } from '@/api/ApiCreate/apiSlice'
import { externalApi } from '@/api/ApiCreate/cepApi'
import { socketMiddleware } from './midleware/socketMiddleware'

// 🔥 CORRIGIDO: Persist config com nome correto do reducer
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['monitoringReducer'] // 🔥 Nome correto do reducer
}

const rootReducer = combineReducers({
  authReducer,
  chatReducer,
  monitoringReducer, // 🔥 Nome consistente
  registration: register,

  [apiSlice.reducerPath]: apiSlice.reducer,
  [externalApi.reducerPath]: externalApi.reducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH'
        ]
      }
    }).concat(apiSlice.middleware, externalApi.middleware, socketMiddleware)
})

// Hooks para padronização do uso do Redux
export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppDispatch: () => AppDispatch = useDispatch
