// 📁 src/lib/echo.ts
// 🔥 CONFIGURAÇÃO DO LARAVEL ECHO - ATUALIZADA PARA SUAS ENV

import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// 🔧 CONFIGURAÇÃO: Pusher global (necessário para Laravel Echo)
declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo: Echo<any>
  }
}

// ✅ Disponibilizar Pusher globalmente
window.Pusher = Pusher

// 🔧 FUNÇÃO: Obter token de autenticação
function getAuthToken(): string {
  // 🔥 IMPLEMENTAR: Buscar token do Redux store ou localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || ''
  }

  return ''
}

// 🎯 CONFIGURAÇÃO PRINCIPAL DO ECHO - ADAPTADA PARA SUAS VARIÁVEIS
const echoConfig = {
  broadcaster: 'reverb', // ✅ Usando Reverb como especificado

  // 🔥 CHAVE: Da sua ENV
  key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'jjpnmycugrpdugowbnhd',

  // 🔥 HOST: Corrigido para usar dev.reverb.aiyou.com.br
  wsHost: process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'dev.reverb.aiyou.com.br',

  // 🔥 PORTA: Da sua ENV
  wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ? parseInt(process.env.NEXT_PUBLIC_REVERB_PORT) : 8080,
  wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ? parseInt(process.env.NEXT_PUBLIC_REVERB_PORT) : 8080,

  // 🔥 SCHEME: Da sua ENV
  forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
  encrypted: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',

  // 🔧 CONFIGURAÇÕES REVERB
  disableStats: true, // Desabilitar estatísticas do Pusher
  enabledTransports: ['ws', 'wss'], // Transportes permitidos

  // 🔐 AUTENTICAÇÃO: Para canais privados
  auth: {
    headers: {
      // 🔥 TOKEN DE AUTORIZAÇÃO
      Authorization: `Bearer ${getAuthToken()}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  },

  // 🎯 ENDPOINT DE AUTORIZAÇÃO (usando sua API base)
  authEndpoint: `${process.env.NEXT_PUBLIC_API_AIYOU_BASE_URL}/broadcasting/auth`,

  // 🔧 CONFIGURAÇÕES AVANÇADAS REVERB
  enableLogging: process.env.NODE_ENV === 'development' // Logs apenas em dev
}

// 🐛 DEBUG: Mostrar configuração em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Configuração Echo:', {
    broadcaster: echoConfig.broadcaster,
    key: echoConfig.key,
    wsHost: echoConfig.wsHost,
    wsPort: echoConfig.wsPort,
    forceTLS: echoConfig.forceTLS,
    authEndpoint: echoConfig.authEndpoint
  })
}

// 🔧 FUNÇÃO: Inicializar Echo
export const initializeEcho = (): Echo<any> => {
  // ✅ Verificar se já existe instância
  if (window.Echo) {
    console.log('🔌 Echo já inicializado, reutilizando instância')

    return window.Echo
  }

  try {
    // 🔥 CRIAR NOVA INSTÂNCIA
    const echo = new Echo<any>(echoConfig)

    // ✅ Disponibilizar globalmente
    window.Echo = echo

    // 🐛 DEBUG: Logs para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('🔌 Laravel Echo inicializado com sucesso!', {
        config: echoConfig,
        echo: echo
      })
    }

    return echo
  } catch (error) {
    console.error('🔌 Erro ao inicializar Laravel Echo:', error)
    throw error
  }
}

// 🔧 FUNÇÃO: Desconectar Echo
export const disconnectEcho = (): void => {
  if (window.Echo) {
    try {
      window.Echo.disconnect()
      console.log('🔌 Laravel Echo desconectado')
    } catch (error) {
      console.error('🔌 Erro ao desconectar Echo:', error)
    }
  }
}

// 🔧 FUNÇÃO: Reconectar Echo
export const reconnectEcho = (): Echo<any> => {
  console.log('🔌 Reconectando Laravel Echo...')
  disconnectEcho()

  return initializeEcho()
}

// 🔧 FUNÇÃO: Verificar status da conexão
export const getEchoConnectionStatus = (): string => {
  if (!window.Echo) return 'disconnected'

  try {
    // @ts-ignore - Acessar propriedade interna do Pusher
    const connection = window.Echo.connector?.pusher?.connection

    return connection?.state || 'unknown'
  } catch (error) {
    console.error('🔌 Erro ao verificar status:', error)

    return 'error'
  }
}

// 🔧 FUNÇÃO: Atualizar token de autenticação
export const updateEchoAuthToken = (newToken: string): void => {
  if (window.Echo && window.Echo.connector) {
    try {
      // @ts-ignore - Atualizar header de autorização
      window.Echo.connector.options.auth.headers.Authorization = `Bearer ${newToken}`
      console.log('🔌 Token de autenticação atualizado')
    } catch (error) {
      console.error('🔌 Erro ao atualizar token:', error)
    }
  }
}

// 🔧 FUNÇÃO: Testar conexão
export const testConnection = async (): Promise<boolean> => {
  return new Promise(resolve => {
    if (!window.Echo) {
      console.error('🔌 Echo não inicializado')
      resolve(false)

      return
    }

    try {
      // @ts-ignore
      const connection = window.Echo.connector?.pusher?.connection

      if (connection) {
        const currentState = connection.state

        console.log('🔌 Estado atual da conexão:', currentState)

        if (currentState === 'connected') {
          resolve(true)
        } else if (currentState === 'connecting') {
          // Aguardar conexão por até 5 segundos
          const timeout = setTimeout(() => {
            resolve(false)
          }, 5000)

          connection.bind('connected', () => {
            clearTimeout(timeout)
            resolve(true)
          })

          connection.bind('failed', () => {
            clearTimeout(timeout)
            resolve(false)
          })
        } else {
          resolve(false)
        }
      } else {
        resolve(false)
      }
    } catch (error) {
      console.error('🔌 Erro ao testar conexão:', error)
      resolve(false)
    }
  })
}

// 📤 EXPORTS
export { Echo }
export default initializeEcho
