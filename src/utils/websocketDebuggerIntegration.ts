// utils/websocketDebuggerIntegration.ts

import { useEffect } from 'react'

import { useWebSocketDebugger } from '@/components/WebSocketDebugger'

// 🔧 Instância global do debugger para ser acessada pelo middleware
let globalDebuggerInstance: ReturnType<typeof useWebSocketDebugger> | null = null

// 🔧 Registrar instância do debugger
export const registerWebSocketDebugger = (debuggerInstance: ReturnType<typeof useWebSocketDebugger>) => {
  globalDebuggerInstance = debuggerInstance
  console.log('🔧 WebSocket Debugger registrado')
}

// 🔧 Função para adicionar mensagem ao debugger
export const addMessageToDebugger = (
  channel: string,
  event: string,
  data: any,
  type: 'sent' | 'received' = 'received'
) => {
  if (globalDebuggerInstance && process.env.NODE_ENV === 'development') {
    globalDebuggerInstance.addMessage({
      channel,
      event,
      data,
      type
    })
  }
}

// 🔧 Hook customizado que integra com o debugger global
export const useWebSocketDebuggerIntegration = () => {
  const debuggerInstance = useWebSocketDebugger()

  // Registrar na instância global quando o hook for usado
  useEffect(() => {
    registerWebSocketDebugger(debuggerInstance)

    return () => {
      globalDebuggerInstance = null
    }
  }, [debuggerInstance])

  return debuggerInstance
}
