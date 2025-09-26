/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useCallback, useRef, useMemo, useState } from 'react'

import { useAppDispatch, useAppSelector, store } from '@/redux-store'

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
  updatedQuestionOperator,
  markProtocolAwaitingHistory,
  updateProtocolMessages,
  updateMessageInChat
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
  useGetAllHistoryByProtocolQuery,
  useLazyGetProtocolHistoryQuery,
  type ProcessedProtocolHistoryItem
} from '@/api/endpoints/chat/protocolHistory'

import {
  useRefreshChatHistoryMutation,
  type ChatWithHistory,
  type ChatHistoryMessage
} from '@/api/endpoints/chat/history'

// WebSocket (mantido)
import { getEcho, isEchoConnected } from '@/redux-store/websocket/echo'
import { adaptProtocolHistoryResponse } from './adapters/protocolHistoryAdapter'
import { useGetActiveChatsQuery } from '@/api/endpoints/chat/queries'
import { handleSoundNotifications } from '@/utils/notifications/websocketSoundIntegration'

// 🎯 TIPOS (mantidos)
interface ProtocolEvent {
  protocol: string
  client_id: string
  project_id: string
  assistant_id: string
  source: string
  identifier: string
  operator: boolean
  error: string | null
  question_operator: boolean
  status: string
  created_at: string
  updated_at: string
}

interface MessageEvent {
  id: string
  protocol: string
  content: string
  message_type?: 'text' | 'audio' // Adicionar
  audio_url?: string | null // Adicionar
  operator_name?: string | null // Adicionar
  role: 'user' | 'assistant' | 'operator'
  operator: number | null
  created_at: string
}

interface UseMonitoringWithWebSocketOptions {
  enableWebSocket?: boolean
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
  isLoadingHistory: boolean
  protocolsAwaitingHistoryCount: number

  isPolling: boolean
  pollingAttempts: number
}

export function useMonitoringWithWebSocket(
  options: UseMonitoringWithWebSocketOptions = {}
): UseMonitoringWithWebSocketReturn {
  const { enableWebSocket = true, onError, onChatSelect } = options

  const dispatch = useAppDispatch()

  const [isPolling, setIsPolling] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollingAttempts = useRef(0)

  // 🔄 RTK QUERY (mantido)
  const {
    data: protocolData,
    error: apiError,
    isLoading: apiLoading,
    refetch: rtqRefetch
  } = useGetAllHistoryByProtocolQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: true
  })

  const { data: originalChatsData } = useGetActiveChatsQuery(undefined, {
    skip: !protocolData
  })

  const data = useMemo(() => {
    if (!protocolData) return undefined

    console.log('🔄 Aplicando adapter com dados RTK:', {
      protocols: protocolData.protocols.length,
      originalChats: originalChatsData?.data?.length || 0
    })

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

  // 🔧 REFS (mantidos)
  const channelsRef = useRef<Set<string>>(new Set())
  const clientsRef = useRef<Set<string>>(new Set())

  // 🎯 ESTADOS DERIVADOS
  const isLoading = apiLoading || reduxLoading
  const error = apiError ? (apiError as any)?.message || 'Erro ao carregar chats' : reduxError
  const connectedChannels = Array.from(channelsRef.current)

  const [protocolsAwaitingHistory, setProtocolsAwaitingHistory] = useState<Set<string>>(new Set())
  const previousProtocolsRef = useRef<Set<string>>(new Set())

  // 🆕 LAZY QUERY: Para buscar histórico individual
  const [fetchProtocolHistory, { isLoading: isLoadingHistory }] = useLazyGetProtocolHistoryQuery()

  const createChatHistoryMessage = useCallback((messageEvent: MessageEvent): ChatHistoryMessage => {
    return {
      id: messageEvent.id,
      content: messageEvent.content,
      message_type: messageEvent.message_type || 'text',
      audio_url: messageEvent.audio_url || null,
      operator_name: messageEvent.operator_name || null,
      role: messageEvent.role,
      operator: typeof messageEvent.operator === 'number' ? !!messageEvent.operator : null,
      created_at: messageEvent.created_at
    }
  }, [])

  const handleNewMessage = useCallback(
    (messageEvent: MessageEvent & { question_operator?: boolean }) => {
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
          lastMessage: newMessage, // ✅ CORRIGIDO: não pode ser null
          project_id: 'unknown',
          operator: false,
          question_operator: false,
          updated_at: messageEvent.created_at,
          created_at: messageEvent.created_at,
          isAwaitingHistory: true // ✅ ADICIONADO: propriedade obrigatória
        }

        dispatch(addNewChat(orphanChat))
      }
    },
    [dispatch, createChatHistoryMessage, chats]
  )

  // 🔥 HANDLER: Question atualizada (NOVO)
  const handleQuestionUpdated = useCallback(
    (questionEvent: any) => {
      // 🔥 DEBUG PARA QUESTION.UPDATED
      console.log('🚨🚨🚨 handleQuestionUpdated CHAMADO!')
      console.log('====================================')
      console.log('📋 DEBUG QUESTION.UPDATED:')
      console.log('====================================')

      // 1️⃣ ESTRUTURA COMPLETA
      console.log('🔍 OBJETO COMPLETO:', JSON.stringify(questionEvent, null, 2))

      // 2️⃣ PROPRIEDADES PRINCIPAIS
      console.log('📌 PROPRIEDADES:')
      Object.keys(questionEvent).forEach(key => {
        console.log(`  - ${key}:`, typeof questionEvent[key], questionEvent[key])
      })

      // 3️⃣ VERIFICAR CAMPOS ESPECÍFICOS DE ATUALIZAÇÃO
      console.log('📌 CAMPOS DE ATUALIZAÇÃO:')
      console.log('- Answered mudou?', questionEvent.answered)
      console.log('- Operator mudou?', questionEvent.operator)
      console.log('- Question Operator?', questionEvent.question_operator)
      console.log('- Content mudou?', questionEvent.content)

      console.log('====================================')

      // 4️⃣ ATUALIZAR NO REDUX
      try {
        // Primeiro, verificar se existe um chat com esse protocolo
        const chat = chats.find(c => c.protocol === questionEvent.protocol)

        if (!chat) {
          console.warn('⚠️ Chat não encontrado para question.updated:', questionEvent.protocol)

          return
        }

        // 5️⃣ ENCONTRAR A MENSAGEM NO HISTÓRICO E ATUALIZAR
        const messageIndex = chat.history.findIndex(msg => msg.id === questionEvent.id)

        if (messageIndex !== -1) {
          console.log('✅ Mensagem encontrada, atualizando no Redux...')

          // Usar action específica para atualizar mensagem
          dispatch(
            updateMessageInChat({
              protocol: questionEvent.protocol,
              messageId: questionEvent.id,
              updates: {
                content: questionEvent.content,

                // Mapear answered para algum campo se necessário
                operator:
                  typeof questionEvent.operator === 'boolean' ? questionEvent.operator : !!questionEvent.operator
              }
            })
          )
        } else {
          console.warn('⚠️ Mensagem não encontrada no histórico:', questionEvent.id)
        }

        // 6️⃣ ATUALIZAR QUESTION_OPERATOR SE PRESENTE
        if (typeof questionEvent.question_operator !== 'undefined') {
          console.log('🚨 Atualizando question_operator:', questionEvent.question_operator)

          dispatch(
            updatedQuestionOperator({
              protocol: questionEvent.protocol,
              question_operator: questionEvent.question_operator
            })
          )
        }
      } catch (error) {
        console.error('💥 Erro ao processar question.updated:', error)
      }
    },
    [dispatch, chats]
  )

  const reconnectToNewChannels = useCallback(() => {
    if (!enableWebSocket) return

    const currentChats = chatsRef.current

    console.log('🔄 Reconectando canais para novos chats:', currentChats.length)

    // Reconectar canais de protocolo para chats que não estão conectados
    currentChats.forEach(chat => {
      const channelName = `protocol.${chat.protocol}`

      if (!channelsRef.current.has(channelName)) {
        console.log(`🔌 Conectando novo canal: ${channelName}`)

        try {
          const echo = getEcho()

          if (!echo || !isEchoConnected()) return

          const channel = echo.private(channelName)

          channel
            .listen('.question.created', (event: any) => {
              console.log('🚨 Nova pergunta:', event)
              handleNewMessage(event)
            })
            .listen('.reply.created', (event: any) => {
              console.log('🚨 Nova resposta:', event)
              handleNewMessage(event)
            })
            .listen('.operator.reply.created', (event: any) => {
              console.log('🚨 Resposta do operador:', event)
              handleNewMessage(event)
            })

          channelsRef.current.add(channelName)
          dispatch(addConnectedChannel(channelName))

          console.log(`✅ Novo canal conectado: ${channelName}`)
        } catch (error) {
          console.error(`💥 Erro ao conectar novo canal ${channelName}:`, error)
        }
      }
    })
  }, [enableWebSocket, dispatch, handleNewMessage])

  // 🔥 FUNÇÃO: Buscar histórico com retry inteligente
  const fetchHistoryForNewProtocolWithRetry = useCallback(
    async (protocolId: string, attempt = 1, maxAttempts = 3) => {
      try {
        console.log(`📥 Tentativa ${attempt}/${maxAttempts} - Buscando histórico: ${protocolId}`)

        // 1. Marcar no Redux como aguardando histórico
        dispatch(markProtocolAwaitingHistory(protocolId))

        // 2. Fazer requisição do histórico
        const result = await fetchProtocolHistory(protocolId).unwrap()

        if (result?.data && Array.isArray(result.data)) {
          // 3. Encontrar dados do protocolo específico
          const protocolData = result.data.find((item: ProcessedProtocolHistoryItem) => item.protocol === protocolId)

          if (protocolData?.history && protocolData.history.length > 0) {
            // ✅ SUCESSO: Histórico encontrado
            console.log(`✅ Histórico encontrado para ${protocolId}: ${protocolData.history.length} mensagens`)

            dispatch(
              updateProtocolMessages({
                protocolId,
                messages: protocolData.history
              })
            )

            setTimeout(() => reconnectToNewChannels(), 500)

            return // Sucesso, não precisa de retry
          }

          // ⚠️ HISTÓRICO VAZIO: Decidir se deve fazer retry
          if (attempt < maxAttempts) {
            // 🔄 RETRY: Aguardar um pouco e tentar novamente
            const delay = attempt === 1 ? 5000 : 10000 // 2s, depois 5s

            console.log(`⏳ Histórico vazio, tentando novamente em ${delay}ms...`)

            setTimeout(() => {
              fetchHistoryForNewProtocolWithRetry(protocolId, attempt + 1, maxAttempts)
            }, delay)

            return
          } else {
            // 🏁 ÚLTIMA TENTATIVA: Aceitar que não tem histórico ainda
            console.log(`💡 Protocolo ${protocolId} sem histórico inicial - aguardando WebSocket`)

            dispatch(
              updateChatInfo({
                protocol: protocolId,
                updates: {
                  historyLoading: false,
                  historyError: null,
                  isAwaitingHistory: true // Liberar para renderização
                }
              })
            )

            setTimeout(() => reconnectToNewChannels(), 500)
          }
        }
      } catch (error) {
        console.error(`💥 Erro ao buscar histórico (tentativa ${attempt}):`, error)

        if (attempt < maxAttempts) {
          // Retry em caso de erro também
          setTimeout(() => {
            fetchHistoryForNewProtocolWithRetry(protocolId, attempt + 1, maxAttempts)
          }, 3000)
        } else {
          // Erro final
          dispatch(
            updateChatInfo({
              protocol: protocolId,
              updates: {
                historyLoading: false,
                historyError: `Erro após ${maxAttempts} tentativas`,
                isAwaitingHistory: true
              }
            })
          )
          setTimeout(() => reconnectToNewChannels(), 500)
        }
      } finally {
        if (attempt === maxAttempts) {
          // Só remove da lista na última tentativa
          setProtocolsAwaitingHistory(prev => {
            const newSet = new Set(prev)

            newSet.delete(protocolId)

            return newSet
          })
        }
      }
    },
    [fetchProtocolHistory, dispatch, reconnectToNewChannels]
  )

  // 🔥 FUNÇÃO: Buscar histórico para protocolo novo
  const fetchHistoryForNewProtocol = useCallback(
    async (protocolId: string) => {
      try {
        console.log(`📥 Buscando histórico para protocolo novo: ${protocolId}`)

        // 1. Marcar no Redux como aguardando histórico
        dispatch(markProtocolAwaitingHistory(protocolId))

        // 2. Fazer requisição do histórico
        const result = await fetchProtocolHistory(protocolId).unwrap()

        if (result?.data && Array.isArray(result.data)) {
          // 3. Encontrar dados do protocolo específico
          const protocolData = result.data.find((item: ProcessedProtocolHistoryItem) => item.protocol === protocolId)

          if (protocolData?.history && protocolData.history.length > 0) {
            console.log(`✅ Histórico encontrado para ${protocolId}: ${protocolData.history.length} mensagens`)

            // 4. Atualizar Redux com as mensagens
            dispatch(
              updateProtocolMessages({
                protocolId,
                messages: protocolData.history
              })
            )
            setTimeout(() => {
              reconnectToNewChannels()
            }, 1000)
          } else {
            console.log(`⚠️ Protocolo ${protocolId} sem mensagens no histórico`)

            // 5. Marcar como sem mensagens (não renderizar ainda)
            dispatch(
              updateChatInfo({
                protocol: protocolId,
                updates: {
                  historyLoading: false,
                  historyError: null,
                  isAwaitingHistory: true // ← Continua aguardando primeira mensagem via WebSocket
                }
              })
            )
            setTimeout(() => {
              reconnectToNewChannels()
            }, 1000)
          }
        } else {
          console.warn(`⚠️ Resposta inválida para protocolo ${protocolId}:`, result)

          // 6. Tratar resposta inválida
          dispatch(
            updateChatInfo({
              protocol: protocolId,
              updates: {
                historyLoading: false,
                historyError: 'Resposta inválida da API',
                isAwaitingHistory: true // ← Libera para renderização mesmo sem mensagens
              }
            })
          )
        }

        setTimeout(() => {
          reconnectToNewChannels()
        }, 1000)
      } catch (error) {
        console.error(`💥 Erro ao buscar histórico do protocolo ${protocolId}:`, error)

        // 7. Tratar erro na busca
        dispatch(
          updateChatInfo({
            protocol: protocolId,
            updates: {
              historyLoading: false,
              historyError: `Erro na busca: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
              isAwaitingHistory: true // ← Libera para renderização mesmo com erro
            }
          })
        )
        setTimeout(() => {
          reconnectToNewChannels()
        }, 1000)
      } finally {
        // 8. Sempre remover da lista de aguardando (sucesso ou erro)
        setProtocolsAwaitingHistory(prev => {
          const newSet = new Set(prev)

          newSet.delete(protocolId)

          return newSet
        })

        console.log(`🏁 Busca de histórico finalizada para: ${protocolId}`)
      }
    },
    [fetchProtocolHistory, dispatch]
  )

  // 🔥 FUNÇÃO: Detectar novos protocolos (CORRIGIDA - uma só função)
  const detectNewProtocols = useCallback(
    (currentChats: ChatWithHistory[]) => {
      const currentProtocolIds = new Set(currentChats.map(chat => chat.protocol))
      const previousProtocolIds = previousProtocolsRef.current

      const newProtocols = [...currentProtocolIds].filter(id => !previousProtocolIds.has(id))

      if (newProtocols.length > 0) {
        console.log('🆕 Novos protocolos detectados:', newProtocols)

        setProtocolsAwaitingHistory(prev => {
          const newSet = new Set(prev)

          newProtocols.forEach(id => newSet.add(id))

          return newSet
        })

        newProtocols.forEach(protocolId => {
          fetchHistoryForNewProtocol(protocolId)
        })
      }

      previousProtocolsRef.current = currentProtocolIds
    },
    [fetchHistoryForNewProtocol] // ✅ Dependência corrigida
  )

  // 🔥 HELPER: Criar mensagem no formato correto (mantido)

  // 🔥 HANDLER: Nova mensagem (REDUX VERSION)

  // 🔥 HANDLER: Novo protocolo (REDUX VERSION)
  const handleProtocolCreated = useCallback(
    async (protocolEvent: ProtocolEvent) => {
      try {
        console.log('🆕 NOVO PROTOCOLO CRIADO via WebSocket:', protocolEvent.protocol)

        // ✅ CORRIGIDO: Nome correto do reducer
        const currentState = store.getState()
        const existingChat = currentState.monitoring.chatsByProtocol[protocolEvent.protocol]

        if (existingChat) {
          console.log(`⚠️ Protocolo ${protocolEvent.protocol} já existe, ignorando...`)

          return
        }

        // Criar chat básico (sem mensagens)
        const basicChat: ChatWithHistory = {
          protocol: protocolEvent.protocol,
          assistant: {
            name: 'Assistente AI',
            id: protocolEvent.assistant_id
          },
          project_id: protocolEvent.client_id,
          source: (protocolEvent.source as any) || 'whatsapp',
          identifier: protocolEvent.identifier,
          operator: protocolEvent.operator,
          status: (protocolEvent.status as any) || 'active',

          // ✅ SEM MENSAGENS (será preenchido depois)
          history: [],
          messageCount: 0,
          lastMessage: undefined, // ✅ CORRIGIDO: undefined ao invés de null

          // 🔄 FLAGS DE CONTROLE
          historyLoading: true,
          historyError: null,
          isAwaitingHistory: true, // ← Flag para não renderizar ainda

          // 📅 TIMESTAMPS
          created_at: protocolEvent.created_at,
          updated_at: protocolEvent.updated_at,

          // 🎛️ PADRÕES
          question_operator: false
        }

        // Adicionar ao Redux
        dispatch(addNewChat(basicChat))
        console.log(`📋 Protocolo ${protocolEvent.protocol} adicionado ao Redux (aguardando histórico)`)

        fetchHistoryForNewProtocolWithRetry(protocolEvent.protocol)

        // O useEffect detectNewProtocols vai pegar e buscar o histórico automaticamente
      } catch (error) {
        console.error('💥 Erro no handleProtocolCreated:', error)
      }
    },
    [dispatch, fetchHistoryForNewProtocolWithRetry]
  )

  const handleProtocolUpdated = useCallback(
    (protocolEvent: ProtocolEvent) => {
      dispatch(
        updateChatInfo({
          protocol: protocolEvent.protocol,
          updates: {
            status: protocolEvent.status as any,
            operator: protocolEvent.operator,
            question_operator: protocolEvent.question_operator,
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
      dispatch(removeChat(deleteEvent.protocol))
    },
    [dispatch]
  )

  const chatsRef = useRef(chats)

  chatsRef.current = chats // Sempre atualizado

  // 🔥 WEBSOCKET: Conectar aos canais
  const connectToProjectChannels = useCallback(() => {
    if (!enableWebSocket) return

    try {
      const echo = getEcho()

      if (!echo || !isEchoConnected()) return

      const currentChats = chatsRef.current
      const clientIds = [...new Set(currentChats.map(chat => chat.project_id).filter(Boolean))]

      console.log('🏢 Conectando aos canais de projeto:', clientIds)

      clientIds.forEach(clientId => {
        if (clientsRef.current.has(clientId)) return

        const channelName = `project.${clientId}`

        try {
          const channel = echo.private(channelName)

          channel
            .listen('.protocol.created', (protocolEvent: any) => {
              handleSoundNotifications.onProtocolCreated() // ✅ Com parâmetro
              handleProtocolCreated(protocolEvent)
            })
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

  const connectToProtocolChannels = useCallback(() => {
    if (!enableWebSocket) return

    try {
      const echo = getEcho()

      if (!echo || !isEchoConnected()) return

      const currentChats = chatsRef.current

      if (currentChats.length === 0) return

      currentChats.forEach(chat => {
        const channelName = `protocol.${chat.protocol}`

        if (channelsRef.current.has(channelName)) return

        try {
          const channel = echo.private(channelName)

          channel
            .listen('.question.created', (event: any) => {
              console.log('🚨 LISTENER .question.created DISPARADO!')
              handleNewMessage(event)
            })
            .listen('.question.updated', (event: any) => {
              console.log('🚨 LISTENER .question.updated DISPARADO!')
              handleSoundNotifications.onQuestionUpdated()
              handleQuestionUpdated(event)
            })
            .listen('.reply.created', (event: any) => {
              console.log('🚨 LISTENER .reply.created DISPARADO!')
              handleNewMessage(event)
            })
            .listen('.operator.reply.created', (event: any) => {
              console.log('🚨 LISTENER .operator.reply.created DISPARADO!')
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

  // 🔥 EFFECT: Detectar novos protocolos
  useEffect(() => {
    if (chats && chats.length > 0) {
      detectNewProtocols(chats)
      setTimeout(() => {
        reconnectToNewChannels()
      }, 1000)
    }
  }, [chats, detectNewProtocols])

  // 🔄 SINCRONIZAÇÃO: API → Redux
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

  const refetch = useCallback(async () => {
    dispatch(setRefreshing(true))

    try {
      await rtqRefetch()
    } finally {
      dispatch(setRefreshing(false))
    }
  }, [dispatch, rtqRefetch])

  const startPollingForChats = useCallback(() => {
    if (isPolling || pollingIntervalRef.current) {
      console.log('⚠️ Polling já está ativo, ignorando...')

      return
    }

    console.log('🔄 Iniciando polling para buscar chats a cada 10 segundos...')
    setIsPolling(true)
    pollingAttempts.current = 0

    const pollFunction = async () => {
      try {
        pollingAttempts.current++
        console.log(`📡 [POLLING] Tentativa ${pollingAttempts.current} - Buscando chats...`)

        // Força refetch da RTK Query
        await refetch()

        // A verificação de parada será feita no useEffect que monitora 'data'
      } catch (error) {
        console.error('💥 [POLLING] Erro na tentativa:', error)
      }
    }

    // Executa imediatamente uma vez
    pollFunction()

    // Configura interval para repetir a cada 10 segundos
    pollingIntervalRef.current = setInterval(pollFunction, 10000)
  }, [refetch, isPolling])

  const stopPollingForChats = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log('⏹️ [POLLING] Parando polling - chats encontrados!')
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      setIsPolling(false)
      pollingAttempts.current = 0
    }
  }, [])

  useEffect(() => {
    // Só inicia polling se:
    // 1. Não está carregando dados iniciais
    // 2. Não tem chats
    // 3. Não tem erro na API
    // 4. Ainda não está fazendo polling
    const shouldStartPolling =
      !apiLoading && (!data?.chats || data.chats.length === 0) && !apiError && !isPolling && !pollingIntervalRef.current

    if (shouldStartPolling) {
      console.log('🎯 [POLLING] Condições atendidas - iniciando polling para chats vazios')
      startPollingForChats()
    }

    // Se recebeu chats, para o polling
    if (data?.chats && data.chats.length > 0 && isPolling) {
      console.log('✅ [POLLING] Chats encontrados! Parando polling...', data.chats.length)
      stopPollingForChats()

      // Aguarda um pouco para o Redux ser atualizado e conecta WebSocket
      setTimeout(() => {
        const connected = isEchoConnected()

        if (connected) {
          console.log('🔌 [POLLING] Conectando WebSocket após encontrar chats...')
          connectToProjectChannels()
          connectToProtocolChannels()
        }
      }, 1000)
    }

    // Cleanup automático após 5 minutos (30 tentativas)
    if (pollingAttempts.current >= 30) {
      console.log('⏰ [POLLING] Timeout - parando polling após 5 minutos')
      stopPollingForChats()
    }
  }, [
    data?.chats,
    apiLoading,
    apiError,
    isPolling,
    startPollingForChats,
    stopPollingForChats,
    connectToProjectChannels,
    connectToProtocolChannels
  ])

  // 🔄 WEBSOCKET CONNECTION MANAGEMENT
  useEffect(() => {
    if (!enableWebSocket) return

    const checkConnection = () => {
      const connected = isEchoConnected()

      dispatch(setWebSocketConnected(connected))

      if (connected && (chatsRef.current.length > 0 || !isPolling)) {
        console.log('🔌 WebSocket conectado, configurando canais...')
        connectToProjectChannels()

        // Só conecta aos canais de protocolo se tiver chats
        if (chatsRef.current.length > 0) {
          connectToProtocolChannels()
        }
      }
    }

    checkConnection()

    return () => {
      console.log('🧹 Limpando canais WebSocket...')

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }

      setIsPolling(false)

      try {
        const echo = getEcho()

        if (echo) {
          channelsRef.current.forEach(channelName => {
            try {
              echo.leave(channelName)
              console.log(`🗑️ Canal desconectado: ${channelName}`)
            } catch (error) {
              console.warn(`⚠️ Erro ao desconectar ${channelName}:`, error)
            }
          })
        }

        channelsRef.current.clear()
        clientsRef.current.clear()
      } catch (error) {
        console.error('💥 Erro no cleanup:', error)
      }
    }
  }, [enableWebSocket, dispatch, connectToProjectChannels, connectToProtocolChannels])

  useEffect(() => {
    const handleForceRetry = (event: CustomEvent) => {
      const { protocol } = event.detail

      console.log('🔄 Evento de retry recebido:', protocol)

      fetchHistoryForNewProtocol(protocol)
    }

    window.addEventListener('forceHistoryRefetch', handleForceRetry as EventListener)

    return () => {
      window.removeEventListener('forceHistoryRefetch', handleForceRetry as EventListener)
    }
  }, [fetchHistoryForNewProtocol])

  // 🎛️ AÇÕES

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
      dispatch(setSelectedChat(protocol))

      if (onChatSelect) {
        const currentState = store.getState()
        const chat = selectChatByProtocol(currentState, protocol)

        if (chat) {
          onChatSelect(protocol, chat)
        }
      }
    },
    [dispatch, onChatSelect]
  )

  const updateChatOrder = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (oldIndex === newIndex) return

      dispatch(reorderChats({ oldIndex, newIndex }))
      console.log(`🔄 Chat reordenado via Redux: ${oldIndex} → ${newIndex}`)
    },
    [dispatch]
  )

  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  return {
    chats,

    //@ts-ignore
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
    updateChatOrder,
    isLoadingHistory,
    protocolsAwaitingHistoryCount: protocolsAwaitingHistory.size,
    isPolling,
    pollingAttempts: pollingAttempts.current
  }
}

// 🎯 HOOK ESPECIALIZADO
export function useMonitoringChatWithWebSocket() {
  return useMonitoringWithWebSocket({
    enableWebSocket: true,
    onError: error => {
      console.error('💥 Erro no hook de monitoramento:', error)
    }
  })
}
