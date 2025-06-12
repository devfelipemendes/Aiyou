import type { Dispatch } from 'redux'
import type Echo from 'laravel-echo'

// ✅ CORRIGIDO: Importar dos slices corretos
import {
  addQuestion,
  updateQuestion,
  addReply,
  updateReply,
  addOperatorReply,
  updateOperatorReply
} from '@/redux-store/slices/questions'
import { addProtocol, updateProtocol } from '@/redux-store/slices/protocols'

// ✅ Função para escutar eventos de protocolo
export function listenProtocolEvents(echo: Echo<any>, protocolId: string, clientId: string, dispatch: Dispatch) {
  console.log('🎧 Configurando listeners para:', { protocolId, clientId })

  try {
    // ✅ Canal com perguntas e respostas
    const protocolChannel = echo.private(`protocol.${protocolId}`)

    protocolChannel
      .listen('.question.created', (e: any) => {
        console.log('📝 Nova pergunta recebida:', e.data)
        dispatch(addQuestion(e.data))
      })
      .listen('.question.updated', (e: any) => {
        console.log('📝 Pergunta atualizada:', e.data)
        dispatch(updateQuestion(e.data))
      })
      .listen('.reply.created', (e: any) => {
        console.log('💬 Nova resposta recebida:', e.data)
        dispatch(addReply(e.data))
      })
      .listen('.reply.updated', (e: any) => {
        console.log('💬 Resposta atualizada:', e.data)
        dispatch(updateReply(e.data))
      })
      .listen('.operator.reply.created', (e: any) => {
        console.log('👨‍💼 Nova resposta do operador:', e.data)
        dispatch(addOperatorReply(e.data))
      })
      .listen('.operator.reply.updated', (e: any) => {
        console.log('👨‍💼 Resposta do operador atualizada:', e.data)
        dispatch(updateOperatorReply(e.data))
      })

    console.log('✅ Listeners do protocolo configurados:', `protocol.${protocolId}`)

    // ✅ Canal com criação/edição de protocolo
    const projectChannel = echo.private(`project.${clientId}`)

    projectChannel
      .listen('.protocol.created', (e: any) => {
        console.log('📋 Novo protocolo criado:', e.data)
        dispatch(addProtocol(e.data))
      })
      .listen('.protocol.updated', (e: any) => {
        console.log('📋 Protocolo atualizado:', e.data)
        dispatch(updateProtocol(e.data))
      })

    console.log('✅ Listeners do projeto configurados:', `project.${clientId}`)
  } catch (error: any) {
    console.error('💥 Erro ao configurar listeners:', error)
  }
}

// ✅ Função para limpar listeners
export function cleanupProtocolEvents(echo: Echo<any>, protocolId: string, clientId: string) {
  console.log('🧹 Limpando listeners para:', { protocolId, clientId })

  try {
    echo.leave(`protocol.${protocolId}`)
    echo.leave(`project.${clientId}`)

    console.log('✅ Listeners limpos com sucesso')
  } catch (error: any) {
    console.error('💥 Erro ao limpar listeners:', error)
  }
}

// ✅ Função auxiliar para listar canais ativos
export function getActiveChannels(echo: Echo<any>) {
  try {
    const channels = echo.connector.pusher.channels.channels
    const channelNames = Object.keys(channels)

    console.log('📡 Canais ativos:', channelNames)

    return channelNames
  } catch (error: any) {
    console.error('💥 Erro ao obter canais ativos:', error)

    return []
  }
}

// ✅ Função para debug de eventos
export function debugChannelEvents(echo: Echo<any>, protocolId: string, clientId: string) {
  if (process.env.NODE_ENV !== 'development') return

  console.group('🔍 Debug Channel Events')

  try {
    // Debug do canal do protocolo
    const protocolChannelName = `protocol.${protocolId}`
    const protocolChannel = echo.private(protocolChannelName)

    console.log('Canal do protocolo:', protocolChannelName)

    // Listener genérico para capturar todos os eventos
    protocolChannel.bind_global((eventName: string, data: any) => {
      console.log(`📡 Evento recebido no ${protocolChannelName}:`, eventName, data)
    })

    // Debug do canal do projeto
    const projectChannelName = `project.${clientId}`
    const projectChannel = echo.private(projectChannelName)

    console.log('Canal do projeto:', projectChannelName)

    projectChannel.bind_global((eventName: string, data: any) => {
      console.log(`📡 Evento recebido no ${projectChannelName}:`, eventName, data)
    })

    console.log('✅ Debug listeners configurados')
  } catch (error: any) {
    console.error('💥 Erro ao configurar debug:', error)
  }

  console.groupEnd()
}
