// components/chat/ChatModal.tsx
'use client'

import { useState, useRef, useEffect } from 'react'

// MUI Imports
import Modal from '@mui/material/Modal'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Fade from '@mui/material/Fade'
import Backdrop from '@mui/material/Backdrop'
import Tooltip from '@mui/material/Tooltip'

// Types
import type { ChatData, ChatMessage } from '@/types/chatTypes'

// Props do Modal
interface ChatModalProps {
  open: boolean
  onClose: () => void
  chatData: ChatData | null
  isLoading: boolean
  onSendMessage?: (message: string) => void
  onTakeControl?: () => void
  onReleaseControl?: () => void
}

/**
 * Estilo do modal seguindo padrões Material Design
 */
const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '95%',
  maxWidth: 1000,
  height: '90vh',
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
}

/**
 * Componente individual de mensagem
 */
const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isOperator = message.sender === 'operator'
  const isBot = message.sender === 'bot'
  const isCustomer = message.sender === 'customer'

  const getBubbleColor = () => {
    if (isOperator) return 'primary.main'
    if (isBot) return 'grey.300'

    return 'background.paper'
  }

  const getTextColor = () => {
    if (isOperator) return 'primary.contrastText'

    return 'text.primary'
  }

  const getBorderStyle = () => {
    if (isBot) return { border: '1px dashed', borderColor: 'primary.main' }
    if (isCustomer) return { border: '1px solid', borderColor: 'grey.300' }

    return {}
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOperator ? 'flex-end' : 'flex-start',
        mb: 2,
        px: 1
      }}
    >
      <Paper
        elevation={isOperator ? 2 : 1}
        sx={{
          p: 1.5,
          maxWidth: '75%',
          bgcolor: getBubbleColor(),
          color: getTextColor(),
          borderRadius: isOperator ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          ...getBorderStyle()
        }}
      >
        {/* Indicador do remetente */}
        {!isOperator && (
          <Typography
            variant='caption'
            sx={{
              display: 'block',
              fontWeight: 600,
              mb: 0.5,
              color: isBot ? 'primary.main' : 'text.secondary'
            }}
          >
            {isBot ? '🤖 Bot' : '👤 Cliente'}
          </Typography>
        )}

        {/* Conteúdo da mensagem */}
        <Typography variant='body2' sx={{ mb: 0.5, lineHeight: 1.4 }}>
          {message.content}
        </Typography>

        {/* Timestamp */}
        <Typography
          variant='caption'
          sx={{
            opacity: 0.7,
            display: 'block',
            textAlign: isOperator ? 'right' : 'left',
            mt: 0.5
          }}
        >
          {message.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
          {message.isRead === false && isOperator && <span style={{ marginLeft: 4 }}>📨</span>}
        </Typography>
      </Paper>
    </Box>
  )
}

/**
 * Componente principal do modal
 */
export const ChatModal = ({
  open,
  onClose,
  chatData,
  isLoading,
  onSendMessage,
  onTakeControl,
  onReleaseControl
}: ChatModalProps) => {
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)

  // Auto scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    })
  }

  useEffect(() => {
    if (open && chatData?.messages) {
      // Delay para permitir que o modal seja renderizado
      setTimeout(scrollToBottom, 100)
    }
  }, [open, chatData?.messages])

  // Focus no input quando modal abre
  useEffect(() => {
    if (open && !isLoading) {
      setTimeout(() => {
        messageInputRef.current?.focus()
      }, 300)
    }
  }, [open, isLoading])

  /**
   * Enviar nova mensagem
   */
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)

    try {
      onSendMessage?.(newMessage.trim())
      setNewMessage('')

      // Pequeno delay para simular envio
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setIsSending(false)
    }
  }

  /**
   * Handle Enter para enviar mensagem
   */
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  /**
   * Obter cor do status
   */
  const getStatusChipColor = (status: ChatData['status']) => {
    switch (status) {
      case 'operator_call':
        return 'error'
      case 'unsolved_closed':
        return 'warning'
      case 'operator_control':
        return 'info'
      case 'no_response':
        return 'warning'
      case 'active':
        return 'success'
      default:
        return 'default'
    }
  }

  /**
   * Obter texto do status
   */
  const getStatusText = (status: ChatData['status']) => {
    switch (status) {
      case 'operator_call':
        return 'Chamada Urgente'
      case 'unsolved_closed':
        return 'Não Resolvido'
      case 'operator_control':
        return 'Sob Controle'
      case 'no_response':
        return 'Sem Resposta'
      case 'active':
        return 'Ativo'
      default:
        return 'Desconhecido'
    }
  }

  /**
   * Verificar se pode assumir controle
   */
  const canTakeControl = chatData?.status !== 'operator_control'

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
      }}
    >
      <Fade in={open}>
        <Box sx={modalStyle}>
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <CircularProgress size={48} />
              <Typography variant='h6' color='text.secondary'>
                Carregando conversa...
              </Typography>
            </Box>
          ) : chatData ? (
            <>
              {/* Header do Modal */}
              <CardHeader
                avatar={
                  <Avatar
                    src={chatData.customerAvatar}
                    sx={{
                      bgcolor: 'primary.main',
                      width: 56,
                      height: 56
                    }}
                  >
                    {chatData.customerName.charAt(0).toUpperCase()}
                  </Avatar>
                }
                title={
                  <Box>
                    <Typography variant='h6' component='div'>
                      {chatData.customerName}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Chat #{chatData.id} • {chatData.department || 'Atendimento Geral'}
                    </Typography>
                  </Box>
                }
                action={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={getStatusText(chatData.status)}
                      color={getStatusChipColor(chatData.status)}
                      size='small'
                    />

                    {canTakeControl ? (
                      <Tooltip title='Assumir controle do chat'>
                        <Button
                          variant='contained'
                          size='small'
                          onClick={onTakeControl}
                          startIcon={<i className='ri-user-line' />}
                        >
                          Assumir
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip title='Liberar controle do chat'>
                        <Button
                          variant='outlined'
                          size='small'
                          onClick={onReleaseControl}
                          startIcon={<i className='ri-user-unfollow-line' />}
                        >
                          Liberar
                        </Button>
                      </Tooltip>
                    )}

                    <Tooltip title='Fechar'>
                      <IconButton onClick={onClose} size='small'>
                        <i className='ri-close-line' />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
                sx={{
                  pb: 1,
                  borderBottom: 1,
                  borderColor: 'divider'
                }}
              />

              {/* Área de Mensagens */}
              <CardContent
                sx={{
                  flexGrow: 1,
                  overflow: 'auto',
                  p: 0,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ flexGrow: 1, p: 2 }}>
                  {chatData.messages && chatData.messages.length > 0 ? (
                    <>
                      {chatData.messages.map((message: any) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant='h6' color='text.secondary' gutterBottom>
                        💬 Nenhuma mensagem ainda
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Seja o primeiro a enviar uma mensagem nesta conversa
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Input de Nova Mensagem */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    <TextField
                      ref={messageInputRef}
                      fullWidth
                      multiline
                      maxRows={4}
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder='Digite sua mensagem...'
                      variant='outlined'
                      size='small'
                      disabled={isSending}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.paper',
                          borderRadius: 2
                        }
                      }}
                    />

                    <Tooltip title={newMessage.trim() ? 'Enviar mensagem' : 'Digite uma mensagem'}>
                      <span>
                        <Button
                          variant='contained'
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || isSending}
                          sx={{
                            minWidth: 48,
                            height: 40,
                            borderRadius: 2
                          }}
                        >
                          {isSending ? (
                            <CircularProgress size={18} color='inherit' />
                          ) : (
                            <i className='ri-send-plane-line' />
                          )}
                        </Button>
                      </span>
                    </Tooltip>
                  </Box>

                  {/* Indicador de digitação */}
                  {chatData.isTyping && (
                    <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                      {chatData.customerName} está digitando...
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant='h6' color='error' gutterBottom>
                ⚠️ Erro ao carregar dados do chat
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Tente novamente ou entre em contato com o suporte
              </Typography>
            </Box>
          )}
        </Box>
      </Fade>
    </Modal>
  )
}

export default ChatModal
