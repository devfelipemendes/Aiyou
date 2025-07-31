import { useEffect, useCallback, useRef, useMemo } from 'react'

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
  clearAllChats,
  updatedQuestionOperator

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
import { useGetAllHistoryByProtocolQuery, type AllProtocolHistoryResponse } from '@/api/endpoints/chat/protocolHistory'

import {
  useRefreshChatHistoryMutation,
  type ChatWithHistory,
  type ChatHistoryMessage
} from '@/api/endpoints/chat/history'

// WebSocket (mantido)
import { getEcho, isEchoConnected } from '@/redux-store/websocket/echo'
import { adaptProtocolHistoryResponse, adaptProtocolToChat } from './adapters/protocolHistoryAdapter'
import { useGetActiveChatsQuery } from '@/api/endpoints/chat/queries'

// 🎯 TIPOS (mantidos)
interface ProtocolEvent {
  protocol: string
  client_id: string
  assistant_id: string
  source: string
  identifier: string
  operator: boolean
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
  onLoadComplete?: (data: AllProtocolHistoryResponse) => void
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
    data: protocolData,
    error: apiError,
    isLoading: apiLoading
  } = useGetAllHistoryByProtocolQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: true
  })

  const { data: originalChatsData } = useGetActiveChatsQuery(undefined, {
    skip: !protocolData // Só buscar quando protocolData estiver disponível
  })

  const data = useMemo(() => {
    if (!protocolData) return undefined

    console.log('🔄 Aplicando adapter com dados RTK:', {
      protocols: protocolData.protocols.length,
      originalChats: originalChatsData?.data?.length || 0
    })

    // ✅ USAR dados do RTK Query diretamente
    return adaptProtocolHistoryResponse(protocolData, originalChatsData?.data)
  }, [protocolData, originalChatsData])

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

  // 🆕 FUNÇÃO: Buscar protocolo específico via API
  const fetchProtocolData = useCallback(async (protocol: string) => {
    try {
      console.log('🔍 Buscando dados do novo protocolo:', protocol)

      // Fazer chamada manual para a API
      const response = await fetch(`/api/v1/chat/${protocol}/history/protocol`)

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Pegar dados do protocolo (mesmo formato que já funciona)
      const protocolData = data.data[protocol] || Object.values(data.data)[0]

      if (!protocolData) {
        throw new Error('Dados do protocolo não encontrados')
      }

      // Processar igual ao adapter existente
      const sortedHistory = protocolData.history.sort(
        (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )

      const processedProtocolItem = {
        ...protocolData,
        protocol,
        history: sortedHistory,
        messageCount: sortedHistory.length,
        lastActivity: sortedHistory[sortedHistory.length - 1]?.created_at || '',
        createdAt: sortedHistory[0]?.created_at || ''
      }

      // Aplicar adapter para converter para ChatWithHistory
      const newChat = adaptProtocolToChat(processedProtocolItem)

      console.log('✅ Novo chat processado:', newChat.protocol, newChat.messageCount, 'mensagens')

      return newChat
    } catch (error) {
      console.error('💥 Erro ao buscar protocolo:', protocol, error)

      return null
    }
  }, [])

  // 🔥 HANDLER: Nova mensagem (REDUX VERSION)
  const handleNewMessage = useCallback(
    (messageEvent: MessageEvent & { question_operator?: boolean }) => {
      console.log('🚨🚨🚨 handleNewMessage CHAMADO!')
      console.log('🔍 Dados da mensagem:', messageEvent)
      console.log('💬 Nova mensagem recebida:', messageEvent.protocol)
      console.log('💬 Nova mensagem recebida:', messageEvent.protocol)

      const newMessage = createChatHistoryMessage(messageEvent)

      // ✅ DISPATCH REDUX - só o chat específico será atualizado
      dispatch(
        addMessageToChat({
          protocol: messageEvent.protocol,
          message: newMessage
        })
      )

      console.log('🔍 Conteúdo da mensagem recebida:', messageEvent)

      if (typeof messageEvent.question_operator !== 'undefined') {
        dispatch(
          updatedQuestionOperator({
            protocol: messageEvent.protocol,
            question_operator: messageEvent.question_operator
          })
        )
      }

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
          operator: false,
          question_operator: false,
          updated_at: messageEvent.created_at,
          created_at: messageEvent.created_at
        }

        dispatch(addNewChat(orphanChat))
      }
    },
    [dispatch, createChatHistoryMessage, chats]
  )

  // const handleCallOperator = useCallback(
  //   async (protocol: string, operator: 0 | 1) => {
  //     console.log(`📞 ${operator === 1 ? 'Chamando' : 'Desligando'} operador para o chat:`, protocol)

  //     // Atualiza a informação no Redux
  //     dispatch(
  //       updateChatInfo({
  //         protocol,
  //         updates: {
  //           question_operator: operator,
  //           updated_at: new Date().toISOString()
  //         }
  //       })
  //     )

  //     // Quando operador é chamado, atualiza o chat
  //     if (operator === 1) {
  //       try {
  //         await refreshChatHistory(protocol).unwrap()
  //         console.log(`✅ Chat ${protocol} atualizado após chamada do operador`)
  //       } catch (error) {
  //         console.error(`💥 Erro ao atualizar chat ${protocol} após operador ser chamado:`, error)
  //       }
  //     }
  //   },
  //   [dispatch, refreshChatHistory]
  // )

  // 🔥 HANDLER: Novo protocolo (REDUX VERSION)
  // 🔥 HANDLER ATUALIZADO: Novo protocolo (com busca real)
  const handleProtocolCreated = useCallback(
    async (protocolEvent: ProtocolEvent) => {
      console.log('📋 Novo protocolo criado via WebSocket:', protocolEvent.protocol)

      // 🔍 BUSCAR DADOS REAIS DO PROTOCOLO
      const newChat = await fetchProtocolData(protocolEvent.protocol)

      if (newChat) {
        // 🏗️ ENRIQUECER com dados do evento WebSocket
        const enrichedChat: ChatWithHistory = {
          ...newChat,

          // 🎯 DADOS DO WEBSOCKET (mais atuais)
          project_id: protocolEvent.client_id,
          operator: protocolEvent.operator,
          status: protocolEvent.status as any,
          updated_at: protocolEvent.updated_at,
          created_at: protocolEvent.created_at
        }

        // ✅ ADICIONAR AO REDUX
        dispatch(addNewChat(enrichedChat))

        console.log('🎉 Novo chat adicionado com dados completos!')
      } else {
        console.warn('⚠️ Não foi possível buscar dados do protocolo, criando chat básico...')

        // 🔧 FALLBACK: Chat básico se API falhar
        const basicChat: ChatWithHistory = {
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
          question_operator: false,
          updated_at: protocolEvent.updated_at,
          created_at: protocolEvent.created_at
        }

        dispatch(addNewChat(basicChat))
      }
    },
    [dispatch, fetchProtocolData]
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

  const chatsRef = useRef(chats)

  chatsRef.current = chats // Sempre atualizado

  // 🔥 WEBSOCKET: Conectar aos canais (mantido, mas com dispatch Redux)
  const connectToProjectChannels = useCallback(() => {
    if (!enableWebSocket) return

    try {
      const echo = getEcho()

      if (!echo || !isEchoConnected()) return

      // ✅ USAR REF ao invés de dependência
      const currentChats = chatsRef.current
      const clientIds = [...new Set(currentChats.map(chat => chat.project_id).filter(Boolean))]

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
  }, [enableWebSocket, dispatch, handleProtocolCreated, handleProtocolUpdated, handleProtocolDeleted])

  //  ^^^^^ ← SEM "chats"!

  const connectToProtocolChannels = useCallback(() => {
    console.log('🔥🔥🔥 connectToProtocolChannels CHAMADO!')
    console.log('🔍 enableWebSocket:', enableWebSocket)
    console.log('🔍 chatsRef.current.length:', chatsRef.current.length)

    if (!enableWebSocket) {
      console.log('❌ WebSocket desabilitado')

      return
    }

    try {
      const echo = getEcho() // ✅ USAR getEcho() como nos canais de projeto

      console.log('🔍 echo:', !!echo)
      console.log('🔍 isEchoConnected():', isEchoConnected())

      if (!echo || !isEchoConnected()) {
        console.log('❌ Echo não conectado')

        return
      }

      const currentChats = chatsRef.current

      if (currentChats.length === 0) {
        console.log('❌ Nenhum chat para conectar')

        return
      }

      console.log('🔍 currentChats.length:', currentChats.length)

      console.log('💬 Conectando aos canais de protocolo...')
      console.log(
        '🔍 Chats atuais para conectar:',
        currentChats.map(c => ({
          protocol: c.protocol,
          project_id: c.project_id
        }))
      )

      currentChats.forEach(chat => {
        const channelName = `protocol.${chat.protocol}`

        if (channelsRef.current.has(channelName)) {
          console.log(`⏭️ Canal ${channelName} já conectado`)

          return
        }

        try {
          console.log(`🔌 Conectando ao canal: ${channelName}`)

          const channel = echo.private(channelName) // ✅ USAR echo ao invés de window.Echo

          channel
            .listen('.question.created', (event: any) => {
              console.log('🚨 LISTENER .question.created DISPARADO!')
              console.log('🚨 Evento recebido:', event)
              handleNewMessage(event)
            })
            .listen('.reply.created', (event: any) => {
              console.log('🚨 LISTENER .reply.created DISPARADO!')
              console.log('🚨 Evento recebido:', event)
              handleNewMessage(event)
            })
            .listen('.operator.reply.created', (event: any) => {
              console.log('🚨 LISTENER .operator.reply.created DISPARADO!')
              console.log('🚨 Evento recebido:', event)
              handleNewMessage(event)
            })

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
  }, [enableWebSocket, dispatch, handleNewMessage])

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
  // ✅ CORREÇÃO: Remover chats das dependências
  // 🔄 WEBSOCKET CONNECTION MANAGEMENT (versão corrigida)
  useEffect(() => {
    if (!enableWebSocket) return

    const checkConnection = () => {
      const connected = isEchoConnected()

      dispatch(setWebSocketConnected(connected))

      if (connected && chatsRef.current.length > 0) {
        console.log('🔌 WebSocket conectado, configurando canais...')
        connectToProjectChannels()
        connectToProtocolChannels()
      }
    }

    checkConnection()

    // 🆕 CLEANUP: Desconectar canais quando componente desmonta ou deps mudam
    return () => {
      console.log('🧹 Limpando canais WebSocket...')

      try {
        const echo = getEcho()

        if (echo) {
          // Desconectar todos os canais
          channelsRef.current.forEach(channelName => {
            try {
              echo.leave(channelName)
              console.log(`🗑️ Canal desconectado: ${channelName}`)
            } catch (error) {
              console.warn(`⚠️ Erro ao desconectar ${channelName}:`, error)
            }
          })
        }

        // Limpar refs
        channelsRef.current.clear()
        clientsRef.current.clear()
      } catch (error) {
        console.error('💥 Erro no cleanup:', error)
      }
    }
  }, [enableWebSocket, dispatch]) // ✅ Dependências corretas

  //  ^^^^^ ← SEM "chats"!

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
    updateChatOrder
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
