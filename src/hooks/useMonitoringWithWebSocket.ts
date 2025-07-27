import { useEffect, useCallback, useRef } from 'react'

import { useAppDispatch, useAppSelector, store } from '@/redux-store'

// Adicionar junto com os outros imports

// 🔥 IMPORTS DO REDUX (nossa nova estrutura)
import {
  initializeChats,
  addNewChat,
  updateChatInfo,
  addMessageToChat,
  removeChat,
  reorderChats,
  setLoading,
  setRefreshing,
  setError,
  setSelectedChat,
  setWebSocketConnected,
  addConnectedChannel,
  clearAllChats

  // removeConnectedChannel
} from '@/redux-store/slices/monitoring'

// 🔥 IMPORTS DOS SELETORES
import {
  selectOrderedChats,
  selectMonitoringStats,
  selectMonitoringUI,
  selectSelectedChat,
  selectChatByProtocol
} from '@/redux-store/selectors/monitoring'

// RTK Query (mantido)
import {
  useGetAllChatsWithHistoryQuery,
  useRefreshChatHistoryMutation,
  type ChatWithHistory,
  type ChatWithHistoryListResponse,
  type ChatHistoryMessage
} from '@/api/endpoints/chat/history'

// WebSocket (mantido)
import { getEcho, isEchoConnected } from '@/redux-store/websocket/echo'

// 🎯 TIPOS (mantidos)
interface ProtocolEvent {
  protocol: string
  client_id: string
  assistant_id: string
  source: string
  identifier: string
  operator: 0 | 1
  status: string
  created_at: string
  updated_at: string
}

interface MessageEvent {
  id: string
  protocol: string
  content: string
  role: 'user' | 'assistant' | 'operator'
  operator: number | null
  created_at: string
}

interface UseMonitoringWithWebSocketOptions {
  enableWebSocket?: boolean
  onLoadComplete?: (data: ChatWithHistoryListResponse) => void
  onError?: (error: any) => void
  onChatSelect?: (protocol: string, chat: ChatWithHistory) => void
}

interface UseMonitoringWithWebSocketReturn {
  chats: ChatWithHistory[]
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
  selectChat: (protocol: string) => void
  selectedChat: ChatWithHistory | null
  isWebSocketConnected: boolean
  connectedChannels: string[]
  updateChatOrder: (oldIndex: number, newIndex: number) => void
}

export function useMonitoringWithWebSocket(
  options: UseMonitoringWithWebSocketOptions = {}
): UseMonitoringWithWebSocketReturn {
  const { enableWebSocket = true, onLoadComplete, onError, onChatSelect } = options

  const dispatch = useAppDispatch()

  // 🔄 RTK QUERY (mantido)
  const {
    data,
    error: apiError,
    isLoading: apiLoading
  } = useGetAllChatsWithHistoryQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: true
  })

  const [refreshChatHistory] = useRefreshChatHistoryMutation()

  // 🔥 REDUX SELECTORS (substitui useState)
  const chats = useAppSelector(selectOrderedChats)
  const stats = useAppSelector(selectMonitoringStats)
  const selectedChat = useAppSelector(selectSelectedChat)

  const {
    isLoading: reduxLoading,
    isRefreshing,
    error: reduxError,
    isWebSocketConnected
  } = useAppSelector(selectMonitoringUI)

  // const connectedProtocols = useAppSelector(selectConnectedProtocols)

  // 🔧 REFS (mantidos)
  const channelsRef = useRef<Set<string>>(new Set())
  const clientsRef = useRef<Set<string>>(new Set())

  // 🎯 ESTADOS DERIVADOS
  const isLoading = apiLoading || reduxLoading
  const error = apiError ? (apiError as any)?.message || 'Erro ao carregar chats' : reduxError
  const connectedChannels = Array.from(channelsRef.current)

  // 🔥 HELPER: Criar mensagem no formato correto (mantido)
  const createChatHistoryMessage = useCallback((messageEvent: MessageEvent): ChatHistoryMessage => {
    return {
      id: messageEvent.id,
      content: messageEvent.content,
      role: messageEvent.role,
      operator: messageEvent.operator,
      created_at: messageEvent.created_at
    }
  }, [])

  // 🔧 VALIDAÇÃO COM API (mantido)
  // const validateWithAPI = useCallback(
  //   async (protocol: string) => {
  //     try {
  //       console.log('🔍 Validando protocolo com API:', protocol)
  //       await refreshChatHistory(protocol).unwrap()
  //       console.log('✅ Protocolo validado com sucesso')
  //     } catch (error) {
  //       console.error('💥 Erro ao validar protocolo:', error)
  //       setTimeout(() => apiRefetch(), 1000)
  //     }
  //   },
  //   [refreshChatHistory, apiRefetch]
  // )

  // 🔥 HANDLER: Nova mensagem (REDUX VERSION)
  const handleNewMessage = useCallback(
    (messageEvent: MessageEvent) => {
      console.log('💬 Nova mensagem recebida:', messageEvent.protocol)

      const newMessage = createChatHistoryMessage(messageEvent)

      // ✅ DISPATCH REDUX - só o chat específico será atualizado
      dispatch(
        addMessageToChat({
          protocol: messageEvent.protocol,
          message: newMessage
        })
      )

      // 🔍 Se chat não existe, criar temporário
      const chatExists = chats.some(chat => chat.protocol === messageEvent.protocol)

      if (!chatExists) {
        console.warn('⚠️ Chat não encontrado, criando temporário:', messageEvent.protocol)

        const orphanChat: ChatWithHistory = {
          protocol: messageEvent.protocol,
          assistant: { name: 'Assistente AI' },
          source: 'whatsapp' as any,
          identifier: messageEvent.protocol.slice(-6),
          status: 'active' as any,
          history: [newMessage],
          historyLoading: false,
          historyError: null,
          messageCount: 1,
          lastMessage: newMessage,
          project_id: 'unknown',
          operator: 0,
          question_operator: 0,
          updated_at: messageEvent.created_at,
          created_at: messageEvent.created_at
        }

        dispatch(addNewChat(orphanChat))
      }
    },
    [dispatch, createChatHistoryMessage, chats]
  )

  // 🔥 HANDLER: Novo protocolo (REDUX VERSION)
  const handleProtocolCreated = useCallback(
    (protocolEvent: ProtocolEvent) => {
      console.log('📋 Novo protocolo criado:', protocolEvent.protocol)

      const newChat: ChatWithHistory = {
        protocol: protocolEvent.protocol,
        assistant: { name: 'Assistente AI' },
        source: protocolEvent.source as any,
        identifier: protocolEvent.identifier,
        status: protocolEvent.status as any,
        history: [],
        historyLoading: false,
        historyError: null,
        messageCount: 0,
        lastMessage: undefined,
        project_id: protocolEvent.client_id,
        operator: protocolEvent.operator,
        question_operator: 0,
        updated_at: protocolEvent.updated_at,
        created_at: protocolEvent.created_at
      }

      // ✅ DISPATCH REDUX - adiciona novo chat sem afetar outros
      dispatch(addNewChat(newChat))

      // Validar com API
    },
    [dispatch]
  )

  // 🔥 HANDLER: Protocolo atualizado (REDUX VERSION)
  const handleProtocolUpdated = useCallback(
    (protocolEvent: ProtocolEvent) => {
      console.log('📋 Protocolo atualizado:', protocolEvent.protocol)

      // ✅ DISPATCH REDUX - atualiza só o chat específico
      dispatch(
        updateChatInfo({
          protocol: protocolEvent.protocol,
          updates: {
            status: protocolEvent.status as any,
            operator: protocolEvent.operator,
            updated_at: protocolEvent.updated_at
          }
        })
      )
    },
    [dispatch]
  )

  // 🔥 HANDLER: Protocolo removido (REDUX VERSION)
  const handleProtocolDeleted = useCallback(
    (deleteEvent: { protocol: string }) => {
      console.log('🗑️ Removendo protocolo:', deleteEvent.protocol)

      // ✅ DISPATCH REDUX - remove chat específico
      dispatch(removeChat(deleteEvent.protocol))
    },
    [dispatch]
  )

  // 🔥 WEBSOCKET: Conectar aos canais (mantido, mas com dispatch Redux)
  const connectToProjectChannels = useCallback(() => {
    if (!enableWebSocket) return

    try {
      const echo = getEcho()

      if (!echo || !isEchoConnected()) return

      const clientIds = [...new Set(chats.map(chat => chat.project_id).filter(Boolean))]

      console.log('🏢 Conectando aos canais de projeto:', clientIds)

      clientIds.forEach(clientId => {
        if (clientsRef.current.has(clientId)) return

        const channelName = `project.${clientId}`

        try {
          const channel = echo.private(channelName)

          channel
            .listen('.protocol.created', handleProtocolCreated)
            .listen('.protocol.updated', handleProtocolUpdated)
            .listen('.protocol.deleted', handleProtocolDeleted)

          clientsRef.current.add(clientId)
          channelsRef.current.add(channelName)
          dispatch(addConnectedChannel(channelName))

          console.log(`✅ Canal de projeto conectado: ${channelName}`)
        } catch (error) {
          console.error(`💥 Erro ao conectar ao canal ${channelName}:`, error)
        }
      })
    } catch (error) {
      console.error('💥 Erro geral nos canais de projeto:', error)
    }
  }, [chats, enableWebSocket, dispatch, handleProtocolCreated, handleProtocolUpdated, handleProtocolDeleted])

  const connectToProtocolChannels = useCallback(() => {
    if (!enableWebSocket) return

    try {
      const echo = getEcho()

      if (!echo || !isEchoConnected()) return

      console.log('💬 Conectando aos canais de protocolo...')

      chats.forEach(chat => {
        const channelName = `protocol.${chat.protocol}`

        if (channelsRef.current.has(channelName)) return

        try {
          const channel = echo.private(channelName)

          channel
            .listen('.question.created', handleNewMessage)
            .listen('.reply.created', handleNewMessage)
            .listen('.operator.reply.created', handleNewMessage)

          channelsRef.current.add(channelName)
          dispatch(addConnectedChannel(channelName))

          console.log(`✅ Canal de protocolo conectado: ${channelName}`)
        } catch (error) {
          console.error(`💥 Erro ao conectar ao canal ${channelName}:`, error)
        }
      })
    } catch (error) {
      console.error('💥 Erro geral nos canais de protocolo:', error)
    }
  }, [chats, enableWebSocket, dispatch, handleNewMessage])

  // 🔄 SINCRONIZAÇÃO: API → Redux (substitui hidratação)
  useEffect(() => {
    if (data?.chats) {
      console.log('🔄 Sincronizando dados da API com Redux')
      dispatch(initializeChats(data.chats))
    }
  }, [data?.chats, dispatch])

  // 🔄 ESTADOS DE LOADING
  useEffect(() => {
    dispatch(setLoading(apiLoading))
  }, [apiLoading, dispatch])

  useEffect(() => {
    if (apiError) {
      dispatch(setError((apiError as any)?.message || 'Erro ao carregar chats'))
    } else {
      dispatch(setError(null))
    }
  }, [apiError, dispatch])

  // 🔄 WEBSOCKET CONNECTION MANAGEMENT (mantido)
  useEffect(() => {
    if (!enableWebSocket || !chats.length) return

    const checkConnection = () => {
      const connected = isEchoConnected()

      dispatch(setWebSocketConnected(connected))

      if (connected) {
        console.log('🔌 WebSocket conectado, configurando canais...')
        connectToProjectChannels()
        connectToProtocolChannels()
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 5000)

    return () => clearInterval(interval)
  }, [chats, enableWebSocket, dispatch, connectToProjectChannels, connectToProtocolChannels])

  // 🎛️ AÇÕES (com Redux)
  const refetch = useCallback(async () => {
    dispatch(setRefreshing(true))

    dispatch(setRefreshing(false))
  }, [dispatch])

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
      // ✅ SEMPRE: Marcar chat como selecionado no Redux
      dispatch(setSelectedChat(protocol))

      // 🔥 BUSCAR CHAT NA HORA DA EXECUÇÃO (não na dependência!)
      if (onChatSelect) {
        // Usar store diretamente para buscar o chat
        const currentState = store.getState()
        const chat = selectChatByProtocol(currentState, protocol)

        if (chat) {
          onChatSelect(protocol, chat)
        }
      }
    },
    [dispatch, onChatSelect] // ✅ SEM "chats" - estável!
  )

  // 🔥 DRAG AND DROP (REDUX VERSION)
  const updateChatOrder = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (oldIndex === newIndex) return

      // ✅ DISPATCH REDUX - só o array de ordem muda
      dispatch(reorderChats({ oldIndex, newIndex }))

      console.log(`🔄 Chat reordenado via Redux: ${oldIndex} → ${newIndex}`)
    },
    [dispatch]
  )

  // 🎯 CALLBACKS (mantidos)
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
    chats, // ← Vem do Redux via seletor
    stats, // ← Calculado via seletor memoizado
    isLoading,
    isRefreshing,
    error,
    refetch,
    refreshSpecificChat,
    clearAllData: () => dispatch(clearAllChats()),
    selectChat,
    selectedChat, // ← Vem do Redux via seletor
    isWebSocketConnected,
    connectedChannels,
    updateChatOrder // ← Agora usa Redux
  }
}

// 🎯 HOOK ESPECIALIZADO (mantido)
export function useMonitoringChatWithWebSocket() {
  return useMonitoringWithWebSocket({
    enableWebSocket: true,
    onLoadComplete: data => {
      console.log('🔄 Dados carregados + Redux ativo:', {
        totalChats: data.totalChats,
        totalMessages: data.totalMessages,
        status: '✅ Performance Otimizada!'
      })
    },
    onError: error => {
      console.error('💥 Erro no hook de monitoramento:', error)
    }
  })
}
