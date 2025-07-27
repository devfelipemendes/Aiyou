// app/(pages)/operador/monitoramento/page.tsx - IMPLEMENTAÇÃO COMPLETA OTIMIZADA
'use client'
import { useState, useCallback, useMemo, useEffect, memo } from 'react'

import { Box as BoxIcon, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Button, Typography, Paper, Box, Alert, CircularProgress, Chip } from '@mui/material'

import Grid from '@mui/material/Grid2'

// DnD Kit imports
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

// import { useAppSelector } from '@/redux-store'

// 🔥 HOOK OTIMIZADO
import { useMonitoringChatWithWebSocket } from '@/hooks/useMonitoringWithWebSocket'

// 🔥 COMPONENTES OTIMIZADOS
import CardMonitor from '@/components/card_monitormanto/CardMonitor' // Agora é o otimizado
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

const MonitoringPageOptimized = () => {
  // 🔥 HOOK PRINCIPAL
  const {
    chats, // 📋 Dados já enriquecidos e atualizados pelo WebSocket
    stats,
    isLoading,
    isRefreshing,
    error,
    refetch,
    refreshSpecificChat,
    selectChat,
    updateChatOrder,
    isWebSocketConnected,
    connectedChannels
  } = useMonitoringChatWithWebSocket()

  // const user = useAppSelector((state: any) => state.authReducer?.user)

  // 🎯 ESTADOS LOCAIS
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProtocolForDialog, setSelectedProtocolForDialog] = useState<string | null>(null)

  const [filters, setFilters] = useState<ChatFilters>({
    orderBy: 'created_at',
    showClosed: false,
    statuses: [],
    channels: [],
    priorities: [],
    messagesLimit: 10,
    cardsPerRow: 4
  })

  // 🔥 CHAT SINCRONIZADO PARA MODAL (tempo real)
  const selectedChatForDialog = useMemo(() => {
    if (!selectedProtocolForDialog) return null

    const chat = chats.find(c => c.protocol === selectedProtocolForDialog)

    if (!chat) {
      console.warn('⚠️ Chat não encontrado para protocolo:', selectedProtocolForDialog)

      return null
    }

    console.log(`🔄 Chat ${selectedProtocolForDialog} sincronizado:`, {
      messageCount: chat.messageCount,
      lastUpdate: chat.updated_at,
      hasHistory: chat.history.length > 0
    })

    return chat
  }, [chats, selectedProtocolForDialog])

  // 🎛️ CALLBACKS ESTÁVEIS (performance critical)
  const handleCardClick = useCallback(
    (protocol: string) => {
      setSelectedCardId(protocol)
      selectChat(protocol)
    },
    [selectChat]
  )

  const handleCardDoubleClick = useCallback(
    (protocol: string) => {
      console.log('🖱️ Abrindo modal para protocolo:', protocol)
      setSelectedProtocolForDialog(protocol)
      setDialogOpen(true)
      setSelectedCardId(protocol)
      selectChat(protocol)
    },
    [selectChat]
  )

  const handleCloseDialog = useCallback(() => {
    console.log('❌ Fechando modal')
    setDialogOpen(false)
    setTimeout(() => {
      setSelectedProtocolForDialog(null)
    }, 300)
  }, [])

  const handleRefreshSpecificChat = useCallback(
    async (protocol: string) => {
      try {
        console.log(`🔄 Refresh específico: ${protocol}`)
        await refreshSpecificChat(protocol)
      } catch (error) {
        console.error('💥 Erro no refresh específico:', error)
      }
    },
    [refreshSpecificChat]
  )

  // 🔄 CALLBACKS DE DRAG & DROP
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const oldIndex = chats.findIndex(chat => chat.protocol === active.id)
        const newIndex = chats.findIndex(chat => chat.protocol === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          console.log(`🔄 Movendo chat: ${oldIndex} → ${newIndex}`)
          updateChatOrder(oldIndex, newIndex)
        }
      }
    },
    [chats, updateChatOrder]
  )

  // 🔄 CALLBACKS DE FILTROS
  const handleFilterChange = useCallback((key: keyof ChatFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleRefreshData = useCallback(() => {
    console.log('🔄 Refresh manual iniciado')
    refetch()
  }, [refetch])

  // 🔧 FUNÇÕES HELPER MEMOIZADAS
  const isCardSelected = useCallback(
    (protocol: string) => {
      return selectedCardId === protocol
    },
    [selectedCardId]
  )

  const isCardInModal = useCallback(
    (protocol: string) => {
      return selectedProtocolForDialog === protocol
    },
    [selectedProtocolForDialog]
  )

  const getGridSize = useCallback(() => {
    switch (filters.cardsPerRow) {
      case 3:
        return { xs: 12, sm: 6, md: 4 }
      case 4:
        return { xs: 12, sm: 6, md: 4, lg: 3 }
      default:
        return { xs: 12, sm: 6, md: 4, lg: 3 }
    }
  }, [filters.cardsPerRow])

  // 🎨 COMPONENTE: Card Draggable OTIMIZADO (separado para evitar problemas com hooks)
  const DraggableCardOptimized = memo(({ clientId, client }: { clientId: string; client: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging: isCurrentlyDragging
    } = useSortable({ id: clientId })

    const dragProps = useMemo(
      () => ({
        dragListeners: listeners,
        dragAttributes: attributes
      }),
      [listeners, attributes]
    )

    const style = useMemo(
      () => ({
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isCurrentlyDragging ? 0.5 : 1,
        cursor: isCurrentlyDragging ? 'grabbing' : 'grab'
      }),
      [transform, transition, isCurrentlyDragging]
    )

    // 🔥 QUEBRAR PROPS AQUI!
    const cardProps = useMemo(
      () => ({
        protocol: client.protocol,
        identifier: client.identifier,
        status: client.status,
        source: client.source,
        messageCount: client.messageCount || 0,
        lastMessage: client.lastMessage,
        history: client.history || [],
        assistant: client.assistant,
        created_at: client.created_at,
        updated_at: client.updated_at,
        historyError: client.historyError,
        historyLoading: client.historyLoading
      }),
      [
        client.protocol,
        client.identifier,
        client.status,
        client.source,
        client.messageCount,
        client.lastMessage,
        client.history,
        client.assistant,
        client.created_at,
        client.updated_at,
        client.historyError,
        client.historyLoading
      ]
    )

    return (
      <div ref={setNodeRef} style={style}>
        <CardMonitor
          chatData={cardProps}
          dragListeners={dragProps.dragListeners} // ← ESTÁVEL
          dragAttributes={dragProps.dragAttributes} // ← ESTÁVEL
          isDragging={isCurrentlyDragging}
          onChatSelect={handleCardClick}
          onChatDoubleClick={handleCardDoubleClick}
          isSelected={isCardSelected(clientId)}
          isWebSocketConnected={isWebSocketConnected}
          isInModal={isCardInModal(clientId)}
        />
      </div>
    )
  })

  // 🔧 DnD SENSORS
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // 🔄 VERIFICAR SE CHAT AINDA EXISTE QUANDO MODAL ESTÁ ABERTO
  useEffect(() => {
    if (dialogOpen && selectedProtocolForDialog && !selectedChatForDialog) {
      console.warn('⚠️ Chat removido enquanto modal estava aberto, fechando...')
      handleCloseDialog()
    }
  }, [dialogOpen, selectedProtocolForDialog, selectedChatForDialog, handleCloseDialog])

  // 🚨 ESTADOS DE LOADING E ERROR
  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
        <Typography variant='h6' sx={{ ml: 2 }}>
          Carregando chats e históricos...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity='error' sx={{ mb: 2 }}>
          <Typography variant='h6'>Erro ao carregar dados</Typography>
          <Typography>{error}</Typography>
        </Alert>
        <Button variant='contained' onClick={handleRefreshData} startIcon={<RefreshCw />}>
          Tentar novamente
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* 🔥 HEADER OTIMIZADO COM STATUS WEBSOCKET */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box display='flex' flexDirection='column' gap={1}>
              <Typography variant='h5'>Monitoramento de Chats ({stats.total})</Typography>

              {/* 📊 ESTATÍSTICAS EM TEMPO REAL */}
              <Box display='flex' gap={1} flexWrap='wrap'>
                <Chip label={`${stats.total} Total`} color='primary' size='small' />
                <Chip label={`${stats.totalMessages} Mensagens`} color='secondary' size='small' />
                <Chip label={`${stats.successCount} Sucesso`} color='success' size='small' />
                {stats.errorCount > 0 && <Chip label={`${stats.errorCount} Erros`} color='error' size='small' />}
              </Box>

              {/* 🔌 STATUS WEBSOCKET */}
              <Box display='flex' alignItems='center' gap={1}>
                {isWebSocketConnected ? (
                  <Chip
                    icon={<Wifi size={16} />}
                    label={`WebSocket Ativo (${connectedChannels.length} canais)`}
                    color='success'
                    size='small'
                  />
                ) : (
                  <Chip icon={<WifiOff size={16} />} label='WebSocket Desconectado' color='error' size='small' />
                )}
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box display='flex' gap={1} justifyContent='flex-end' flexWrap='wrap'>
              {/* 🔄 BOTÃO REFRESH */}
              <Button
                variant='outlined'
                onClick={handleRefreshData}
                startIcon={<RefreshCw />}
                disabled={isRefreshing}
                size='small'
              >
                {isRefreshing ? 'Atualizando...' : 'Atualizar'}
              </Button>

              {/* 🔧 FILTROS */}
              <Button
                variant={filters.orderBy === 'created_at' ? 'contained' : 'outlined'}
                size='small'
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

      {/* 🔥 GRID OTIMIZADO COM CARDS */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={chats.map(chat => chat.protocol)} strategy={verticalListSortingStrategy}>
          <Grid container spacing={3}>
            {chats.map(chat => (
              <Grid size={getGridSize()} key={chat.protocol}>
                <DraggableCardOptimized clientId={chat.protocol} client={chat} />
              </Grid>
            ))}
          </Grid>
        </SortableContext>
      </DndContext>

      {/* 🔥 MENSAGEM QUANDO NÃO HÁ CHATS */}
      {chats.length === 0 && !isLoading && (
        <Box display='flex' flexDirection='column' alignItems='center' py={8}>
          <BoxIcon size={64} color='#ccc' />
          <Typography variant='h6' color='text.secondary' mt={2}>
            Nenhum chat ativo encontrado
          </Typography>
          <Typography variant='body2' color='text.secondary' mt={1}>
            {isWebSocketConnected ? 'Aguardando novos chats...' : 'Conectando ao WebSocket...'}
          </Typography>
          <Button variant='outlined' onClick={handleRefreshData} sx={{ mt: 2 }}>
            Atualizar dados
          </Button>
        </Box>
      )}

      {/* 🔥 MODAL EM TEMPO REAL */}
      {dialogOpen && selectedChatForDialog && (
        <ChatMonitoringModal
          open={dialogOpen}
          onClose={handleCloseDialog}
          chatData={selectedChatForDialog} // 🔥 Dados em tempo real
          // 🔧 Removidos props que ainda não existem no modal:
          // protocol={selectedProtocolForDialog!}
          // isWebSocketConnected={isWebSocketConnected}
          // connectedChannels={connectedChannels}
          // onRefreshChat={() => handleRefreshSpecificChat(selectedProtocolForDialog!)}
          // onSendMessage={(content: string) => {
          //   console.log('📤 Enviando mensagem:', content)
          // }}
          // onDataChange={(updatedChat) => {
          //   console.log('🔄 Dados do modal atualizados:', updatedChat)
          // }}
        />
      )}

      {/* 🔥 DEBUG INFO (desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <Paper elevation={1} sx={{ p: 2, mt: 3, backgroundColor: '#f5f5f5' }}>
          <Typography variant='h6' gutterBottom>
            🚀 Performance Debug
          </Typography>
          <Typography variant='body2'>
            <strong>Chats:</strong> {chats.length} |<strong> WebSocket:</strong>{' '}
            {isWebSocketConnected ? '✅ Conectado' : '❌ Desconectado'} |<strong> Canais:</strong>{' '}
            {connectedChannels.length} |<strong> Média msgs/chat:</strong> {stats.averageMessagesPerChat}
          </Typography>
          {stats.mostActiveChat && (
            <Typography variant='body2'>
              <strong>Chat mais ativo:</strong> {stats.mostActiveChat.protocol}({stats.mostActiveChat.messageCount}{' '}
              mensagens)
            </Typography>
          )}
          <Typography variant='caption' color='text.secondary' display='block' mt={1}>
            💡 Abra o console para ver logs de re-renders evitados
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

export default MonitoringPageOptimized
