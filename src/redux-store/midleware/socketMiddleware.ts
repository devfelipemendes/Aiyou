// redux-store/websocket/socketMiddleware.ts (CORREÇÃO ESPECÍFICA PARA CANAIS)
import type { Middleware, PayloadAction, Action } from '@reduxjs/toolkit'

import { disconnectEcho, getEcho, registerReconnectListener } from '../websocket/echo'
import { setWebsocketError, setWebsocketStatus } from '../slices/webSocket'

interface WebSocketInitPayload {
  token: string
  userId: string | number
  clients: Array<{
    id: string
    name: string
    [key: string]: any
  }>
}

type WebSocketInitAction = PayloadAction<WebSocketInitPayload, 'WEBSOCKET/INIT'>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type WebSocketDisconnectAction = PayloadAction<undefined, 'WEBSOCKET/DISCONNECT'>

interface RootState {
  websocketReducer: {
    status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
    lastConnectedAt: string | null
    error?: string | null
  }
  authReducer: any
  protocolsReducer: any
  messagesReducer: any
  [key: string]: any
}

// 🔧 Armazenar clients para reconexão
let connectedClients: any[] = []

// 🔧 Função melhorada para verificar se um canal é válido
const isValidChannel = (channel: any): boolean => {
  try {
    if (!channel) {
      console.warn('⚠️ Canal é null ou undefined')

      return false
    }

    // Verificar propriedades essenciais do canal
    const checks = {
      hasListen: typeof channel.listen === 'function',
      hasBindGlobal: typeof channel.bind_global === 'function',
      hasBind: typeof channel.bind === 'function',
      hasSubscription: !!channel.subscription,
      channelName: channel.name || 'N/A',
      isEchoChannel: typeof channel.listen === 'function',
      isPusherChannel: typeof channel.bind_global === 'function' || typeof channel.bind === 'function'
    }

    console.log('🔍 Validação detalhada do canal:', checks)

    // 🔧 CORREÇÃO: Canal é válido se é um canal do Echo OU um canal do Pusher
    const isEchoChannelValid = checks.hasListen // Echo wrapper tem listen
    const isPusherChannelValid = checks.hasBindGlobal || checks.hasBind // Pusher raw tem bind methods

    const isValid = isEchoChannelValid || isPusherChannelValid

    if (!isValid) {
      console.error('💥 Canal inválido - nenhum tipo de canal reconhecido')

      return false
    }

    console.log(`✅ Canal válido detectado: ${checks.isEchoChannel ? 'Echo' : 'Pusher'}`)

    return true
  } catch (error) {
    console.error('💥 Erro ao validar canal:', error)

    return false
  }
}

// 🔧 Função para conectar a um client com melhor handling de canais
const connectToClient = async (echo: any, client: any, store: any): Promise<boolean> => {
  try {
    const channelName = `project.${client.id}`

    console.log('🔌 Iniciando conexão ao canal:', {
      channelName,
      clientId: client.id,
      clientName: client.name
    })

    // 🔧 Verificar se WebSocket está realmente conectado
    const connection = echo?.connector?.pusher?.connection

    if (!connection || connection.state !== 'connected') {
      console.warn('⚠️ WebSocket não está conectado, aguardando...')
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (!connection || connection.state !== 'connected') {
        console.error('💥 WebSocket ainda não conectado após aguardar')

        return false
      }
    }

    const socketId = connection.socket_id

    console.log('🔑 Socket ID confirmado:', socketId)

    // 🔧 Tentar criar o canal com retry
    let channel = null
    let attempts = 0
    const maxAttempts = 3

    while (!channel && attempts < maxAttempts) {
      attempts++

      try {
        console.log(`🔄 Tentativa ${attempts}/${maxAttempts} de criar canal: ${channelName}`)

        channel = echo.private(channelName)

        if (channel) {
          console.log(`📡 Canal criado na tentativa ${attempts}:`, {
            name: channelName,
            channel: channel,
            type: typeof channel,
            constructor: channel.constructor?.name
          })
        }
      } catch (channelError) {
        console.error(`💥 Erro na tentativa ${attempts} de criar canal:`, channelError)

        if (attempts < maxAttempts) {
          console.log(`⏳ Aguardando ${attempts * 1000}ms antes da próxima tentativa...`)
          await new Promise(resolve => setTimeout(resolve, attempts * 1000))
        }
      }
    }

    if (!channel) {
      console.error('💥 Falha ao criar canal após todas as tentativas')

      return false
    }

    // 🔧 Aguardar inicialização do canal
    console.log('⏳ Aguardando inicialização do canal...')
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 🔧 Validar canal criado
    if (!isValidChannel(channel)) {
      console.error('💥 Canal criado mas inválido:', channelName)

      // Tentar acessar o canal através do pusher channels
      try {
        const pusherChannels = echo.connector.pusher.channels.channels
        const pusherChannel = pusherChannels[`private-${channelName}`]

        if (pusherChannel) {
          console.log('🔍 Encontrado canal no pusher.channels:', pusherChannel)
          channel = pusherChannel
        }
      } catch (pusherError) {
        console.error('💥 Erro ao acessar canal via pusher.channels:', pusherError)
      }

      if (!isValidChannel(channel)) {
        console.error('💥 Canal permanece inválido após verificações')

        return false
      }
    }

    // 🔧 Verificar subscription
    if (channel.subscription) {
      console.log('📡 Status da subscription:', {
        subscribed: channel.subscription.subscribed,
        state: channel.subscription.state,
        channel: channelName
      })

      // Se não estiver subscrito, aguardar um pouco mais
      if (!channel.subscription.subscribed) {
        console.log('⏳ Aguardando subscription...')
        await new Promise(resolve => setTimeout(resolve, 2000))

        console.log('📡 Status da subscription após aguardar:', {
          subscribed: channel.subscription.subscribed,
          state: channel.subscription.state
        })
      }
    }

    // 📋 Configurar listeners de eventos básicos
    try {
      console.log('🎧 Configurando listeners para:', channelName)

      // 🔧 CORREÇÃO: Detectar tipo de canal e usar métodos apropriados
      const isEchoChannel = typeof channel.listen === 'function'
      const isPusherChannel = typeof channel.bind_global === 'function' || typeof channel.bind === 'function'

      if (isEchoChannel) {
        console.log('🔧 Configurando listeners para canal do Echo')

        channel
          .listen('.protocol.created', (e: any) => {
            console.log('📋 Novo protocolo criado:', e.data || e)
            store.dispatch({
              type: 'protocols/addProtocol',
              payload: { ...(e.data || e), client_id: client.id }
            })
          })
          .listen('.protocol.updated', (e: any) => {
            console.log('📋 Protocolo atualizado:', e.data || e)
            store.dispatch({
              type: 'protocols/updateProtocol',
              payload: e.data || e
            })
          })
          .listen('.protocol.deleted', (e: any) => {
            console.log('🗑️ Protocolo removido:', e.data || e)
            const protocolId = (e.data || e).id

            if (protocolId) {
              store.dispatch({
                type: 'protocols/removeProtocol',
                payload: protocolId
              })
            }
          })
      } else if (isPusherChannel) {
        console.log('🔧 Configurando listeners para canal do Pusher')

        // Para canal do Pusher, usar bind ao invés de listen
        channel.bind('protocol.created', (e: any) => {
          console.log('📋 Novo protocolo criado (Pusher):', e)
          store.dispatch({
            type: 'protocols/addProtocol',
            payload: { ...e, client_id: client.id }
          })
        })

        channel.bind('protocol.updated', (e: any) => {
          console.log('📋 Protocolo atualizado (Pusher):', e)
          store.dispatch({
            type: 'protocols/updateProtocol',
            payload: e
          })
        })

        channel.bind('protocol.deleted', (e: any) => {
          console.log('🗑️ Protocolo removido (Pusher):', e)
          const protocolId = e.id

          if (protocolId) {
            store.dispatch({
              type: 'protocols/removeProtocol',
              payload: protocolId
            })
          }
        })
      } else {
        console.warn('⚠️ Tipo de canal não reconhecido para configurar listeners')
      }

      console.log(`✅ Listeners básicos configurados para: ${channelName}`)
    } catch (listenError) {
      console.error(`💥 Erro ao configurar listeners para ${channelName}:`, listenError)

      // Não retornar false aqui, pois o canal pode estar funcionando
    }

    // 🔧 Configurar listeners de subscription para debug
    if (channel.subscription) {
      try {
        channel.subscription.bind('pusher:subscription_succeeded', () => {
          console.log(`✅ Subscription bem-sucedida: ${channelName}`)
        })

        channel.subscription.bind('pusher:subscription_error', (error: any) => {
          console.error(`💥 Erro na subscription: ${channelName}`, error)
        })
      } catch (subscriptionError) {
        console.warn('⚠️ Erro ao configurar listeners de subscription:', subscriptionError)
      }
    }

    // 🔧 Configurar debug global se disponível
    try {
      const isEchoChannel = typeof channel.listen === 'function'
      const isPusherChannel = typeof channel.bind_global === 'function' || typeof channel.bind === 'function'

      if (isPusherChannel && typeof channel.bind_global === 'function') {
        channel.bind_global((eventName: string, data: any) => {
          if (!eventName.startsWith('pusher:') && !eventName.startsWith('pusher_internal:')) {
            console.log(`📡 [${channelName}] ${eventName}:`, data)
          }
        })
        console.log(`✅ Debug global configurado para canal Pusher: ${channelName}`)
      } else if (isEchoChannel) {
        // Para canais Echo, o debug global pode não estar disponível
        console.log(`ℹ️ Debug global não disponível para canal Echo: ${channelName}`)
      }
    } catch (debugError) {
      console.warn('⚠️ Erro ao configurar debug global:', debugError)
    }

    console.log(`🎉 Cliente conectado com sucesso: ${channelName}`)

    return true
  } catch (error) {
    console.error(`💥 Erro geral ao conectar client ${client.id}:`, error)

    return false
  }
}

// 🔧 Função para reconectar todos os clients
const reconnectAllClients = async (echo: any, store: any) => {
  console.log('🔄 Reconectando aos clients após reconexão...')

  let successCount = 0

  for (const client of connectedClients) {
    try {
      const success = await connectToClient(echo, client, store)

      if (success) successCount++
    } catch (error) {
      console.error(`💥 Erro ao reconectar client ${client.id}:`, error)
    }

    // Pequeno delay entre reconexões
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log(`🔄 Reconexão concluída: ${successCount}/${connectedClients.length} clients`)
}

const websocketMiddleware: Middleware<{}, RootState> = store => next => (action: unknown) => {
  if (typeof action !== 'object' || action === null || !('type' in action)) {
    return next(action)
  }

  const actionType = (action as Action).type

  // 🔧 Inicializar WebSocket com clients
  if (actionType === 'WEBSOCKET/INIT') {
    const initAction = action as WebSocketInitAction
    const { userId, clients } = initAction.payload

    console.log('🔌 Inicializando WebSocket...', {
      userId,
      clientsCount: clients.length,
      clients: clients.map(c => ({ id: c.id, name: c.name }))
    })

    // Armazenar clients para reconexão
    connectedClients = clients

    store.dispatch(setWebsocketStatus('connecting'))

    try {
      const echo = getEcho()

      // Verificar se Echo foi inicializado corretamente
      if (!echo || !echo.connector || !echo.connector.pusher) {
        throw new Error('Echo não foi inicializado corretamente')
      }

      // 🎧 Event handlers principais
      echo.connector.pusher.connection.bind('connected', async () => {
        console.log('✅ WebSocket conectado - iniciando conexão aos clients...')
        store.dispatch(setWebsocketStatus('connected'))

        // 🔧 Aguardar para garantir estabilidade da conexão
        console.log('⏳ Aguardando estabilização da conexão...')
        await new Promise(resolve => setTimeout(resolve, 2000))

        console.log('🔌 Iniciando conexão sequencial aos clients...')

        let successCount = 0

        // Conectar clients sequencialmente (não em paralelo)
        for (let i = 0; i < clients.length; i++) {
          const client = clients[i]

          try {
            console.log(`🔌 Conectando client ${i + 1}/${clients.length}: ${client.name}`)

            const success = await connectToClient(echo, client, store)

            if (success) {
              successCount++
              console.log(`✅ Client ${i + 1}/${clients.length} conectado com sucesso`)
            } else {
              console.error(`❌ Client ${i + 1}/${clients.length} falhou na conexão`)
            }
          } catch (error) {
            console.error(`💥 Erro crítico ao conectar client ${client.id}:`, error)
          }

          // Pequeno delay entre conexões para evitar sobrecarga
          if (i < clients.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }

        console.log(`🎉 Conexão concluída: ${successCount}/${clients.length} clients conectados`)
      })

      echo.connector.pusher.connection.bind('disconnected', () => {
        console.log('❌ WebSocket desconectado')
        store.dispatch(setWebsocketStatus('disconnected'))
      })

      echo.connector.pusher.connection.bind('connecting', () => {
        console.log('🔄 WebSocket reconectando...')
        store.dispatch(setWebsocketStatus('reconnecting'))
      })

      echo.connector.pusher.connection.bind('error', (err: any) => {
        console.error('💥 Erro no WebSocket:', err)
        store.dispatch(setWebsocketError(err?.message || 'Erro na conexão WebSocket'))
      })

      // 🔧 Registrar callback de reconexão
      registerReconnectListener(async () => {
        try {
          await reconnectAllClients(echo, store)
        } catch (error) {
          console.error('💥 Erro durante reconexão:', error)
        }
      })
    } catch (error: any) {
      console.error('💥 Erro ao inicializar WebSocket:', error)
      store.dispatch(setWebsocketError(error?.message || 'Erro ao inicializar WebSocket'))
      store.dispatch(setWebsocketStatus('disconnected'))
    }
  }

  // 🔧 Desconectar WebSocket
  if (actionType === 'WEBSOCKET/DISCONNECT') {
    console.log('🔌 Desconectando WebSocket...')

    try {
      connectedClients = []
      disconnectEcho()
      store.dispatch(setWebsocketStatus('disconnected'))
    } catch (error: any) {
      console.error('💥 Erro ao desconectar WebSocket:', error)
    }
  }

  return next(action)
}

export default websocketMiddleware

// 🔧 Action creators atualizados
export const initWebSocket = (token: string, userId: string | number, clients: any[] = []) => ({
  type: 'WEBSOCKET/INIT' as const,
  payload: { token, userId, clients }
})

export const disconnectWebSocket = () => ({
  type: 'WEBSOCKET/DISCONNECT' as const
})

// 🔧 Action para reconectar manualmente
export const reconnectWebSocket = () => (dispatch: any, getState: any) => {
  const { websocketReducer } = getState()

  if (websocketReducer.status !== 'disconnected') {
    dispatch(disconnectWebSocket())

    setTimeout(() => {
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

        dispatch(initWebSocket(token, userId, clients))
      }
    }, 1000)
  }
}

// 🔧 Função de debug para verificar estado das conexões
export const debugWebSocketConnections = () => {
  try {
    const echo = getEcho()

    if (!echo) {
      console.log('💥 Echo não inicializado')

      return
    }

    if (!echo.connector || !echo.connector.pusher) {
      console.log('💥 Connector ou Pusher não disponível')

      return
    }

    const connection = echo.connector.pusher.connection
    const channels = echo.connector.pusher.channels.channels

    console.group('🔍 Debug WebSocket Connections')
    console.log('Connection State:', connection.state)
    console.log('Socket ID:', connection.socket_id)
    console.log(
      'Connected Clients:',
      connectedClients.map(c => ({ id: c.id, name: c.name }))
    )
    console.log('Active Channels:', Object.keys(channels))
    console.log(
      'Channel Details:',
      Object.entries(channels).map(([name, channel]: [string, any]) => ({
        name,
        subscribed: channel.subscribed,
        subscription_state: channel.subscription_state,
        subscription: !!channel.subscription
      }))
    )
    console.groupEnd()
  } catch (error) {
    console.error('💥 Erro ao fazer debug das conexões:', error)
  }
}

// 🔧 Função para testar conexão manualmente
export const testWebSocketConnection = () => {
  try {
    const echo = getEcho()

    if (!echo?.connector?.pusher?.connection) {
      console.error('💥 Conexão WebSocket não disponível')

      return false
    }

    const connection = echo.connector.pusher.connection

    console.log('🧪 Teste de conexão WebSocket:', {
      state: connection.state,
      socketId: connection.socket_id,
      readyState: connection.readyState
    })

    return connection.state === 'connected'
  } catch (error) {
    console.error('💥 Erro no teste de conexão:', error)

    return false
  }
}
