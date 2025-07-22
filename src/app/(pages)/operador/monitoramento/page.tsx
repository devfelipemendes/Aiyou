// pages/monitoring/page.tsx (com dados fake para teste)
'use client'
import { useState, useCallback } from 'react'

// Imports existentes...
import Grid from '@mui/material/Grid2'
import { Box as BoxIcon, RefreshCw } from 'lucide-react'
import { Button, Typography, Paper, Box, Alert, CircularProgress } from '@mui/material'

// DnD Kit imports existentes...
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { useAppSelector } from '@/redux-store'
import { useMonitoringChatWithHistory } from '@/hooks/usersChatWithHistory'

// Imports dos componentes existentes
import CardMonitor from '@/components/card_monitormanto/CardMonitor'
import type { ChatHistoryMessage, ChatWithHistory } from '@/api/endpoints/chat/history'
import ChatMonitoringModal from '@/components/dialogs/chat'

// Tipos para os filtros (mantidos)
type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent'
type ChatStatus = 'active' | 'resolved' | 'closed' | 'pending'
type ChannelType = 'whatsapp' | 'telegram' | 'webchat' | 'email' | 'sms'

interface ChatFilters {
  orderBy: 'created_at' | 'priority' | 'last_activity'
  showClosed: boolean
  statuses: ChatStatus[]
  channels: ChannelType[]
  priorities: PriorityLevel[]
  messagesLimit: number
  cardsPerRow: number
}

// 🔧 DADOS FAKE PARA TESTE DOS CARDS

const MonitoringPage = () => {
  // 🔧 Dados fake para teste

  const { chats, filteredChats, isLoading, error, refetch } = useMonitoringChatWithHistory()

  const {
    isRefreshing // 🔄 Recarregamento (refresh manual)
  } = useMonitoringChatWithHistory()

  const user = useAppSelector((state: any) => state.authReducer?.user)

  const clients = user?.clients || []

  // Estados existentes (mantidos)
  const [filters, setFilters] = useState<ChatFilters>({
    orderBy: 'created_at',
    showClosed: false,
    statuses: [],
    channels: [],
    priorities: [],
    messagesLimit: 10,
    cardsPerRow: 4
  })

  // Hook para notificações (substituído por implementação simples)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedChatForModal, setSelectedChatForModal] = useState<ChatWithHistory | null>(null)

  const handleOpenModal = useCallback((chat: ChatWithHistory) => {
    console.log('🔄 Abrindo modal para chat:', chat.protocol)
    setSelectedChatForModal(chat)
    setModalOpen(true)
  }, [])

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedChatForModal(null)
  }

  const handleCardClick = useCallback((clientId: string) => {
    setSelectedCardId(clientId)
  }, [])

  const handleCardHover = useCallback((clientId: string, isHovered: boolean) => {
    // Apenas log para debug, sem alterar filtros
    console.log('Card hover:', clientId, isHovered)
  }, [])

  const isCardSelected = useCallback(
    (clientId: string) => {
      return selectedCardId === clientId
    },
    [selectedCardId]
  )

  // Sensores DnD (mantidos)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // 🔧 Filtros aplicados aos protocolos fake

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    console.log('Drag end:', event)
  }, [])

  const handleFilterChange = useCallback((key: keyof ChatFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleRefreshData = useCallback(() => {
    refetch() // Esta função vem do hook e recarrega dados reais!
  }, [refetch])

  const getGridSize = useCallback(() => {
    const sizeMap = {
      6: { md: 2, xl: 2, sm: 4 },
      4: { md: 3, xl: 3, sm: 6 },
      3: { md: 4, xl: 4, sm: 6 },
      2: { md: 6, xl: 6, sm: 12 },
      1: { md: 12, xl: 12, sm: 12 }
    }

    return sizeMap[filters.cardsPerRow as keyof typeof sizeMap] || sizeMap[4]
  }, [filters.cardsPerRow])

  if (isLoading && chats.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando chats e históricos...</Typography>
      </Box>
    )
  }

  // 🚨 TRATAMENTO DE ERRO
  if (error && chats.length === 0) {
    return (
      <Alert severity='error' sx={{ mt: 2 }}>
        <Typography variant='h6'>Erro ao carregar dados</Typography>
        <Typography>{error}</Typography>
        <Button onClick={refetch} sx={{ mt: 1 }}>
          Tentar novamente
        </Button>
      </Alert>
    )
  }

  console.log('🔍 DEBUG - Dados dos chats:')
  chats.forEach((chat, index) => {
    console.log(`Chat ${index}:`, {
      protocol: chat.protocol,
      historyLength: chat.history?.length || 0,
      firstMessage: chat.history?.[0]?.content || 'Sem mensagens',
      lastMessage: chat.history?.[chat.history.length - 1]?.content || 'Sem mensagens'
    })
  })

  return (
    <>
      {false && (
        <Alert severity='info' sx={{ mb: 2 }}>
          <Box display='flex' alignItems='center' gap={1}>
            <CircularProgress size={16} />
            <Typography variant='body2'>
              Inicializando conexões WebSocket para {clients.length} cliente(s)...
            </Typography>
          </Box>
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BoxIcon size={24} />
              <div>
                <Typography variant='h5' component='h1'>
                  Monitoramento de Interações
                </Typography>
                {/* <Typography variant='body2' color='text.secondary'>
                  {filteredProtocols.length} de {fakeProtocols.length} conversas
                  <span> • Modo de Teste</span>
                </Typography> */}
                {isRefreshing && (
                  <Alert severity='info' sx={{ mb: 2 }}>
                    <Box display='flex' alignItems='center' gap={1}>
                      <CircularProgress size={16} />
                      <Typography variant='body2'>Atualizando dados automaticamente...</Typography>
                    </Box>
                  </Alert>
                )}
              </div>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
              {/* Botão de refresh */}
              <Button
                variant='outlined'
                size='small'
                startIcon={<RefreshCw size={16} />}
                onClick={handleRefreshData}
                disabled={isLoading || isRefreshing} // ✅ Estados reais
              >
                {isLoading ? 'Carregando...' : isRefreshing ? 'Atualizando...' : 'Atualizar'}
              </Button>

              {/* Filtros */}
              <Button
                variant={filters.orderBy === 'created_at' ? 'contained' : 'outlined'}
                size='small'
                startIcon={<i className='ri-filter-2-line' />}
                onClick={() =>
                  handleFilterChange('orderBy', filters.orderBy === 'created_at' ? 'priority' : 'created_at')
                }
              >
                {filters.orderBy === 'created_at' ? 'Por Data' : 'Por Prioridade'}
              </Button>

              <Button
                variant={filters.showClosed ? 'contained' : 'outlined'}
                size='small'
                onClick={() => handleFilterChange('showClosed', !filters.showClosed)}
              >
                {filters.showClosed ? 'Ocultar Fechados' : 'Mostrar Fechados'}
              </Button>

              <Button
                variant='outlined'
                size='small'
                onClick={() => handleFilterChange('cardsPerRow', filters.cardsPerRow === 4 ? 3 : 4)}
              >
                {filters.cardsPerRow === 4 ? '3 por linha' : '4 por linha'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={filteredChats.map(chat => chat.protocol)} // ⬅️ Array dos IDs
          strategy={verticalListSortingStrategy} // ⬅️ Estratégia de ordenação
        >
          <Grid container spacing={3}>
            {filteredChats.map(chat => (
              <Grid size={getGridSize()} key={chat.protocol}>
                <DraggableCard
                  clientId={chat.protocol}
                  channel={chat.source}
                  messages={chat.history}
                  operatorName={chat.assistant?.name || 'Assistent'}
                  buttonName={`Chat ${chat.protocol}`}
                  client={chat}
                  notificationType={() => {}}
                  isSelected={isCardSelected(chat.protocol)}
                  onCardClick={handleCardClick}
                  onCardHover={handleCardHover}
                  onOpenModalCard={() => handleOpenModal(chat)} // ✅ Arrow function "binda" o chat
                />
              </Grid>
            ))}
          </Grid>
        </SortableContext>
      </DndContext>
      <ChatMonitoringModal open={modalOpen} onClose={handleCloseModal} chatData={selectedChatForModal} />
    </>
  )
}

// 🔧 Componente DraggableCard para os protocolos
interface DraggableCardProps {
  clientId: string
  channel: string
  messages: ChatHistoryMessage[] // Array de mensagens reais
  operatorName?: string
  buttonName: string
  client: ChatWithHistory // ✅ Tipo correto
  notificationType: any
  onOpenModalCard: () => void // ✅ MUDANÇA: função sem parâmetros
  isSelected: boolean
  onCardClick: (clientId: string) => void
  onCardHover: (clientId: string, isHovered: boolean) => void
}

// 2️⃣ CORRIGIR O DRAGGABLECARD:
const DraggableCard = ({
  clientId,
  client,
  onOpenModalCard, // ← Recebe função já "bindada" com o chat correto
  isSelected
}: DraggableCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isCurrentlyDragging
  } = useSortable({ id: clientId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isCurrentlyDragging ? 0.5 : 1,
    cursor: isCurrentlyDragging ? 'grabbing' : 'grab'
  }

  // 🔥 FUNÇÃO SIMPLES: Apenas chama onOpenModalCard quando clicado
  const handleChatSelect = useCallback(() => {
    console.log('🔄 Card clicado! Abrindo modal para:', client.protocol)
    onOpenModalCard() // ← Chama função que já tem o chat "bindado"
  }, [onOpenModalCard, client.protocol])

  return (
    <div ref={setNodeRef} style={style}>
      <CardMonitor
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isCurrentlyDragging}
        chatData={client}
        onChatSelect={handleChatSelect} // ← Função simples
        isSelected={isSelected}
      />
    </div>
  )
}

export default MonitoringPage
