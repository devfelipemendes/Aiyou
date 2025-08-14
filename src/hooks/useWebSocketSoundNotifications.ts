import { useCallback } from 'react'

import { soundNotificationManager } from '@/utils/notifications/soundNotifications'

export const useWebSocketSoundNotifications = () => {
  const handleOperatorCalled = useCallback((eventData: any) => {
    if (eventData.question_operator === 1 || eventData.question_operator === true) {
      soundNotificationManager.playNotification('operator_called')
    }
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNewProtocol = useCallback((eventData: any) => {
    soundNotificationManager.playNotification('new_protocol')
  }, [])

  return {
    handleOperatorCalled,
    handleNewProtocol
  }
}
