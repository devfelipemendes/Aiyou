// 📁 src/hooks/useWebSocket.ts
// 🔥 HOOKS PERSONALIZADOS PARA WEBSOCKET

import { useEffect, useCallback, useMemo } from 'react'

import { useAppDispatch, useAppSelector } from '@/redux-store'
import { websocketActions } from '@/redux-store/midleware/socketMiddleware'
import {
  selectWebSocketState,
  selectIsConnected,
  selectActiveChannels,
  selectRecentMessages,
  selectConnectionStatus,
  selectMessageStatistics
} from '@/redux-store/slices/webSocket'

// 🎯 HOOK PRINCIPAL: Gerenciamento geral do WebSocket
export const useWebSocket = () => {
  const dispatch = useAppDispatch()
  const webSocketState = useAppSelector(selectWebSocketState)
  const isConnected = useAppSelector(selectIsConnected)
  const connectionStatus = useAppSelector(selectConnectionStatus)

  // 🔧 FUNÇÕES: Controle da conexão
  const connect = useCallback(
    (protocolId?: string, clientId?: string) => {
      dispatch(websocketActions.connect(protocolId, clientId))
    },
    [dispatch]
  )

  const disconnect = useCallback(() => {
    dispatch(websocketActions.disconnect())
  }, [dispatch])

  const reconnect = useCallback(() => {
    dispatch(websocketActions.reconnect())
  }, [dispatch])

  const updateAuthToken = useCallback(
    (token: string) => {
      dispatch(websocketActions.updateAuthToken(token))
    },
    [dispatch]
  )

  return {
    // Estado
    isConnected,
    connectionStatus,
    webSocketState,

    // Ações
    connect,
    disconnect,
    reconnect,
    updateAuthToken
  }
}

// 🎯 HOOK: Gerenciamento de canal de protocolo
export const useProtocolChannel = (protocolId: string | null) => {
  const dispatch = useAppDispatch()
  const activeChannels = useAppSelector(selectActiveChannels)
  const isConnected = useAppSelector(selectIsConnected)

  // 🔧 ESTADO: Canal ativo
  const isChannelActive = useMemo(() => {
    return protocolId ? activeChannels.includes(`protocol.${protocolId}`) : false
  }, [activeChannels, protocolId])

  // 🔧 FUNÇÕES: Controle do canal
  const joinChannel = useCallback(() => {
    if (protocolId && isConnected) {
      dispatch(websocketActions.joinProtocolChannel(protocolId))
    }
  }, [dispatch, protocolId, isConnected])

  const leaveChannel = useCallback(() => {
    if (protocolId) {
      dispatch(websocketActions.leaveProtocolChannel(protocolId))
    }
  }, [dispatch, protocolId])

  // 🔄 EFEITO: Auto-entrar no canal quando conectado
  useEffect(() => {
    if (protocolId && isConnected && !isChannelActive) {
      joinChannel()
    }

    // 🗑️ CLEANUP: Sair do canal ao desmontar
    return () => {
      if (protocolId && isChannelActive) {
        leaveChannel()
      }
    }
  }, [protocolId, isConnected, isChannelActive, joinChannel, leaveChannel])

  return {
    isChannelActive,
    joinChannel,
    leaveChannel,
    channelName: protocolId ? `protocol.${protocolId}` : null
  }
}

// 🎯 HOOK: Gerenciamento de canal de projeto
export const useProjectChannel = (clientId: string | null) => {
  const dispatch = useAppDispatch()
  const activeChannels = useAppSelector(selectActiveChannels)
  const isConnected = useAppSelector(selectIsConnected)

  // 🔧 ESTADO: Canal ativo
  const isChannelActive = useMemo(() => {
    return clientId ? activeChannels.includes(`project.${clientId}`) : false
  }, [activeChannels, clientId])

  // 🔧 FUNÇÕES: Controle do canal
  const joinChannel = useCallback(() => {
    if (clientId && isConnected) {
      dispatch(websocketActions.joinProjectChannel(clientId))
    }
  }, [dispatch, clientId, isConnected])

  const leaveChannel = useCallback(() => {
    if (clientId) {
      dispatch(websocketActions.leaveProjectChannel(clientId))
    }
  }, [dispatch, clientId])

  // 🔄 EFEITO: Auto-entrar no canal quando conectado
  useEffect(() => {
    if (clientId && isConnected && !isChannelActive) {
      joinChannel()
    }

    // 🗑️ CLEANUP: Sair do canal ao desmontar
    return () => {
      if (clientId && isChannelActive) {
        leaveChannel()
      }
    }
  }, [clientId, isConnected, isChannelActive, joinChannel, leaveChannel])

  return {
    isChannelActive,
    joinChannel,
    leaveChannel,
    channelName: clientId ? `project.${clientId}` : null
  }
}

// 🎯 HOOK: Escutar mensagens específicas por tipo
export const useWebSocketMessages = (messageTypes?: string[]) => {
  const recentMessages = useAppSelector(selectRecentMessages)

  // 🔧 FILTRO: Mensagens por tipo
  const filteredMessages = useMemo(() => {
    if (!messageTypes || messageTypes.length === 0) {
      return recentMessages
    }

    return recentMessages.filter(message => messageTypes.includes(message.type))
  }, [recentMessages, messageTypes])

  // 🔧 UTILITÁRIOS: Mensagens específicas
  const latestMessage = useMemo(() => filteredMessages[0] || null, [filteredMessages])

  const messageCount = filteredMessages.length

  const getMessagesByChannel = useCallback(
    (channelName: string) => {
      return filteredMessages.filter(message => message.channel === channelName)
    },
    [filteredMessages]
  )

  return {
    messages: filteredMessages,
    latestMessage,
    messageCount,
    getMessagesByChannel
  }
}

// 🎯 HOOK: Estatísticas do WebSocket
export const useWebSocketStats = () => {
  const statistics = useAppSelector(selectMessageStatistics)
  const webSocketState = useAppSelector(selectWebSocketState)

  return {
    totalMessages: statistics.total,
    messagesByType: statistics.byType,
    activeChannelsCount: webSocketState.activeChannels.length,
    reconnectAttempts: webSocketState.reconnectAttempts,
    lastConnected: webSocketState.lastConnected,
    errors: webSocketState.errors
  }
}

// 🎯 HOOK COMPOSTO: Para componentes de chat
export const useChatWebSocket = (protocolId: string | null, clientId: string | null) => {
  const webSocket = useWebSocket()
  const protocolChannel = useProtocolChannel(protocolId)
  const projectChannel = useProjectChannel(clientId)

  // 🔧 MENSAGENS: Apenas relacionadas ao chat
  const chatMessages = useWebSocketMessages([
    'question.created',
    'question.updated',
    'reply.created',
    'reply.updated',
    'operator.reply.created',
    'operator.reply.updated'
  ])

  // 🔧 FUNÇÃO: Conectar a ambos os canais
  const connectToChat = useCallback(() => {
    if (!webSocket.isConnected) {
      webSocket.connect(protocolId || undefined, clientId || undefined)
    } else {
      if (protocolId) protocolChannel.joinChannel()
      if (clientId) projectChannel.joinChannel()
    }
  }, [webSocket, protocolChannel, projectChannel, protocolId, clientId])

  // 🔧 FUNÇÃO: Desconectar de ambos os canais
  const disconnectFromChat = useCallback(() => {
    if (protocolId) protocolChannel.leaveChannel()
    if (clientId) projectChannel.leaveChannel()
  }, [protocolChannel, projectChannel, protocolId, clientId])

  return {
    // Estado geral
    isConnected: webSocket.isConnected,
    connectionStatus: webSocket.connectionStatus,

    // Canais
    protocolChannel: {
      isActive: protocolChannel.isChannelActive,
      name: protocolChannel.channelName
    },
    projectChannel: {
      isActive: projectChannel.isChannelActive,
      name: projectChannel.channelName
    },

    // Mensagens
    messages: chatMessages.messages,
    latestMessage: chatMessages.latestMessage,
    messageCount: chatMessages.messageCount,

    // Ações
    connectToChat,
    disconnectFromChat,
    reconnect: webSocket.reconnect
  }
}

// 🎯 HOOK: Auto-conectar ao montar componente
export const useAutoConnectWebSocket = (
  protocolId?: string | null,
  clientId?: string | null,
  options: {
    autoConnect?: boolean
    autoDisconnect?: boolean
  } = {}
) => {
  const { autoConnect = true, autoDisconnect = true } = options
  const webSocket = useWebSocket()

  useEffect(() => {
    if (autoConnect) {
      webSocket.connect(protocolId || undefined, clientId || undefined)
    }

    return () => {
      if (autoDisconnect) {
        webSocket.disconnect()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Apenas na montagem/desmontagem

  return webSocket
}

/*
🎓 EXPLICAÇÃO DIDÁTICA DOS HOOKS:

1. 🎯 useWebSocket():
   - Hook principal para controle geral da conexão
   - connect(), disconnect(), reconnect()
   - Estado da conexão e status

2. 🎯 useProtocolChannel(protocolId):
   - Gerencia canal específico do protocolo
   - Auto-entra no canal quando conectado
   - Auto-sai quando componente desmonta

3. 🎯 useProjectChannel(clientId):
   - Gerencia canal específico do projeto
   - Funciona igual ao protocolChannel

4. 🎯 useWebSocketMessages(types):
   - Filtra mensagens por tipo
   - Acesso às mensagens mais recentes
   - Utilitários para análise

5. 🎯 useChatWebSocket(protocolId, clientId):
   - HOOK PRINCIPAL para componentes de chat
   - Gerencia ambos os canais automaticamente
   - Filtra apenas mensagens de chat

6. 🎯 useAutoConnectWebSocket():
   - Auto-conecta na montagem do componente
   - Auto-desconecta na desmontagem
   - Útil para componentes principais

📋 COMO USAR:

// Em um componente de chat:
const chat = useChatWebSocket(protocolId, clientId)

// Para conectar:
chat.connectToChat()

// Estado:
console.log(chat.isConnected)
console.log(chat.messages)

// Auto-conectar:
useAutoConnectWebSocket(protocolId, clientId)
*/
