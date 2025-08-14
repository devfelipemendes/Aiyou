// src/utils/websocketAutoReconnect.ts
import { toast } from 'react-toastify'

import { getEcho, disconnectEcho } from '@/redux-store/websocket/echo'

interface AutoReconnectConfig {
  checkInterval: number
  maxRetries: number
  retryDelay: number
  showToasts: boolean
  connectionTimeout: number // 🆕 NOVO: Timeout para considerar conexão válida
}

class WebSocketAutoReconnect {
  private intervalId: NodeJS.Timeout | null = null
  private retryCount = 0
  private isReconnecting = false
  private wasConnected = false
  private listeners: Array<(connected: boolean) => void> = []

  private config: AutoReconnectConfig = {
    checkInterval: 5000,
    maxRetries: 10,
    retryDelay: 2000,
    showToasts: true,
    connectionTimeout: 10000 // 🆕 10 segundos para confirmar conexão
  }

  constructor(customConfig?: Partial<AutoReconnectConfig>) {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig }
    }
  }

  start() {
    if (this.intervalId) {
      console.log('🔄 Monitor de reconexão já está ativo')

      return
    }

    console.log('🎯 Iniciando monitor de auto-reconexão WebSocket')
    this.wasConnected = this.isReallyConnected() // 🆕 Verificação mais rigorosa

    this.intervalId = setInterval(() => {
      this.checkConnection()
    }, this.config.checkInterval)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('🛑 Monitor de auto-reconexão parado')
    }
  }

  // 🆕 NOVO: Verificação mais rigorosa da conexão
  private isReallyConnected(): boolean {
    try {
      const echo = getEcho()

      if (!echo?.connector?.pusher?.connection) {
        return false
      }

      const connection = echo.connector.pusher.connection
      const state = connection.state
      const socketId = connection.socket_id

      // 🎯 Conexão real: deve ter estado 'connected' E socket_id válido
      const isConnected = state === 'connected' && socketId && socketId.length > 0

      // console.log(`🔍 Verificação rigorosa: ${isConnected ? '✅' : '❌'}`, {
      //   state,
      //   socketId: socketId || 'null',
      //   hasEcho: !!echo,
      //   hasConnection: !!connection
      // })

      return isConnected
    } catch (error) {
      console.error('💥 Erro na verificação de conexão:', error)

      return false
    }
  }

  // 🆕 NOVO: Teste de "ping" para validar conexão
  private async testRealConnection(): Promise<boolean> {
    return new Promise(resolve => {
      try {
        const echo = getEcho()

        if (!echo?.connector?.pusher?.connection) {
          resolve(false)

          return
        }

        const connection = echo.connector.pusher.connection

        // 🧪 Teste: escutar evento de ping/pong
        const timeoutId = setTimeout(() => {
          resolve(false)
        }, 5000)

        // Se conseguir fazer bind, a conexão está ativa
        connection.bind('pusher:ping', () => {
          clearTimeout(timeoutId)
          resolve(true)
        })

        // Enviar ping
        connection.send_event('pusher:ping', {})
      } catch (error) {
        console.error('💥 Erro no teste de conexão:', error)
        resolve(false)
      }
    })
  }

  private checkConnection() {
    const isConnected = this.isReallyConnected()

    // console.log(`🔍 Verificando WebSocket: ${isConnected ? '✅ Conectado' : '❌ Desconectado'}`)

    if (!isConnected && !this.isReconnecting && this.retryCount < this.config.maxRetries) {
      this.attemptReconnect()
    }

    if (isConnected && !this.wasConnected) {
      this.onReconnected()
    }

    if (!isConnected && this.wasConnected) {
      this.onDisconnected()
    }

    this.wasConnected = isConnected
  }

  // 🔧 MELHORADO: Reconexão mais agressiva
  private async attemptReconnect() {
    if (this.isReconnecting) return

    this.isReconnecting = true
    this.retryCount++

    console.log(`🔄 Tentativa de reconexão ${this.retryCount}/${this.config.maxRetries}`)

    if (this.config.showToasts && this.retryCount === 1) {
      toast.info('Reconectando...', { autoClose: 2000 })
    }

    try {
      // 🚨 PASSO 1: Desconectar completamente primeiro
      console.log('🔌 Desconectando completamente...')
      disconnectEcho()

      await new Promise(resolve => setTimeout(resolve, 1000))

      // 🚨 PASSO 2: Aguardar antes de reconectar
      console.log('⏱️ Aguardando antes de reconectar...')
      await new Promise(resolve => setTimeout(resolve, this.config.retryDelay))

      // 🚨 PASSO 3: Reconectar forçando nova instância
      console.log('🔄 Criando nova conexão...')

      // 🚨 PASSO 4: Aguardar tempo suficiente para conexão real
      console.log('⏳ Aguardando conexão estabilizar...')
      await new Promise(resolve => setTimeout(resolve, this.config.connectionTimeout))

      // 🚨 PASSO 5: Testar conexão real
      const isReallyConnected = await this.testRealConnection()

      if (isReallyConnected) {
        console.log('✅ Reconexão REAL bem-sucedida!')
        this.retryCount = 0

        if (this.config.showToasts) {
          toast.success('Reconectado!', { autoClose: 2000 })
        }
      } else {
        console.log(`❌ Tentativa ${this.retryCount} falhou - conexão não é real`)
      }
    } catch (error) {
      console.error('💥 Erro na tentativa de reconexão:', error)
    } finally {
      this.isReconnecting = false
    }

    if (this.retryCount >= this.config.maxRetries) {
      console.error('🚨 Máximo de tentativas de reconexão atingido')

      if (this.config.showToasts) {
        toast.error('Falha na reconexão. Recarregue a página.', {
          autoClose: false
        })
      }
    }
  }

  private onDisconnected() {
    console.log('📡 WebSocket desconectado')
    this.retryCount = 0

    this.listeners.forEach(listener => {
      try {
        listener(false)
      } catch (error) {
        console.error('💥 Erro no listener de desconexão:', error)
      }
    })
  }

  private onReconnected() {
    console.log('🎉 WebSocket reconectado REALMENTE!')
    this.retryCount = 0

    this.listeners.forEach(listener => {
      try {
        listener(true)
      } catch (error) {
        console.error('💥 Erro no listener de reconexão:', error)
      }
    })
  }

  addListener(callback: (connected: boolean) => void) {
    this.listeners.push(callback)
  }

  removeListener(callback: (connected: boolean) => void) {
    const index = this.listeners.indexOf(callback)

    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  getStatus() {
    return {
      isActive: !!this.intervalId,
      isConnected: this.isReallyConnected(),
      isReconnecting: this.isReconnecting,
      retryCount: this.retryCount,
      maxRetries: this.config.maxRetries
    }
  }
}

export const autoReconnect = new WebSocketAutoReconnect()

export const startAutoReconnect = (config?: Partial<AutoReconnectConfig>) => {
  if (config) {
    const customReconnect = new WebSocketAutoReconnect(config)

    customReconnect.start()

    return customReconnect
  }

  autoReconnect.start()

  return autoReconnect
}

export const stopAutoReconnect = () => {
  autoReconnect.stop()
}

export const getReconnectStatus = () => {
  return autoReconnect.getStatus()
}
