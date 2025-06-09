// store/slices/monitoring.ts
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

interface KanbanState {
  filterOrders: Record<string, string[]>
  lastCleanup: number
}

const initialState: KanbanState = {
  filterOrders: {},
  lastCleanup: Date.now()
}

// 🔥 CORRIGIDO: Nome do slice sem typo
const monitoringSlice = createSlice({
  name: 'monitoring', // 🔥 Nome consistente
  initialState,
  reducers: {
    /**
     * Define a ordem personalizada para uma combinação específica de filtros
     */
    setFilterOrder: (state, action: PayloadAction<{ key: string; order: string[] }>) => {
      const { key, order } = action.payload

      state.filterOrders[key] = order
    },

    /**
     * Remove a ordem personalizada para uma combinação de filtros
     */
    clearFilterOrder: (state, action: PayloadAction<string>) => {
      delete state.filterOrders[action.payload]
    },

    /**
     * Remove todas as ordens personalizadas
     */
    clearAllFilterOrders: state => {
      state.filterOrders = {}
    },

    /**
     * Limpa ordens antigas para evitar crescimento excessivo do estado
     * Mantém apenas as 50 ordens mais recentes
     */
    cleanupOldOrders: state => {
      const entries = Object.entries(state.filterOrders)

      // Se tiver mais de 100 entradas, limpa
      if (entries.length > 100) {
        // Mantém apenas as 50 mais recentes
        const recent = entries.slice(-50)

        state.filterOrders = Object.fromEntries(recent)
      }

      state.lastCleanup = Date.now()
    },

    /**
     * Remove uma ordem específica se ela contém um clientId que não existe mais
     */
    removeClientFromOrders: (state, action: PayloadAction<string>) => {
      const clientIdToRemove = action.payload

      // Percorre todas as ordens e remove o clientId
      Object.keys(state.filterOrders).forEach(key => {
        state.filterOrders[key] = state.filterOrders[key].filter(id => id !== clientIdToRemove)

        // Se a ordem ficou vazia, remove ela completamente
        if (state.filterOrders[key].length === 0) {
          delete state.filterOrders[key]
        }
      })
    },

    /**
     * Atualiza múltiplas ordens de uma vez (útil para sincronização)
     */
    bulkUpdateOrders: (state, action: PayloadAction<Record<string, string[]>>) => {
      state.filterOrders = { ...state.filterOrders, ...action.payload }
    }
  }
})

// Export das actions
export const {
  setFilterOrder,
  clearFilterOrder,
  clearAllFilterOrders,
  cleanupOldOrders,
  removeClientFromOrders,
  bulkUpdateOrders
} = monitoringSlice.actions

// Seletores - 🔥 CORRIGIDO: Tipagem correta
export const selectFilterOrders = (state: { monitoringReducer: KanbanState }) => state.monitoringReducer.filterOrders

export const selectFilterOrder = (state: { monitoringReducer: KanbanState }, filterKey: string) =>
  state.monitoringReducer.filterOrders[filterKey] || null

export const selectLastCleanup = (state: { monitoringReducer: KanbanState }) => state.monitoringReducer.lastCleanup

export const selectOrdersCount = (state: { monitoringReducer: KanbanState }) =>
  Object.keys(state.monitoringReducer.filterOrders).length

// Export do reducer
export default monitoringSlice.reducer

/**
 * Tipos auxiliares para usar no componente
 */
export type { KanbanState }
