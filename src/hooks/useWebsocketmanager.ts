// hooks/useClientWebSocketManager.ts (VERSÃO CORRIGIDA)
import { useEffect, useCallback, useRef, useState } from 'react'

import { useAppDispatch, useAppSelector } from '@/redux-store'
import { getEcho, isEchoConnected } from '@/redux-store/websocket/echo'
import { setProtocols, addProtocol, updateProtocol, removeProtocol } from '@/redux-store/slices/protocols'
import { setMessages, addMessage, updateMessage } from '@/redux-store/slices/messages'

interface Client {
  id: string
  name: string
  img_url?: string
  description?: string
  used_tokens: number
  assistants: Array<{
    id: string
    name: string
    img_url?: string
    description?: string
  }>
}

interface UseClientWebSocketManagerProps {
  clients: Client[]
  enabled?: boolean
}

// 🔧 Função auxiliar para verificar se um objeto tem métodos necessários
const isValidChannel = (channel: any): boolean => {
  return (
    channel &&
    typeof channel.listen === 'function' &&
    (typeof channel.bind_global === 'function' || typeof channel.bind === 'function')
  )
}

// 🔧 Função auxiliar para bind seguro de eventos globais
const safeBindGlobal = (channel: any, callback: (eventName: string, data: any) => void) => {
  try {
    if (typeof channel.bind_global === 'function') {
      // Método padrão do Pusher
      channel.bind_global(callback)
    } else if (typeof channel.bind === 'function') {
      // Fallback: usar bind com evento específico ou listener de fallback
      console.warn('⚠️ bind_global não disponível, usando método alternativo')

      // Lista de eventos comuns para escutar
      const commonEvents = [
        'protocol.created',
        'protocol.updated',
        'protocol.deleted',
        'question.created',
        'question.updated',
        'reply.created',
        'reply.updated',
        'operator.reply.created',
        'operator.reply.updated'
      ]

      // Bind individual para cada evento comum
      commonEvents.forEach(eventName => {
        try {
          channel.bind(eventName, (data: any) => {
            callback(eventName, data)
          })
        } catch (bindError) {
          console.warn(`⚠️ Erro ao fazer bind do evento ${eventName}:`, bindError)
        }
      })
    }
  } catch (error) {
    console.error('💥 Erro ao configurar bind global:', error)
  }
}

export const useClientWebSocketManager = ({ clients, enabled = true }: UseClientWebSocketManagerProps) => {
  const dispatch = useAppDispatch()
  const [isInitialized, setIsInitialized] = useState(false)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [connectionErrors, setConnectionErrors] = useState<Record<string, string>>({})
  const activeChannelsRef = useRef<Set<string>>(new Set())
  const protocolChannelsRef = useRef<Set<string>>(new Set())

  // 🔧 Função para buscar dados iniciais de um client
  const fetchClientData = useCallback(
    async (clientId: string) => {
      try {
        setLoadingStates(prev => ({ ...prev, [clientId]: true }))
        setConnectionErrors(prev => ({ ...prev, [clientId]: '' }))

        console.log(`📊 Buscando dados para client: ${clientId}`)

        // 📊 Buscar protocolos do client
        const protocolsResponse = await fetch(`/api/clients/${clientId}/protocols`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            Accept: 'application/json'
          }
        })

        if (protocolsResponse.ok) {
          const protocolsData = await protocolsResponse.json()

          // Atualizar store com protocolos
          dispatch(setProtocols({ clientId, protocols: protocolsData.data || [] }))

          console.log(`✅ ${protocolsData.data?.length || 0} protocolos carregados para client: ${clientId}`)

          // 💬 Para cada protocolo, buscar mensagens
          for (const protocol of protocolsData.data || []) {
            try {
              const messagesResponse = await fetch(`/api/protocols/${protocol.id}/messages`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                  Accept: 'application/json'
                }
              })

              if (messagesResponse.ok) {
                const messagesData = await messagesResponse.json()

                dispatch(
                  setMessages({
                    protocolId: protocol.id,
                    messages: messagesData.data || []
                  })
                )

                console.log(`💬 ${messagesData.data?.length || 0} mensagens carregadas para protocolo: ${protocol.id}`)
              } else {
                console.warn(`⚠️ Erro ao carregar mensagens do protocolo ${protocol.id}:`, messagesResponse.status)
              }
            } catch (messageError) {
              console.error(`💥 Erro ao buscar mensagens do protocolo ${protocol.id}:`, messageError)
            }
          }
        } else {
          const errorText = await protocolsResponse.text()

          throw new Error(`API Error ${protocolsResponse.status}: ${errorText}`)
        }

        console.log(`✅ Dados carregados com sucesso para client: ${clientId}`)
      } catch (error: any) {
        console.error(`💥 Erro ao carregar dados do client ${clientId}:`, error)
        setConnectionErrors(prev => ({
          ...prev,
          [clientId]: error.message || 'Erro desconhecido ao carregar dados'
        }))
      } finally {
        setLoadingStates(prev => ({ ...prev, [clientId]: false }))
      }
    },
    [dispatch]
  )

  // 🔧 Função para conectar aos canais de um client
  const connectToClientChannels = useCallback(
    (clientId: string) => {
      try {
        const echo = getEcho()

        if (!echo || !isEchoConnected()) {
          console.warn('⚠️ WebSocket não conectado, aguardando...')

          return false
        }

        const projectChannelName = `project.${clientId}`

        if (activeChannelsRef.current.has(projectChannelName)) {
          console.log('📡 Canal já ativo:', projectChannelName)

          return true
        }

        console.log('🔌 Conectando ao canal do projeto:', projectChannelName)

        // 🎧 Escutar eventos do projeto
        const projectChannel = echo.private(projectChannelName)

        // ⚠️ Verificar se o canal foi criado corretamente
        if (!isValidChannel(projectChannel)) {
          console.error('💥 Canal inválido criado para:', projectChannelName)

          return false
        }

        // 📋 Configurar listeners dos eventos
        try {
          projectChannel
            .listen('.protocol.created', (e: any) => {
              console.log('📋 Novo protocolo criado:', e.data || e)
              dispatch(addProtocol(e.data || e))

              // Conectar automaticamente ao canal do protocolo
              if (e.data?.id || e.id) {
                connectToProtocolChannel(e.data?.id || e.id)
              }
            })
            .listen('.protocol.updated', (e: any) => {
              console.log('📋 Protocolo atualizado:', e.data || e)
              dispatch(updateProtocol(e.data || e))
            })
            .listen('.protocol.deleted', (e: any) => {
              console.log('🗑️ Protocolo removido:', e.data || e)
              const protocolId = e.data?.id || e.id

              if (protocolId) {
                dispatch(removeProtocol(protocolId))
                disconnectFromProtocolChannel(protocolId)
              }
            })

          console.log(`✅ Listeners básicos configurados para: ${projectChannelName}`)
        } catch (listenError) {
          console.error('💥 Erro ao configurar listeners básicos:', listenError)
        }

        // 🔧 Debug de todos os eventos do canal (com verificação de segurança)
        try {
          safeBindGlobal(projectChannel, (eventName: string, data: any) => {
            if (!eventName.startsWith('pusher:') && !eventName.startsWith('pusher_internal:')) {
              console.log(`📡 [${projectChannelName}] ${eventName}:`, data)
            }
          })
        } catch (debugError) {
          console.warn('⚠️ Não foi possível configurar debug global para:', projectChannelName, debugError)
        }

        activeChannelsRef.current.add(projectChannelName)
        console.log('✅ Conectado ao canal do projeto:', projectChannelName)

        return true
      } catch (error: any) {
        console.error('💥 Erro ao conectar ao canal do projeto:', error)
        setConnectionErrors(prev => ({
          ...prev,
          [clientId]: `Erro na conexão WebSocket: ${error.message}`
        }))

        return false
      }
    },
    [dispatch]
  )

  // 🔧 Função para conectar ao canal de um protocolo específico
  const connectToProtocolChannel = useCallback(
    (protocolId: string) => {
      try {
        const echo = getEcho()

        if (!echo || !isEchoConnected()) {
          console.warn('⚠️ WebSocket não conectado para protocolo:', protocolId)

          return false
        }

        const protocolChannelName = `protocol.${protocolId}`

        if (protocolChannelsRef.current.has(protocolChannelName)) {
          console.log('📡 Canal do protocolo já ativo:', protocolChannelName)

          return true
        }

        console.log('🔌 Conectando ao canal do protocolo:', protocolChannelName)

        const protocolChannel = echo.private(protocolChannelName)

        // ⚠️ Verificar se o canal foi criado corretamente
        if (!isValidChannel(protocolChannel)) {
          console.error('💥 Canal de protocolo inválido criado para:', protocolChannelName)

          return false
        }

        // 📨 Configurar listeners das mensagens
        try {
          protocolChannel
            .listen('.question.created', (e: any) => {
              console.log('❓ Nova pergunta:', e.data || e)
              dispatch(
                addMessage({
                  protocolId: protocolId,
                  message: {
                    ...(e.data || e),
                    type: 'user'
                  }
                })
              )
            })
            .listen('.question.updated', (e: any) => {
              console.log('❓ Pergunta atualizada:', e.data || e)
              dispatch(updateMessage(e.data || e))
            })
            .listen('.reply.created', (e: any) => {
              console.log('💬 Nova resposta:', e.data || e)
              dispatch(
                addMessage({
                  protocolId: protocolId,
                  message: {
                    ...(e.data || e),
                    type: 'operator'
                  }
                })
              )
            })
            .listen('.reply.updated', (e: any) => {
              console.log('💬 Resposta atualizada:', e.data || e)
              dispatch(updateMessage(e.data || e))
            })
            .listen('.operator.reply.created', (e: any) => {
              console.log('👨‍💼 Resposta do operador:', e.data || e)
              dispatch(
                addMessage({
                  protocolId: protocolId,
                  message: {
                    ...(e.data || e),
                    type: 'operator'
                  }
                })
              )
            })

          console.log(`✅ Listeners de mensagens configurados para: ${protocolChannelName}`)
        } catch (listenError) {
          console.error('💥 Erro ao configurar listeners de mensagens:', listenError)
        }

        // 🔧 Debug global do canal do protocolo
        try {
          safeBindGlobal(protocolChannel, (eventName: string, data: any) => {
            if (!eventName.startsWith('pusher:') && !eventName.startsWith('pusher_internal:')) {
              console.log(`📡 [${protocolChannelName}] ${eventName}:`, data)
            }
          })
        } catch (debugError) {
          console.warn('⚠️ Debug global não disponível para:', protocolChannelName)
        }

        protocolChannelsRef.current.add(protocolChannelName)
        console.log('✅ Conectado ao canal do protocolo:', protocolChannelName)

        return true
      } catch (error) {
        console.error('💥 Erro ao conectar ao canal do protocolo:', error)

        return false
      }
    },
    [dispatch]
  )

  // 🔧 Função para desconectar de um canal de protocolo
  const disconnectFromProtocolChannel = useCallback((protocolId: string) => {
    try {
      const echo = getEcho()

      if (!echo) return

      const protocolChannelName = `protocol.${protocolId}`

      if (protocolChannelsRef.current.has(protocolChannelName)) {
        echo.leave(protocolChannelName)
        protocolChannelsRef.current.delete(protocolChannelName)
        console.log('🔌 Desconectado do canal do protocolo:', protocolChannelName)
      }
    } catch (error) {
      console.error('💥 Erro ao desconectar do canal do protocolo:', error)
    }
  }, [])

  // 🔧 Função para inicializar todos os clients
  const initializeClients = useCallback(async () => {
    if (!enabled || isInitialized) return

    console.log(
      '🚀 Inicializando clients:',
      clients.map(c => `${c.name} (${c.id})`)
    )

    // Aguardar conexão WebSocket
    const waitForConnection = () => {
      return new Promise<void>((resolve, reject) => {
        if (isEchoConnected()) {
          resolve()

          return
        }

        let attempts = 0
        const maxAttempts = 20 // 10 segundos máximo

        const checkConnection = () => {
          attempts++

          if (isEchoConnected()) {
            resolve()
          } else if (attempts >= maxAttempts) {
            reject(new Error('Timeout aguardando conexão WebSocket'))
          } else {
            setTimeout(checkConnection, 500)
          }
        }

        checkConnection()
      })
    }

    try {
      await waitForConnection()
      console.log('✅ WebSocket conectado, iniciando configuração dos clients...')
    } catch (error) {
      console.error('💥 Erro ao aguardar conexão WebSocket:', error)

      // Continuar mesmo sem WebSocket conectado
    }

    // Processar cada client
    let successCount = 0

    for (const client of clients) {
      try {
        console.log(`🔄 Processando client: ${client.name} (${client.id})`)

        // 1. Buscar dados iniciais
        await fetchClientData(client.id)

        // 2. Conectar aos canais WebSocket (se conectado)
        if (isEchoConnected()) {
          const connected = connectToClientChannels(client.id)

          if (connected) {
            successCount++
          }
        } else {
          console.warn('⚠️ WebSocket não conectado, pulando conexão de canais para:', client.id)
        }

        console.log(`✅ Client ${client.name} (${client.id}) inicializado`)
      } catch (error: any) {
        console.error(`💥 Erro ao inicializar client ${client.id}:`, error)
        setConnectionErrors(prev => ({
          ...prev,
          [client.id]: `Erro na inicialização: ${error.message}`
        }))
      }
    }

    setIsInitialized(true)
    console.log(`🎉 Inicialização concluída! ${successCount}/${clients.length} clients conectados ao WebSocket`)
  }, [clients, enabled, isInitialized, fetchClientData, connectToClientChannels])

  // 🔧 Conectar protocolos existentes aos seus canais
  const protocols = useAppSelector((state: any) => state.protocolsReducer?.protocols || [])

  useEffect(() => {
    if (isInitialized && protocols.length > 0 && isEchoConnected()) {
      console.log('🔗 Conectando aos canais dos protocolos existentes...')
      protocols.forEach((protocol: any) => {
        connectToProtocolChannel(protocol.id)
      })
    }
  }, [isInitialized, protocols, connectToProtocolChannel])

  // 🔧 Inicializar quando clients mudarem
  useEffect(() => {
    if (clients.length > 0) {
      initializeClients()
    }
  }, [clients, initializeClients])

  // 🔧 Cleanup
  useEffect(() => {
    return () => {
      const echo = getEcho()

      if (echo) {
        // Desconectar todos os canais
        Array.from(activeChannelsRef.current).forEach(channel => {
          try {
            echo.leave(channel)
          } catch (error) {
            console.warn('⚠️ Erro ao desconectar canal:', channel, error)
          }
        })
        Array.from(protocolChannelsRef.current).forEach(channel => {
          try {
            echo.leave(channel)
          } catch (error) {
            console.warn('⚠️ Erro ao desconectar canal de protocolo:', channel, error)
          }
        })

        activeChannelsRef.current.clear()
        protocolChannelsRef.current.clear()
      }
    }
  }, [])

  return {
    isInitialized,
    loadingStates,
    connectionErrors,
    activeChannels: Array.from(activeChannelsRef.current),
    protocolChannels: Array.from(protocolChannelsRef.current),
    connectToProtocolChannel,
    disconnectFromProtocolChannel,
    refetchClientData: fetchClientData,
    totalChannels: activeChannelsRef.current.size + protocolChannelsRef.current.size,
    hasErrors: Object.values(connectionErrors).some(error => error.length > 0)
  }
}
