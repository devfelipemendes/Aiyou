'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'

import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Paper,
  Button,
  useTheme,
  useMediaQuery,
  type Theme
} from '@mui/material'
import { styled } from '@mui/material/styles'

import { MessageSquare } from 'lucide-react'

import ChatLog from '@/components/chatLog/chatLog'

import type { ChatHistoryMessage, ChatWithHistory } from '@/api/endpoints/chat/history'

import ChatMonitoringSidebar from './(components)/ChatMonitoringSidebar'

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
  clientHistories?: Record<string, any>
}

const ChatMonitoringModal = ({ open, onClose, chatData, clientHistories = {} }: ChatMonitoringModalProps) => {
  const [selectedProtocol, setSelectedProtocol] = useState<string>(chatData?.protocol || '')
  const [displayChatData, setDisplayChatData] = useState<ChatWithHistory | null>(chatData)
  const [sidebarOpen, setSidebarOpen] = useState(true)

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

  const historyData = useMemo(() => {
    if (!clientHistories || Object.keys(clientHistories).length === 0) {
      return {
        data: [],
        stats: {
          totalProtocols: 0,
          totalMessages: 0,
          oldestProtocol: undefined,
          newestProtocol: undefined
        }
      }
    }

    const protocolsArray = Object.entries(clientHistories).map(([protocol, data]) => ({
      protocol,
      identifier: data.identifier,
      source: data.source,
      assistant_name: data.assistant_name,
      operator_name: data.operator_name,
      history: data.history,
      messageCount: data.history?.length || 0,
      lastActivity: data.history?.[data.history.length - 1]?.created_at || '',
      createdAt: data.history?.[0]?.created_at || ''
    }))

    return {
      data: protocolsArray,
      stats: {
        totalProtocols: protocolsArray.length,
        totalMessages: protocolsArray.reduce((sum, p) => sum + p.messageCount, 0),
        oldestProtocol: protocolsArray[protocolsArray.length - 1]?.protocol,
        newestProtocol: protocolsArray[0]?.protocol
      }
    }
  }, [clientHistories])

  const historyLoading = false
  const historyError = null

  const refreshHistory = () => {
    console.log('🔄 Refresh via prop clientHistories')
  }

  const convertProtocolToDisplay = useCallback(
    (protocolData: any): ChatWithHistory => {
      console.log('🔄 Convertendo protocolo:', protocolData)

      const historyMessages = protocolData.history || []

      const convertedHistory: ChatHistoryMessage[] = historyMessages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        operator: msg.operator,
        created_at: msg.created_at
      }))

      const result: ChatWithHistory = {
        protocol: protocolData.protocol,
        assistant: chatData?.assistant || { name: 'Assistente' },
        source: chatData?.source || 'whatsapp',
        identifier: chatData?.identifier || `cliente_${protocolData.protocol?.slice(-4)}`,
        status: chatData?.status || 'active',
        history: convertedHistory,
        historyLoading: false,
        historyError: null,
        lastMessage: convertedHistory.length > 0 ? convertedHistory[convertedHistory.length - 1] : undefined,
        messageCount: convertedHistory.length,
        project_id: chatData?.project_id || '',
        operator: chatData?.operator || false,
        question_operator: chatData?.question_operator || false,
        updated_at: chatData?.updated_at || new Date().toISOString(),
        created_at: protocolData.createdAt || new Date().toISOString()
      }

      return result
    },
    [chatData]
  )

  const handleProtocolSelect = useCallback(
    (protocol: string, protocolData?: any) => {
      console.log('🔄 Selecionando protocolo:', protocol)

      try {
        setSelectedProtocol(protocol)

        let selectedData = protocolData

        if (!selectedData && clientHistories[protocol]) {
          selectedData = {
            protocol,
            ...clientHistories[protocol],
            createdAt: clientHistories[protocol].history?.[0]?.created_at || ''
          }
        }

        if (selectedData) {
          const convertedChatData = convertProtocolToDisplay(selectedData)

          setDisplayChatData(convertedChatData)
          console.log('✅ Protocolo selecionado:', convertedChatData)
        }
      } catch (error) {
        console.error('💥 Erro ao selecionar protocolo:', error)
      }
    },
    [clientHistories, convertProtocolToDisplay]
  )

  useEffect(() => {
    if (open && chatData) {
      setSelectedProtocol(chatData.protocol)
      setDisplayChatData(chatData)
    }
  }, [open, chatData])

  const handleSidebarClose = useCallback(() => {
    if (isBelowMdScreen) {
      setSidebarOpen(false)
    }
  }, [isBelowMdScreen])

  if (!chatData) return null

  const clientName = chatData.assistant?.name || `Cliente ${chatData.protocol}`
  const clientChannel = chatData.source || 'WhatsApp'

  return (
    <LargeMonitoringDialog open={open} onClose={onClose}>
      <ModalDialogContent>
        <ChatMonitoringSidebar
          open={sidebarOpen}
          onClose={handleSidebarClose}
          chatData={chatData}
          selectedProtocol={selectedProtocol}
          historyData={historyData}
          historyLoading={historyLoading}
          historyError={historyError}
          onRefreshHistory={refreshHistory}
          onProtocolSelect={handleProtocolSelect}
          isBelowLgScreen={isBelowLgScreen}
          isBelowMdScreen={isBelowMdScreen}
          isBelowSmScreen={isBelowSmScreen}
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
                💬 Conversa com {clientName}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {chatData.history?.length || 0} mensagens • Canal: {clientChannel}
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
                  {needsOperatorInstruction && (
                    <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1, mb: 1 }}>
                      <Typography variant='body2' color='warning.dark'>
                        🚨 Mensagem ID: {lastUserMessage?.id} precisa de instrução do operador
                      </Typography>
                      <Typography variant='caption'>Conteúdo: {lastUserMessage?.content?.slice(0, 100)}...</Typography>
                    </Box>
                  )}
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

          <Paper
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 0,
              borderTop: 1,
              borderColor: 'divider'
            }}
          >
            <Box display='flex' gap={1} alignItems='center'>
              <Box flex={1}>
                <Typography variant='body2' color='text.secondary' mb={1}>
                  Como a Aivou deveria responder isso pra deixar o cliente mais seguro e satisfeito? Escreva aqui sua
                  sugestão.
                </Typography>

                <Paper variant='outlined' sx={{ p: 1.5, minHeight: 60 }}>
                  <Typography variant='body2' color='text.disabled'>
                    Digite uma mensagem aqui!
                  </Typography>
                </Paper>
              </Box>
              <Button variant='contained' color='primary'>
                Instruir Assistente ➜
              </Button>
            </Box>
          </Paper>
        </Box>
      </ModalDialogContent>
    </LargeMonitoringDialog>
  )
}

export default ChatMonitoringModal
