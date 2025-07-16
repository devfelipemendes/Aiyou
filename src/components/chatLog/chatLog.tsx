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

import { type ChatLogProps, type ChatLogMessage, type MsgGroupType } from '@/types/newChatypes'

// ===== FUNÇÃO PARA AGRUPAR MENSAGENS =====
const formatedChatData = (messages: ChatLogMessage[]): MsgGroupType[] => {
  if (!messages || messages.length === 0) return []

  const formattedChatData: MsgGroupType[] = []
  let chatMessageSenderId = messages[0].senderId
  let msgGroup: MsgGroupType = {
    senderId: chatMessageSenderId,
    messages: []
  }

  messages.forEach((message, index) => {
    if (chatMessageSenderId === message.senderId) {
      msgGroup.messages.push({
        time: message.time,
        message: message.message,
        msgStatus: message.msgStatus
      })
    } else {
      chatMessageSenderId = message.senderId
      formattedChatData.push(msgGroup)
      msgGroup = {
        senderId: message.senderId,
        messages: [
          {
            time: message.time,
            message: message.message,
            msgStatus: message.msgStatus
          }
        ]
      }
    }

    if (index === messages.length - 1) formattedChatData.push(msgGroup)
  })

  return formattedChatData
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
const ChatLog = ({ chatStore, isBelowLgScreen, isBelowMdScreen, isBelowSmScreen }: ChatLogProps) => {
  // Dados simplificados
  const { profileUser, activeChat } = chatStore
  const { userInfo: otherUser, messages } = activeChat

  // Refs
  const scrollRef = useRef(null)

  return (
    <ScrollWrapper isBelowLgScreen={isBelowLgScreen} scrollRef={scrollRef}>
      <CardContent
        className='p-0'
        style={{
          pointerEvents: 'none', // ✅ Transparente ao scroll
          overflow: 'visible' // ✅ Remove scroll interno
        }}
      >
        {formatedChatData(messages).map((msgGroup, index) => {
          const isSender = msgGroup.senderId === profileUser.id
          const currentUser = isSender ? profileUser : otherUser

          return (
            <div key={index} className={classnames('flex gap-4 p-5', { 'flex-row-reverse': isSender })}>
              {/* ===== AVATAR SIMPLIFICADO ===== */}
              {currentUser.avatar ? (
                <Avatar alt={currentUser.fullName} src={currentUser.avatar} className='is-8 bs-8' />
              ) : (
                <CustomAvatar skin='light' size={32}>
                  {getInitials(currentUser.fullName)}
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
                  // Mostrar apenas para a última mensagem do grupo
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
                            {msg.time
                              ? new Date(msg.time).toLocaleString('en-US', {
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true
                                })
                              : new Date().toLocaleString('en-US', {
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true
                                })}
                          </Typography>
                        </div>
                      ) : (
                        <Typography variant='caption'>
                          {msg.time
                            ? new Date(msg.time).toLocaleString('en-US', {
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true
                              })
                            : new Date().toLocaleString('en-US', {
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true
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
