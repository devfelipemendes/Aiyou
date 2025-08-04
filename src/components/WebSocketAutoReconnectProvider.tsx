// src/components/WebSocketAutoReconnectProvider.tsx
'use client'

import type { ReactNode } from 'react'

import { useWebSocketAutoReconnect } from '@/hooks/useWebSocketAutoReconnect'

interface Props {
  children: ReactNode
}

export function WebSocketAutoReconnectProvider({ children }: Props) {
  // 🔥 EXECUTA o hook de auto-reconexão
  // Isso vai ficar ativo enquanto o Provider existir
  useWebSocketAutoReconnect()

  // 🎯 RENDERIZA os filhos normalmente
  // O Provider é "invisível" - só executa a lógica
  return <>{children}</>
}
