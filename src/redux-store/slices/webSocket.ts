import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

interface WebSocketState {
  connected: boolean
}

const initialState: WebSocketState = {
  connected: false
}

export const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    wsConnect(state, action: PayloadAction<{ token: string; clientId: string }>) {
      state.connected = true
    },
    wsDisconnect(state) {
      state.connected = false
    }
  }
})

export const { wsConnect, wsDisconnect } = websocketSlice.actions
export default websocketSlice.reducer
