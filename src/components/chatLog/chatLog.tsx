import { useRef, useState } from 'react'
import type { MutableRefObject, ReactNode } from 'react'

import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import CardContent from '@mui/material/CardContent'

import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

import { Box, Button, Divider } from '@mui/material'

import CustomAvatar from '@core/components/mui/Avatar'

import { getInitials } from '@/utils/getInitials'

import type { ChatHistoryMessage, ChatWithHistory } from '@/api/endpoints/chat/history'
import SendMsgForm from '../SendMessageFormChat'

interface AdaptedChatLogProps {
  chatData: ChatWithHistory
  isBelowLgScreen: boolean
  isBelowMdScreen: boolean
  isBelowSmScreen: boolean
  showOperatorTriggers?: boolean
  operatorTriggerMessages?: string[]
  onInstructAssistant?: (messageId: string, messageContent: string) => void
  isShowDetailsChatLog?: boolean
}

interface AdaptedMsgGroup {
  senderId: string
  senderRole: 'user' | 'assistant' | 'operator'
  senderName: string
  messages: Array<{
    messageId: string
    time: number
    operator?: boolean
    message: string
    msgStatus?: {
      isSent: boolean
      isDelivered: boolean
      isSeen: boolean
    }
  }>
}

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
      msgGroup.messages.push({
        time: new Date(message.created_at).getTime(),
        message: message.content,
        operator: message.operator ?? undefined,
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        },
        messageId: message.id
      })
    } else {
      currentRole = message.role
      formattedData.push(msgGroup)
      msgGroup = {
        senderId: message.id,
        senderRole: message.role,
        senderName: message.role === 'user' ? 'Cliente' : 'Assistente',
        messages: [
          {
            messageId: message.id,
            time: new Date(message.created_at).getTime(),
            message: message.content,
            operator: message.operator ?? undefined,
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
          suppressScrollY: false
        }}
        className={className}
        style={{
          overflow: 'visible'
        }}
      >
        {children}
      </PerfectScrollbar>
    )
  }
}

const ChatLog = ({
  chatData,
  isBelowLgScreen,
  isBelowMdScreen,
  isBelowSmScreen,
  showOperatorTriggers = false,
  operatorTriggerMessages = [],

  isShowDetailsChatLog
}: AdaptedChatLogProps) => {
  const scrollRef = useRef(null)

  console.log('🔥 CHATLOG RENDERIZADO!', {
    showOperatorTriggers,
    operatorTriggerMessages,
    hasHistory: !!chatData?.history?.length
  })

  const formattedMessages = formatChatHistory(chatData.history)

  const [activeInstructionMessageId, setActiveInstructionMessageId] = useState<string | null>(null)

  const handleToggleInstructionInput = (messageId: string) => {
    if (activeInstructionMessageId === messageId) {
      setActiveInstructionMessageId(null)
    } else {
      setActiveInstructionMessageId(messageId)
    }
  }

  if (showOperatorTriggers) {
    const allFormattedIds = formattedMessages.flatMap(group => group.messages.map(msg => msg.messageId))

    console.log('🚨 Todos IDs formatados:', allFormattedIds)
    console.log(
      '🚨 Match encontrado:',
      operatorTriggerMessages.some(id => allFormattedIds.includes(id))
    )
  }

  const messageInputRef = useRef<HTMLDivElement>(null)

  // const isSmallScreen = window.innerWidth < 600

  return (
    <ScrollWrapper isBelowLgScreen={isBelowLgScreen} scrollRef={scrollRef}>
      <CardContent
        className='p-0'
        style={{
          overflow: 'visible'
        }}
      >
        {formattedMessages.map((msgGroup, index) => {
          const isSender = msgGroup.senderRole === 'operator' || msgGroup.senderRole === 'assistant'
          const userData = getUserData(msgGroup.senderRole, chatData)

          return (
            <div key={index} className={classnames('flex gap-4 p-5', { 'flex-row-reverse': isSender })}>
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

                {msgGroup.messages.map((msg, msgIndex) => {
                  const hasButton = !isSender && msg.operator === true && isShowDetailsChatLog
                  const showingInput = activeInstructionMessageId === msg.messageId

                  return (
                    <>
                      {showingInput && (
                        <div className='mb-2'>
                          <SendMsgForm
                            dispatch={undefined as any}
                            isBelowSmScreen={isBelowSmScreen}
                            messageInputRef={messageInputRef}
                            placeholder='Digite uma instrução'
                            isInstruction={true}
                            questionId={msg.messageId}
                          />
                        </div>
                      )}
                      <Box
                        key={msgIndex}
                        className={classnames('whitespace-pre-wrap pli-4 plb-2 shadow-xs', {
                          'bg-backgroundPaper rounded-e rounded-b': !isSender,
                          'bg-primary text-[var(--mui-palette-primary-contrastText)] rounded-s rounded-b': isSender,

                          'flex justify-between items-start gap-3': hasButton
                        })}
                        sx={{
                          width: hasButton ? 'auto' : 'fit-content',
                          minWidth: hasButton ? '200px' : 'auto',
                          maxWidth: '100%'
                        }}
                      >
                        {hasButton ? (
                          <>
                            <Typography
                              style={{
                                wordBreak: 'break-word',
                                flex: 1,
                                marginRight: '12px'
                              }}
                              className={classnames({
                                'bg-backgroundPaper rounded-e rounded-b': !isSender,
                                'bg-primary text-[var(--mui-palette-primary-contrastText)] rounded-s rounded-b':
                                  isSender
                              })}
                            >
                              {msg.message}
                            </Typography>

                            <Divider orientation='vertical' flexItem />

                            <Button
                              variant='contained'
                              size='small'
                              className='cursor-pointer'
                              color={!showingInput ? 'info' : 'error'}
                              sx={{
                                flexShrink: 0,
                                alignSelf: 'flex-start'
                              }}
                              onClick={() => handleToggleInstructionInput(msg.messageId)}
                              endIcon={
                                showingInput ? <i className='ri-close-line' /> : <i className='ri-chat-3-line' />
                              }
                            >
                              {showingInput ? 'Cancelar modo instrução' : 'Instruir assistente'}
                            </Button>
                          </>
                        ) : (
                          <Typography
                            style={{ wordBreak: 'break-word' }}
                            className={classnames({
                              'bg-backgroundPaper rounded-e rounded-b': !isSender,
                              'bg-primary text-[var(--mui-palette-primary-contrastText)] rounded-s rounded-b': isSender
                            })}
                          >
                            {msg.message}
                          </Typography>
                        )}
                      </Box>
                    </>
                  )
                })}

                {msgGroup.messages.map((msg, msgIndex) => {
                  if (msgIndex !== msgGroup.messages.length - 1) return null

                  return (
                    <div key={msgIndex}>
                      {isSender ? (
                        <div className='flex items-center gap-2'>
                          {msg.msgStatus?.isSeen ? (
                            <i className='ri-check-double-line text-success text-base' />
                          ) : msg.msgStatus?.isDelivered ? (
                            <i className='ri-check-double-line text-base' />
                          ) : (
                            msg.msgStatus?.isSent && <i className='ri-check-line text-base' />
                          )}

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
