import Echo from 'laravel-echo'
import { io } from 'socket.io-client'

let echo: Echo<any> | null = null

export const socketMiddleware = (storeAPI: any) => (next: any) => (action: any) => {
  const clientId = console.log('')

  switch (action.type) {
    case 'WS_CONNECT':
      if (echo) return next(action) // já conectado

      const token = action.payload?.token // opcional: token de auth

      echo = new Echo({
        broadcaster: 'socket.io',
        client: io,
        host: `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/v1/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      })

      // Exemplos de canais e eventos
      echo
        .private(`client.${[clientId]}`)
        .listen('ChatUpdated', (e: any) => {
          storeAPI.dispatch({ type: 'CHAT_UPDATED', payload: e.chat })
        })
        .listen('OperatorRequested', (e: any) => {
          storeAPI.dispatch({ type: 'OPERATOR_CALLED', payload: e.chatId })
        })

      console.log('[WS] Conectado ao canal dashboard')
      break

    case 'WS_DISCONNECT':
      if (echo) {
        echo.disconnect()
        echo = null
        console.log('[WS] Desconectado')
      }

      break

    default:
      break
  }

  return next(action)
}
