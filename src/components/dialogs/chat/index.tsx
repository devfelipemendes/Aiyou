'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'

import { Dialog, DialogContent, Typography, Box, Paper, useTheme, useMediaQuery, type Theme } from '@mui/material'
import { styled } from '@mui/material/styles'

import { MessageSquare } from 'lucide-react'

import ChatLog from '@/components/chatLog/chatLog'

import type { ChatWithHistory } from '@/api/endpoints/chat/history'

import ChatMonitoringSidebar from './(components)/ChatMonitoringSidebar'
import SendMsgForm from '@/components/SendMessageFormChat'

import { useOperatorReplyMutation } from '@/api/endpoints/chat/operatorMode'
import { useGetHistoryByProtocolQuery, type ProtocolHistoryMessage } from '@/api/endpoints/chat/protocolHistory'
import { useMonitoringChatWithWebSocket } from '@/hooks/useMonitoringWithWebSocket'
import { useAppSelector } from '@/redux-store'

const LargeMonitoringDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '95vw',
    height: '90vh',
    maxWidth: 'none',
    maxHeight: 'none',
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',

    [theme.breakpoints.down('md')]: {
      width: '98vw',
      height: '95vh',
      margin: 4
    },

    [theme.breakpoints.down('sm')]: {
      width: '100vw',
      height: '100vh',
      margin: 0,
      borderRadius: 0
    }
  }
}))

const ModalDialogContent = styled(DialogContent)(() => ({
  padding: 0,
  height: '100%',
  display: 'flex',
  overflow: 'hidden',
  flexDirection: 'row'
}))

interface ChatMonitoringModalProps {
  open: boolean
  onClose: () => void
  chatData: ChatWithHistory | null
}

const ChatMonitoringModal = ({ open, onClose, chatData }: ChatMonitoringModalProps) => {
  const [selectedProtocol, setSelectedProtocol] = useState<string>(chatData?.protocol || '')
  const [displayChatData, setDisplayChatData] = useState<ChatWithHistory | null>(chatData)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [operatorReply, { isLoading: isOperatorLoading }] = useOperatorReplyMutation()

  const monitoringChats = useAppSelector((state: any) => state.monitoring?.chatsByProtocol || {})

  const messageInputRef = useRef<HTMLDivElement>(null)

  const {
    data: protocolHistoryData,
    isLoading: protocolHistoryLoading,
    error: protocolHistoryError
  } = useGetHistoryByProtocolQuery(selectedProtocol, {
    skip: !selectedProtocol || !open
  })

  const { refetch: refetchProtocolHistory } = useMonitoringChatWithWebSocket()

  const convertHistoryMessage = useCallback(
    (msg: ProtocolHistoryMessage): any => ({
      id: msg.id,
      content: msg.content,
      message_type: msg.message_type,
      audio_url: msg.audio_url,
      role: msg.role,
      operator: msg.operator !== null && msg.operator > 0,
      operator_name: msg.operator_name,
      created_at: msg.created_at,
      instruction: null
    }),
    []
  )

  const processedHistoryData = useMemo(() => {
    if (!protocolHistoryData?.data) return []

    return Object.entries(protocolHistoryData.data).map(([protocol, item]) => ({
      protocol,
      identifier: item.identifier,
      source: item.source,
      assistant: { name: item.assistant_name },
      operator_name: item.operator_name, // Corrigido: usar operator_name ao invés de last_operator_name
      history: (item.history || []).map(convertHistoryMessage),
      messageCount: item.history?.length || 0,
      created_at: item.history?.[0]?.created_at || '',
      status: 'active' as const,
      historyLoading: false,
      historyError: null,
      isAwaitingHistory: false,
      operator: false,
      question_operator: false,
      project_id: '',
      updated_at: item.history?.[item.history.length - 1]?.created_at || '',
      lastMessage: item.history?.length > 0 ? convertHistoryMessage(item.history[item.history.length - 1]) : undefined
    }))
  }, [protocolHistoryData, convertHistoryMessage])

  const currentChat = useMemo(() => {
    // 1️⃣ Buscar no Redux (fonte da verdade para operator)
    const reduxChat = monitoringChats[selectedProtocol]

    // 2️⃣ Buscar nos dados processados da API (tem o histórico completo)
    const apiChat = processedHistoryData.find(p => p.protocol === selectedProtocol)

    // 3️⃣ MERGE: combinar ambos (operator do Redux + history da API)
    if (reduxChat && apiChat) {
      return {
        ...apiChat,
        operator: reduxChat.operator, // 🔥 Usar estado do Redux
        question_operator: reduxChat.question_operator
      }
    }

    // 4️⃣ Fallback
    return reduxChat || apiChat || displayChatData
  }, [selectedProtocol, monitoringChats, processedHistoryData, displayChatData])

  const isAssumed = currentChat?.operator || false

  const handleOperatorMessage = useCallback(
    async (content: string) => {
      if (!selectedProtocol || !content.trim()) {
        console.warn('⚠️ Protocolo ou conteúdo inválido')

        return
      }

      try {
        console.log('📨 Enviando mensagem do operador:', { selectedProtocol, content })

        await operatorReply({
          protocol: selectedProtocol,
          content: content.trim()
        }).unwrap()

        console.log('✅ Mensagem do operador enviada com sucesso!')
      } catch (error) {
        console.error('❌ Erro ao enviar mensagem do operador:', error)
      }
    },
    [selectedProtocol, operatorReply]
  )

  const lastUserMessage = useMemo(() => {
    if (!displayChatData?.history || displayChatData.history.length === 0) {
      return null
    }

    const userMessages = displayChatData.history.filter(msg => msg.role === 'user')

    if (userMessages.length === 0) {
      return null
    }

    const lastMessage = userMessages[userMessages.length - 1]

    console.log('🔍 Última mensagem do cliente:', {
      id: lastMessage.id,
      content: lastMessage.content?.slice(0, 50) + '...',
      operator: lastMessage.operator,
      needsOperator: lastMessage.operator === true
    })

    return lastMessage
  }, [displayChatData?.history])

  const needsOperatorInstruction = useMemo(() => {
    const needsInstruction = lastUserMessage?.operator === true

    if (needsInstruction) {
      console.log('🚨 ATENÇÃO: Mensagem precisa de instrução do operador!', {
        messageId: lastUserMessage.id,
        content: lastUserMessage.content?.slice(0, 100)
      })
    }

    return needsInstruction
  }, [lastUserMessage])

  const handleInstructAssistant = useCallback(async (messageId: string, instruction: string) => {
    console.log('🔥 INSTRUINDO ASSISTENTE:', {
      messageId,
      instruction,
      timestamp: new Date().toISOString()
    })

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log('✅ Instrução enviada com sucesso!')
    } catch (error) {
      console.error('💥 Erro ao instruir assistente:', error)
    }
  }, [])

  const theme = useTheme()
  const modeTheme = theme.palette.mode
  const isBelowLgScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  const handleProtocolSelect = useCallback(
    (protocol: string, protocolData: any) => {
      setSelectedProtocol(protocol)

      if (protocolData?.history) {
        const convertedHistory = protocolData.history.map(convertHistoryMessage)

        setDisplayChatData({
          ...chatData,
          protocol,
          history: convertedHistory,
          messageCount: convertedHistory.length,
          identifier: protocolData.identifier,
          source: protocolData.source,
          lastMessage: convertedHistory[convertedHistory.length - 1]
        } as ChatWithHistory)
      }
    },
    [chatData, convertHistoryMessage]
  )

  const handleEndChat = useCallback(async () => {
    // Implementar lógica de encerramento se necessário
    console.log('Encerrando chat:', selectedProtocol)
    onClose()
  }, [selectedProtocol, onClose])

  useEffect(() => {
    if (open && chatData) {
      setSelectedProtocol(chatData.protocol)
      setDisplayChatData(chatData)
    }
  }, [open, chatData])

  if (!chatData) return null

  const clientName = chatData.identifier || `Cliente ${chatData.protocol}`
  const clientChannel = chatData.source || 'WhatsApp'
  const protocolNumber = chatData.protocol

  return (
    <LargeMonitoringDialog open={open} onClose={onClose}>
      <ModalDialogContent>
        <ChatMonitoringSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          chatData={currentChat}
          selectedProtocol={selectedProtocol}
          historyData={processedHistoryData}
          historyLoading={protocolHistoryLoading}
          historyError={(protocolHistoryError as any)?.message || null}
          onRefreshHistory={refetchProtocolHistory}
          onProtocolSelect={handleProtocolSelect}
          isBelowLgScreen={isBelowLgScreen}
          isBelowMdScreen={isBelowMdScreen}
          isBelowSmScreen={isBelowSmScreen}
          onEndChat={handleEndChat}
        />

        <Box flex={1} display='flex' flexDirection='column'>
          <Box
            flex={1}
            sx={{
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                flexShrink: 0
              }}
            >
              <Typography variant='subtitle1' fontWeight='medium'>
                Em contato com: {clientName}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Canal: {clientChannel} • Protocolo: {protocolNumber}
              </Typography>
            </Paper>

            <Box
              sx={{
                flex: 1,
                position: 'relative',
                overflowY: 'auto',
                overflowX: 'hidden',
                backgroundImage: `${
                  modeTheme === 'light'
                    ? 'linear-gradient(rgba(241, 241, 241, 0.95), rgba(255,255,255,0.95))'
                    : 'linear-gradient( rgba(28, 24, 48, 0.95), rgba(40,36,61,0.95))'
                }, url("/images/identidadeVisual/bgChat.png")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                scrollBehavior: 'smooth',

                '&::-webkit-scrollbar': {
                  width: '6px'
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: theme => theme.palette.divider,
                  borderRadius: '3px',
                  '&:hover': {
                    background: theme => theme.palette.text.secondary
                  }
                }
              }}
              ref={element => {
                if (element && chatData?.history?.length) {
                  requestAnimationFrame(() => {
                    ;(element as HTMLDivElement).scrollTop = (element as HTMLDivElement).scrollHeight
                  })
                }
              }}
            >
              {chatData.history && chatData.history.length > 0 ? (
                <Box
                  sx={{
                    padding: 2,
                    minHeight: '100%'
                  }}
                >
                  <ChatLog
                    chatData={displayChatData || chatData}
                    isBelowLgScreen={isBelowLgScreen}
                    isBelowMdScreen={isBelowMdScreen}
                    isBelowSmScreen={isBelowSmScreen}
                    showOperatorTriggers={needsOperatorInstruction}
                    operatorTriggerMessages={lastUserMessage?.id ? [lastUserMessage.id] : []}
                    onInstructAssistant={handleInstructAssistant}
                    isShowDetailsChatLog={true}
                  />
                </Box>
              ) : (
                <Box
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                  height='100%'
                  flexDirection='column'
                  gap={2}
                >
                  <MessageSquare size={48} color='#ccc' />
                  <Typography variant='h6' color='text.secondary'>
                    Nenhuma mensagem ainda
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Este chat não possui histórico de mensagens
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Box
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              backgroundColor: isAssumed ? 'background.paper' : 'action.disabledBackground',
              opacity: isAssumed ? 1 : 0.6
            }}
          >
            {isAssumed ? (
              <SendMsgForm
                isBelowSmScreen={isBelowSmScreen}
                messageInputRef={messageInputRef}
                placeholder='Digite sua mensagem como operador...'
                onSendMessage={handleOperatorMessage} // 🔥 Nova prop
                disabled={false}
                isOperatorLoading={isOperatorLoading}
              />
            ) : (
              <Box p={2} textAlign='center'>
                <Typography variant='body2' color='text.secondary'>
                  💬 Para enviar mensagens, primeiro assuma o chat
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {'Use o botão "Assumir Chat" na barra lateral'}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </ModalDialogContent>
    </LargeMonitoringDialog>
  )
}

export default ChatMonitoringModal
