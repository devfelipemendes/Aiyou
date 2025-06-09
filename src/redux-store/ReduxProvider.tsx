// redux-store/ReduxProvider.tsx - AQUI que vai o PersistGate
'use client'

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { store, persistor } from './index'

interface ReduxProviderProps {
  children: React.ReactNode
}

const ReduxProvider = ({ children }: ReduxProviderProps) => {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Carregando...</div>} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}

export default ReduxProvider
