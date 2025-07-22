// hooks/useWebSocketChannels.ts
import { useEffect, useCallback, useRef } from 'react'

import { useAppDispatch } from '@/redux-store'
import { getEcho, isEchoConnected } from '@/redux-store/websocket/echo'
import { listenProtocolEvents, cleanupProtocolEvents } from '@/redux-store/websocket/listeners/chatlistener'

interface UseWebSocketChannelsProps {
  clientsData: Array<{
    clientId: string
    protocolId?: string
  }>
  enabled?: boolean
}

export const useWebSocketChannels = ({ clientsData, enabled = true }: UseWebSocketChannelsProps) => {
  const dispatch = useAppDispatch()
  const activeChannelsRef = useRef<Set<string>>(new Set())

  // const echoRef = useRef<any>(null)

  // 🔧 Função para conectar a um canal específico
  const connectToChannel = useCallback(
    (clientId: string, protocolId?: string) => {
      try {
        const echo = getEcho()

        if (!echo || !isEchoConnected()) {
          console.warn('⚠️ WebSocket não conectado, aguardando...')

          return false
        }

        // 🎯 Definir identificadores do canal
        const channelKey = protocolId || clientId
        const projectId = clientId // ou extrair de outro campo

        if (activeChannelsRef.current.has(channelKey)) {
          console.log('📡 Canal já ativo:', channelKey)

          return true
        }

        console.log('🔌 Conectando ao canal:', { clientId, protocolId, channelKey })

        // 🎧 Conectar listeners
        listenProtocolEvents(echo, channelKey, projectId, dispatch)

        // 📝 Marcar como ativo
        activeChannelsRef.current.add(channelKey)

        console.log('✅ Canal conectado:', channelKey)

        return true
      } catch (error) {
        console.error('💥 Erro ao conectar canal:', error)

        return false
      }
    },
    [dispatch]
  )

  // 🔧 Função para desconectar de um canal
  const disconnectFromChannel = useCallback((clientId: string, protocolId?: string) => {
    try {
      const echo = getEcho()

      if (!echo) return

      const channelKey = protocolId || clientId
      const projectId = clientId

      if (!activeChannelsRef.current.has(channelKey)) {
        return
      }

      console.log('🔌 Desconectando canal:', channelKey)

      cleanupProtocolEvents(echo, channelKey, projectId)
      activeChannelsRef.current.delete(channelKey)

      console.log('✅ Canal desconectado:', channelKey)
    } catch (error) {
      console.error('💥 Erro ao desconectar canal:', error)
    }
  }, [])

  // 🔧 Função para reconectar todos os canais
  const reconnectAllChannels = useCallback(() => {
    console.log('🔄 Reconectando todos os canais...')

    const currentChannels = Array.from(activeChannelsRef.current)

    activeChannelsRef.current.clear()

    clientsData.forEach(client => {
      if (currentChannels.includes(client.protocolId || client.clientId)) {
        connectToChannel(client.clientId, client.protocolId)
      }
    })
  }, [clientsData, connectToChannel])

  // 🔧 Conectar/desconectar baseado nos dados dos clientes
  useEffect(() => {
    if (!enabled) return

    // ⏱️ Aguardar conexão WebSocket
    const checkConnectionAndConnect = () => {
      if (!isEchoConnected()) {
        console.log('🔄 Aguardando conexão WebSocket...')
        setTimeout(checkConnectionAndConnect, 1000)

        return
      }

      // 🎯 Conectar aos canais dos clientes atuais
      clientsData.forEach(client => {
        connectToChannel(client.clientId, client.protocolId)
      })
    }

    checkConnectionAndConnect()

    // 🧹 Cleanup: desconectar canais não utilizados
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const currentChannels = Array.from(activeChannelsRef.current)

      currentChannels.forEach(channelKey => {
        const client = clientsData.find(c => (c.protocolId || c.clientId) === channelKey)

        if (!client) {
          disconnectFromChannel(channelKey)
        }
      })
    }
  }, [clientsData, enabled, connectToChannel, disconnectFromChannel])

  // 🔧 Listener para reconexão do WebSocket
  useEffect(() => {
    const echo = getEcho()

    if (!echo) return

    const handleReconnection = () => {
      console.log('🔄 WebSocket reconectado, restaurando canais...')
      setTimeout(reconnectAllChannels, 1000)
    }

    // 🎧 Escutar eventos de reconexão
    echo.connector.pusher.connection.bind('connected', handleReconnection)

    return () => {
      if (echo?.connector?.pusher?.connection) {
        echo.connector.pusher.connection.unbind('connected', handleReconnection)
      }
    }
  }, [reconnectAllChannels])

  return {
    connectToChannel,
    disconnectFromChannel,
    reconnectAllChannels,
    activeChannels: Array.from(activeChannelsRef.current),
    isConnected: isEchoConnected()
  }
}
