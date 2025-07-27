// src/hooks/useMonitoringWithWebSocket.ts - VERSÃO CORRIGIDA
import { useEffect, useState, useMemo, useCallback, useRef } from 'react'

import { useAppDispatch, useAppSelector } from '@/redux-store'
import {
  useGetAllChatsWithHistoryQuery,
  useRefreshChatHistoryMutation,
  type ChatWithHistory,
  type ChatWithHistoryListResponse,
  type ChatHistoryMessage
} from '@/api/endpoints/chat/history'

import { clearAllChats, selectSelectedChat, selectIsLoading, selectError } from '@/redux-store/slices/chat'

// 🔥 WEBSOCKET IMPORTS
import { getEcho, isEchoConnected } from '@/redux-store/websocket/echo'

// 🎯 TIPOS PARA EVENTOS WEBSOCKET
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

  // 🔄 RTK QUERY
  const {
    data,
    error: apiError,
    isLoading: apiLoading,
    refetch: apiRefetch
  } = useGetAllChatsWithHistoryQuery(undefined, {
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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)
  const [connectedChannels, setConnectedChannels] = useState<string[]>([])
  const [localChats, setLocalChats] = useState<ChatWithHistory[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // 🔧 REFS PARA CONTROLE DE CONEXÕES
  const channelsRef = useRef<Set<string>>(new Set())
  const clientsRef = useRef<Set<string>>(new Set())

  // 📋 DADOS FINAIS (HÍBRIDO: API + WEBSOCKET)
  const chats = useMemo(() => {
    if (!isHydrated || !enableWebSocket) {
      return data?.chats || []
    }

    return localChats
  }, [data?.chats, localChats, enableWebSocket, isHydrated])

  const isLoading = apiLoading || reduxIsLoading
  const error = apiError ? (apiError as any)?.message || 'Erro ao carregar chats' : reduxError
  const selectedChat = reduxSelectedChat

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
  const createChatHistoryMessage = useCallback((messageEvent: MessageEvent): ChatHistoryMessage => {
    return {
      id: messageEvent.id,
      content: messageEvent.content,
      role: messageEvent.role,
      operator: messageEvent.operator,
      created_at: messageEvent.created_at
    }
  }, [])

  // 🔧 VALIDAÇÃO COM API
  const validateWithAPI = useCallback(
    async (protocol: string) => {
      try {
        console.log('🔍 Validando protocolo com API:', protocol)
        await refreshChatHistory(protocol).unwrap()
        console.log('✅ Protocolo validado com sucesso')
      } catch (error) {
        console.error('💥 Erro ao validar protocolo:', error)
        setTimeout(() => apiRefetch(), 1000)
      }
    },
    [refreshChatHistory, apiRefetch]
  )

  // 🔥 HANDLER CORRIGIDO: Nova mensagem com tratamento para protocolos órfãos
  const handleNewMessage = useCallback(
    (messageEvent: MessageEvent) => {
      console.log('💬 Nova mensagem recebida:', messageEvent.protocol)

      setLocalChats(prevChats => {
        // 🔍 ENCONTRAR CHAT
        const chatIndex = prevChats.findIndex(chat => chat.protocol === messageEvent.protocol)

        if (chatIndex === -1) {
          console.warn('⚠️ Chat não encontrado para mensagem:', messageEvent.protocol)
          console.log(
            '🔍 Protocolos existentes:',
            prevChats.map(c => c.protocol)
          )

          // 🆕 CRIAR CHAT TEMPORÁRIO para protocolo órfão
          console.log('🆕 Criando chat temporário para protocolo órfão:', messageEvent.protocol)

          const newMessage = createChatHistoryMessage(messageEvent)

          const orphanChat: ChatWithHistory = {
            protocol: messageEvent.protocol,
            assistant: { name: 'Assistente AI' },
            source: 'whatsapp' as any, // Default
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

          // 🔄 FAZER REFETCH PARA SINCRONIZAR (async)
          setTimeout(() => {
            console.log('🔄 Fazendo refetch devido a protocolo órfão')
            apiRefetch()
          }, 2000)

          return [orphanChat, ...prevChats]
        }

        const newMessage = createChatHistoryMessage(messageEvent)

        // ✅ VERIFICAR DUPLICATA
        const currentChat = prevChats[chatIndex]
        const messageExists = currentChat.history.some(msg => msg.id === newMessage.id)

        if (messageExists) {
          console.warn('⚠️ Mensagem duplicada ignorada:', newMessage.id)

          return prevChats // Retorna sem modificar
        }

        // 🎯 CRIAR NOVO ARRAY COM CHAT ATUALIZADO
        const newChats = [...prevChats]

        newChats[chatIndex] = {
          ...currentChat,
          history: [...currentChat.history, newMessage],
          messageCount: (currentChat.messageCount || 0) + 1,
          lastMessage: newMessage,
          updated_at: messageEvent.created_at
        }

        console.log(`✅ Chat ${messageEvent.protocol} atualizado:`, {
          totalMensagens: newChats[chatIndex].messageCount,
          ultimaMensagem: newMessage.content.substring(0, 30) + '...'
        })

        return newChats
      })
    },
    [createChatHistoryMessage, apiRefetch]
  )

  // 🔥 HANDLER CORRIGIDO: Novo protocolo
  const handleProtocolCreated = useCallback(
    (protocolEvent: ProtocolEvent) => {
      console.log('📋 Novo protocolo criado:', protocolEvent.protocol)

      setLocalChats(prevChats => {
        // ✅ VERIFICAR DUPLICATA
        const exists = prevChats.some(chat => chat.protocol === protocolEvent.protocol)

        if (exists) {
          console.warn('⚠️ Protocolo já existe:', protocolEvent.protocol)

          return prevChats
        }

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

        console.log(`✅ Novo chat adicionado: ${protocolEvent.protocol}`)

        // 🎯 VALIDAR COM API (async)
        setTimeout(() => validateWithAPI(protocolEvent.protocol), 1000)

        return [newChat, ...prevChats]
      })
    },
    [validateWithAPI]
  )

  // 🔥 HANDLER CORRIGIDO: Protocolo atualizado com tratamento para órfãos
  const handleProtocolUpdated = useCallback(
    (protocolEvent: ProtocolEvent) => {
      console.log('📋 Protocolo atualizado:', protocolEvent.protocol)

      setLocalChats(prevChats => {
        const chatIndex = prevChats.findIndex(chat => chat.protocol === protocolEvent.protocol)

        if (chatIndex === -1) {
          console.warn('⚠️ Chat não encontrado para atualização:', protocolEvent.protocol)
          console.log(
            '🔍 Protocolos existentes:',
            prevChats.map(c => c.protocol)
          )

          // 🆕 CRIAR CHAT se não existe (protocolo órfão)
          console.log('🆕 Criando chat para protocolo órfão em atualização:', protocolEvent.protocol)

          const orphanChat: ChatWithHistory = {
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

          // 🔄 FAZER REFETCH PARA SINCRONIZAR (async)
          setTimeout(() => {
            console.log('🔄 Fazendo refetch devido a protocolo órfão em atualização')
            apiRefetch()
          }, 2000)

          return [orphanChat, ...prevChats]
        }

        const currentChat = prevChats[chatIndex]

        // 🎯 VERIFICAR SE ALGO MUDOU
        const needsUpdate =
          currentChat.status !== protocolEvent.status ||
          currentChat.operator !== protocolEvent.operator ||
          currentChat.updated_at !== protocolEvent.updated_at

        if (!needsUpdate) {
          return prevChats // Sem mudanças
        }

        // 🎯 CRIAR NOVO ARRAY COM CHAT ATUALIZADO
        const newChats = [...prevChats]

        newChats[chatIndex] = {
          ...currentChat,
          status: protocolEvent.status as any,
          operator: protocolEvent.operator,
          updated_at: protocolEvent.updated_at
        }

        console.log(`✅ Chat ${protocolEvent.protocol} atualizado`)

        return newChats
      })
    },
    [apiRefetch]
  )

  // 🔥 HANDLER CORRIGIDO: Protocolo removido
  const handleProtocolDeleted = useCallback((deleteEvent: { protocol: string }) => {
    console.log('🗑️ Removendo protocolo:', deleteEvent.protocol)

    setLocalChats(prevChats => {
      const newChats = prevChats.filter(chat => chat.protocol !== deleteEvent.protocol)

      if (newChats.length === prevChats.length) {
        console.warn('⚠️ Protocolo não encontrado para remoção:', deleteEvent.protocol)

        return prevChats
      }

      console.log(`✅ Chat ${deleteEvent.protocol} removido`)

      return newChats
    })
  }, [])

  // 🔥 WEBSOCKET - CONECTAR AOS CANAIS DE PROJETO
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
          setConnectedChannels(prev => [...prev, channelName])
          console.log(`✅ Canal de projeto conectado: ${channelName}`)
        } catch (error) {
          console.error(`💥 Erro ao conectar ao canal ${channelName}:`, error)
        }
      })
    } catch (error) {
      console.error('💥 Erro geral nos canais de projeto:', error)
    }
  }, [chats, enableWebSocket, handleProtocolCreated, handleProtocolUpdated, handleProtocolDeleted])

  // 🔥 WEBSOCKET - CONECTAR AOS CANAIS DE PROTOCOLO (com verificação robusta)
  const connectToProtocolChannels = useCallback(() => {
    if (!enableWebSocket) return

    try {
      const echo = getEcho()

      if (!echo || !isEchoConnected()) return

      console.log('💬 Conectando aos canais de protocolo...')
      console.log(
        '📋 Chats disponíveis:',
        chats.map(c => ({ protocol: c.protocol, source: c.source }))
      )

      chats.forEach(chat => {
        const channelName = `protocol.${chat.protocol}`

        if (channelsRef.current.has(channelName)) {
          console.log('📡 Canal de protocolo já conectado:', channelName)

          return
        }

        try {
          const channel = echo.private(channelName)

          channel
            .listen('.question.created', handleNewMessage)
            .listen('.reply.created', handleNewMessage)
            .listen('.operator.reply.created', handleNewMessage)

          channelsRef.current.add(channelName)
          setConnectedChannels(prev => [...prev, channelName])
          console.log(`✅ Canal de protocolo conectado: ${channelName}`)
        } catch (error) {
          console.error(`💥 Erro ao conectar ao canal ${channelName}:`, error)
        }
      })

      console.log('📊 Status dos canais de protocolo:', {
        totalChats: chats.length,
        canaisConectados: channelsRef.current.size,
        ultimaConexao: Array.from(channelsRef.current).slice(-3)
      })
    } catch (error) {
      console.error('💥 Erro geral nos canais de protocolo:', error)
    }
  }, [chats, enableWebSocket, handleNewMessage])

  // 🔄 HIDRATAR: Sincronizar dados da API com estado local
  useEffect(() => {
    if (data?.chats && enableWebSocket && !isHydrated) {
      console.log('🔄 Hidratando estado local com dados da API')
      setLocalChats(data.chats)
      setIsHydrated(true)
    }
  }, [data?.chats, enableWebSocket, isHydrated])

  // 🔄 CONECTAR WEBSOCKET APÓS PRIMEIRA CARGA (com limpeza de canais órfãos)
  useEffect(() => {
    if (!enableWebSocket || !chats.length) return

    const checkConnection = () => {
      const connected = isEchoConnected()

      setIsWebSocketConnected(connected)

      if (connected) {
        console.log('🔌 WebSocket conectado, configurando canais...')

        // 🧹 LIMPAR CANAIS ÓRFÃOS (protocolos que não existem mais)
        const existingProtocols = new Set(chats.map(chat => chat.protocol))

        const connectedProtocolChannels = Array.from(channelsRef.current).filter(channel =>
          channel.startsWith('protocol.')
        )

        connectedProtocolChannels.forEach(channelName => {
          const protocol = channelName.replace('protocol.', '')

          if (!existingProtocols.has(protocol)) {
            console.log('🧹 Removendo canal órfão:', channelName)
            channelsRef.current.delete(channelName)
            setConnectedChannels(prev => prev.filter(ch => ch !== channelName))

            // Tentar desconectar do canal
            try {
              const echo = getEcho()

              if (echo) {
                echo.leave(channelName)
              }
            } catch (error) {
              console.warn('⚠️ Erro ao desconectar canal órfão:', error)
            }
          }
        })

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

  // 🔥 DRAG AND DROP CORRIGIDO (SEM IMMER)
  const updateChatOrder = useCallback((oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) return

    setLocalChats(prevChats => {
      // ✅ VERIFICAR ÍNDICES VÁLIDOS
      if (oldIndex < 0 || oldIndex >= prevChats.length || newIndex < 0 || newIndex >= prevChats.length) {
        console.warn('⚠️ Índices inválidos para reordenação:', { oldIndex, newIndex, length: prevChats.length })

        return prevChats
      }

      // 🔄 REORDENAR COM SPREAD OPERATOR (SIMPLES E FUNCIONAL)
      const newChats = [...prevChats]
      const [movedItem] = newChats.splice(oldIndex, 1)

      newChats.splice(newIndex, 0, movedItem)

      console.log(`🔄 Chat reordenado: ${oldIndex} → ${newIndex}`)

      return newChats
    })
  }, [])

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
    stats,
    isLoading,
    isRefreshing,
    error,
    refetch,
    refreshSpecificChat,
    clearAllData: () => dispatch(clearAllChats()),
    selectChat,
    selectedChat,
    isWebSocketConnected,
    connectedChannels,
    updateChatOrder
  }
}

// 🎯 HOOK ESPECIALIZADO (com debug melhorado)
export function useMonitoringChatWithWebSocket() {
  return useMonitoringWithWebSocket({
    enableWebSocket: true,
    onLoadComplete: data => {
      console.log('🔄 Dados carregados + WebSocket ativo (CORRIGIDO):', {
        totalChats: data.totalChats,
        totalMessages: data.totalMessages,
        protocolos: data.chats?.map(c => c.protocol) || [],
        status: '✅ Funcional + Tratamento de Órfãos'
      })
    },
    onError: error => {
      console.error('💥 Erro no hook de monitoramento:', error)
    }
  })
}
