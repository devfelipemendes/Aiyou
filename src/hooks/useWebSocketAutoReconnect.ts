// src/hooks/useWebSocketAutoReconnect.ts
import { useEffect } from 'react'

import { startAutoReconnect, stopAutoReconnect } from '@/utils/websocketAutoReconnect'

export function useWebSocketAutoReconnect() {
  useEffect(() => {
    // Só iniciar se estiver logado (tem token)
    const token = document.cookie.includes('token=')

    if (!token) {
      console.log('🚫 Não logado - pulando auto-reconexão')

      return
    }

    console.log('🚀 Iniciando WebSocket com auto-reconexão')

    // 🔧 CORRIGIDO: Remover variável não utilizada
    startAutoReconnect({
      checkInterval: 5000, // Verifica a cada 5 segundos
      maxRetries: 15, // Máximo 15 tentativas
      retryDelay: 3000, // 3 segundos entre tentativas
      showToasts: true // Mostrar notificações
    })

    // Cleanup quando componente desmontar
    return () => {
      console.log('🛑 Parando auto-reconexão')
      stopAutoReconnect()
    }
  }, [])
}
