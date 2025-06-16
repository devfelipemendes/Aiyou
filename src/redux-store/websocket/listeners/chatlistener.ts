// redux-store/websocket/listeners/chatlistener.ts (VERSÃO CORRIGIDA)
import type { Dispatch } from 'redux'
import type Echo from 'laravel-echo'

import {
  addQuestion,
  updateQuestion,
  addReply,
  updateReply,
  addOperatorReply,
  updateOperatorReply
} from '@/redux-store/slices/questions'
import { addProtocol, updateProtocol } from '@/redux-store/slices/protocols'

// 🔧 Interface para o debugger
interface DebuggerCallback {
  (message: { channel: string; event: string; data: any; type: 'sent' | 'received' }): void
}

let debuggerCallback: DebuggerCallback | null = null

export const setDebuggerCallback = (callback: DebuggerCallback | null) => {
  debuggerCallback = callback
  console.log('🔧 Debugger callback definido:', !!callback)
}

const logEventToDebugger = (channel: string, event: string, data: any) => {
  console.log(`📡 [${channel}] ${event}:`, data)

  if (debuggerCallback) {
    try {
      debuggerCallback({
        channel,
        event,
        data,
        type: 'received'
      })
    } catch (error) {
      console.error('💥 Erro no callback do debugger:', error)
    }
  }
}

// 🔧 Função auxiliar para verificar se um canal é válido
const isValidChannel = (channel: any): boolean => {
  return (
    channel &&
    typeof channel.listen === 'function' &&
    (typeof channel.bind_global === 'function' || typeof channel.bind === 'function')
  )
}

// 🔧 Função auxiliar para bind seguro de eventos globais
const safeBindGlobal = (channel: any, channelName: string) => {
  try {
    if (!isValidChannel(channel)) {
      console.error('💥 Canal inválido para bind global:', channelName)

      return false
    }

    if (typeof channel.bind_global === 'function') {
      // Método padrão do Pusher
      channel.bind_global((eventName: string, data: any) => {
        if (!eventName.startsWith('pusher:') && !eventName.startsWith('pusher_internal:')) {
          logEventToDebugger(channelName, `global:${eventName}`, data)
        }
      })
      console.log(`✅ Bind global configurado para: ${channelName}`)

      return true
    } else if (typeof channel.bind === 'function') {
      // Fallback: usar bind com eventos específicos
      console.warn(`⚠️ bind_global não disponível para ${channelName}, usando método alternativo`)

      // Lista de eventos comuns para debug
      const debugEvents = [
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

      // Bind individual para cada evento de debug
      debugEvents.forEach(eventName => {
        try {
          channel.bind(eventName, (data: any) => {
            logEventToDebugger(channelName, eventName, data)
          })
        } catch (bindError) {
          console.warn(`⚠️ Erro ao fazer bind do evento debug ${eventName}:`, bindError)
        }
      })

      return true
    } else {
      console.error(`💥 Nenhum método de bind disponível para: ${channelName}`)

      return false
    }
  } catch (error) {
    console.error(`💥 Erro ao configurar bind global para ${channelName}:`, error)

    return false
  }
}

// ✅ Função para escutar eventos de protocolo (VERSÃO CORRIGIDA)
export function listenProtocolEvents(echo: Echo<any>, protocolId: string, clientId: string, dispatch: Dispatch) {
  console.log('🎧 Configurando listeners para:', { protocolId, clientId })

  try {
    // ✅ Canal com perguntas e respostas
    const protocolChannelName = `protocol.${protocolId}`

    console.log('🔌 Conectando ao canal:', protocolChannelName)
    const protocolChannel = echo.private(protocolChannelName)

    // ⚠️ Verificar se o canal foi criado corretamente
    if (!isValidChannel(protocolChannel)) {
      console.error('💥 Canal de protocolo inválido:', protocolChannelName)
      logEventToDebugger('system', 'channel.error', {
        error: 'Canal inválido',
        channel: protocolChannelName
      })

      return
    }

    // 📨 Configurar listeners com tratamento de erro
    try {
      protocolChannel

        // Pergunta do usuário
        .listen('.question.created', (e: any) => {
          logEventToDebugger(protocolChannelName, 'question.created', e.data || e)

          try {
            dispatch(addQuestion(e.data || e))
          } catch (dispatchError) {
            console.error('💥 Erro ao dispatch question.created:', dispatchError)
          }
        })

        // Caso algum estado daquele registro na banco de uma pergunta já criada tenha mudado.
        .listen('.question.updated', (e: any) => {
          logEventToDebugger(protocolChannelName, 'question.updated', e.data || e)

          try {
            dispatch(updateQuestion(e.data || e))
          } catch (dispatchError) {
            console.error('💥 Erro ao dispatch question.updated:', dispatchError)
          }
        })

        // Resposta da AI
        .listen('.reply.created', (e: any) => {
          logEventToDebugger(protocolChannelName, 'reply.created', e.data || e)

          try {
            dispatch(addReply(e.data || e))
          } catch (dispatchError) {
            console.error('💥 Erro ao dispatch reply.created:', dispatchError)
          }
        })

        // Resposta da AI
        .listen('.reply.updated', (e: any) => {
          logEventToDebugger(protocolChannelName, 'reply.updated', e.data || e)

          try {
            dispatch(updateReply(e.data || e))
          } catch (dispatchError) {
            console.error('💥 Erro ao dispatch reply.updated:', dispatchError)
          }
        })

        //! Mensagem do operador para o usuário Caso o operador tenha assumido o chat (MODO OPERADOR)
        .listen('.operator.reply.created', (e: any) => {
          logEventToDebugger(protocolChannelName, 'operator.reply.created', e.data || e)

          try {
            dispatch(addOperatorReply(e.data || e))
          } catch (dispatchError) {
            console.error('💥 Erro ao dispatch operator.reply.created:', dispatchError)
          }
        })

        //! Mensagem do operador para o usuário Caso o operador tenha assumido o chat (MODO OPERADOR)
        .listen('.operator.reply.updated', (e: any) => {
          logEventToDebugger(protocolChannelName, 'operator.reply.updated', e.data || e)

          try {
            dispatch(updateOperatorReply(e.data || e))
          } catch (dispatchError) {
            console.error('💥 Erro ao dispatch operator.reply.updated:', dispatchError)
          }
        })

      console.log('✅ Listeners do protocolo configurados:', protocolChannelName)
    } catch (listenError: any) {
      console.error('💥 Erro ao configurar listeners do protocolo:', listenError)
      logEventToDebugger('system', 'listener.error', {
        error: listenError.message,
        channel: protocolChannelName
      })
    }

    // 🔧 Escutar TODOS os eventos no canal para debug (com verificação de segurança)
    safeBindGlobal(protocolChannel, protocolChannelName)

    // ✅ Canal com criação/edição de protocolo
    const projectChannelName = `project.${clientId}`

    console.log('🔌 Conectando ao canal:', projectChannelName)
    const projectChannel = echo.private(projectChannelName)

    // ⚠️ Verificar se o canal foi criado corretamente
    if (!isValidChannel(projectChannel)) {
      console.error('💥 Canal de projeto inválido:', projectChannelName)
      logEventToDebugger('system', 'channel.error', {
        error: 'Canal inválido',
        channel: projectChannelName
      })

      return
    }

    // 📋 Configurar listeners do projeto com tratamento de erro
    try {
      projectChannel
        .listen('.protocol.created', (e: any) => {
          logEventToDebugger(projectChannelName, 'protocol.created', e.data || e)

          try {
            dispatch(addProtocol(e.data || e))
          } catch (dispatchError) {
            console.error('💥 Erro ao dispatch protocol.created:', dispatchError)
          }
        })
        .listen('.protocol.updated', (e: any) => {
          logEventToDebugger(projectChannelName, 'protocol.updated', e.data || e)

          try {
            dispatch(updateProtocol(e.data || e))
          } catch (dispatchError) {
            console.error('💥 Erro ao dispatch protocol.updated:', dispatchError)
          }
        })

      console.log('✅ Listeners do projeto configurados:', projectChannelName)
    } catch (listenError: any) {
      console.error('💥 Erro ao configurar listeners do projeto:', listenError)
      logEventToDebugger('system', 'listener.error', {
        error: listenError.message,
        channel: projectChannelName
      })
    }

    // 🔧 Escutar TODOS os eventos no canal para debug
    safeBindGlobal(projectChannel, projectChannelName)

    // 🔧 Testar se os canais estão funcionando
    setTimeout(() => {
      console.log('🔍 Verificando estado dos canais...')

      try {
        // Verificar canal do protocolo
        if (protocolChannel?.subscription) {
          console.log('📡 Canal do protocolo:', {
            name: protocolChannelName,
            subscribed: protocolChannel.subscription.subscribed,
            state: protocolChannel.subscription.state
          })
        }

        // Verificar canal do projeto
        if (projectChannel?.subscription) {
          console.log('📡 Canal do projeto:', {
            name: projectChannelName,
            subscribed: projectChannel.subscription.subscribed,
            state: projectChannel.subscription.state
          })
        }
      } catch (checkError) {
        console.warn('⚠️ Erro ao verificar estado dos canais:', checkError)
      }
    }, 2000)
  } catch (error: any) {
    console.error('💥 Erro ao configurar listeners:', error)

    if (debuggerCallback) {
      try {
        debuggerCallback({
          channel: 'system',
          event: 'listener.error',
          data: { error: error.message, protocolId, clientId },
          type: 'received'
        })
      } catch (debugError) {
        console.error('💥 Erro no callback do debugger durante erro:', debugError)
      }
    }
  }
}

// ✅ Função para limpar listeners (VERSÃO CORRIGIDA)
export function cleanupProtocolEvents(echo: Echo<any>, protocolId: string, clientId: string) {
  console.log('🧹 Limpando listeners para:', { protocolId, clientId })

  try {
    const protocolChannelName = `protocol.${protocolId}`
    const projectChannelName = `project.${clientId}`

    // Tentar desconectar com tratamento de erro individual
    try {
      echo.leave(protocolChannelName)
      console.log('✅ Desconectado do canal:', protocolChannelName)
    } catch (leaveError) {
      console.warn('⚠️ Erro ao desconectar do canal de protocolo:', protocolChannelName, leaveError)
    }

    try {
      echo.leave(projectChannelName)
      console.log('✅ Desconectado do canal:', projectChannelName)
    } catch (leaveError) {
      console.warn('⚠️ Erro ao desconectar do canal de projeto:', projectChannelName, leaveError)
    }

    console.log('✅ Cleanup concluído')

    if (debuggerCallback) {
      try {
        debuggerCallback({
          channel: 'system',
          event: 'channels.cleanup',
          data: { protocolId, clientId, channels: [protocolChannelName, projectChannelName] },
          type: 'received'
        })
      } catch (debugError) {
        console.error('💥 Erro no callback do debugger durante cleanup:', debugError)
      }
    }
  } catch (error: any) {
    console.error('💥 Erro ao limpar listeners:', error)
  }
}

// ✅ Função auxiliar para listar canais ativos (VERSÃO CORRIGIDA)
export function getActiveChannels(echo: Echo<any>) {
  try {
    if (!echo?.connector?.pusher?.channels?.channels) {
      console.warn('⚠️ Estrutura de canais não disponível')

      return []
    }

    const channels = echo.connector.pusher.channels.channels
    const channelNames = Object.keys(channels)

    console.log('📡 Canais ativos:', channelNames)

    // 🔧 Debug dos canais com verificação de segurança
    channelNames.forEach(channelName => {
      try {
        const channel = channels[channelName]

        console.log(`📡 Canal ${channelName}:`, {
          subscribed: channel?.subscribed,
          state: channel?.subscription_state
        })
      } catch (channelError) {
        console.warn(`⚠️ Erro ao inspecionar canal ${channelName}:`, channelError)
      }
    })

    return channelNames
  } catch (error: any) {
    console.error('💥 Erro ao obter canais ativos:', error)

    return []
  }
}

// ✅ Função para debug de eventos - MELHORADA E CORRIGIDA
export function debugChannelEvents(echo: Echo<any>, protocolId: string, clientId: string) {
  if (process.env.NODE_ENV !== 'development') return

  console.group('🔍 Debug Channel Events')

  try {
    // Verificar se Echo está disponível
    if (!echo?.connector?.pusher?.channels?.channels) {
      console.error('💥 Echo ou channels não disponível para debug')
      console.groupEnd()

      return
    }

    // Debug do canal do protocolo
    const protocolChannelName = `private-protocol.${protocolId}`

    console.log('🔧 Verificando canal:', protocolChannelName)

    // ✅ Acessar canal diretamente
    const protocolChannel = echo.connector.pusher.channels.channels[protocolChannelName]

    if (protocolChannel) {
      console.log('✅ Canal encontrado:', protocolChannelName, {
        subscribed: protocolChannel.subscribed,
        state: protocolChannel.subscription_state
      })
    } else {
      console.warn('⚠️ Canal não encontrado:', protocolChannelName)
    }

    // Debug do canal do projeto
    const projectChannelName = `private-project.${clientId}`
    const projectChannel = echo.connector.pusher.channels.channels[projectChannelName]

    if (projectChannel) {
      console.log('✅ Canal encontrado:', projectChannelName, {
        subscribed: projectChannel.subscribed,
        state: projectChannel.subscription_state
      })
    } else {
      console.warn('⚠️ Canal não encontrado:', projectChannelName)
    }

    // 🔧 Listar TODOS os canais
    const allChannels = Object.keys(echo.connector.pusher.channels.channels)

    console.log('📡 Todos os canais:', allChannels)

    // 🔧 Verificar estado da conexão
    const connection = echo.connector.pusher.connection

    console.log('🔗 Estado da conexão:', {
      state: connection?.state,
      socketId: connection?.socket_id
    })

    console.log('✅ Debug concluído')
  } catch (error: any) {
    console.error('💥 Erro ao fazer debug:', error)
  }

  console.groupEnd()
}

export function sendTestMessage(echo: Echo<any>, protocolId: string) {
  if (process.env.NODE_ENV !== 'development') return

  console.log('🧪 Enviando mensagem de teste para:', protocolId)

  try {
    // Simular um evento para testar
    if (debuggerCallback) {
      debuggerCallback({
        channel: `protocol.${protocolId}`,
        event: 'test.message',
        data: {
          message: 'Mensagem de teste',
          timestamp: new Date().toISOString(),
          protocolId,
          source: 'frontend-test'
        },
        type: 'sent'
      })
      console.log('✅ Mensagem de teste enviada para debugger')
    } else {
      console.warn('⚠️ Debugger callback não disponível')
    }
  } catch (error) {
    console.error('💥 Erro ao enviar mensagem de teste:', error)
  }
}

export function checkChannelsHealth(echo: Echo<any>) {
  try {
    if (!echo?.connector?.pusher) {
      return { status: 'error', message: 'Echo não inicializado' }
    }

    const connection = echo.connector.pusher.connection
    const channels = echo.connector.pusher.channels.channels

    const health = {
      status: 'ok',
      connection: {
        state: connection?.state,
        socketId: connection?.socket_id
      },
      channels: {
        total: Object.keys(channels).length,
        active: Object.values(channels).filter((ch: any) => ch?.subscribed).length,
        list: Object.keys(channels)
      }
    }

    console.log('🏥 Saúde dos canais:', health)

    return health
  } catch (error: any) {
    console.error('💥 Erro ao verificar saúde dos canais:', error)

    return { status: 'error', message: error.message }
  }
}

// 🔧 Exportar funcionalidades de debug
export const debugUtils = {
  setDebuggerCallback,
  sendTestMessage,
  debugChannelEvents,
  getActiveChannels,
  checkChannelsHealth
}
