import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export interface Protocol {
  id: string | number
  title: string
  status: string

  // Adicione outros campos conforme a estrutura que o backend envia
}

interface ProtocolsState {
  list: Protocol[]
}

const initialState: ProtocolsState = {
  list: []
}

const protocolsSlice = createSlice({
  name: 'protocols',
  initialState,
  reducers: {
    addProtocol: (state, action: PayloadAction<Protocol>) => {
      const exists = state.list.some(p => p.id === action.payload.id)

      if (!exists) {
        state.list.push(action.payload)
      }
    },
    updateProtocol: (state, action: PayloadAction<Protocol>) => {
      const index = state.list.findIndex(p => p.id === action.payload.id)

      if (index !== -1) {
        state.list[index] = action.payload
      }
    }
  }
})

export const { addProtocol, updateProtocol } = protocolsSlice.actions

export default protocolsSlice.reducer
