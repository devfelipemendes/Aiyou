import type { Middleware } from '@reduxjs/toolkit'

import { soundNotificationManager } from '@/utils/notifications/soundNotifications'

interface QuestionUpdatedPayload {
  question_operator?: number | boolean
  protocol?: string
  [key: string]: any
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const soundNotificationMiddleware: Middleware = _store => next => (action: any) => {
  const result = next(action)

  try {
    // 🔊 NOTIFICAÇÃO 1: Operador chamado (question_operator = 1)
    if (action.type === 'questions/updateQuestion' || action.type === 'messages/updateMessage') {
      const payload = action.payload as QuestionUpdatedPayload

      if (payload.question_operator === 1 || payload.question_operator === true) {
        console.log('🚨 Operador chamado! Reproduzindo notificação sonora...')
        soundNotificationManager.playNotification('operator_called')
      }
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
