// redux-store/ReduxProvider.tsx - AQUI que vai o PersistGate
'use client'

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { store, persistor } from './index'
import LoadingScreen from '@/components/LoadingScreen'

interface ReduxProviderProps {
  children: React.ReactNode
}

const ReduxProvider = ({ children }: ReduxProviderProps) => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}

export default ReduxProvider
