// 🎯 HOOK: Integra RTK Query + Redux Slice para histórico de protocolos
import { useEffect, useCallback } from 'react'

import { useAppDispatch, useAppSelector } from '@/redux-store'
import { useGetProtocolHistoryQuery } from '@/api/endpoints/chat/protocolHistory'
import {
  setProtocolHistoryLoading,
  setProtocolHistoryData,
  setProtocolHistoryError,
  clearProtocolHistory,
  updateProtocolHistoryAccess,
  selectProtocolHistory,
  selectProtocolHistoryLoading,
  selectProtocolHistoryError,
  selectHasProtocolHistoryCache
} from '@/redux-store/slices/activeChats'

import type { ProcessedProtocolHistoryResponse } from '@/api/endpoints/chat/protocolHistory'

interface UseProtocolHistoryOptions {
  autoFetch?: boolean // Buscar automaticamente ao montar
  useCache?: boolean // Usar cache se disponível
  onSuccess?: (data: ProcessedProtocolHistoryResponse) => void
  onError?: (error: string) => void
}

interface UseProtocolHistoryReturn {
  historyData: ProcessedProtocolHistoryResponse | null
  isLoading: boolean
  error: string | null
  hasCache: boolean
  fetchHistory: () => void
  clearHistory: () => void
  refreshHistory: () => void
}

export function useProtocolHistory(
  protocol: string,
  options: UseProtocolHistoryOptions = {}
): UseProtocolHistoryReturn {
  const { autoFetch = true, useCache = true, onSuccess, onError } = options

  const dispatch = useAppDispatch()

  // 🔗 SELECTORS: Pegar dados do Redux
  const historyData = useAppSelector(state => selectProtocolHistory(state, protocol))
  const isLoading = useAppSelector(state => selectProtocolHistoryLoading(state, protocol))
  const error = useAppSelector(state => selectProtocolHistoryError(state, protocol))
  const hasCache = useAppSelector(state => selectHasProtocolHistoryCache(state, protocol))

  // 🔗 RTK QUERY: Controle manual da query
  const {
    data: apiResponse,
    error: apiError,
    isLoading: apiLoading,
    refetch
  } = useGetProtocolHistoryQuery(protocol, {
    skip: !protocol || (useCache && hasCache) // Skip se não tem protocolo OU se tem cache válido
  })

  // 🎯 FUNÇÃO: Buscar histórico (com ou sem cache)
  const fetchHistory = useCallback(() => {
    if (!protocol) {
      console.warn('⚠️ Protocolo não fornecido para buscar histórico')

      return
    }

    console.log(`🔍 Buscando histórico para protocolo: ${protocol}`)

    // Marcar como loading
    dispatch(setProtocolHistoryLoading({ protocol, isLoading: true }))

    // Se tem cache válido e useCache = true, usar cache
    if (useCache && hasCache && historyData) {
      console.log(`💾 Usando cache para protocolo: ${protocol}`)
      dispatch(updateProtocolHistoryAccess(protocol))
      dispatch(setProtocolHistoryLoading({ protocol, isLoading: false }))
      onSuccess?.(historyData)

      return
    }

    // Senão, fazer nova requisição (refetch vai disparar o useEffect)
    refetch()
  }, [protocol, hasCache, useCache, historyData, dispatch, refetch, onSuccess])

  // 🎯 FUNÇÃO: Limpar histórico
  const clearHistory = useCallback(() => {
    console.log(`🗑️ Limpando histórico do protocolo: ${protocol}`)
    dispatch(clearProtocolHistory(protocol))
  }, [protocol, dispatch])

  // 🎯 FUNÇÃO: Forçar refresh (ignorar cache)
  const refreshHistory = useCallback(() => {
    console.log(`🔄 Forçando refresh do protocolo: ${protocol}`)
    dispatch(clearProtocolHistory(protocol))
    refetch()
  }, [protocol, dispatch, refetch])

  // 🎯 EFEITO: Sincronizar API com Redux
  useEffect(() => {
    // Sincronizar loading state
    dispatch(
      setProtocolHistoryLoading({
        protocol,
        isLoading: apiLoading
      })
    )

    // Se tem erro da API
    if (apiError) {
      const errorMessage = (apiError as any)?.data?.message || 'Erro ao carregar histórico'

      dispatch(setProtocolHistoryError({ protocol, error: errorMessage }))
      onError?.(errorMessage)

      return
    }

    // Se tem dados da API
    if (apiResponse && !apiLoading) {
      console.log(`✅ Histórico recebido para protocolo ${protocol}:`, apiResponse.stats)
      dispatch(setProtocolHistoryData({ protocol, data: apiResponse }))
      onSuccess?.(apiResponse)
    }
  }, [apiResponse, apiError, apiLoading, protocol, dispatch, onSuccess, onError])

  // 🎯 EFEITO: Auto fetch na montagem
  useEffect(() => {
    if (autoFetch && protocol && !isLoading) {
      fetchHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, protocol])

  return {
    historyData,
    isLoading,
    error,
    hasCache,

    fetchHistory,
    clearHistory,
    refreshHistory
  }
}
