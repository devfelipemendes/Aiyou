import { useEffect, useCallback } from 'react'

import { useAppDispatch, useAppSelector } from '@/redux-store'
import { initWebSocket, listenToProtocol, disconnectWebSocket } from '@/redux-store/midleware/socketMiddleware'

interface UseWebSocketOptions {
  autoConnect?: boolean
  protocolId?: string
  clientId?: string
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { autoConnect = true, protocolId, clientId } = options

  const dispatch = useAppDispatch()
  const websocketState = useAppSelector((state: any) => state.websocket)

  // Função para conectar
  const connect = useCallback(
    (token?: string, userId?: string) => {
      const tokenToUse = token || localStorage.getItem('token')
      const userIdToUse = userId || localStorage.getItem('userId')

      if (!tokenToUse || !userIdToUse) {
        console.error('❌ Token ou userId não encontrados para conectar WebSocket')

        return
      }

      console.log('🔌 Conectando WebSocket...', { userId: userIdToUse, protocolId, clientId })
      dispatch(initWebSocket(tokenToUse, userIdToUse, protocolId, clientId))
    },
    [dispatch, protocolId, clientId]
  )

  // Função para desconectar
  const disconnect = useCallback(() => {
    console.log('🔌 Desconectando WebSocket...')
    dispatch(disconnectWebSocket())
  }, [dispatch])

  // Função para escutar eventos de um protocolo específico
  const listenProtocol = useCallback(
    (newProtocolId: string, newClientId: string) => {
      console.log('🎧 Adicionando listeners para protocolo:', newProtocolId)
      dispatch(listenToProtocol(newProtocolId, newClientId))
    },
    [dispatch]
  )

  // Auto-conectar se habilitado
  useEffect(() => {
    if (autoConnect && websocketState.status === 'disconnected') {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')

      if (token && userId) {
        connect(token, userId)
      }
    }
  }, [autoConnect, connect, websocketState.status])

  // Limpar conexão ao desmontar componente
  useEffect(() => {
    return () => {
      if (websocketState.status !== 'disconnected') {
        console.log('🧹 Limpando WebSocket ao desmontar componente')

        // Não desconectamos automaticamente pois outros componentes podem estar usando
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    // Estado atual
    status: websocketState.status,
    lastConnectedAt: websocketState.lastConnectedAt,
    error: websocketState.error,
    isConnected: websocketState.status === 'connected',
    isConnecting: websocketState.status === 'connecting' || websocketState.status === 'reconnecting',

    // Funções
    connect,
    disconnect,
    listenProtocol,

    // Helpers
    canConnect: websocketState.status === 'disconnected',
    canDisconnect: websocketState.status !== 'disconnected'
  }
}

// Hook específico para protocolo
export const useProtocolWebSocket = (protocolId: string, clientId: string) => {
  return useWebSocket({ protocolId, clientId })
}

// Hook para status simples (sem auto-connect)
export const useWebSocketStatus = () => {
  const websocketState = useAppSelector((state: any) => state.websocket)

  return {
    status: websocketState.status,
    lastConnectedAt: websocketState.lastConnectedAt,
    error: websocketState.error,
    isConnected: websocketState.status === 'connected',
    isConnecting: websocketState.status === 'connecting' || websocketState.status === 'reconnecting'
  }
}
