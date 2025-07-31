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

// ✅ Configurações do .env para Reverb
const getReverbConfig = () => {
  const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME || 'https'
  const isSecure = scheme === 'https'

  let port = process.env.NEXT_PUBLIC_REVERB_PORT

  if (!port || port === 'null' || port === '') {
    // Usar portas padrão se não especificada
    port = isSecure ? '443' : '80'
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_AIYOU_BASE_URL || 'https://staging.api.aiyou.com.br/v1'
  const reverbUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'staging.reverb.aiyou.com.br'

  const reverbHostname = extractHostname(reverbUrl) || 'staging.api.aiyou.com.br'

  const config = {
    appKey: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: reverbHostname,
    port: parseInt(port),
    scheme: process.env.NEXT_PUBLIC_REVERB_SCHEME || 'https',
    apiUrl: apiBaseUrl,
    baseUrl: process.env.NEXT_PUBLIC_API_AIYOU_BASE_URL || 'staging.reverb.aiyou.com.br/v1',
    authEndpoint: `${apiBaseUrl}/broadcasting/auth`,

    // 🔧 URLs para debug
    wsUrl: `${scheme}://${reverbHostname}${parseInt(port) !== 443 && parseInt(port) !== 80 ? `:${port}` : ''}`,
    reverbFullUrl: reverbUrl
  }

  console.log('🔧 Configuração Reverb FINAL:', {
    appKey: config.appKey,
    wsHost: config.wsHost,
    port: config.port,
    scheme: config.scheme,
    wsUrl: config.wsUrl,
    authEndpoint: config.authEndpoint,
    note: '✅ WebSocket → Reverb hostname, Auth → API completa'
  })

  return config
}

export const getEcho = () => {
  if (!echoInstance) {
    const config = getReverbConfig()
    const token = getAuthToken()

    console.log('🔌 Iniciando Laravel Echo com Reverb...')
    console.log('🔌 Iniciando Laravel Echo FINAL...')
    console.log('🔗 WebSocket irá conectar em:', config.wsUrl)
    console.log('📡 Auth será feita em:', config.authEndpoint)
    console.log('🔑 Token de autenticação:', token ? 'Presente' : 'Ausente')

    if (!token) {
      console.warn('⚠️ Token não encontrado. WebSocket pode falhar na autenticação.')
    }

    window.Pusher = Pusher

    try {
      echoInstance = new Echo({
        broadcaster: 'pusher',
        key: config.appKey,
        wsHost: config.wsHost,
        forceTLS: config.scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
        cluster: 'local',
        authEndpoint: config.authEndpoint,

        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        },

        authorizer: (channel: any) => {
          return {
            authorize: (socketId: string, callback: any) => {
              console.log('🔐 Autorizando canal:', {
                channel: channel.name,
                socketId,
                token: token ? 'Presente' : 'Ausente'
              })

              // Fazer request manual para o endpoint de autenticação
              const xhr = new XMLHttpRequest()

              xhr.open('POST', config.authEndpoint, true)
              xhr.setRequestHeader('Content-Type', 'application/json')
              xhr.setRequestHeader('Accept', 'application/json')
              xhr.setRequestHeader('Authorization', `Bearer ${token}`)
              xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

              xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                  if (xhr.status === 200) {
                    try {
                      const response = JSON.parse(xhr.responseText)

                      console.log('✅ Autorização bem-sucedida:', response)
                      callback(null, response)
                    } catch (e) {
                      console.error('💥 Erro ao parse da resposta de autorização:', e)
                      callback(new Error('Erro ao processar resposta'))
                    }
                  } else {
                    console.error('💥 Erro de autorização:', {
                      status: xhr.status,
                      statusText: xhr.statusText,
                      response: xhr.responseText
                    })
                    callback(new Error(`Erro de autorização: ${xhr.status}`))
                  }
                }
              }

              // Enviar dados necessários para autorização
              const authData = {
                socket_id: socketId,
                channel_name: channel.name
              }

              console.log('📤 Enviando dados de autorização:', authData)
              xhr.send(JSON.stringify(authData))
            }
          }
        }
      })

      const pusherConnection = echoInstance.connector.pusher.connection

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

      pusherConnection.bind('state_change', (states: any) => {
        console.log('🔄 Estado da conexão mudou:', {
          previous: states.previous,
          current: states.current
        })
      })

      console.log('🎉 Laravel Echo configurado com sucesso para Reverb!')
      console.log('🌐 URL de conexão:', `${config.scheme}://${config.wsHost}:${config.port}`)
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
      wsUrl: `${config.scheme}://${config.wsHost}:${config.port}`,
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
