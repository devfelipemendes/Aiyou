// src/components/dialogs/chat-monitoring/ChatMonitoringModal.tsx
'use client'

// React Imports
import { useState, useCallback, useRef, useEffect } from 'react'

// MUI Imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material'
import { styled } from '@mui/material/styles'

// Icon Imports
import { MessageSquare, Phone, User, Settings, X, UserPlus, MessageCircle, UserCheck, XCircle } from 'lucide-react'

// Component Imports
import ChatLog from '@/components/chatLog/chatLog'

// Types - vamos usar os mesmos tipos que você já tem
import type { ChatWithHistory } from '@/api/endpoints/chat/history'

// ===== TIPOS PARA AS AÇÕES =====
type ActionType = 'assume_chat' | 'transfer_operator' | 'add_comment' | 'client_details' | 'end_chat'

interface ActionState {
  loading: ActionType | null
  error: string | null
  success: ActionType | null
}

// ===== COMPONENTES ESTILIZADOS (seguindo o padrão do projeto) =====

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

const ModalHeader = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.paper,
  flexShrink: 0,

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5, 1)
  }
}))

// ===== COMPONENTE PRINCIPAL =====

interface ChatMonitoringModalProps {
  open: boolean
  onClose: () => void
  chatData: ChatWithHistory | null
}

const ChatMonitoringModal = ({ open, onClose, chatData }: ChatMonitoringModalProps) => {
  // Estados internos do modal
  const [selectedSection, setSelectedSection] = useState<'chat' | 'details'>('chat')

  // Estado para controle das ações
  const [actionState, setActionState] = useState<ActionState>({
    loading: null,
    error: null,
    success: null
  })

  // ===== HANDLERS DAS AÇÕES (aqui é onde a mágica acontece!) =====

  const handleAssumeChat = useCallback(async () => {
    if (!chatData) return

    setActionState(prev => ({ ...prev, loading: 'assume_chat', error: null }))

    try {
      console.log('🔄 Assumindo chat:', chatData.protocol)

      // TODO: Implementar chamada para API
      // await assumeChatAPI(chatData.protocol)

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Sucesso
      setActionState(prev => ({
        ...prev,
        loading: null,
        success: 'assume_chat'
      }))

      console.log('✅ Chat assumido com sucesso!')

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setActionState(prev => ({ ...prev, success: null }))
      }, 3000)
    } catch (error) {
      console.error('❌ Erro ao assumir chat:', error)
      setActionState(prev => ({
        ...prev,
        loading: null,
        error: 'Erro ao assumir chat. Tente novamente.'
      }))
    }
  }, [chatData])

  const handleTransferOperator = useCallback(async () => {
    if (!chatData) return

    setActionState(prev => ({ ...prev, loading: 'transfer_operator', error: null }))

    try {
      console.log('🔄 Transferindo para outro operador:', chatData.protocol)

      // TODO: Abrir modal de seleção de operador
      // TODO: Implementar chamada para API

      await new Promise(resolve => setTimeout(resolve, 1000))

      setActionState(prev => ({
        ...prev,
        loading: null,
        success: 'transfer_operator'
      }))

      console.log('✅ Chat transferido!')

      setTimeout(() => {
        setActionState(prev => ({ ...prev, success: null }))
      }, 3000)
    } catch (error) {
      console.error('❌ Erro ao transferir:', error)
      setActionState(prev => ({
        ...prev,
        loading: null,
        error: 'Erro ao transferir chat.'
      }))
    }
  }, [chatData])

  const handleAddComment = useCallback(async () => {
    if (!chatData) return

    setActionState(prev => ({ ...prev, loading: 'add_comment', error: null }))

    try {
      console.log('🔄 Adicionando comentário:', chatData.protocol)

      // TODO: Abrir modal/dialog para adicionar comentário
      // TODO: Implementar chamada para API

      await new Promise(resolve => setTimeout(resolve, 800))

      setActionState(prev => ({
        ...prev,
        loading: null,
        success: 'add_comment'
      }))

      setTimeout(() => {
        setActionState(prev => ({ ...prev, success: null }))
      }, 3000)
    } catch (error) {
      console.error('❌ Erro ao adicionar comentário:', error)
      setActionState(prev => ({
        ...prev,
        loading: null,
        error: 'Erro ao adicionar comentário.'
      }))
    }
  }, [chatData])

  const handleClientDetails = useCallback(() => {
    if (!chatData) return

    console.log('📋 Abrindo detalhes do cliente:', chatData.protocol)

    // TODO: Navegar para página de detalhes do cliente
    // router.push(`/operador/clientes/${chatData.protocol}`)

    // Ou abrir em nova aba
    // window.open(`/operador/clientes/${chatData.protocol}`, '_blank')

    // Por enquanto, apenas feedback visual
    setActionState(prev => ({
      ...prev,
      success: 'client_details'
    }))

    setTimeout(() => {
      setActionState(prev => ({ ...prev, success: null }))
    }, 2000)
  }, [chatData])

  const handleEndChat = useCallback(async () => {
    if (!chatData) return

    setActionState(prev => ({ ...prev, loading: 'end_chat', error: null }))

    try {
      console.log('🔄 Encerrando atendimento:', chatData.protocol)

      // TODO: Implementar confirmação
      // const confirmed = await showConfirmDialog('Tem certeza que deseja encerrar?')
      // if (!confirmed) return

      // TODO: Implementar chamada para API
      // await endChatAPI(chatData.protocol)

      await new Promise(resolve => setTimeout(resolve, 1200))

      setActionState(prev => ({
        ...prev,
        loading: null,
        success: 'end_chat'
      }))

      console.log('✅ Atendimento encerrado!')

      // Fechar modal após sucesso
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('❌ Erro ao encerrar chat:', error)
      setActionState(prev => ({
        ...prev,
        loading: null,
        error: 'Erro ao encerrar atendimento.'
      }))
    }
  }, [chatData, onClose])

  // Helper para verificar se uma ação está carregando
  const isLoading = (action: ActionType) => actionState.loading === action
  const isSuccess = (action: ActionType) => actionState.success === action

  // Se não tiver dados, não renderiza
  if (!chatData) return null

  // Dados básicos do cliente
  const clientName = chatData.assistant?.name || `Cliente ${chatData.protocol}`
  const clientChannel = chatData.source || 'WhatsApp'
  const clientStatus = chatData.status === 'active' ? 'Ativo' : 'Inativo'

  return (
    <LargeMonitoringDialog open={open} onClose={onClose}>
      {/* HEADER DO MODAL */}
      <ModalHeader>
        <Box display='flex' alignItems='center' gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <User size={24} />
          </Avatar>
          <Box>
            <Typography variant='h6' component='div'>
              {clientName}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Canal de atendimento: {clientChannel} | Cliente antigo | (61) - 98331-4145
            </Typography>
          </Box>
          <Chip label={clientStatus} color={chatData.status === 'active' ? 'success' : 'default'} size='small' />
        </Box>

        <Box display='flex' alignItems='center' gap={1}>
          <IconButton size='small'>
            <Phone size={20} />
          </IconButton>
          <IconButton size='small'>
            <MessageSquare size={20} />
          </IconButton>
          <IconButton size='small'>
            <Settings size={20} />
          </IconButton>
          <IconButton onClick={onClose}>
            <X size={24} />
          </IconButton>
        </Box>
      </ModalHeader>

      {/* CONTEÚDO PRINCIPAL */}
      <ModalDialogContent>
        {/* SIDEBAR ESQUERDA */}
        <Paper
          sx={{
            width: 280,
            flexShrink: 0,
            borderRadius: 0,
            borderRight: 1,
            borderColor: 'divider'
          }}
        >
          {/* Seção de Ações */}
          <Box p={2}>
            <Typography variant='subtitle2' gutterBottom color='text.secondary'>
              Ações
            </Typography>

            {/* Mensagem de erro geral */}
            {actionState.error && (
              <Alert severity='error' sx={{ mb: 2, fontSize: '0.75rem' }}>
                {actionState.error}
              </Alert>
            )}

            <Box display='flex' flexDirection='column' gap={1}>
              {/* Botão: Assumir Chat */}
              <Button
                variant='contained'
                startIcon={
                  isLoading('assume_chat') ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : isSuccess('assume_chat') ? (
                    <UserCheck size={16} />
                  ) : (
                    <MessageSquare size={16} />
                  )
                }
                fullWidth
                size='small'
                onClick={handleAssumeChat}
                disabled={!!actionState.loading}
                color={isSuccess('assume_chat') ? 'success' : 'primary'}
              >
                {isLoading('assume_chat')
                  ? 'Assumindo...'
                  : isSuccess('assume_chat')
                    ? 'Chat Assumido!'
                    : 'Assumir Chat'}
              </Button>

              {/* Botão: Transferir Operador */}
              <Button
                variant='outlined'
                startIcon={
                  isLoading('transfer_operator') ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : isSuccess('transfer_operator') ? (
                    <UserCheck size={16} />
                  ) : (
                    <UserPlus size={16} />
                  )
                }
                fullWidth
                size='small'
                onClick={handleTransferOperator}
                disabled={!!actionState.loading}
                color={isSuccess('transfer_operator') ? 'success' : 'primary'}
              >
                {isLoading('transfer_operator')
                  ? 'Transferindo...'
                  : isSuccess('transfer_operator')
                    ? 'Transferido!'
                    : 'Transferir Para Outro Operador'}
              </Button>

              {/* Botão: Adicionar Comentário */}
              <Button
                variant='outlined'
                startIcon={
                  isLoading('add_comment') ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : isSuccess('add_comment') ? (
                    <UserCheck size={16} />
                  ) : (
                    <MessageCircle size={16} />
                  )
                }
                fullWidth
                size='small'
                onClick={handleAddComment}
                disabled={!!actionState.loading}
                color={isSuccess('add_comment') ? 'success' : 'primary'}
              >
                {isLoading('add_comment')
                  ? 'Adicionando...'
                  : isSuccess('add_comment')
                    ? 'Comentário Adicionado!'
                    : 'Adicionar Comentário'}
              </Button>

              {/* Botão: Detalhes do Cliente */}
              <Button
                variant='outlined'
                startIcon={isSuccess('client_details') ? <UserCheck size={16} /> : <User size={16} />}
                fullWidth
                size='small'
                onClick={handleClientDetails}
                disabled={!!actionState.loading}
                color={isSuccess('client_details') ? 'success' : 'primary'}
              >
                {isSuccess('client_details') ? 'Abrindo Detalhes!' : 'Ir Para Detalhes Do Cliente'}
              </Button>

              {/* Botão: Encerrar Atendimento */}
              <Button
                variant='contained'
                color='error'
                startIcon={
                  isLoading('end_chat') ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : isSuccess('end_chat') ? (
                    <UserCheck size={16} />
                  ) : (
                    <XCircle size={16} />
                  )
                }
                fullWidth
                size='small'
                onClick={handleEndChat}
                disabled={!!actionState.loading}
              >
                {isLoading('end_chat')
                  ? 'Encerrando...'
                  : isSuccess('end_chat')
                    ? 'Encerrado!'
                    : 'Encerrar Atendimento'}
              </Button>
            </Box>
          </Box>

          <Divider />

          {/* Seção de Status */}
          <Box p={2}>
            <Typography variant='subtitle2' gutterBottom color='text.secondary'>
              Status
            </Typography>
            {/* TODO: Implementar radio buttons de status */}
            <Typography variant='body2'>Status atual: {clientStatus}</Typography>
          </Box>

          <Divider />

          {/* Histórico de Interações */}
          <Box p={2}>
            <Typography variant='subtitle2' gutterBottom color='text.secondary'>
              Histórico de interações com este cliente:
            </Typography>
            {/* TODO: Implementar lista de interações anteriores */}
            <Typography variant='body2' color='text.secondary'>
              Histórico será implementado aqui
            </Typography>
          </Box>
        </Paper>

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
                backgroundImage: `linear-gradient(rgba(245, 245, 245, 0.9), rgba(255,255,255,0.9)), url("/images/identidadeVisual/bgChat.png")`,
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
                    element.scrollTop = element.scrollHeight
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
                    chatData={chatData}
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
