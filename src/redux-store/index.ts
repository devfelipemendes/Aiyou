// store/index.ts - CORRIGIDO
// Third-party Imports

import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import storage from 'redux-persist/lib/storage' // localStorage
import { persistStore, persistReducer } from 'redux-persist'

// 🔥 CORRIGIDO: Import path correto
import monitoringReducer from './slices/monitoring'
import chatReducer from '@/redux-store/slices/chat'

import activeChatsReducer from './slices/activeChats'

// Slice Imports
import authReducer from './slices/auth'
import register from './slices/register'

import { apiSlice } from '@/api/ApiCreate/apiSlice'
import { externalApi } from '@/api/ApiCreate/cepApi'
import websocketMiddleware from './midleware/socketMiddleware'
import websocketReducer from './slices/webSocket'
import protocolsReducer from './slices/protocols'
import questionsReducer from './slices/questions'
import messagesReducer from './slices/messages'
import clientHistoriesReducer from './slices/clientHistoriesSlice'
import { soundNotificationMiddleware } from './midleware/soundNotificationMiddleware'
import firstAccessReducer from './slices/firstAccessSlice'

import planPollingReducer from './slices/pollingMeSlice'

import planPollingMiddleware from './midleware/userPollingMiddleware'
import assistantsReducer from './slices/assistants'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['authReducer', 'monitoringReducer', 'firstAccess'],
  blacklist: ['websocketReducer', 'chatReducer', 'activeChats', 'protocolsReducer', 'messagesReducer', 'planPolling'] // WebSocket e chat sempre frescos
}

const rootReducer = combineReducers({
  authReducer,
  chatReducer,
  monitoring: monitoringReducer,
  registration: register,
  websocketReducer,
  protocolsReducer,
  questionsReducer,
  messagesReducer,
  planPolling: planPollingReducer,
  activeChats: activeChatsReducer,
  clientHistories: clientHistoriesReducer,
  assistants: assistantsReducer,
  firstAccess: firstAccessReducer,

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
          'persist/FLUSH',
          'websocket/connect',
          'websocket/disconnect',
          'websocket/joinProtocolChannel',
          'websocket/joinProjectChannel',
          'activeChats/markChannelConnected', // 🔥 NOVO: Ignorar Set objects
          'activeChats/markChannelDisconnected',
          'monitoring/addConnectedChannel',
          'monitoring/removeConnectedChannel'
        ],
        ignoredPaths: ['register', 'websocket.connection', 'websocket.channels', 'activeChatsReducer.connectedChannels']
      }
    }).concat(
      apiSlice.middleware,
      externalApi.middleware,
      websocketMiddleware,
      soundNotificationMiddleware,
      planPollingMiddleware
    ),

  devTools: process.env.NODE_ENV !== 'production'
})

// Hooks para padronização do uso do Redux
export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppDispatch: () => AppDispatch = useDispatch
