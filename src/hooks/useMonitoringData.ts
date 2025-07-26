// hooks/useMonitoringData.ts - VERSÃO CORRIGIDA
import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/redux-store'

// RTK Query imports
import { useGetActiveChatsQuery, type ChatItem } from '@/api/endpoints/chat/queries'
import { useGetMultipleProtocolHistoriesQuery } from '@/api/endpoints/chat/protocolHistory'

// Active Chats slice - 🔥 CORRIGIDO: Usar o slice correto
import {
  initializeChats,
  setLoading as setActiveChatsLoading,
  setError as setActiveChatsError,
  selectActiveChats,
  selectActiveChatsLoading,
  selectActiveChatsError
} from '@/redux-store/slices/activeChats'

// Client Histories slice
import {
  setClientHistories,
  setLoading as setHistoriesLoading,
  setError as setHistoriesError,
  selectAllHistories,
  selectClientHistoriesLoading,
  selectClientHistoriesError,
  selectClientHistoriesStats
} from '@/redux-store/slices/clientHistoriesSlice'

// 🔥 FUNÇÃO DE CONVERSÃO: ChatItem → ActiveChat
const convertChatItemToActiveChat = (chatItem: ChatItem) => {
  return {
    protocol: chatItem.protocol,
    assistant_id: chatItem.assistant.id,
    client_id: chatItem.project_id, // Usando project_id como client_id
    source: chatItem.source,
    identifier: chatItem.identifier,
    operator: chatItem.operator,
    active: chatItem.status === 'active' ? 1 : 0, // Converter string para number
    updated_at: chatItem.updated_at,
    created_at: chatItem.created_at
  }
}

interface UseMonitoringDataOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  skipHistories?: boolean
}

interface UseMonitoringDataReturn {
  activeChats: any[]
  activeChatsLoading: boolean
  activeChatsError: string | null

  // Históricos de clientes
  clientHistories: Record<string, any>
  historiesLoading: boolean
  historiesError: string | null
  historiesStats: any

  // Estados combinados
  isFullyLoaded: boolean
  hasErrors: boolean

  // Funções
  refetchActiveChats: () => void
  refetchHistories: () => void
  refetchAll: () => void

  // Helpers
  getHistoryByProtocol: (protocol: string) => any
  getHistoriesByClient: (identifier: string) => Record<string, any>
}

export function useMonitoringData(options: UseMonitoringDataOptions = {}): UseMonitoringDataReturn {
  const { autoRefresh = false, refreshInterval = 30000, skipHistories = false } = options

  const dispatch = useAppDispatch()

  // 🔗 RTK QUERY: Chats ativos
  const {
    data: activeChatsResponse,
    error: activeChatsApiError,
    isLoading: activeChatsApiLoading,
    refetch: refetchActiveChats
  } = useGetActiveChatsQuery(undefined, {
    pollingInterval: autoRefresh ? refreshInterval : 0
  })

  // 🔗 EXTRAIR PROTOCOLOS DOS CHATS ATIVOS
  const activeProtocols = activeChatsResponse?.data?.map(chat => chat.protocol) || []

  // 🔗 RTK QUERY: Históricos
  const shouldFetchHistories = activeProtocols.length > 0 && !skipHistories

  const {
    data: historiesResponse,
    error: historiesApiError,
    isLoading: historiesApiLoading,
    refetch: refetchHistories
  } = useGetMultipleProtocolHistoriesQuery(activeProtocols, {
    skip: !shouldFetchHistories,
    pollingInterval: autoRefresh ? refreshInterval : 0
  })

  // 🔗 REDUX SELECTORS: Estados locais
  const activeChats = useAppSelector(selectActiveChats)
  const activeChatsLoading = useAppSelector(selectActiveChatsLoading)
  const activeChatsError = useAppSelector(selectActiveChatsError)

  const clientHistories = useAppSelector(selectAllHistories)
  const historiesLoading = useAppSelector(selectClientHistoriesLoading)
  const historiesError = useAppSelector(selectClientHistoriesError)
  const historiesStats = useAppSelector(selectClientHistoriesStats)

  // 🎯 SINCRONIZAÇÃO: Active Chats API → Redux Slice
  useEffect(() => {
    dispatch(setActiveChatsLoading(activeChatsApiLoading))

    if (activeChatsApiError) {
      const errorMessage = (activeChatsApiError as any)?.message || 'Erro ao carregar chats ativos'

      dispatch(setActiveChatsError(errorMessage))
    } else if (activeChatsResponse?.data) {
      console.log('🔄 Sincronizando chats ativos com Redux...')

      // 🔥 CORRIGIDO: Converter ChatItem[] → ActiveChat[]
      const convertedChats = activeChatsResponse.data.map(convertChatItemToActiveChat)

      dispatch(initializeChats(convertedChats))
      dispatch(setActiveChatsError(null))
    }
  }, [activeChatsResponse, activeChatsApiError, activeChatsApiLoading, dispatch])

  // 🎯 SINCRONIZAÇÃO: Histories API → Redux Slice
  useEffect(() => {
    if (skipHistories) return

    dispatch(setHistoriesLoading(historiesApiLoading))

    if (historiesApiError) {
      const errorMessage = (historiesApiError as any)?.message || 'Erro ao carregar históricos'

      dispatch(setHistoriesError(errorMessage))
    } else if (historiesResponse?.data) {
      console.log('🔄 Sincronizando históricos com Redux...')
      dispatch(setClientHistories(historiesResponse.data))
      dispatch(setHistoriesError(null))
    }
  }, [historiesResponse, historiesApiError, historiesApiLoading, dispatch, skipHistories])

  // 🎯 HELPERS FUNCTIONS
  const getHistoryByProtocol = (protocol: string) => {
    return clientHistories[protocol] || null
  }

  const getHistoriesByClient = (identifier: string) => {
    const result: Record<string, any> = {}

    Object.keys(clientHistories).forEach(protocol => {
      const history = clientHistories[protocol]

      if (history.identifier === identifier) {
        result[protocol] = history
      }
    })

    return result
  }

  const refetchAll = () => {
    refetchActiveChats()

    if (!skipHistories) {
      refetchHistories()
    }
  }

  // 🎯 ESTADOS COMBINADOS
  const isFullyLoaded = !activeChatsLoading && (!shouldFetchHistories || !historiesLoading)
  const hasErrors = !!activeChatsError || !!historiesError

  return {
    // Chats ativos
    activeChats,
    activeChatsLoading,
    activeChatsError,

    // Históricos
    clientHistories,
    historiesLoading,
    historiesError,
    historiesStats,

    // Estados combinados
    isFullyLoaded,
    hasErrors,

    // Funções
    refetchActiveChats,
    refetchHistories,
    refetchAll,

    // Helpers
    getHistoryByProtocol,
    getHistoriesByClient
  }
}

// 🎯 HOOKS ESPECIALIZADOS
export function useMonitoringDataWithRefresh() {
  return useMonitoringData({
    autoRefresh: true,
    refreshInterval: 30000
  })
}

export function useActiveChatsOnly() {
  return useMonitoringData({
    skipHistories: true,
    autoRefresh: false
  })
}

export function useMonitoringDataStatic() {
  return useMonitoringData({
    autoRefresh: false
  })
}
