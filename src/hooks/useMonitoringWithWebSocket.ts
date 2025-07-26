// src/hooks/useMonitoringWithWebSocket.ts
import { useEffect, useState, useMemo, useCallback, useRef } from 'react'

import { useAppDispatch, useAppSelector } from '@/redux-store'
import {
  useGetAllChatsWithHistoryQuery,
  useRefreshChatHistoryMutation,
  type ChatWithHistory,
  type ChatWithHistoryListResponse,
  type ChatHistoryMessage // 🔥 IMPORT CORRETO
} from '@/api/endpoints/chat/history'

import { clearAllChats, selectSelectedChat, selectIsLoading, selectError } from '@/redux-store/slices/chat'

// 🔥 WEBSOCKET IMPORTS
import { getEcho, isEchoConnected } from '@/redux-store/websocket/echo'

// 🎯 TIPOS PARA EVENTOS WEBSOCKET (CORRIGIDOS)
interface ProtocolEvent {
  protocol: string
  client_id: string
  assistant_id: string
  source: string
  identifier: string
  operator: 0 | 1 // 🔥 CORRIGIDO: deve ser 0 ou 1
  status: string
  created_at: string
  updated_at: string
}

interface MessageEvent {
  id: string
  protocol: string
  content: string
  role: 'user' | 'assistant' | 'operator'
  operator: number | null // 🔥 CORRIGIDO: operator nas mensagens é string ou null
  created_at: string
}

interface UseMonitoringWithWebSocketOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  enableFilters?: boolean
  defaultSource?: string
  defaultStatus?: string
  sortBy?: 'lastMessage' | 'messageCount' | 'protocol' | 'assistant'
  sortOrder?: 'asc' | 'desc'
  enableWebSocket?: boolean
  onLoadComplete?: (data: ChatWithHistoryListResponse) => void
  onError?: (error: any) => void
  onChatSelect?: (protocol: string, chat: ChatWithHistory) => void
}

interface UseMonitoringWithWebSocketReturn {
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

  // 🔥 NOVOS RETORNOS WEBSOCKET
  isWebSocketConnected: boolean
  connectedChannels: string[]
}

export function useMonitoringWithWebSocket(
  options: UseMonitoringWithWebSocketOptions = {}
): UseMonitoringWithWebSocketReturn {
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    enableFilters = true,
    defaultSource = 'all',
    defaultStatus = 'all',
    sortBy = 'lastMessage',
    sortOrder = 'desc',
    enableWebSocket = true,
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

  // 🔥 NOVOS ESTADOS WEBSOCKET
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)
  const [connectedChannels, setConnectedChannels] = useState<string[]>([])
  const [localChats, setLocalChats] = useState<ChatWithHistory[]>([])

  // 🔧 REFS PARA CONTROLE DE CONEXÕES
  const channelsRef = useRef<Set<string>>(new Set())
  const clientsRef = useRef<Set<string>>(new Set())

  // 📋 DADOS PROCESSADOS
  const chats = useMemo(() => {
    if (enableWebSocket && localChats.length > 0) {
      return localChats
    }

    return data?.chats || []
  }, [data?.chats, localChats, enableWebSocket])

  const isLoading = apiLoading || reduxIsLoading
  const error = apiError ? (apiError as any)?.message || 'Erro ao carregar chats' : reduxError
  const selectedChat = reduxSelectedChat

  // 🔍 CHATS FILTRADOS
  const filteredChats = useMemo(() => {
    if (!enableFilters) return chats

    return chats
      .filter((chat: ChatWithHistory) => {
        const matchesSearch =
          !searchTerm ||
          chat.assistant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.identifier.includes(searchTerm) ||
          chat.protocol.includes(searchTerm) ||
          (chat.history && chat.history.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase())))

        const matchesSource = sourceFilter === 'all' || chat.source === sourceFilter
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

  // 📊 ESTATÍSTICAS CALCULADAS
  const stats = useMemo(() => {
    const totalMessages = chats.reduce((sum: number, chat: ChatWithHistory) => sum + (chat.messageCount || 0), 0)
    const successCount = chats.filter((chat: ChatWithHistory) => !chat.historyError).length
    const errorCount = chats.filter((chat: ChatWithHistory) => chat.historyError).length

    const mostActiveChat = chats.reduce((mostActive: ChatWithHistory | undefined, current: ChatWithHistory) => {
      const currentCount = current.messageCount || 0
      const mostActiveCount = mostActive?.messageCount || 0

      return currentCount > mostActiveCount ? current : mostActive
    }, undefined)

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

  // 🔥 HELPER: CRIAR MENSAGEM NO FORMATO CORRETO
  const createChatHistoryMessage = (messageEvent: MessageEvent): ChatHistoryMessage => {
    return {
      id: messageEvent.id,
      content: messageEvent.content,
      role: messageEvent.role,
      operator: messageEvent.operator,
      created_at: messageEvent.created_at
    }
  }

  // 🔥 WEBSOCKET - CONECTAR AOS CANAIS DE PROJETO
  const connectToProjectChannels = useCallback(() => {
    if (!enableWebSocket) return

    try {
      const echo = getEcho()

      if (!echo || !isEchoConnected()) {
        console.warn('⚠️ WebSocket não conectado para monitoramento')

        return
      }

      const clientIds = [...new Set(chats.map(chat => chat.project_id).filter(Boolean))]

      console.log('🔌 Conectando aos canais de projeto:', clientIds)

      clientIds.forEach(clientId => {
        if (clientsRef.current.has(clientId)) {
          console.log('📡 Canal de projeto já conectado:', clientId)

          return
        }

        const channelName = `project.${clientId}`

        console.log('🔌 Conectando ao canal:', channelName)

        try {
          const channel = echo.private(channelName)

          channel
            .listen('.protocol.created', (e: ProtocolEvent) => {
              console.log('📋 Novo protocolo criado:', e)

              setLocalChats(prev => {
                const newChat: ChatWithHistory = {
                  protocol: e.protocol,
                  assistant: { name: 'Assistente AI' },
                  source: e.source as any,
                  identifier: e.identifier,
                  status: e.status as any,
                  history: [],
                  historyLoading: false,
                  historyError: null,
                  messageCount: 0,
                  project_id: e.client_id,
                  operator: e.operator, // 🔥 AGORA É 0 | 1
                  question_operator: 0,
                  updated_at: e.updated_at,
                  created_at: e.created_at
                }

                const exists = prev.some(chat => chat.protocol === e.protocol)

                if (exists) return prev

                return [newChat, ...prev]
              })
            })
            .listen('.protocol.updated', (e: ProtocolEvent) => {
              console.log('📋 Protocolo atualizado:', e)

              setLocalChats(prev =>
                prev.map(chat =>
                  chat.protocol === e.protocol ? { ...chat, status: e.status as any, updated_at: e.updated_at } : chat
                )
              )
            })
            .listen('.protocol.deleted', (e: { protocol: string }) => {
              console.log('🗑️ Protocolo removido:', e)

              setLocalChats(prev => prev.filter(chat => chat.protocol !== e.protocol))
            })

          clientsRef.current.add(clientId)
          setConnectedChannels(prev => [...prev, channelName])
          console.log(`✅ Conectado ao canal de projeto: ${channelName}`)
        } catch (channelError) {
          console.error(`💥 Erro ao conectar ao canal ${channelName}:`, channelError)
        }
      })
    } catch (error) {
      console.error('💥 Erro ao conectar aos canais de projeto:', error)
    }
  }, [chats, enableWebSocket])

  // 🔥 WEBSOCKET - CONECTAR AOS CANAIS DE PROTOCOLO (MENSAGENS)
  const connectToProtocolChannels = useCallback(() => {
    if (!enableWebSocket) return

    try {
      const echo = getEcho()

      if (!echo || !isEchoConnected()) return

      chats.forEach(chat => {
        const channelName = `protocol.${chat.protocol}`

        if (channelsRef.current.has(channelName)) return

        console.log('🔌 Conectando ao canal de protocolo:', channelName)

        try {
          const channel = echo.private(channelName)

          channel
            .listen('.question.created', (e: MessageEvent) => {
              console.log('❓ Nova pergunta:', e)

              setLocalChats(prev =>
                prev.map(chat => {
                  if (chat.protocol === e.protocol) {
                    const newMessage = createChatHistoryMessage(e) // 🔥 USAR HELPER

                    return {
                      ...chat,
                      history: [...chat.history, newMessage],
                      messageCount: (chat.messageCount || 0) + 1,
                      lastMessage: newMessage
                    }
                  }

                  return chat
                })
              )
            })
            .listen('.reply.created', (e: MessageEvent) => {
              console.log('💬 Nova resposta:', e)

              setLocalChats(prev =>
                prev.map(chat => {
                  if (chat.protocol === e.protocol) {
                    const newMessage = createChatHistoryMessage(e) // 🔥 USAR HELPER

                    return {
                      ...chat,
                      history: [...chat.history, newMessage],
                      messageCount: (chat.messageCount || 0) + 1,
                      lastMessage: newMessage
                    }
                  }

                  return chat
                })
              )
            })
            .listen('.operator.reply.created', (e: MessageEvent) => {
              console.log('👨‍💼 Resposta do operador:', e)

              setLocalChats(prev =>
                prev.map(chat => {
                  if (chat.protocol === e.protocol) {
                    const newMessage = createChatHistoryMessage(e) // 🔥 USAR HELPER

                    return {
                      ...chat,
                      history: [...chat.history, newMessage],
                      messageCount: (chat.messageCount || 0) + 1,
                      lastMessage: newMessage
                    }
                  }

                  return chat
                })
              )
            })

          channelsRef.current.add(channelName)
          setConnectedChannels(prev => [...prev, channelName])
          console.log(`✅ Conectado ao canal de protocolo: ${channelName}`)
        } catch (channelError) {
          console.error(`💥 Erro ao conectar ao canal ${channelName}:`, channelError)
        }
      })
    } catch (error) {
      console.error('💥 Erro ao conectar aos canais de protocolo:', error)
    }
  }, [chats, enableWebSocket])

  // 🔄 EFEITO: INICIALIZAR DADOS LOCAIS QUANDO API CARREGA
  useEffect(() => {
    if (data?.chats && enableWebSocket) {
      console.log('🔄 Inicializando cache local com dados da API')
      setLocalChats(data.chats)
    }
  }, [data?.chats, enableWebSocket])

  // 🔄 EFEITO: CONECTAR WEBSOCKET APÓS PRIMEIRA CARGA
  useEffect(() => {
    if (!enableWebSocket || !chats.length) return

    const checkConnection = () => {
      const connected = isEchoConnected()

      setIsWebSocketConnected(connected)

      if (connected) {
        console.log('🔌 WebSocket conectado, configurando canais...')
        connectToProjectChannels()
        connectToProtocolChannels()
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 5000)

    return () => clearInterval(interval)
  }, [chats, enableWebSocket, connectToProjectChannels, connectToProtocolChannels])

  // 🎛️ AÇÕES
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
    selectedChat,
    isWebSocketConnected,
    connectedChannels
  }
}

// 🎯 HOOK ESPECIALIZADO PARA MONITORAMENTO COM WEBSOCKET
export function useMonitoringChatWithWebSocket() {
  return useMonitoringWithWebSocket({
    autoRefresh: false,
    enableFilters: true,
    enableWebSocket: true,
    sortBy: 'lastMessage',
    sortOrder: 'desc',
    onLoadComplete: data => {
      console.log('🔄 Dados carregados + WebSocket ativo:', {
        totalChats: data.totalChats,
        totalMessages: data.totalMessages
      })
    }
  })
}
