// src/hooks/useCardNotifications.ts - VERSÃO CORRIGIDA SEM ERROS

import { useState, useCallback } from 'react'

// 🔥 TIPOS: Definindo aqui para evitar problemas de importação
type NotificationType = 'normal' | 'operator_call' | 'unresolved' | 'operator_control' | 'no_response'
type ChatStatus = 'ativo' | 'encerrado' | 'resolvido' | 'nao_resolvido' | 'chamou_operador'

// 🔥 INTERFACE: Estado do hook
interface CardNotificationState {
  selectedCardId: string | null
  hoveredCardId: string | null
}

// 🔥 INTERFACE: Retorno do hook
interface UseCardNotificationsReturn {
  selectedCardId: string | null
  hoveredCardId: string | null

  // Handlers
  handleCardClick: (clientId: string) => void
  handleCardHover: (clientId: string, isHovered: boolean) => void
  clearSelection: () => void

  // Checkers
  isCardSelected: (clientId: string) => boolean
  isCardHovered: (clientId: string) => boolean

  // Notification helpers
  getNotificationType: (client: any) => NotificationType
  getNotificationCounts: (clients: any[]) => Record<NotificationType, number>
}

// 🔥 HOOK PRINCIPAL: Simplificado e sem erros
export const useCardNotifications = (): UseCardNotificationsReturn => {
  const [state, setState] = useState<CardNotificationState>({
    selectedCardId: null,
    hoveredCardId: null
  })

  // 🔥 HANDLER: Click no card
  const handleCardClick = useCallback((clientId: string) => {
    console.log('Card clicked:', clientId) // Debug
    setState(prev => ({
      ...prev,
      selectedCardId: prev.selectedCardId === clientId ? null : clientId
    }))
  }, [])

  // 🔥 HANDLER: Hover no card
  const handleCardHover = useCallback((clientId: string, isHovered: boolean) => {
    setState(prev => ({
      ...prev,
      hoveredCardId: isHovered ? clientId : null
    }))
  }, [])

  // 🔥 HANDLER: Limpar seleção
  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedCardId: null
    }))
  }, [])

  // 🔥 CHECKER: Se card está selecionado
  const isCardSelected = useCallback(
    (clientId: string): boolean => {
      return state.selectedCardId === clientId
    },
    [state.selectedCardId]
  )

  // 🔥 CHECKER: Se card está com hover
  const isCardHovered = useCallback(
    (clientId: string): boolean => {
      return state.hoveredCardId === clientId
    },
    [state.hoveredCardId]
  )

  // 🔥 HELPER: Determinar tipo de notificação
  const getNotificationType = useCallback((client: any): NotificationType => {
    // Se o client já tem notificationType definido, use ele
    if (client.notificationType) {
      return client.notificationType
    }

    // Determinar baseado no status
    const status: ChatStatus = client.status

    switch (status) {
      case 'chamou_operador':
        return 'operator_call'
      case 'nao_resolvido':
        return 'unresolved'
      case 'ativo':
        // Lógica para detectar "operator_control"
        const lastMessage = client.messages?.[client.messages.length - 1]

        if (lastMessage?.sender === 'operador') {
          const timeDiff = Date.now() - new Date(lastMessage.timestamp).getTime()

          if (timeDiff < 5 * 60 * 1000) {
            // 5 minutos
            return 'operator_control'
          }
        }

        // Verificar se não há resposta há muito tempo
        if (client.lastActivity) {
          const timeDiff = Date.now() - new Date(client.lastActivity).getTime()

          if (timeDiff > 30 * 60 * 1000) {
            // 30 minutos
            return 'no_response'
          }
        }

        return 'normal'
      default:
        return 'normal'
    }
  }, [])

  // 🔥 HELPER: Contar notificações por tipo
  const getNotificationCounts = useCallback(
    (clients: any[]) => {
      const counts: Record<NotificationType, number> = {
        operator_call: 0,
        unresolved: 0,
        operator_control: 0,
        no_response: 0,
        normal: 0
      }

      clients.forEach(client => {
        const type = getNotificationType(client)

        counts[type]++
      })

      return counts
    },
    [getNotificationType]
  )

  return {
    // Estados
    selectedCardId: state.selectedCardId,
    hoveredCardId: state.hoveredCardId,

    // Handlers
    handleCardClick,
    handleCardHover,
    clearSelection,

    // Checkers
    isCardSelected,
    isCardHovered,

    // Helpers
    getNotificationType,
    getNotificationCounts
  }
}

// 🔥 EXPORT dos tipos para usar em outros lugares
export type { NotificationType, UseCardNotificationsReturn }
