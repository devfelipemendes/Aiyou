import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

type WebsocketState = {
  status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
  lastConnectedAt: string | null
  error?: string | null
}

const initialState: WebsocketState = {
  status: 'disconnected',
  lastConnectedAt: null,
  error: null
}

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    setWebsocketStatus(state, action: PayloadAction<WebsocketState['status']>) {
      state.status = action.payload

      if (action.payload === 'connected') {
        state.lastConnectedAt = new Date().toISOString()
        state.error = null
      }

      if (action.payload === 'disconnected') {
        state.lastConnectedAt = null
      }
    },
    setWebsocketError(state, action: PayloadAction<string>) {
      state.error = action.payload
    }
  }
})

export const { setWebsocketStatus, setWebsocketError } = websocketSlice.actions
export default websocketSlice.reducer
