import { soundNotificationManager } from './soundNotifications'

// Função auxiliar para integrar diretamente nos listeners do WebSocket
export const handleSoundNotifications = {
  onQuestionUpdated: () => {
    console.log('🚨 [WebSocket] Operador chamado! Reproduzindo som...')
    soundNotificationManager.playNotification('operator_called')
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onProtocolCreated: () => {
    console.log('📋 [WebSocket] Novo protocolo! Reproduzindo som...')
    soundNotificationManager.playNotification('new_protocol')
  }
}
