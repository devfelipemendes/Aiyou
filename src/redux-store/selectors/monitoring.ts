import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@/redux-store'

// 🎯 SELETORES BASE (dados brutos)
const selectMonitoringState = (state: RootState) => state.monitoring
const selectChatsByProtocol = (state: RootState) => state.monitoring.chatsByProtocol
const selectChatOrder = (state: RootState) => state.monitoring.chatOrder

const chatSelectorCache = new Map<string, ReturnType<typeof createSelector>>()

export const getChatSelector = (protocol: string) => {
  // ✅ CACHE: Reutiliza selector se já existe
  if (!chatSelectorCache.has(protocol)) {
    // ✅ CRIAR NOVO: Selector individual memoizado
    const newSelector = createSelector([(state: RootState) => state.monitoring.chatsByProtocol[protocol]], chat => {
      // 🔍 DEBUG: Log apenas quando selector específico é executado
      if (process.env.NODE_ENV === 'development' && chat) {
        console.log(`🎯 Selector ${protocol} executado:`, {
          messageCount: chat.messageCount,
          hasHistory: chat.history?.length > 0,
          isLoading: chat.historyLoading
        })
      }

      return chat || null
    })

    // ✅ CACHE: Salva para reutilização
    chatSelectorCache.set(protocol, newSelector)

    console.log(`🏭 Factory criou selector para protocolo: ${protocol}`)
  }

  return chatSelectorCache.get(protocol)!
}

// 🔥 SELETOR PRINCIPAL: Lista ordenada de chats
export const selectOrderedChats = createSelector(
  [selectChatsByProtocol, selectChatOrder],
  (chatsByProtocol, chatOrder) => {
    // ✅ MEMOIZADO: só recalcula se chatsByProtocol OU chatOrder mudarem
    return chatOrder.map(protocol => chatsByProtocol[protocol]).filter(Boolean) // Remove protocolos órfãos
  }
)

// 🔥 SELETOR INDIVIDUAL: Chat específico por protocolo
export const selectChatByProtocol = createSelector(
  [selectChatsByProtocol, (_: RootState, protocol: string) => protocol],
  (chatsByProtocol, protocol) => {
    // ✅ MEMOIZADO POR PROTOCOLO: só recalcula se ESTE chat mudar
    console.warn(`⚠️ DEPRECATED: Use getChatSelector("${protocol}") em vez de selectChatByProtocol`)

    return chatsByProtocol[protocol] || null
  }
)

// 🔥 FACTORY DE SELETORES: Cria seletor memoizado para cada card
export const createChatSelector = (protocol: string) =>
  createSelector([selectChatsByProtocol], chatsByProtocol => chatsByProtocol[protocol] || null)

// 🔥 SELETOR: Estatísticas gerais (calculadas apenas quando necessário)
export const selectMonitoringStats = createSelector([selectOrderedChats], chats => {
  if (!chats.length) {
    return {
      total: 0,
      totalMessages: 0,
      successCount: 0,
      errorCount: 0,
      averageMessagesPerChat: 0,
      mostActiveChat: null,
      latestActivity: null
    }
  }

  const totalMessages = chats.reduce((sum, chat) => sum + (chat.messageCount || 0), 0)

  const successCount = chats.filter(chat => !chat.historyError).length
  const errorCount = chats.filter(chat => chat.historyError).length

  const mostActiveChat = chats.reduce((mostActive, current) => {
    const currentCount = current.messageCount || 0
    const mostActiveCount = mostActive?.messageCount || 0

    return currentCount > mostActiveCount ? current : mostActive
  }, chats[0])

  const latestActivity = chats
    .filter(chat => chat.lastMessage)
    .map(chat => chat.lastMessage!.created_at)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]

  return {
    total: chats.length,
    totalMessages,
    successCount,
    errorCount,
    averageMessagesPerChat: Math.round(totalMessages / chats.length),
    mostActiveChat,
    latestActivity
  }
})

// 🔥 SELETORES: Estados de UI
export const selectMonitoringUI = createSelector([selectMonitoringState], monitoring => ({
  isLoading: monitoring.isLoading,
  isRefreshing: monitoring.isRefreshing,
  error: monitoring.error,
  selectedProtocol: monitoring.selectedProtocol,
  isWebSocketConnected: monitoring.isWebSocketConnected,
  connectedChannels: monitoring.connectedChannels
}))

// 🔥 SELETOR: Chat selecionado completo
export const selectSelectedChat = createSelector(
  [selectChatsByProtocol, selectMonitoringState],
  (chatsByProtocol, monitoring) => {
    if (!monitoring.selectedProtocol) return null

    return chatsByProtocol[monitoring.selectedProtocol] || null
  }
)

// 🔥 SELETORES: Para filtros específicos (se necessário)
export const selectChatsBySource = createSelector(
  [selectOrderedChats, (_: RootState, source: string) => source],
  (chats, source) => chats.filter(chat => chat.source === source)
)

export const selectChatsByStatus = createSelector(
  [selectOrderedChats, (_: RootState, status: string) => status],
  (chats, status) => chats.filter(chat => chat.status === status)
)

// 🔥 SELETOR: Protocolos conectados via WebSocket
export const selectConnectedProtocols = createSelector([selectMonitoringState], monitoring => {
  return monitoring.connectedChannels
    .filter(channel => channel.startsWith('protocol.'))
    .map(channel => channel.replace('protocol.', ''))
})

// 🔥 HOOK CUSTOMIZADO: Para usar seletor individual em componentes
export const useChatSelector = (protocol: string) => {
  return createSelector([selectChatsByProtocol], chatsByProtocol => chatsByProtocol[protocol] || null)
}

export const selectRenderableChats = createSelector(
  [(state: RootState) => Object.values(state.monitoring.chatsByProtocol)],
  chats => {
    const renderableChats = chats.filter(chat => {
      const hasMessages = chat.history && chat.history.length > 0
      const notAwaitingHistory = !chat.isAwaitingHistory
      const hasError = !!chat.historyError

      // Renderizar se: tem mensagens OU não está aguardando OU tem erro
      return hasMessages || notAwaitingHistory || hasError
    })

    return renderableChats
  }
)

export const clearChatSelectorCache = () => {
  chatSelectorCache.clear()
  console.log('🧹 Cache de seletores limpo')
}

// 🔍 UTILITY: Debug do cache
export const getCacheSummary = () => {
  return {
    cacheSize: chatSelectorCache.size,
    cachedProtocols: Array.from(chatSelectorCache.keys())
  }
}

export type ChatSelector = ReturnType<typeof getChatSelector>
export type MonitoringStats = ReturnType<typeof selectMonitoringStats>
export type MonitoringUI = ReturnType<typeof selectMonitoringUI>
