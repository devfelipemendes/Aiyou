// views/monitoring/MonitoringDashboard.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'

// Components
import { MonitoringCard } from '@/components/monitoring/MonitoringCard'
import { ChatModal } from '@/components/chat/ChatModal'

// Hooks
import { useChatModal } from '@/hooks/useChatModal'

// Types
import type { ChatData, ChatStatus } from '@/types/chatTypes'

/**
 * Dados mock para desenvolvimento
 * Remover quando integrar com WebSocket/API real
 */
const generateMockChats = (): ChatData[] => [
  {
    id: 'CHAT_001',
    customerName: 'João Silva Santos',
    customerEmail: 'joao.silva@email.com',
    status: 'operator_call',
    lastMessage: 'Preciso de ajuda URGENTE com meu pedido! O prazo está vencendo e não consegui finalizar.',
    timestamp: new Date(Date.now() - 300000), // 5 min atrás
    unreadCount: 3,
    priority: 'high',
    department: 'Vendas'
  },
  {
    id: 'CHAT_002',
    customerName: 'Maria dos Santos',
    customerEmail: 'maria.santos@email.com',
    status: 'unsolved_closed',
    lastMessage: 'O problema não foi resolvido mesmo após várias tentativas. Preciso de uma solução definitiva.',
    timestamp: new Date(Date.now() - 900000), // 15 min atrás
    unreadCount: 0,
    priority: 'medium',
    department: 'Suporte'
  },
  {
    id: 'CHAT_003',
    customerName: 'Pedro Costa Lima',
    customerEmail: 'pedro.costa@email.com',
    status: 'operator_control',
    lastMessage: 'Operador assumiu o controle da conversa',
    timestamp: new Date(Date.now() - 600000), // 10 min atrás
    operatorId: 'OP_001',
    operatorName: 'Ana Oliveira',
    unreadCount: 0,
    priority: 'low',
    department: 'Técnico'
  },
  {
    id: 'CHAT_004',
    customerName: 'Ana Lucia Ferreira',
    customerEmail: 'ana.lucia@email.com',
    status: 'no_response',
    lastMessage: 'Cliente não respondeu há mais de 15 minutos...',
    timestamp: new Date(Date.now() - 1200000), // 20 min atrás
    unreadCount: 0,
    priority: 'low',
    department: 'Atendimento'
  },
  {
    id: 'CHAT_005',
    customerName: 'Carlos Mendes',
    customerEmail: 'carlos.mendes@email.com',
    status: 'active',
    lastMessage: 'Obrigado pela ajuda! Está funcionando perfeitamente agora.',
    timestamp: new Date(Date.now() - 120000), // 2 min atrás
    unreadCount: 1,
    priority: 'medium',
    department: 'Suporte',
    isTyping: false
  },
  {
    id: 'CHAT_006',
    customerName: 'Fernanda Oliveira',
    customerEmail: 'fernanda.oliveira@email.com',
    status: 'active',
    lastMessage: 'Estou com dificuldades para acessar minha conta...',
    timestamp: new Date(Date.now() - 60000), // 1 min atrás
    unreadCount: 2,
    priority: 'medium',
    department: 'Técnico',
    isTyping: true
  }
]

/**
 * Componente principal do dashboard de monitoramento
 */
export const MonitoringDashboard = () => {
  // Estados
  const [chats, setChats] = useState<ChatData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ChatStatus | 'all'>('all')
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  // Hook do modal
  const chatModal = useChatModal()

  /**
   * Carregar dados iniciais (simula API call)
   */
  useEffect(() => {
    const loadChats = async () => {
      // Simula carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000))
      setChats(generateMockChats())
    }

    loadChats()
  }, [])

  /**
   * Simular atualizações em tempo real (remover quando implementar WebSocket)
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setChats(currentChats =>
        currentChats.map(chat => {
          // Simula algumas atualizações aleatórias
          const shouldUpdate = Math.random() < 0.1 // 10% de chance

          if (!shouldUpdate) return chat

          return {
            ...chat,
            timestamp: new Date(),
            lastMessage: `Mensagem atualizada às ${new Date().toLocaleTimeString()}`
          }
        })
      )
    }, 30000) // A cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  /**
   * Filtrar chats baseado na busca e filtro de status
   */
  const filteredChats = useMemo(() => {
    return chats.filter(chat => {
      const matchesSearch =
        chat.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || chat.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [chats, searchTerm, statusFilter])

  /**
   * Estatísticas dos chats
   */
  const chatStats = useMemo(() => {
    const total = chats.length

    const byStatus = chats.reduce(
      (acc, chat) => {
        acc[chat.status] = (acc[chat.status] || 0) + 1

        return acc
      },
      {} as Record<ChatStatus, number>
    )

    const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)
    const urgent = chats.filter(chat => chat.status === 'operator_call').length

    return { total, byStatus, totalUnread, urgent }
  }, [chats])

  /**
   * Handlers
   */
  const handleChatClick = (chat: ChatData) => {
    setSelectedChatId(chat.id)
    chatModal.openModal(chat)
  }

  const handleCloseModal = () => {
    setSelectedChatId(null)
    chatModal.closeModal()
  }

  const handleSendMessage = (message: string) => {
    if (!chatModal.selectedChat) return

    // Adicionar mensagem ao modal
    chatModal.addMessageToCurrentChat({
      content: message,
      sender: 'operator'
    })

    // Atualizar chat na lista
    setChats(currentChats =>
      currentChats.map(chat =>
        chat.id === chatModal.selectedChat?.id
          ? {
              ...chat,
              lastMessage: message,
              timestamp: new Date(),
              unreadCount: 0
            }
          : chat
      )
    )

    // Aqui você enviaria via WebSocket no futuro
    console.log('📤 Enviando mensagem via WebSocket:', {
      chatId: chatModal.selectedChat.id,
      message
    })
  }

  const handleTakeControl = () => {
    if (!chatModal.selectedChat) return

    const updatedChat = {
      ...chatModal.selectedChat,
      status: 'operator_control' as ChatStatus,
      operatorName: 'Você' // Substituir pelo nome do operador logado
    }

    // Atualizar modal
    chatModal.updateSelectedChat(updatedChat)

    // Atualizar lista
    setChats(currentChats => currentChats.map(chat => (chat.id === updatedChat.id ? updatedChat : chat)))

    // Aqui você enviaria via WebSocket no futuro
    console.log('👤 Assumindo controle via WebSocket:', updatedChat.id)
  }

  const handleReleaseControl = () => {
    if (!chatModal.selectedChat) return

    const updatedChat = {
      ...chatModal.selectedChat,
      status: 'active' as ChatStatus,
      operatorName: undefined,
      operatorId: undefined
    }

    // Atualizar modal
    chatModal.updateSelectedChat(updatedChat)

    // Atualizar lista
    setChats(currentChats => currentChats.map(chat => (chat.id === updatedChat.id ? updatedChat : chat)))

    console.log('🔓 Liberando controle via WebSocket:', updatedChat.id)
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' gutterBottom>
          Monitor de Chats em Tempo Real
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Gerencie todas as conversas do seu atendimento
        </Typography>
      </Box>

      {/* Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant='h4' color='primary'>
                {chatStats.total}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Total de Chats
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant='h4' color='error'>
                {chatStats.urgent}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Urgentes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant='h4' color='warning'>
                {chatStats.totalUnread}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Não Lidas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant='h4' color='info'>
                {chatStats.byStatus.operator_control || 0}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Sob Controle
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems='center'>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder='Buscar por nome, ID ou mensagem...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-search-line' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label='Status'
                  onChange={e => setStatusFilter(e.target.value as ChatStatus | 'all')}
                >
                  <MenuItem value='all'>Todos</MenuItem>
                  <MenuItem value='operator_call'>Chamadas Urgentes</MenuItem>
                  <MenuItem value='active'>Ativos</MenuItem>
                  <MenuItem value='operator_control'>Sob Controle</MenuItem>
                  <MenuItem value='unsolved_closed'>Não Resolvidos</MenuItem>
                  <MenuItem value='no_response'>Sem Resposta</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip label={`${filteredChats.length} chats encontrados`} color='primary' variant='outlined' />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Grid de Cards */}
      <Grid container spacing={3}>
        {filteredChats.map(chat => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={chat.id}>
            <MonitoringCard
              chat={chat}
              isSelected={selectedChatId === chat.id && chatModal.isOpen}
              onClick={handleChatClick}
            />
          </Grid>
        ))}
      </Grid>

      {/* Mensagem quando não há chats */}
      {filteredChats.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant='h6' color='text.secondary' gutterBottom>
            🔍 Nenhum chat encontrado
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Tente ajustar os filtros ou aguarde novos chats
          </Typography>
        </Box>
      )}

      {/* FAB para atualizar */}
      <Tooltip title='Atualizar chats'>
        <Fab color='primary' sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => window.location.reload()}>
          <i className='ri-refresh-line' />
        </Fab>
      </Tooltip>

      {/* Modal do Chat */}
      <ChatModal
        open={chatModal.isOpen}
        onClose={handleCloseModal}
        chatData={chatModal.selectedChat}
        isLoading={chatModal.isLoading}
        onSendMessage={handleSendMessage}
        onTakeControl={handleTakeControl}
        onReleaseControl={handleReleaseControl}
      />
    </Box>
  )
}

export default MonitoringDashboard
