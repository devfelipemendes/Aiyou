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

// Exemplo: passando protocolId e clientId como argumentos
export function listenProtocolEvents(echo: Echo<any>, protocolId: string, clientId: string, dispatch: Dispatch) {
  // Canal com perguntas e respostas
  echo
    .private(`protocol.${protocolId}`)
    .listen('.question.created', (e: any) => dispatch(addQuestion(e.data)))
    .listen('.question.updated', (e: any) => dispatch(updateQuestion(e.data)))
    .listen('.reply.created', (e: any) => dispatch(addReply(e.data)))
    .listen('.reply.updated', (e: any) => dispatch(updateReply(e.data)))
    .listen('.operator.reply.created', (e: any) => dispatch(addOperatorReply(e.data)))
    .listen('.operator.reply.updated', (e: any) => dispatch(updateOperatorReply(e.data)))

  // Canal com criação/edição de protocolo
  echo
    .private(`project.${clientId}`)
    .listen('.protocol.created', (e: any) => dispatch(addProtocol(e.data)))
    .listen('.protocol.updated', (e: any) => dispatch(updateProtocol(e.data)))
}

export function cleanupProtocolEvents(echo: Echo<any>, protocolId: string, clientId: string) {
  echo.leave(`protocol.${protocolId}`)
  echo.leave(`project.${clientId}`)
}
