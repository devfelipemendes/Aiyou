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

  // ✅ CORRIGIDO: Usar 'websocketReducer' ao invés de 'websocket'
  const websocketState = useAppSelector(state => {
    // Debug: verificar estrutura do state
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Estado disponível:', Object.keys(state))
      console.log('🔍 WebSocket state raw:', state.websocketReducer)
    }

    // ✅ Verificar se websocketReducer existe no state
    if (!state.websocketReducer) {
      console.error('❌ Estado websocketReducer não encontrado no Redux store!')
      console.log('📊 Estado atual:', state)

      // Retornar estado padrão para evitar crash
      return {
        status: 'disconnected' as const,
        lastConnectedAt: null,
        error: 'Estado websocketReducer não configurado no Redux store'
      }
    }

    return state.websocketReducer
  })

  // ✅ Função para conectar
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

  // ✅ Função para desconectar
  const disconnect = useCallback(() => {
    console.log('🔌 Desconectando WebSocket...')
    dispatch(disconnectWebSocket())
  }, [dispatch])

  // ✅ Função para escutar eventos de um protocolo específico
  const listenProtocol = useCallback(
    (newProtocolId: string, newClientId: string) => {
      console.log('🎧 Adicionando listeners para protocolo:', newProtocolId)
      dispatch(listenToProtocol(newProtocolId, newClientId))
    },
    [dispatch]
  )

  // ✅ Auto-conectar se habilitado e websocket existe
  useEffect(() => {
    if (autoConnect && websocketState && websocketState.status === 'disconnected') {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')

      if (token && userId) {
        console.log('🔄 Auto-conectando WebSocket...')
        connect(token, userId)
      } else {
        console.log('ℹ️ Auto-connect habilitado mas token/userId não encontrados')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, connect, websocketState?.status])

  // ✅ Verificar se websocketState existe antes de retornar propriedades
  if (!websocketState) {
    console.error('❌ useWebSocket: Estado websocketReducer não disponível')

    return {
      // Estado padrão para evitar crashes
      status: 'disconnected' as const,
      lastConnectedAt: null,
      error: 'Estado websocketReducer não configurado',
      isConnected: false,
      isConnecting: false,

      // Funções
      connect,
      disconnect,
      listenProtocol,

      // Helpers
      canConnect: false,
      canDisconnect: false
    }
  }

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

// ✅ Hook específico para protocolo
export const useProtocolWebSocket = (protocolId: string, clientId: string) => {
  return useWebSocket({ protocolId, clientId })
}

// ✅ Hook para status simples (sem auto-connect)
export const useWebSocketStatus = () => {
  const websocketState = useAppSelector(state => {
    if (!state.websocketReducer) {
      console.error('❌ useWebSocketStatus: Estado websocketReducer não encontrado!')

      return {
        status: 'disconnected' as const,
        lastConnectedAt: null,
        error: 'Estado websocketReducer não configurado'
      }
    }

    return state.websocketReducer
  })

  return {
    status: websocketState.status,
    lastConnectedAt: websocketState.lastConnectedAt,
    error: websocketState.error,
    isConnected: websocketState.status === 'connected',
    isConnecting: websocketState.status === 'connecting' || websocketState.status === 'reconnecting'
  }
}

// ✅ Hook para debug do estado Redux (adaptado para sua store)
export const useWebSocketDebug = () => {
  const state = useAppSelector(state => state)

  useEffect(() => {
    console.group('🔍 Debug Redux State')
    console.log('Slices disponíveis:', Object.keys(state))
    console.log('Estado websocketReducer:', state.websocketReducer)
    console.log('Estado protocolsReducer:', state.protocolsReducer)
    console.log('Estado questionsReducer:', state.questionsReducer)
    console.log('Estado completo:', state)
    console.groupEnd()
  }, [state])

  return {
    hasWebSocketState: !!state.websocketReducer,
    hasProtocolsState: !!state.protocolsReducer,
    hasQuestionsState: !!state.questionsReducer,
    availableSlices: Object.keys(state),
    websocketState: state.websocketReducer,
    protocolsState: state.protocolsReducer,
    questionsState: state.questionsReducer
  }
}
