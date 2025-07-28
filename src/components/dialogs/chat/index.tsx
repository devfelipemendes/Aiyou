// src/components/dialogs/chat-monitoring/ChatMonitoringModal.tsx
'use client'

// React Imports
import { useState, useCallback, useEffect, useMemo } from 'react'

// MUI Imports
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

// Icon Imports
import { MessageSquare } from 'lucide-react'

// Component Imports
import ChatLog from '@/components/chatLog/chatLog'

// Types - vamos usar os mesmos tipos que você já tem
import type { ChatHistoryMessage, ChatWithHistory } from '@/api/endpoints/chat/history'

// import type { ChatMonitorProps } from '@/types/newChatypes'

// import type { ProtocolHistoryItem } from '@/api/endpoints/chat/protocolHistory'
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
  flexDirection: 'row' // Layout horizontal: sidebar + chat
}))

// ===== COMPONENTE PRINCIPAL =====

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

  const theme = useTheme()
  const modeTheme = theme.palette.mode
  const isBelowLgScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  // 🔥 NOVO: Hook para histórico
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

    // Converter Record<string, ProtocolHistoryItem> para array
    const protocolsArray = Object.entries(clientHistories).map(([protocol, data]) => ({
      protocol, // 🔥 ADICIONAR: protocolo como propriedade
      identifier: data.identifier,
      source: data.source,
      assistant_name: data.assistant_name,
      operator_name: data.operator_name,
      history: data.history,
      messageCount: data.history?.length || 0,
      lastActivity: data.history?.[data.history.length - 1]?.created_at || '',
      createdAt: data.history?.[0]?.created_at || '' // 🔥 ADICIONAR: createdAt
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

    // Aqui poderia chamar refetchAll() do hook pai se necessário
  }

  const convertProtocolToDisplay = useCallback(
    (protocolData: any): ChatWithHistory => {
      // 🔥 MUDANÇA: any em vez de ProtocolHistoryItem
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
        protocol: protocolData.protocol, // 🔥 OK: agora existe
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
        operator: chatData?.operator || 0,
        question_operator: chatData?.question_operator || 0,
        updated_at: chatData?.updated_at || new Date().toISOString(),
        created_at: protocolData.createdAt || new Date().toISOString() // 🔥 OK: agora existe
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

        // 🔥 NOVO: Buscar dados do protocolo correto
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

  // ========== 5. ATUALIZAR EFEITO PARA RESETAR SELEÇÃO QUANDO MODAL ABRE ==========
  // ✅ ADICIONAR este useEffect para sincronizar com chatData inicial:
  useEffect(() => {
    if (open && chatData) {
      setSelectedProtocol(chatData.protocol)
      setDisplayChatData(chatData)
    }
  }, [open, chatData])

  // Estados internos do modal

  // Estado para controle das ações

  // ===== HANDLERS DAS AÇÕES (aqui é onde a mágica acontece!) =====

  const handleSidebarClose = useCallback(() => {
    if (isBelowMdScreen) {
      setSidebarOpen(false)
    }
  }, [isBelowMdScreen])

  // Helper para verificar se uma ação está carregando

  // Se não tiver dados, não renderiza
  if (!chatData) return null

  // Dados básicos do cliente
  const clientName = chatData.assistant?.name || `Cliente ${chatData.protocol}`
  const clientChannel = chatData.source || 'WhatsApp'

  // const getStatusColors = (status: ChatMonitorProps['statusChat'], callOperator: boolean) => {
  //   if (callOperator) {
  //     return {
  //       backgroundColor: '#f44336', // Vermelho para chamada de operador
  //       color: '#ffffff'
  //     }
  //   }

  //   const colorConfig = {
  //     active: { backgroundColor: '#44b700', color: '#ffffff' }, // Verde para ativo
  //     inactive: { backgroundColor: '#797979', color: '#ffffff' }, // Cinza para inativo
  //     resolved: { backgroundColor: '#2e7d32', color: '#ffffff' }, // Verde escuro para resolvido
  //     unresolved: { backgroundColor: '#ed6c02', color: '#ffffff' } // Laranja para não resolvido
  //   }

  //   return colorConfig[status] ?? colorConfig.active
  // }

  // const StyledBadge = styled(Badge, {
  //   shouldForwardProp: prop => !['status', 'callOperator'].includes(prop as string)
  // })<{ status: ChatMonitorProps['statusChat']; callOperator: boolean }>(({ theme, status, callOperator }) => {
  //   const colors = getStatusColors(status, callOperator)

  //   return {
  //     '& .MuiBadge-badge': {
  //       backgroundColor: colors.backgroundColor,
  //       color: colors.color,
  //       boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  //       '&::after': {
  //         position: 'absolute',
  //         top: 0,
  //         left: 0,
  //         width: '100%',
  //         height: '100%',
  //         borderRadius: '50%',
  //         animation: 'ripple 1.2s infinite ease-in-out',
  //         border: '1px solid currentColor',
  //         content: '""'
  //       }
  //     },
  //     '@keyframes ripple': {
  //       '0%': {
  //         transform: 'scale(.8)',
  //         opacity: 1
  //       },
  //       '100%': {
  //         transform: 'scale(2.4)',
  //         opacity: 0
  //       }
  //     }
  //   }
  // })

  return (
    <LargeMonitoringDialog open={open} onClose={onClose}>
      {/* CONTEÚDO PRINCIPAL */}
      <ModalDialogContent>
        {/* SIDEBAR ESQUERDA */}
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

        {/* ✅ ÁREA PRINCIPAL - CHAT COM CHATLOG INTEGRADO */}
        <Box flex={1} display='flex' flexDirection='column'>
          {/* ChatLog - Conversa em tempo real */}
          <Box
            flex={1}
            sx={{
              overflow: 'hidden', // ✅ Container não tem scroll
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0 // ✅ Importante para flex shrinking
            }}
          >
            {/* Header da conversa */}
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

            {/* Área do ChatLog - Container com scroll próprio */}
            <Box
              sx={{
                flex: 1,
                position: 'relative',
                overflowY: 'auto', // ✅ Scroll vertical
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

                // ✅ Scrollbar customizada
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
                // ✅ Auto-scroll para o final quando o conteúdo muda
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
                    minHeight: '100%' // ✅ Garante que o conteúdo sempre tenha altura mínima
                  }}
                >
                  <ChatLog
                    chatData={displayChatData || chatData}
                    isBelowLgScreen={true} // ✅ Usa scroll nativo
                    isBelowMdScreen={false}
                    isBelowSmScreen={false}
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

          {/* Input de mensagem (rodapé) */}
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
                {/* TODO: Implementar TextField */}
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
