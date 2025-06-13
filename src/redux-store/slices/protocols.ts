// redux-store/slices/protocols.ts
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

interface Protocol {
  id: string
  client_id: string
  status: 'active' | 'resolved' | 'closed' | 'pending'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  last_activity?: string
  messages_count: number
  unread_count: number
  operator_name?: string
  client_name?: string
  channel: 'whatsapp' | 'telegram' | 'webchat' | 'email' | 'sms'
  metadata?: any
}

interface ProtocolsState {
  protocols: Protocol[]
  protocolsByClient: Record<string, Protocol[]>
  loading: Record<string, boolean>
  error: string | null
  stats: {
    total: number
    active: number
    urgent: number
    unread: number
  }
}

const initialState: ProtocolsState = {
  protocols: [],
  protocolsByClient: {},
  loading: {},
  error: null,
  stats: {
    total: 0,
    active: 0,
    urgent: 0,
    unread: 0
  }
}

const protocolsSlice = createSlice({
  name: 'protocols',
  initialState,
  reducers: {
    // 🔧 Definir protocolos para um client específico
    setProtocols: (state, action: PayloadAction<{ clientId: string; protocols: Protocol[] }>) => {
      const { clientId, protocols } = action.payload

      state.protocolsByClient[clientId] = protocols

      // Recriar array global de protocolos
      state.protocols = Object.values(state.protocolsByClient).flat()

      // Atualizar estatísticas
      state.stats.total = state.protocols.length
      state.stats.active = state.protocols.filter(p => p.status === 'active').length
      state.stats.urgent = state.protocols.filter(p => p.priority === 'urgent').length
      state.stats.unread = state.protocols.reduce((sum, p) => sum + p.unread_count, 0)

      state.loading[clientId] = false
    },

    // 🔧 Adicionar novo protocolo
    addProtocol: (state, action: PayloadAction<Protocol>) => {
      const protocol = action.payload

      // Verificar se já existe
      const existingIndex = state.protocols.findIndex(p => p.id === protocol.id)

      if (existingIndex === -1) {
        // Adicionar ao array global
        state.protocols.push(protocol)

        // Adicionar ao array do client
        if (!state.protocolsByClient[protocol.client_id]) {
          state.protocolsByClient[protocol.client_id] = []
        }

        state.protocolsByClient[protocol.client_id].push(protocol)

        // Atualizar estatísticas
        state.stats.total++
        if (protocol.status === 'active') state.stats.active++
        if (protocol.priority === 'urgent') state.stats.urgent++
        state.stats.unread += protocol.unread_count || 0
      }
    },

    // 🔧 Atualizar protocolo existente
    updateProtocol: (state, action: PayloadAction<Partial<Protocol> & { id: string }>) => {
      const updatedData = action.payload

      // Atualizar no array global
      const globalIndex = state.protocols.findIndex(p => p.id === updatedData.id)

      if (globalIndex !== -1) {
        const oldProtocol = state.protocols[globalIndex]

        state.protocols[globalIndex] = { ...oldProtocol, ...updatedData }

        // Atualizar no array do client
        const clientProtocols = state.protocolsByClient[oldProtocol.client_id]

        if (clientProtocols) {
          const clientIndex = clientProtocols.findIndex(p => p.id === updatedData.id)

          if (clientIndex !== -1) {
            clientProtocols[clientIndex] = { ...oldProtocol, ...updatedData }
          }
        }

        // Recalcular estatísticas
        state.stats.active = state.protocols.filter(p => p.status === 'active').length
        state.stats.urgent = state.protocols.filter(p => p.priority === 'urgent').length
        state.stats.unread = state.protocols.reduce((sum, p) => sum + p.unread_count, 0)
      }
    },

    // 🔧 Remover protocolo
    removeProtocol: (state, action: PayloadAction<string>) => {
      const protocolId = action.payload

      // Encontrar protocolo para pegar client_id
      const protocolToRemove = state.protocols.find(p => p.id === protocolId)

      if (protocolToRemove) {
        // Remover do array global
        state.protocols = state.protocols.filter(p => p.id !== protocolId)

        // Remover do array do client
        const clientProtocols = state.protocolsByClient[protocolToRemove.client_id]

        if (clientProtocols) {
          state.protocolsByClient[protocolToRemove.client_id] = clientProtocols.filter(p => p.id !== protocolId)
        }

        // Atualizar estatísticas
        state.stats.total--
        if (protocolToRemove.status === 'active') state.stats.active--
        if (protocolToRemove.priority === 'urgent') state.stats.urgent--
        state.stats.unread -= protocolToRemove.unread_count || 0
      }
    },

    // 🔧 Incrementar contador de mensagens não lidas
    incrementUnreadCount: (state, action: PayloadAction<string>) => {
      const protocolId = action.payload

      const protocol = state.protocols.find(p => p.id === protocolId)

      if (protocol) {
        protocol.unread_count++

        // Atualizar também no array do client
        const clientProtocols = state.protocolsByClient[protocol.client_id]
        const clientProtocol = clientProtocols?.find(p => p.id === protocolId)

        if (clientProtocol) {
          clientProtocol.unread_count++
        }

        // Atualizar estatísticas
        state.stats.unread++
      }
    },

    // 🔧 Marcar protocolo como lido
    markAsRead: (state, action: PayloadAction<string>) => {
      const protocolId = action.payload

      const protocol = state.protocols.find(p => p.id === protocolId)

      if (protocol && protocol.unread_count > 0) {
        const previousUnread = protocol.unread_count

        protocol.unread_count = 0

        // Atualizar também no array do client
        const clientProtocols = state.protocolsByClient[protocol.client_id]
        const clientProtocol = clientProtocols?.find(p => p.id === protocolId)

        if (clientProtocol) {
          clientProtocol.unread_count = 0
        }

        // Atualizar estatísticas
        state.stats.unread -= previousUnread
      }
    },

    // 🔧 Definir estado de carregamento
    setLoading: (state, action: PayloadAction<{ clientId: string; loading: boolean }>) => {
      const { clientId, loading } = action.payload

      state.loading[clientId] = loading
    },

    // 🔧 Definir erro
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})

export const {
  setProtocols,
  addProtocol,
  updateProtocol,
  removeProtocol,
  incrementUnreadCount,
  markAsRead,
  setLoading,
  setError
} = protocolsSlice.actions

// 🔧 Selectors
export const selectAllProtocols = (state: any) => state.protocolsReducer.protocols
export const selectProtocolsByClient = (clientId: string) => (state: any) =>
  state.protocolsReducer.protocolsByClient[clientId] || []
export const selectProtocolById = (protocolId: string) => (state: any) =>
  state.protocolsReducer.protocols.find((p: Protocol) => p.id === protocolId)
export const selectProtocolStats = (state: any) => state.protocolsReducer.stats
export const selectProtocolsLoading = (state: any) => state.protocolsReducer.loading
export const selectProtocolsError = (state: any) => state.protocolsReducer.error

export default protocolsSlice.reducer
