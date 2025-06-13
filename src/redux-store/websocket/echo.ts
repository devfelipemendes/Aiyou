import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

import { getAuthToken } from '@/utils/getAuthToken'

let echoInstance: Echo<any> | null = null
let isReconnected = false

type ListenerCallback = () => void
const listeners: ListenerCallback[] = []

const extractHostname = (url: string): string => {
  if (!url) return 'localhost'

  try {
    // Se já é apenas hostname, retorna direto
    if (!url.includes('://')) {
      return url.split(':')[0].split('/')[0]
    }

    // Extrair hostname de URL completa
    const urlObj = new URL(url)

    return urlObj.hostname
  } catch (error) {
    // Fallback: remover protocolo manualmente
    return url
      .replace(/^https?:\/\//, '')
      .split(':')[0]
      .split('/')[0]
  }
}

const rawHost = process.env.NEXT_PUBLIC_LARAVEL_API_URL || ''

// ✅ Configurações do .env para Reverb
const getReverbConfig = () => {
  const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME || 'https'

  const isSecure = scheme === 'https'

  let port = process.env.NEXT_PUBLIC_REVERB_PORT

  if (!port || port === 'null' || port === '') {
    // Usar portas padrão se não especificada
    port = isSecure ? '443' : '80'
  }

  const host = extractHostname(rawHost) || 'dev.reverb.aiyou.com.br'

  const config = {
    appKey: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'jjpnmycugrpdugowbnhd',
    host: host,
    port: null,
    scheme: process.env.NEXT_PUBLIC_REVERB_SCHEME || 'https',
    apiUrl: process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'dev.reverb.aiyou.com.br/v1',
    baseUrl: process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'dev.reverb.aiyou.com.br/v1 '
  }

  console.log('🔧 Configuração Reverb:', {
    appKey: config.appKey,
    host: config.host,
    port: config.port,
    scheme: config.scheme,
    wsUrl: `${config.scheme}://${config.host}:${config.port}`,
    authEndpoint: `${config.apiUrl}/broadcasting/auth`
  })

  return config
}

export const getEcho = () => {
  if (!echoInstance) {
    const config = getReverbConfig()
    const token = getAuthToken()

    console.log('🔌 Iniciando Laravel Echo com Reverb...')
    console.log('🔑 Token de autenticação:', token ? 'Presente' : 'Ausente')

    if (!token) {
      console.warn('⚠️ Token não encontrado. WebSocket pode falhar na autenticação.')
    }

    // ✅ Garantir que Pusher está disponível globalmente
    window.Pusher = Pusher

    try {
      // ✅ CORREÇÃO PRINCIPAL: Configurar Echo para usar Reverb diretamente
      echoInstance = new Echo({
        broadcaster: 'pusher',
        key: config.appKey,
        wsHost: config.host,
        wsPort: config.port,
        wssPort: config.port,
        forceTLS: config.scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
        authEndpoint: `${config.apiUrl}/broadcasting/auth`,
        cluster: 'local',
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }
      })

      // ✅ Acessar a conexão do Pusher através do Echo
      const pusherConnection = echoInstance.connector.pusher.connection

      // ✅ Event listeners para conexão
      pusherConnection.bind('connected', () => {
        console.log('✅ Reverb WebSocket conectado!')
        console.log('📡 Socket ID:', echoInstance?.connector?.pusher?.connection?.socket_id)

        if (isReconnected) {
          console.log('🔁 Reconectado — restaurando listeners...')
          listeners.forEach(cb => {
            try {
              cb()
            } catch (error) {
              console.error('💥 Erro ao restaurar listener:', error)
            }
          })
        }

        isReconnected = true
      })

      pusherConnection.bind('connecting', () => {
        console.log('🔄 Conectando ao Reverb WebSocket...')
      })

      pusherConnection.bind('disconnected', () => {
        console.log('❌ Reverb WebSocket desconectado')
      })

      pusherConnection.bind('unavailable', () => {
        console.error('💥 Reverb WebSocket indisponível')
      })

      pusherConnection.bind('failed', () => {
        console.error('💥 Falha na conexão com Reverb WebSocket')
      })

      pusherConnection.bind('error', (err: any) => {
        console.error('💥 Erro no Reverb WebSocket:', err)
      })

      // ✅ Debug de estado da conexão
      pusherConnection.bind('state_change', (states: any) => {
        console.log('🔄 Estado da conexão mudou:', {
          previous: states.previous,
          current: states.current
        })
      })

      console.log('🎉 Laravel Echo configurado com sucesso para Reverb!')
      console.log('🌐 URL de conexão:', `${config.scheme}://${config.host}:${config.port}`)
    } catch (error: any) {
      console.error('💥 Erro ao configurar Laravel Echo:', error)
      throw new Error(`Falha ao inicializar WebSocket: ${error.message}`)
    }
  }

  return echoInstance
}

// ✅ Função para registrar listeners de reconexão
export const registerReconnectListener = (callback: ListenerCallback) => {
  if (typeof callback === 'function') {
    listeners.push(callback)
    console.log('🎧 Listener de reconexão registrado. Total:', listeners.length)
  } else {
    console.warn('⚠️ Callback de reconexão deve ser uma função')
  }
}

// ✅ Função para remover listener específico
export const unregisterReconnectListener = (callback: ListenerCallback) => {
  const index = listeners.indexOf(callback)

  if (index > -1) {
    listeners.splice(index, 1)
    console.log('🗑️ Listener de reconexão removido. Total:', listeners.length)
  }
}

// ✅ Função para desconectar
export const disconnectEcho = () => {
  if (echoInstance) {
    console.log('🔌 Desconectando Laravel Echo...')

    try {
      echoInstance.disconnect()
      echoInstance = null
      isReconnected = false
      listeners.length = 0 // limpa todos os listeners

      console.log('✅ Laravel Echo desconectado com sucesso')
    } catch (error: any) {
      console.error('💥 Erro ao desconectar Laravel Echo:', error)
    }
  } else {
    console.log('ℹ️ Laravel Echo já estava desconectado')
  }
}

// ✅ Função para verificar se está conectado
export const isEchoConnected = (): boolean => {
  return echoInstance?.connector?.pusher?.connection?.state === 'connected'
}

// ✅ Função para obter informações da conexão
export const getConnectionInfo = () => {
  const config = getReverbConfig()

  return {
    isConnected: isEchoConnected(),
    socketId: echoInstance?.connector?.pusher?.connection?.socket_id || null,
    state: echoInstance?.connector?.pusher?.connection?.state || 'disconnected',
    config: {
      wsUrl: `${config.scheme}://${config.host}:${config.port}`,
      authEndpoint: `${config.apiUrl}/broadcasting/auth`,
      appKey: config.appKey,
      broadcaster: 'reverb'
    },
    hasToken: !!getAuthToken(),
    listenersCount: listeners.length
  }
}

// ✅ Função para forçar reconexão
export const reconnectEcho = () => {
  console.log('🔄 Forçando reconexão do Laravel Echo...')

  if (echoInstance?.connector?.pusher) {
    try {
      echoInstance.connector.pusher.disconnect()

      setTimeout(() => {
        if (echoInstance?.connector?.pusher) {
          echoInstance.connector.pusher.connect()
        }
      }, 1000)
    } catch (error: any) {
      console.error('💥 Erro ao reconectar:', error)
    }
  }
}

// ✅ Função para debug (development only)
export const debugEcho = () => {
  if (process.env.NODE_ENV === 'development') {
    const info = getConnectionInfo()

    console.group('🔍 Debug Laravel Echo')
    console.log('Configuração:', info.config)
    console.log('Estado da conexão:', info.state)
    console.log('Socket ID:', info.socketId)
    console.log('Tem token:', info.hasToken)
    console.log('Listeners ativos:', info.listenersCount)
    console.log('Instância Echo:', echoInstance)
    console.log('Connector Pusher:', echoInstance?.connector?.pusher)
    console.groupEnd()

    return info
  }
}

// ✅ Exportar configuração para uso em outros lugares
export const getReverbConfiguration = getReverbConfig
