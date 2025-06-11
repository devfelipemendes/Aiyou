// React Imports
import { useRef, useEffect } from 'react'
import type { MutableRefObject, ReactNode } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import CardContent from '@mui/material/CardContent'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { ChatType, ChatDataType, UserChatType, ProfileUserType } from '@/types/chatTypes'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { DateUtils } from './utils' // 🔥 ADICIONADO: Import dos utilitários corrigidos

type MsgGroupType = {
  senderId: number
  messages: Omit<UserChatType, 'senderId'>[]
}

type ChatLogProps = {
  chatStore: ChatDataType
  isBelowLgScreen: boolean
  isBelowMdScreen: boolean
  isBelowSmScreen: boolean
}

// Formats the chat data into a structured format for display.
const formatedChatData = (chats: ChatType['chat'], profileUser: ProfileUserType) => {
  const formattedChatData: MsgGroupType[] = []
  let chatMessageSenderId = chats[0] ? chats[0].senderId : profileUser.id
  let msgGroup: MsgGroupType = {
    senderId: chatMessageSenderId,
    messages: []
  }

  chats.forEach((chat, index) => {
    if (chatMessageSenderId === chat.senderId) {
      msgGroup.messages.push({
        time: chat.time,
        message: chat.message,
        msgStatus: chat.msgStatus
      })
    } else {
      chatMessageSenderId = chat.senderId

      formattedChatData.push(msgGroup)
      msgGroup = {
        senderId: chat.senderId,
        messages: [
          {
            time: chat.time,
            message: chat.message,
            msgStatus: chat.msgStatus
          }
        ]
      }
    }

    if (index === chats.length - 1) formattedChatData.push(msgGroup)
  })

  return formattedChatData
}

// Wrapper for the chat log to handle scrolling
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
      <div ref={scrollRef} className={classnames('bs-full overflow-y-auto overflow-x-hidden', className)}>
        {children}
      </div>
    )
  } else {
    return (
      <PerfectScrollbar ref={scrollRef} options={{ wheelPropagation: false }} className={className}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const ChatLog = ({ chatStore, isBelowLgScreen, isBelowMdScreen, isBelowSmScreen }: ChatLogProps) => {
  // Props
  const { profileUser, contacts } = chatStore

  // Vars
  const activeUserChat = chatStore.chats.find((chat: ChatType) => chat.userId === chatStore.activeUser?.id)

  // Refs
  const scrollRef = useRef(null)

  // Function to scroll to bottom when new message is sent
  const scrollToBottom = () => {
    if (scrollRef.current) {
      if (isBelowLgScreen) {
        // @ts-ignore
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      } else {
        // @ts-ignore
        scrollRef.current._container.scrollTop = scrollRef.current._container.scrollHeight
      }
    }
  }

  // Scroll to bottom on new message
  useEffect(() => {
    if (activeUserChat && activeUserChat.chat && activeUserChat.chat.length) {
      scrollToBottom()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatStore])

  return (
    <ScrollWrapper
      isBelowLgScreen={isBelowLgScreen}
      scrollRef={scrollRef}
      className='bg-[var(--mui-palette-customColors-chatBg)]'
    >
      <CardContent className='p-0'>
        {activeUserChat &&
          formatedChatData(activeUserChat.chat, profileUser).map((msgGroup, index) => {
            const isSender = msgGroup.senderId === profileUser.id

            return (
              <div key={index} className={classnames('flex gap-4 p-5', { 'flex-row-reverse': isSender })}>
                {!isSender ? (
                  contacts.find(contact => contact.id === activeUserChat?.userId)?.avatar ? (
                    <Avatar
                      alt={contacts.find(contact => contact.id === activeUserChat?.userId)?.fullName}
                      src={contacts.find(contact => contact.id === activeUserChat?.userId)?.avatar}
                      className='is-8 bs-8'
                    />
                  ) : (
                    <CustomAvatar
                      color={contacts.find(contact => contact.id === activeUserChat?.userId)?.avatarColor}
                      skin='light'
                      size={32}
                    >
                      {getInitials(contacts.find(contact => contact.id === activeUserChat?.userId)?.fullName as string)}
                    </CustomAvatar>
                  )
                ) : profileUser.avatar ? (
                  <Avatar alt={profileUser.fullName} src={profileUser.avatar} className='is-8 bs-8' />
                ) : (
                  <CustomAvatar alt={profileUser.fullName} src={profileUser.avatar} size={32} />
                )}
                <div
                  className={classnames('flex flex-col gap-2', {
                    'items-end': isSender,
                    'max-is-[65%]': !isBelowMdScreen,
                    'max-is-[75%]': isBelowMdScreen && !isBelowSmScreen,
                    'max-is-[calc(100%-5.75rem)]': isBelowSmScreen
                  })}
                >
                  {msgGroup.messages.map((msg, index) => (
                    <Typography
                      key={index}
                      className={classnames('whitespace-pre-wrap pli-4 plb-2 shadow-xs', {
                        'bg-backgroundPaper rounded-e rounded-b': !isSender,
                        'bg-primary text-[var(--mui-palette-primary-contrastText)] rounded-s rounded-b': isSender
                      })}
                      style={{ wordBreak: 'break-word' }}
                    >
                      {msg.message}
                    </Typography>
                  ))}
                  {msgGroup.messages.map(
                    (msg, index) =>
                      index === msgGroup.messages.length - 1 &&
                      (isSender ? (
                        <div key={index} className='flex items-center gap-2'>
                          {/* 🔥 Status Icons - Mantidos iguais */}
                          {msg.msgStatus?.isSeen ? (
                            <i className='ri-check-double-line text-success text-base' />
                          ) : msg.msgStatus?.isDelivered ? (
                            <i className='ri-check-double-line text-base' />
                          ) : (
                            msg.msgStatus?.isSent && <i className='ri-check-line text-base' />
                          )}

                          {/* 🔥 CORRIGIDO: Formatação de tempo usando DateUtils */}
                          {index === activeUserChat.chat.length - 1 ? (
                            <Typography variant='caption'>
                              {DateUtils.formatForChat(DateUtils.now())} {/* Última mensagem: tempo atual */}
                            </Typography>
                          ) : msg.time ? (
                            <Typography variant='caption'>
                              {DateUtils.formatForChat(msg.time)} {/* ✅ Usando timestamp diretamente */}
                            </Typography>
                          ) : null}
                        </div>
                      ) : index === activeUserChat.chat.length - 1 ? (
                        <Typography key={index} variant='caption'>
                          {DateUtils.formatForChat(DateUtils.now())} {/* Última mensagem: tempo atual */}
                        </Typography>
                      ) : msg.time ? (
                        <Typography key={index} variant='caption'>
                          {DateUtils.formatForChat(msg.time)} {/* ✅ Usando timestamp diretamente */}
                        </Typography>
                      ) : null)
                  )}
                </div>
              </div>
            )
          })}
      </CardContent>
    </ScrollWrapper>
  )
}

export default ChatLog

/*
🔥 PRINCIPAIS MUDANÇAS:

1. ✅ Import do DateUtils corrigido
2. ✅ Substituição de new Date(msg.time).toLocaleString() por DateUtils.formatForChat(msg.time)
3. ✅ msg.time agora é tratado como number (timestamp)
4. ✅ Compatibilidade mantida com a estrutura existente
5. ✅ Performance melhorada (não cria objetos Date desnecessários)

📝 COMO FUNCIONA AGORA:

- msg.time é um timestamp (number)
- DateUtils.formatForChat() converte para string legível
- Sem mais erros de serialização
- Formatação consistente em todo o app

🎯 RESULTADO ESPERADO:

- Horários aparecem como "2:30 PM", "14:30", etc.
- Sem erros no console
- Performance melhorada
- Código mais limpo e mantível
*/
