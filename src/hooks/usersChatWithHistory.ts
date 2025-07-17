// 🎯 VERSÃO FINAL POLIDA (baseada no seu código + melhorias)
import { useEffect, useState, useMemo, useCallback } from 'react'

import { useAppDispatch, useAppSelector } from '@/redux-store'
import {
  useGetAllChatsWithHistoryQuery,
  useRefreshChatHistoryMutation,
  type ChatWithHistory,
  type ChatWithHistoryListResponse
} from '@/api/endpoints/chat/history'

import {
  setActiveChats,
  setLoading,
  setError,
  clearAllChats,
  selectSelectedChat,
  selectIsLoading,
  selectError
} from '@/redux-store/slices/chat'
import type { ChatItem } from '@/api/endpoints/chat/queries'

interface UseChatWithHistoryOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  enableFilters?: boolean
  defaultSource?: string
  defaultStatus?: string
  sortBy?: 'lastMessage' | 'messageCount' | 'protocol' | 'assistant'
  sortOrder?: 'asc' | 'desc'
  onLoadComplete?: (data: ChatWithHistoryListResponse) => void
  onError?: (error: any) => void
  onChatSelect?: (protocol: string, chat: ChatWithHistory) => void
}

interface UseChatWithHistoryReturn {
  chats: ChatWithHistory[]
  filteredChats: ChatWithHistory[]
  stats: {
    total: number
    totalMessages: number
    successCount: number
    errorCount: number
    averageMessagesPerChat: number
    mostActiveChat?: ChatWithHistory
    latestActivity?: string
  }
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  refetch: () => void
  refreshSpecificChat: (protocol: string) => Promise<void>
  clearAllData: () => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  sourceFilter: string
  setSourceFilter: (source: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  selectChat: (protocol: string) => void
  selectedChat: ChatWithHistory | null
}

export function useChatWithHistory(options: UseChatWithHistoryOptions = {}): UseChatWithHistoryReturn {
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    enableFilters = true,
    defaultSource = 'all',
    defaultStatus = 'all',
    sortBy = 'lastMessage',
    sortOrder = 'desc',
    onLoadComplete,
    onError,
    onChatSelect
  } = options

  const dispatch = useAppDispatch()

  // 🔄 RTK QUERY
  const {
    data,
    error: apiError,
    isLoading: apiLoading,
    refetch: apiRefetch
  } = useGetAllChatsWithHistoryQuery(undefined, {
    pollingInterval: autoRefresh ? refreshInterval : 0,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: true
  })

  const [refreshChatHistory] = useRefreshChatHistoryMutation()

  // 🔗 REDUX SELECTORS

  const reduxSelectedChat = useAppSelector(selectSelectedChat)
  const reduxIsLoading = useAppSelector(selectIsLoading)
  const reduxError = useAppSelector(selectError)

  // 🎯 ESTADOS LOCAIS
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState(defaultSource)
  const [statusFilter, setStatusFilter] = useState(defaultStatus)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 📋 DADOS PROCESSADOS (✅ MEMOIZADO CORRETAMENTE)
  const chats = useMemo(() => {
    return data?.chats || []
  }, [data?.chats])

  const isLoading = apiLoading || reduxIsLoading
  const error = apiError ? (apiError as any)?.message || 'Erro ao carregar chats' : reduxError
  const selectedChat = reduxSelectedChat

  // 🔍 CHATS FILTRADOS (✅ TIPAGEM CONSISTENTE)
  const filteredChats = useMemo(() => {
    if (!enableFilters) return chats

    return chats
      .filter((chat: ChatWithHistory) => {
        // Filtro por busca
        const matchesSearch =
          !searchTerm ||
          chat.assistant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.identifier.includes(searchTerm) ||
          chat.protocol.includes(searchTerm) ||
          (chat.history && chat.history.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase())))

        // Filtro por source
        const matchesSource = sourceFilter === 'all' || chat.source === sourceFilter

        // Filtro por status
        const matchesStatus = statusFilter === 'all' || chat.status === statusFilter

        return matchesSearch && matchesSource && matchesStatus
      })
      .sort((a: ChatWithHistory, b: ChatWithHistory) => {
        let compareValue = 0

        switch (sortBy) {
          case 'lastMessage':
            const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0
            const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0

            compareValue = bTime - aTime
            break
          case 'messageCount':
            compareValue = (b.messageCount || 0) - (a.messageCount || 0)
            break
          case 'protocol':
            compareValue = a.protocol.localeCompare(b.protocol)
            break
          case 'assistant':
            compareValue = (a.assistant?.name || '').localeCompare(b.assistant?.name || '')
            break
        }

        return sortOrder === 'desc' ? compareValue : -compareValue
      })
  }, [chats, searchTerm, sourceFilter, statusFilter, sortBy, sortOrder, enableFilters])

  // 📊 ESTATÍSTICAS CALCULADAS (✅ TIPOS SEGUROS)
  const stats = useMemo(() => {
    const totalMessages = chats.reduce((sum: number, chat: ChatWithHistory) => sum + (chat.messageCount || 0), 0)

    const successCount = chats.filter((chat: ChatWithHistory) => !chat.historyError).length
    const errorCount = chats.filter((chat: ChatWithHistory) => chat.historyError).length

    // Chat mais ativo (tipos seguros)
    const mostActiveChat = chats.reduce((mostActive: ChatWithHistory | undefined, current: ChatWithHistory) => {
      const currentCount = current.messageCount || 0
      const mostActiveCount = mostActive?.messageCount || 0

      return currentCount > mostActiveCount ? current : mostActive
    }, undefined)

    // Última atividade (tipos seguros)
    const latestActivity = chats
      .filter((chat: ChatWithHistory) => chat.lastMessage)
      .map((chat: ChatWithHistory) => chat.lastMessage!.created_at)
      .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime())[0]

    return {
      total: chats.length,
      totalMessages,
      successCount,
      errorCount,
      averageMessagesPerChat: chats.length > 0 ? Math.round(totalMessages / chats.length) : 0,
      mostActiveChat,
      latestActivity
    }
  }, [chats])

  // 🎛️ AÇÕES (✅ USECALLBACK PARA PERFORMANCE)
  const refetch = useCallback(async () => {
    setIsRefreshing(true)

    try {
      await apiRefetch()
    } finally {
      setIsRefreshing(false)
    }
  }, [apiRefetch])

  const refreshSpecificChat = useCallback(
    async (protocol: string) => {
      try {
        await refreshChatHistory(protocol).unwrap()
        console.log(`✅ Histórico do chat ${protocol} atualizado`)
      } catch (error) {
        console.error(`💥 Erro ao atualizar chat ${protocol}:`, error)
        throw error
      }
    },
    [refreshChatHistory]
  )

  const selectChat = useCallback(
    (protocol: string) => {
      const chat = chats.find((c: ChatWithHistory) => c.protocol === protocol)

      if (chat && onChatSelect) {
        onChatSelect(protocol, chat)
      }
    },
    [chats, onChatSelect]
  )

  // 🔧 HELPER FUNCTION PARA CONVERSÃO SEGURA
  const convertChatForRedux = useCallback((chat: ChatWithHistory): ChatItem => {
    const getValidSource = (source: string): ChatItem['source'] => {
      const validSources: ChatItem['source'][] = ['whatsapp', 'telegram', 'webchat', 'email', 'sms']

      return validSources.includes(source as ChatItem['source']) ? (source as ChatItem['source']) : 'webchat'
    }

    return {
      protocol: chat.protocol,
      assistant: chat.assistant,
      project_id: chat.project_id || '',
      source: getValidSource(chat.source),
      identifier: chat.identifier,
      operator: chat.operator || 0,
      error: chat.historyError,
      question_operator: chat.question_operator || 0,
      status: chat.status,
      updated_at: chat.updated_at || chat.lastMessage?.created_at || new Date().toISOString(),
      created_at: chat.created_at || new Date().toISOString()
    }
  }, [])

  // 🔄 SINCRONIZAÇÃO COM REDUX (✅ SEM @ts-ignore)
  useEffect(() => {
    dispatch(setLoading(apiLoading))
  }, [apiLoading, dispatch])

  useEffect(() => {
    if (apiError) {
      const errorMessage = (apiError as any)?.message || 'Erro ao carregar chats'

      dispatch(setError(errorMessage))
    } else if (data?.chats) {
      console.log('🔄 Sincronizando dados da API com Redux Slice...')

      const chatsForSlice: ChatItem[] = data.chats.map(convertChatForRedux)

      dispatch(setActiveChats(chatsForSlice))
      dispatch(setError(null))

      console.log(`✅ ${chatsForSlice.length} chats sincronizados com Redux`)
    }
  }, [data, apiError, dispatch, convertChatForRedux])

  // 🎯 CALLBACKS
  useEffect(() => {
    if (data && onLoadComplete) {
      onLoadComplete(data)
    }
  }, [data, onLoadComplete])

  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  return {
    chats,
    filteredChats,
    stats,
    isLoading,
    isRefreshing,
    error,
    refetch,
    refreshSpecificChat,
    clearAllData: () => dispatch(clearAllChats()),
    searchTerm,
    setSearchTerm,
    sourceFilter,
    setSourceFilter,
    statusFilter,
    setStatusFilter,
    selectChat,
    selectedChat
  }
}

// 🎯 HOOKS ESPECIALIZADOS (mantidos iguais - estão perfeitos!)
export function useSimpleChatWithHistory() {
  return useChatWithHistory({
    enableFilters: false,
    autoRefresh: false,
    sortBy: 'lastMessage',
    sortOrder: 'desc'
  })
}

export function useMonitoringChatWithHistory() {
  return useChatWithHistory({
    autoRefresh: true,
    refreshInterval: 30000,
    enableFilters: true,
    sortBy: 'lastMessage',
    sortOrder: 'desc',
    onLoadComplete: data => {
      console.log('🔄 Dados atualizados automaticamente:', {
        totalChats: data.totalChats,
        totalMessages: data.totalMessages
      })
    }
  })
}
