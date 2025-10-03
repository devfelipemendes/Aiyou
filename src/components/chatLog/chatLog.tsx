import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

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
import { AudioPlayer } from '../AudioPlayer'

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
    messageType?: 'text' | 'audio'
    audioUrl?: string | null
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
        messageType: message.message_type, // Adicionar
        audioUrl: message.audio_url,
        operator: message.operator ?? undefined,
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        },
        messageId: message.id
      })
      console.log('Mensagem processada:', {
        id: message.id,
        type: message.message_type,
        audio: message.audio_url,
        content: message.content.substring(0, 50)
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
            messageType: message.message_type, // Adicionar
            audioUrl: message.audio_url, // Adicionar
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
  scrollRef: (element: any) => void
  className?: string
}) => {
  if (isBelowLgScreen) {
    return (
      <div
        ref={scrollRef}
        className={classnames('bs-full overflow-y-auto overflow-x-hidden ', className)}
        style={{ scrollBehavior: 'auto' }}
      >
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
  const scrollRef = useRef<any>(null)

  const [instructionLoading, setInstructionLoading] = useState<string | null>(null)

  // 🔥 FUNÇÃO: Scroll direto para o final
  const scrollToBottom = useCallback(() => {
    if (!scrollRef.current) return

    if (isBelowLgScreen) {
      // @ts-ignore
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    } else {
      // @ts-ignore
      if (scrollRef.current._container) {
        scrollRef.current._container.scrollTop = scrollRef.current._container.scrollHeight
      }
    }
  }, [isBelowLgScreen])

  const handleInstructionSending = useCallback((questionId: string) => {
    setInstructionLoading(questionId)
  }, [])

  const handleCloseInstructionInput = useCallback(() => {
    setInstructionLoading(null)
    setActiveInstructionMessageId(null)
  }, [])

  // 🔥 SCROLL INICIAL: Executa ANTES da renderização visual
  useLayoutEffect(() => {
    if (chatData?.history?.length) {
      scrollToBottom()
    }
  }, [chatData?.history?.length, scrollToBottom])

  // 🔥 REF CALLBACK: Scroll imediato quando ref é criado
  const handleScrollRef = useCallback(
    (element: HTMLDivElement | any) => {
      scrollRef.current = element

      if (element && chatData?.history?.length) {
        // Scroll imediato na criação
        setTimeout(() => {
          if (isBelowLgScreen) {
            element.scrollTop = element.scrollHeight
          } else {
            if (element._container) {
              element._container.scrollTop = element._container.scrollHeight
            }
          }
        }, 0)
      }
    },
    [chatData?.history?.length, isBelowLgScreen]
  )

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

  const handleInstructionSent = useCallback(
    (questionId: string) => {
      console.log('✅ Instrução enviada com sucesso para:', questionId)

      // Aguardar um pouco para suavizar a transição
      setTimeout(() => {
        setInstructionLoading(null)
        setActiveInstructionMessageId(null)
      }, 500)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scrollToBottom]
  )

  const handleInstructionError = useCallback((questionId: string) => {
    console.log('❌ Erro ao enviar instrução para:', questionId)
    setInstructionLoading(null)

    // Manter modal aberto em caso de erro
  }, [])

  // const isSmallScreen = window.innerWidth < 600

  return (
    <ScrollWrapper isBelowLgScreen={isBelowLgScreen} scrollRef={handleScrollRef}>
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
                  const hasButton = !isSender && msg.operator === true && isShowDetailsChatLog === true
                  const isLoadingThisMessage = instructionLoading === msg.messageId
                  const showingInput = activeInstructionMessageId === msg.messageId && !isLoadingThisMessage
                  const isAudioMessage = msg.messageType === 'audio' && msg.audioUrl

                  return (
                    <React.Fragment key={msg.messageId || msgIndex}>
                      {showingInput && (
                        <div className='mb-2'>
                          <SendMsgForm
                            dispatch={undefined as any}
                            isBelowSmScreen={isBelowSmScreen}
                            messageInputRef={messageInputRef}
                            placeholder={isLoadingThisMessage ? 'Enviando instrução...' : 'Digite uma instrução'}
                            isInstruction={true}
                            questionId={msg.messageId}
                            onInstructionSent={handleInstructionSent}
                            onCancel={handleCloseInstructionInput}
                            onInstructionSending={handleInstructionSending}
                            onInstructionError={handleInstructionError}
                            disabled={isLoadingThisMessage}
                          />
                        </div>
                      )}

                      {/* Renderização para ÁUDIO */}
                      {isAudioMessage ? (
                        <Box
                          className={classnames('shadow-xs', {
                            'rounded-e rounded-b': !isSender,
                            'rounded-s rounded-b': isSender,
                            'flex justify-between items-start gap-3': hasButton
                          })}
                          sx={{
                            bgcolor: isSender ? 'primary.main' : 'background.paper',
                            p: 1,
                            width: hasButton ? 'auto' : 'fit-content',
                            minWidth: hasButton ? '350px' : '280px',
                            maxWidth: '100%'
                          }}
                        >
                          {hasButton ? (
                            <>
                              <Box sx={{ flex: 1 }}>
                                <AudioPlayer
                                  audioUrl={msg.audioUrl!}
                                  messageId={msg.messageId}
                                  compact={isBelowSmScreen}
                                />
                                {/* Mostrar transcrição se existir */}
                                {msg.message && msg.message !== 'Áudio' && (
                                  <Typography
                                    variant='caption'
                                    sx={{
                                      display: 'block',
                                      mt: 3,
                                      mb: 3,
                                      px: 3,
                                      fontStyle: 'italic',
                                      color: isSender ? 'primary.contrastText' : 'text.secondary'
                                    }}
                                  >
                                    Transcrição: {msg.message}
                                  </Typography>
                                )}
                              </Box>

                              <Divider orientation='vertical' flexItem />

                              <Button
                                variant='contained'
                                size='small'
                                className='cursor-pointer'
                                color={!showingInput ? 'info' : isLoadingThisMessage ? 'warning' : 'error'}
                                sx={{
                                  flexShrink: 0,
                                  alignSelf: 'flex-start',
                                  height: '100%',
                                  ml: 1
                                }}
                                onClick={() => handleToggleInstructionInput(msg.messageId)}
                                disabled={isLoadingThisMessage}
                                endIcon={
                                  isLoadingThisMessage ? (
                                    <i className='ri-loader-4-line animate-spin' />
                                  ) : showingInput ? (
                                    <i className='ri-close-line' />
                                  ) : (
                                    <i className='ri-chat-3-line' />
                                  )
                                }
                              >
                                {isLoadingThisMessage ? 'Enviando...' : showingInput ? 'Cancelar' : 'Instruir'}
                              </Button>
                            </>
                          ) : (
                            <Box>
                              <AudioPlayer
                                audioUrl={msg.audioUrl!}
                                messageId={msg.messageId}
                                compact={isBelowSmScreen}
                              />
                              {/* Mostrar transcrição se existir */}
                              {msg.message && msg.message !== 'Áudio' && (
                                <Typography
                                  variant='caption'
                                  sx={{
                                    display: 'block',
                                    mt: 3,
                                    mb: 3,
                                    px: 3,
                                    fontStyle: 'italic',
                                    color: isSender ? 'primary.contrastText' : 'text.secondary'
                                  }}
                                >
                                  Transcrição: {msg.message}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      ) : (
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
                                color={!showingInput ? 'info' : isLoadingThisMessage ? 'warning' : 'error'}
                                sx={{
                                  flexShrink: 0,
                                  alignSelf: 'flex-start'
                                }}
                                onClick={() => handleToggleInstructionInput(msg.messageId)}
                                disabled={isLoadingThisMessage}
                                endIcon={
                                  isLoadingThisMessage ? (
                                    <i className='ri-loader-4-line animate-spin' />
                                  ) : showingInput ? (
                                    <i className='ri-close-line' />
                                  ) : (
                                    <i className='ri-chat-3-line' />
                                  )
                                }
                              >
                                {isLoadingThisMessage
                                  ? 'Enviando...'
                                  : showingInput
                                    ? 'Cancelar instrução'
                                    : 'Instruir assistente'}
                              </Button>
                            </>
                          ) : (
                            <Typography
                              style={{ wordBreak: 'break-word' }}
                              className={classnames({
                                'bg-backgroundPaper rounded-e rounded-b': !isSender,
                                'bg-primary text-[var(--mui-palette-primary-contrastText)] rounded-s rounded-b':
                                  isSender
                              })}
                            >
                              {msg.message}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </React.Fragment>
                  )
                })}

                {msgGroup.messages.map((msg, msgIndex) => {
                  if (msgIndex !== msgGroup.messages.length - 1) return null

                  return (
                    <div key={`status-${msg.messageId || msgIndex}`}>
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
