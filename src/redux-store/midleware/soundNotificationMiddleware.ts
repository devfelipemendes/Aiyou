import type { Middleware } from '@reduxjs/toolkit'

import { soundNotificationManager } from '@/utils/notifications/soundNotifications'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const soundNotificationMiddleware: Middleware = _store => next => (action: any) => {
  const result = next(action)

  try {
    // 🔊 NOTIFICAÇÃO 1: Operador chamado (question_operator = 1)
    if (action.type === 'monitoring/updatedQuestionOperator') {
      const payload = action.payload as { protocol: string; question_operator: boolean }

      if (payload.question_operator === true) {
        console.log('🚨 [MIDDLEWARE] Operador chamado! Reproduzindo notificação sonora...')
        soundNotificationManager.playNotification('operator_called')
      }
    }

    if (action.type === 'monitoring/addNewChat') {
      console.log('📋 [MIDDLEWARE] Novo protocolo criado! Reproduzindo notificação sonora...')
      soundNotificationManager.playNotification('new_protocol')
    }

    // 🔊 NOTIFICAÇÃO 2: Novo protocolo criado
    if (action.type === 'protocols/addProtocol') {
      console.log('📋 Novo protocolo criado! Reproduzindo notificação sonora...')
      soundNotificationManager.playNotification('new_protocol')
    }
  } catch (error) {
    console.error('🔇 Erro no middleware de notificações sonoras:', error)
  }

  return result
}
