import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

import { getAuthToken } from '@/utils/getAuthToken'

let echoInstance: Echo<any> | null = null
let isReconnected = false

type ListenerCallback = () => void
const listeners: ListenerCallback[] = []

export const getEcho = () => {
  if (!echoInstance) {
    window.Pusher = Pusher

    const token = getAuthToken()

    console.log('Token chegou no ECHO', token)

    const pusher = new Pusher('your-key', {
      cluster: 'mt1',
      forceTLS: true,
      authEndpoint: '/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    echoInstance = new Echo({ broadcaster: 'pusher', client: pusher })

    // 🔁 Reconexão
    pusher.connection.bind('connected', () => {
      if (isReconnected) {
        console.log('[Echo] Reconectado — restaurando listeners...')
        listeners.forEach(cb => cb()) // Restaura os listeners
      }

      isReconnected = true
    })
  }

  return echoInstance
}

// 🔁 Usado pelos listeners para garantir re-listen após reconexão
export const registerReconnectListener = (callback: ListenerCallback) => {
  listeners.push(callback)
}

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
    isReconnected = false
    listeners.length = 0 // limpa tudo
  }
}
