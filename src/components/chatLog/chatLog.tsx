// React Imports
import { useRef } from 'react'
import type { MutableRefObject, ReactNode } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import CardContent from '@mui/material/CardContent'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

import type { ChatHistoryMessage, ChatWithHistory } from '@/api/endpoints/chat/history'

interface AdaptedChatLogProps {
  chatData: ChatWithHistory
  isBelowLgScreen: boolean
  isBelowMdScreen: boolean
  isBelowSmScreen: boolean
}

interface AdaptedMsgGroup {
  senderId: string
  senderRole: 'user' | 'assistant' | 'operator'
  senderName: string
  messages: Array<{
    time: number
    message: string
    msgStatus?: {
      isSent: boolean
      isDelivered: boolean
      isSeen: boolean
    }
  }>
}

// ===== FUNÇÃO PARA AGRUPAR MENSAGENS =====
const formatChatHistory = (history: ChatHistoryMessage[]): AdaptedMsgGroup[] => {
  if (!history || history.length === 0) return []

  const formattedData: AdaptedMsgGroup[] = []
  let currentRole = history[0].role
  let msgGroup: AdaptedMsgGroup = {
    senderId: history[0].id,
    senderRole: history[0].role,
    senderName: history[0].role === 'user' ? 'Cliente' : 'Assistente',
    messages: []
  }

  history.forEach((message, index) => {
    if (currentRole === message.role) {
      // Mesma pessoa continuando a conversa
      msgGroup.messages.push({
        time: new Date(message.created_at).getTime(),
        message: message.content,
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      })
    } else {
      // Nova pessoa falando
      currentRole = message.role
      formattedData.push(msgGroup)
      msgGroup = {
        senderId: message.id,
        senderRole: message.role,
        senderName: message.role === 'user' ? 'Cliente' : 'Assistente',
        messages: [
          {
            time: new Date(message.created_at).getTime(),
            message: message.content,
            msgStatus: {
              isSent: true,
              isDelivered: true,
              isSeen: true
            }
          }
        ]
      }
    }

    if (index === history.length - 1) formattedData.push(msgGroup)
  })

  return formattedData
}

const getUserData = (role: 'user' | 'assistant' | 'operator', chatData: ChatWithHistory) => {
  switch (role) {
    case 'user':
      return {
        id: 'user',
        fullName: `Cliente ${chatData.identifier.slice(-4)}`,
        avatar: null,
        role: 'Cliente'
      }
    case 'assistant':
      return {
        id: 'assistant',
        fullName: chatData.assistant?.name || 'Assistente',
        avatar: chatData.assistant?.img_url,
        role: 'Assistente'
      }
    case 'operator':
      return {
        id: 'operator',
        fullName: 'Operador',
        avatar: null,
        role: 'Operador'
      }
    default:
      return {
        id: 'unknown',
        fullName: 'Usuário',
        avatar: null,
        role: 'Usuário'
      }
  }
}

// ===== COMPONENTE DE SCROLL =====
const ScrollWrapper = ({
  children,
  isBelowLgScreen,
  scrollRef,
  className
}: {
  children: ReactNode
  isBelowLgScreen: boolean
  scrollRef: MutableRefObject<null>
  className?: string
}) => {
  if (isBelowLgScreen) {
    return (
      <div ref={scrollRef} className={classnames('bs-full overflow-y-auto overflow-x-hidden ', className)}>
        {children}
      </div>
    )
  } else {
    return (
      <PerfectScrollbar
        ref={scrollRef}
        options={{
          wheelPropagation: true,
          suppressScrollX: true,
          suppressScrollY: true
        }}
        className={className}
        style={{
          pointerEvents: 'none',
          overflow: 'visible'
        }}
      >
        {children}
      </PerfectScrollbar>
    )
  }
}

// ===== COMPONENTE PRINCIPAL =====
const ChatLog = ({ chatData, isBelowLgScreen, isBelowMdScreen, isBelowSmScreen }: AdaptedChatLogProps) => {
  const scrollRef = useRef(null)

  const formattedMessages = formatChatHistory(chatData.history)

  return (
    <ScrollWrapper isBelowLgScreen={isBelowLgScreen} scrollRef={scrollRef}>
      <CardContent
        className='p-0'
        style={{
          pointerEvents: 'none', // ✅ Transparente ao scroll
          overflow: 'visible' // ✅ Remove scroll interno
        }}
      >
        {formattedMessages.map((msgGroup, index) => {
          const isSender = msgGroup.senderRole === 'operator' || msgGroup.senderRole === 'assistant'
          const userData = getUserData(msgGroup.senderRole, chatData)

          return (
            <div key={index} className={classnames('flex gap-4 p-5', { 'flex-row-reverse': isSender })}>
              {/* ===== AVATAR SIMPLIFICADO ===== */}
              {userData.avatar ? (
                <Avatar
                  alt={userData.fullName.toUpperCase()}
                  src={userData.avatar.toUpperCase()}
                  className='is-8 bs-8'
                />
              ) : (
                <CustomAvatar skin={isSender ? 'filled' : 'light'} color={isSender ? 'primary' : 'info'} size={32}>
                  {getInitials(userData.fullName.toUpperCase())}
                </CustomAvatar>
              )}

              {/* ===== MENSAGENS ===== */}
              <div
                className={classnames('flex flex-col gap-2', {
                  'items-end': isSender,
                  'max-is-[65%]': !isBelowMdScreen,
                  'max-is-[75%]': isBelowMdScreen && !isBelowSmScreen,
                  'max-is-[calc(100%-5.75rem)]': isBelowSmScreen
                })}
              >
                {!isSender && (
                  <Typography variant='caption' color='text.secondary' className='px-2'>
                    {userData.fullName}
                  </Typography>
                )}
                {/* Renderizar mensagens do grupo */}
                {msgGroup.messages.map((msg, msgIndex) => (
                  <Typography
                    key={msgIndex}
                    className={classnames('whitespace-pre-wrap pli-4 plb-2 shadow-xs', {
                      'bg-backgroundPaper rounded-e rounded-b': !isSender,
                      'bg-primary text-[var(--mui-palette-primary-contrastText)] rounded-s rounded-b': isSender
                    })}
                    style={{ wordBreak: 'break-word' }}
                  >
                    {msg.message}
                  </Typography>
                ))}

                {/* ===== TIMESTAMP E STATUS ===== */}
                {msgGroup.messages.map((msg, msgIndex) => {
                  if (msgIndex !== msgGroup.messages.length - 1) return null

                  return (
                    <div key={msgIndex}>
                      {isSender ? (
                        <div className='flex items-center gap-2'>
                          {/* Status de entrega */}
                          {msg.msgStatus?.isSeen ? (
                            <i className='ri-check-double-line text-success text-base' />
                          ) : msg.msgStatus?.isDelivered ? (
                            <i className='ri-check-double-line text-base' />
                          ) : (
                            msg.msgStatus?.isSent && <i className='ri-check-line text-base' />
                          )}

                          {/* Timestamp */}
                          <Typography variant='caption'>
                            {new Date(msg.time).toLocaleString('pt-BR', {
                              hour: 'numeric',
                              minute: 'numeric',
                              hour12: false
                            })}
                          </Typography>
                        </div>
                      ) : (
                        <Typography variant='caption'>
                          {new Date(msg.time).toLocaleString('pt-BR', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: false
                          })}
                        </Typography>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </CardContent>
    </ScrollWrapper>
  )
}

export default ChatLog
