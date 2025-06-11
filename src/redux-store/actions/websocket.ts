// store/actions/websocket.ts
export const initWebSocket = (token: string, userId: string) => ({
  type: 'WEBSOCKET/INIT',
  payload: { token, userId }
})

export const disconnectWebSocket = () => ({
  type: 'WEBSOCKET/DISCONNECT'
})
