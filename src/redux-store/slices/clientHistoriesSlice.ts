// redux-store/slices/clientHistoriesSlice.ts - VERSÃO CORRIGIDA
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { ProtocolHistoryItem } from '@/api/endpoints/chat/protocolHistory'

interface ClientHistoriesState {
  historiesByProtocol: Record<string, ProtocolHistoryItem>

  // 🔥 CORRIGIDO: Set → Array (serializável)
  loadingProtocols: string[] // ← Mudança aqui

  isLoading: boolean
  error: string | null
  lastFetched: number | null
  stats: {
    totalProtocols: number
    totalMessages: number
    clientsCount: number
    lastUpdate: number | null
  }
}

const initialState: ClientHistoriesState = {
  historiesByProtocol: {},
  loadingProtocols: [], // 🔥 CORRIGIDO: Array vazio
  isLoading: false,
  error: null,
  lastFetched: null,
  stats: {
    totalProtocols: 0,
    totalMessages: 0,
    clientsCount: 0,
    lastUpdate: null
  }
}

const clientHistoriesSlice = createSlice({
  name: 'clientHistories',
  initialState,
  reducers: {
    setClientHistories: (state, action: PayloadAction<Record<string, ProtocolHistoryItem>>) => {
      const histories = action.payload

      console.log(`📥 Carregando ${Object.keys(histories).length} históricos de clientes`)

      Object.entries(histories).forEach(([protocol, data]) => {
        state.historiesByProtocol[protocol] = data

        // 🔥 CORRIGIDO: Remover do array
        state.loadingProtocols = state.loadingProtocols.filter(p => p !== protocol)
      })

      // Atualizar estatísticas (mantido igual)
      state.stats = {
        totalProtocols: Object.keys(state.historiesByProtocol).length,
        totalMessages: Object.values(state.historiesByProtocol).reduce((sum, item) => sum + item.history.length, 0),
        clientsCount: new Set(Object.values(state.historiesByProtocol).map(item => item.identifier)).size,
        lastUpdate: Date.now()
      }

      state.lastFetched = Date.now()
      state.isLoading = false
      state.error = null

      console.log('📊 Estatísticas atualizadas:', state.stats)
    },

    setProtocolHistory: (state, action: PayloadAction<{ protocol: string; data: ProtocolHistoryItem }>) => {
      const { protocol, data } = action.payload

      console.log(`📥 Histórico do protocolo ${protocol} carregado`)

      state.historiesByProtocol[protocol] = data

      // 🔥 CORRIGIDO: Remover do array
      state.loadingProtocols = state.loadingProtocols.filter(p => p !== protocol)

      // Recalcular estatísticas (mantido igual)
      state.stats = {
        totalProtocols: Object.keys(state.historiesByProtocol).length,
        totalMessages: Object.values(state.historiesByProtocol).reduce((sum, item) => sum + item.history.length, 0),
        clientsCount: new Set(Object.values(state.historiesByProtocol).map(item => item.identifier)).size,
        lastUpdate: Date.now()
      }
    },

    // 🔥 CORRIGIDO: Usar array methods
    setProtocolLoading: (state, action: PayloadAction<string>) => {
      const protocol = action.payload

      if (!state.loadingProtocols.includes(protocol)) {
        state.loadingProtocols.push(protocol)
      }

      console.log(`⏳ Carregando histórico do protocolo: ${protocol}`)
    },

    removeProtocolLoading: (state, action: PayloadAction<string>) => {
      const protocol = action.payload

      state.loadingProtocols = state.loadingProtocols.filter(p => p !== protocol)
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
      console.error('💥 Erro nos históricos de clientes:', action.payload)
    },

    addMessageToProtocol: (
      state,
      action: PayloadAction<{
        protocol: string
        message: {
          id: string
          content: string
          role: 'user' | 'assistant' | 'operator'
          operator: number | null
          created_at: string
        }
      }>
    ) => {
      const { protocol, message } = action.payload
      const protocolHistory = state.historiesByProtocol[protocol]

      if (protocolHistory) {
        protocolHistory.history.push(message)

        protocolHistory.history.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

        state.stats.totalMessages++
        state.stats.lastUpdate = Date.now()

        console.log(`📨 Nova mensagem adicionada ao protocolo ${protocol}`)
      }
    },

    clearHistories: state => {
      console.log('🧹 Limpando todos os históricos de clientes')
      state.historiesByProtocol = {}
      state.loadingProtocols = [] // 🔥 CORRIGIDO: Array vazio
      state.error = null
      state.lastFetched = null
      state.stats = {
        totalProtocols: 0,
        totalMessages: 0,
        clientsCount: 0,
        lastUpdate: null
      }
    },

    removeProtocolHistory: (state, action: PayloadAction<string>) => {
      const protocol = action.payload

      if (state.historiesByProtocol[protocol]) {
        delete state.historiesByProtocol[protocol]
        state.loadingProtocols = state.loadingProtocols.filter(p => p !== protocol)

        state.stats = {
          totalProtocols: Object.keys(state.historiesByProtocol).length,
          totalMessages: Object.values(state.historiesByProtocol).reduce((sum, item) => sum + item.history.length, 0),
          clientsCount: new Set(Object.values(state.historiesByProtocol).map(item => item.identifier)).size,
          lastUpdate: Date.now()
        }

        console.log(`🗑️ Protocolo ${protocol} removido`)
      }
    }
  }
})

// Actions (mantidas iguais)
export const {
  setClientHistories,
  setProtocolHistory,
  setProtocolLoading,
  removeProtocolLoading,
  setLoading,
  setError,
  addMessageToProtocol,
  clearHistories,
  removeProtocolHistory
} = clientHistoriesSlice.actions

// 🔥 SELECTORS CORRIGIDOS
export const selectHistoryByProtocol = (state: any, protocol: string) =>
  state.clientHistories.historiesByProtocol[protocol] || null

export const selectHistoriesByClient = (state: any, identifier: string) => {
  const allHistories: Record<string, ProtocolHistoryItem> = state.clientHistories.historiesByProtocol
  const result: Record<string, ProtocolHistoryItem> = {}

  Object.keys(allHistories).forEach(protocol => {
    const historyItem = allHistories[protocol]

    if (historyItem.identifier === identifier) {
      result[protocol] = historyItem
    }
  })

  return result
}

export const selectAllHistories = (state: any) => state.clientHistories.historiesByProtocol
export const selectClientHistoriesLoading = (state: any) => state.clientHistories.isLoading
export const selectClientHistoriesError = (state: any) => state.clientHistories.error
export const selectClientHistoriesStats = (state: any) => state.clientHistories.stats
export const selectLastFetched = (state: any) => state.clientHistories.lastFetched

// 🔥 CORRIGIDO: Selector que usa array
export const selectProtocolLoading = (state: any, protocol: string) =>
  state.clientHistories.loadingProtocols.includes(protocol)

export const selectLoadingProtocols = (state: any) => state.clientHistories.loadingProtocols

// Outros selectors (mantidos iguais)
export const selectProtocolsByClient = (state: any, identifier: string) => {
  const histories = selectHistoriesByClient(state, identifier)

  return Object.keys(histories).sort((a, b) => {
    const historyA = histories[a]
    const historyB = histories[b]
    const lastA = historyA.history[historyA.history.length - 1]?.created_at || ''
    const lastB = historyB.history[historyB.history.length - 1]?.created_at || ''

    return new Date(lastB).getTime() - new Date(lastA).getTime()
  })
}

export const selectClientStats = (state: any, identifier: string) => {
  const clientHistories = selectHistoriesByClient(state, identifier)
  const protocols = Object.values(clientHistories)

  return {
    protocolCount: protocols.length,
    totalMessages: protocols.reduce((sum, p) => sum + p.history.length, 0),
    lastActivity: protocols.reduce((latest, p) => {
      const lastMsg = p.history[p.history.length - 1]

      if (!lastMsg) return latest
      const msgTime = new Date(lastMsg.created_at).getTime()

      return msgTime > latest ? msgTime : latest
    }, 0)
  }
}

export default clientHistoriesSlice.reducer
