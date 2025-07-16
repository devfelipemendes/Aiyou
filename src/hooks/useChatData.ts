// hooks/useChatData.ts - Hook para gerenciar dados do chat

import { useState, useEffect, useCallback } from 'react'

import type { ActiveProtocol, ApiChatMessage, ChatMonitorData, ChatLogData } from '@/types/newChatypes'
import { convertApiDataToChatLog, API_CONFIG } from '@/types/newChatypes'

interface UseChatDataReturn {
  chatData: ChatMonitorData | null
  chatLogData: ChatLogData | null
  isLoading: boolean
  error: string | null
  loadChatData: () => Promise<void>
  addMessage: (message: ApiChatMessage) => void
  clearError: () => void
}

export const useChatData = (protocol: string): UseChatDataReturn => {
  const [chatData, setChatData] = useState<ChatMonitorData | null>(null)
  const [chatLogData, setChatLogData] = useState<ChatLogData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Busca dados do protocol específico
   */
  const fetchProtocolData = async (protocolId: string): Promise<ActiveProtocol> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACTIVE_PROTOCOLS}/${protocolId}`)

    if (!response.ok) {
      throw new Error(`Erro ao buscar dados do protocol: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Busca histórico de mensagens
   */
  const fetchChatHistory = async (protocolId: string): Promise<ApiChatMessage[]> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT_HISTORY}/${protocolId}`)

    if (!response.ok) {
      throw new Error(`Erro ao buscar histórico: ${response.status}`)
    }

    const data = await response.json()

    return data.messages || data // Flexibilidade no formato de resposta
  }

  /**
   * Carrega todos os dados do chat
   */
  const loadChatData = useCallback(async () => {
    if (!protocol) return

    setIsLoading(true)
    setError(null)

    try {
      // Buscar dados do protocol e histórico em paralelo
      const [protocolData, messages] = await Promise.all([fetchProtocolData(protocol), fetchChatHistory(protocol)])

      // Ordenar mensagens por data
      const sortedMessages = messages.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )

      // Atualizar estado com dados originais
      const newChatData: ChatMonitorData = {
        protocol: protocolData,
        messages: sortedMessages,
        isLoading: false,
        error: null
      }

      setChatData(newChatData)

      // Converter para formato do ChatLog
      const convertedData = convertApiDataToChatLog(protocolData, sortedMessages)

      setChatLogData(convertedData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'

      setError(errorMessage)
      setChatData(null)
      setChatLogData(null)
    } finally {
      setIsLoading(false)
    }
  }, [protocol])

  /**
   * Adiciona nova mensagem (via WebSocket)
   */
  const addMessage = useCallback((message: ApiChatMessage) => {
    setChatData(prev => {
      if (!prev) return null

      const updatedMessages = [...prev.messages, message].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )

      const newChatData = {
        ...prev,
        messages: updatedMessages
      }

      // Atualizar também o formato do ChatLog
      const convertedData = convertApiDataToChatLog(prev.protocol, updatedMessages)

      setChatLogData(convertedData)

      return newChatData
    })
  }, [])

  /**
   * Limpa erro
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Carrega dados iniciais quando o protocol muda
  useEffect(() => {
    if (protocol) {
      loadChatData()
    }
  }, [protocol, loadChatData])

  return {
    chatData,
    chatLogData,
    isLoading,
    error,
    loadChatData,
    addMessage,
    clearError
  }
}

// ===== HOOK PARA BUSCAR TODOS OS PROTOCOLOS ATIVOS =====

interface UseActiveProtocolsReturn {
  protocols: ActiveProtocol[]
  isLoading: boolean
  error: string | null
  loadProtocols: () => Promise<void>
  addProtocol: (protocol: ActiveProtocol) => void
  removeProtocol: (protocolId: string) => void
  updateProtocol: (protocolId: string, updates: Partial<ActiveProtocol>) => void
}

export const useActiveProtocols = (): UseActiveProtocolsReturn => {
  const [protocols, setProtocols] = useState<ActiveProtocol[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Carrega lista de protocolos ativos
   */
  const loadProtocols = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACTIVE_PROTOCOLS}`)

      if (!response.ok) {
        throw new Error(`Erro ao buscar protocolos: ${response.status}`)
      }

      const data = await response.json()

      // Flexibilidade no formato de resposta
      const protocolsList = data.protocols || data.data || data

      setProtocols(Array.isArray(protocolsList) ? protocolsList : [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'

      setError(errorMessage)
      setProtocols([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Adiciona novo protocol
   */
  const addProtocol = useCallback((protocol: ActiveProtocol) => {
    setProtocols(prev => {
      const exists = prev.some(p => p.protocol === protocol.protocol)

      if (exists) {
        return prev.map(p => (p.protocol === protocol.protocol ? protocol : p))
      }

      return [...prev, protocol]
    })
  }, [])

  /**
   * Remove protocol
   */
  const removeProtocol = useCallback((protocolId: string) => {
    setProtocols(prev => prev.filter(p => p.protocol !== protocolId))
  }, [])

  /**
   * Atualiza protocol
   */
  const updateProtocol = useCallback((protocolId: string, updates: Partial<ActiveProtocol>) => {
    setProtocols(prev => prev.map(p => (p.protocol === protocolId ? { ...p, ...updates } : p)))
  }, [])

  // Carrega dados iniciais
  useEffect(() => {
    loadProtocols()
  }, [loadProtocols])

  return {
    protocols,
    isLoading,
    error,
    loadProtocols,
    addProtocol,
    removeProtocol,
    updateProtocol
  }
}
