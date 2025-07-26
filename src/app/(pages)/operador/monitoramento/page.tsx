// app/(pages)/operador/monitoramento/page.tsx - INTEGRAÇÃO NOVA
'use client'
import { useState, useCallback, useMemo } from 'react'

import { Box as BoxIcon, RefreshCw } from 'lucide-react'
import { Button, Typography, Paper, Box, Alert, CircularProgress, Chip } from '@mui/material'

import Grid from '@mui/material/Grid2'

// DnD Kit imports (mantidos)
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

// 🔥 NOVO: Usar nosso hook integrado
// import { useMonitoringDataWithRefresh } from '@/hooks/useMonitoringData'

import CardMonitor from '@/components/card_monitormanto/CardMonitor'
import { useMockMonitoringData } from '@/hooks/useMockMonitoringData'
import ChatMonitoringModal from '@/components/dialogs/chat'

// Tipos (mantidos)
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

// 🔥 FUNÇÃO PARA CONVERTER DADOS PRO FORMATO DO CARDMONITOR
const formatChatForCardMonitor = (chat: any, history: any) => {
  return {
    protocol: chat.protocol,
    assistant: chat.assistant,
    source: chat.source,
    identifier: chat.identifier,
    status: chat.status || 'active',
    created_at: chat.created_at,
    updated_at: chat.updated_at,

    // Dados do histórico
    history: history?.history || [],
    historyLoading: false,
    historyError: null,
    messageCount: history?.history?.length || 0,
    lastMessage: history?.history?.[history.history.length - 1] || null,

    // Campos extras
    assistant_name: history?.assistant_name || chat.assistant?.name || 'Sistema',
    operator_name: history?.operator_name || null
  }
}

const MonitoringPage = () => {
  // 🔥 NOVO: Usar nosso hook integrado
  const {
    activeChats,
    clientHistories,
    isFullyLoaded,
    hasErrors,
    activeChatsError,
    historiesError,
    historiesStats,
    refetchAll,
    getHistoryByProtocol,
    getHistoriesByClient,
    isRefreshing
  } = useMockMonitoringData()

  const user = useAppSelector((state: any) => state.authReducer?.user)

  // Estados (mantidos)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedChatForDialog, setSelectedChatForDialog] = useState<any>(null)

  const [filters, setFilters] = useState<ChatFilters>({
    orderBy: 'created_at',
    showClosed: false,
    statuses: [],
    channels: [],
    priorities: [],
    messagesLimit: 10,
    cardsPerRow: 4
  })

  // 🔥 NOVO: Combinar chats ativos com seus históricos
  const enrichedChats = useMemo(() => {
    console.log('🔄 Enriquecendo chats com históricos...')

    const result = activeChats.map(chat => {
      const history = getHistoryByProtocol(chat.protocol)
      const enriched = formatChatForCardMonitor(chat, history)

      console.log(`✅ Chat ${chat.protocol} enriquecido:`, {
        protocol: enriched.protocol,
        source: enriched.source,
        messages: enriched.messageCount,
        hasError: !!enriched.historyError
      })

      return enriched
    })

    console.log(`📊 Total de ${result.length} chats enriquecidos`)

    return result
  }, [activeChats, getHistoryByProtocol])

  // Callbacks (mantidos)
  const handleCardClick = useCallback((clientId: string) => {
    setSelectedCardId(clientId)
  }, [])

  const handleCardDoubleClick = useCallback(
    (protocol: string) => {
      console.log('🖱️ Card duplo clique:', protocol)
      const chat = enrichedChats.find(c => c.protocol === protocol)

      if (chat) {
        setSelectedChatForDialog(chat)
        setDialogOpen(true)
        console.log('📱 Abrindo dialog para:', protocol)
      }
    },
    [enrichedChats]
  )

  const handleCloseDialog = useCallback(() => {
    console.log('❌ Fechando dialog')
    setDialogOpen(false)
    setSelectedChatForDialog(null)
  }, [])

  const handleCardHover = useCallback((clientId: string, isHovered: boolean) => {
    console.log('Card hover:', clientId, isHovered)
  }, [])

  const isCardSelected = useCallback((clientId: string) => selectedCardId === clientId, [selectedCardId])

  // DnD (mantido)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    console.log('Drag end:', event)
  }, [])

  const handleFilterChange = useCallback((key: keyof ChatFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  // 🔥 USAR REFETCH DO MOCK
  const handleRefreshDataMock = useCallback(() => {
    console.log('🔄 Iniciando refresh manual...')
    refetchAll()
  }, [refetchAll])

  // 🔥 NOVO: Usar refetchAll do hook
  const handleRefreshData = useCallback(() => {
    refetchAll()
  }, [refetchAll])

  // DraggableCard (adaptado)
  const DraggableCard = ({ clientId, client }: { clientId: string; client: any }) => {
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

    return (
      <div ref={setNodeRef} style={style}>
        <CardMonitor
          dragListeners={listeners}
          dragAttributes={attributes}
          isDragging={isCurrentlyDragging}
          chatData={client} // 🔥 NOVO: Dados enriquecidos com histórico
          onChatSelect={handleCardClick}
          isSelected={isCardSelected(clientId)}
        />
      </div>
    )
  }

  // 🔥 ESTADOS DE LOADING E ERROR
  if (!isFullyLoaded) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
        <Typography variant='h6' sx={{ ml: 2 }}>
          Carregando chats e históricos...
        </Typography>
      </Box>
    )
  }

  if (hasErrors) {
    return (
      <Box p={3}>
        <Alert severity='error' sx={{ mb: 2 }}>
          <Typography variant='h6'>Erro ao carregar dados</Typography>
          {activeChatsError && <Typography>Chats: {activeChatsError}</Typography>}
          {historiesError && <Typography>Históricos: {historiesError}</Typography>}
        </Alert>
        <Button variant='contained' onClick={handleRefreshDataMock} startIcon={<RefreshCw />}>
          Tentar novamente
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header com estatísticas */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h5'>Monitoramento de Chats ({enrichedChats.length})</Typography>
          <Button variant='outlined' onClick={handleRefreshDataMock} startIcon={<RefreshCw />}>
            Atualizar
          </Button>
        </Box>

        <Box display='flex' gap={2} mt={2}>
          <Chip label={`${enrichedChats.filter(c => c.status === 'active').length} Ativos`} color='primary' />
          <Chip label={`${enrichedChats.reduce((sum, c) => sum + c.messageCount, 0)} Mensagens`} color='secondary' />
        </Box>
      </Paper>

      {/* Grid com Cards */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={enrichedChats.map(c => c.protocol)} strategy={verticalListSortingStrategy}>
          <Grid container spacing={3}>
            {enrichedChats.map(chat => (
              <Grid key={chat.protocol} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <DraggableCard clientId={chat.protocol} client={chat} />
              </Grid>
            ))}
          </Grid>
        </SortableContext>
      </DndContext>

      {/* Mensagem quando não há chats */}
      {enrichedChats.length === 0 && (
        <Box display='flex' flexDirection='column' alignItems='center' py={8}>
          <BoxIcon size={64} color='#ccc' />
          <Typography variant='h6' color='text.secondary' mt={2}>
            Nenhum chat ativo encontrado
          </Typography>
          <Button variant='outlined' onClick={handleRefreshData} sx={{ mt: 2 }}>
            Atualizar dados
          </Button>
        </Box>
      )}

      {/* 🔥 DIALOG PARA CHAT DETALHADO */}
      {dialogOpen && selectedChatForDialog && (
        <ChatMonitoringModal
          open={dialogOpen}
          onClose={handleCloseDialog}
          chatData={selectedChatForDialog}
          clientHistories={getHistoriesByClient(selectedChatForDialog.identifier)}
        />
      )}
    </Box>
  )
}

export default MonitoringPage
