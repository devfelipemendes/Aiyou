// hooks/useWebSocket.ts (Atualizado)
import { useCallback, useEffect, useState } from 'react'

import { useAppDispatch } from '@/redux-store'
import { initWebSocket, disconnectWebSocket } from '@/redux-store/midleware/socketMiddleware'

interface UseWebSocketProps {
  autoConnect?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface LoginResponse {
  data: {
    token: string
    user: {
      id: string
      name: string
      clients: Array<{
        id: string
        name: string
        img_url?: string
        description?: string
        assistants: any[]
      }>
    }
  }
}

export const useWebSocket = ({ autoConnect = false }: UseWebSocketProps = {}) => {
  const dispatch = useAppDispatch()
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')

  // 🔧 Conectar WebSocket com dados do login
  const connect = useCallback(
    (token: string, userId: string, clients: any[] = []) => {
      console.log('🔌 Iniciando conexão WebSocket...', { userId, clientsCount: clients.length })

      setStatus('connecting')

      try {
        // Dispatch da ação de inicialização com dados dos clients
        dispatch(initWebSocket(token, userId, clients))

        // Status será atualizado pelo middleware
      } catch (error) {
        console.error('💥 Erro ao conectar WebSocket:', error)
        setStatus('error')
      }
    },
    [dispatch]
  )

  // 🔧 Conectar automaticamente com dados do localStorage
  const connectFromStorage = useCallback(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const userDataStr = localStorage.getItem('userData')

    if (token && userId) {
      let clients = []

      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr)

          clients = userData.clients || []
        } catch (error) {
          console.warn('⚠️ Erro ao parse dos dados do usuário:', error)
        }
      }

      connect(token, userId, clients)

      return true
    }

    return false
  }, [connect])

  // 🔧 Desconectar
  const disconnect = useCallback(() => {
    console.log('🔌 Desconectando WebSocket...')
    dispatch(disconnectWebSocket())
    setStatus('disconnected')
  }, [dispatch])

  // 🔧 Auto conectar se habilitado
  useEffect(() => {
    if (autoConnect) {
      connectFromStorage()
    }
  }, [autoConnect, connectFromStorage])

  return {
    status,
    connect,
    disconnect,
    connectFromStorage
  }
}
