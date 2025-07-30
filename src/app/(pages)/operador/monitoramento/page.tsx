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
import CardMonitorOptimized from '@/components/card_monitormanto/CardMonitor' // Agora é o otimizado
import ChatMonitoringModal from '@/components/dialogs/chat'

import { useAppSelector } from '@/redux-store'
import { selectChatOrder } from '@/redux-store/slices/monitoring'
import { useGetAllHistoryByProtocolQuery } from '@/api/endpoints/chat/protocolHistory'

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

    selectChat,
    updateChatOrder,
    isWebSocketConnected,
    connectedChannels
  } = useMonitoringChatWithWebSocket()

  const chatProtocols = useAppSelector(selectChatOrder)

  // const user = useAppSelector((state: any) => state.authReducer?.user)

  const { data: protocolHistoryData, isLoading: isLoadingProtocolData } = useGetAllHistoryByProtocolQuery()

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

  const modalData = useMemo(() => {
    if (!selectedChatForDialog || !protocolHistoryData?.protocolsMap) return null

    // Converter protocolsMap para formato que o modal espera
    const clientHistories: Record<string, any> = {}

    Object.entries(protocolHistoryData.protocolsMap).forEach(([protocol, protocolData]) => {
      clientHistories[protocol] = {
        identifier: protocolData.identifier,
        source: protocolData.source,
        assistant_name: protocolData.assistant_name,
        operator_name: protocolData.operator_name,
        history: protocolData.history
      }
    })

    return {
      chatData: selectedChatForDialog,
      clientHistories
    }
  }, [selectedChatForDialog, protocolHistoryData])

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

  // 🔄 CALLBACKS DE DRAG & DROP
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        // ✅ USAR chatProtocols ao invés de chats
        const oldIndex = chatProtocols.findIndex((protocol: any) => protocol === active.id)
        const newIndex = chatProtocols.findIndex((protocol: any) => protocol === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          console.log(`🔄 Movendo chat: ${oldIndex} → ${newIndex}`)
          updateChatOrder(oldIndex, newIndex)
        }
      }
    },
    [chatProtocols, updateChatOrder] // ← chatProtocols, não chats
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
  // ✅ OTIMIZAÇÃO: Separar drag props dos dados
  const DraggableCardOptimized = memo(({ protocol }: { protocol: string }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging: isCurrentlyDragging
    } = useSortable({ id: protocol })

    // 🔥 PROPS ESTÁVEIS (não dependem de drag)
    const stableProps = useMemo(
      () => ({
        protocol,
        onChatSelect: handleCardClick,
        onChatDoubleClick: handleCardDoubleClick,
        isSelected: isCardSelected(protocol),
        isWebSocketConnected,
        isInModal: isCardInModal(protocol)
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [protocol, isWebSocketConnected] // ← Só dependências estáveis
    )

    // 🔥 PROPS INSTÁVEIS (apenas drag)
    const dragProps = {
      dragListeners: listeners,
      dragAttributes: attributes,
      isDragging: isCurrentlyDragging
    }

    const style = useMemo(
      () => ({
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isCurrentlyDragging ? 0.5 : 1
      }),
      [transform, transition, isCurrentlyDragging]
    )

    return (
      <div ref={setNodeRef} style={style}>
        <CardMonitorOptimized {...stableProps} {...dragProps} />
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
        <SortableContext items={chatProtocols} strategy={verticalListSortingStrategy}>
          <Grid container spacing={3}>
            {chatProtocols.map((protocol: any) => (
              <Grid size={getGridSize()} key={protocol}>
                <DraggableCardOptimized protocol={protocol} /> {/* ← SÓ PROTOCOL */}
              </Grid>
            ))}
          </Grid>
        </SortableContext>
      </DndContext>

      {/* 🔥 MENSAGEM QUANDO NÃO HÁ CHATS */}
      {chatProtocols.length === 0 &&
        !isLoading && ( // ← chatProtocols, não chats
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

      {/* 🆕 MODAL COM DADOS DE PROTOCOLO */}
      {dialogOpen && modalData && (
        <ChatMonitoringModal
          open={dialogOpen}
          onClose={handleCloseDialog}
          chatData={modalData.chatData}
          clientHistories={modalData.clientHistories} // 🔥 Dados formatados para o sidebar
        />
      )}

      {/* 🔥 DEBUG INFO (desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <Paper elevation={1} sx={{ p: 2, mt: 3, backgroundColor: '#f5f5f5' }}>
          <Typography variant='h6' gutterBottom>
            🚀 Performance Debug - Dados de Protocolo
          </Typography>
          <Typography variant='body2'>
            <strong>Chats Convertidos:</strong> {chats.length} |<strong>Protocolos Brutos:</strong>{' '}
            {protocolHistoryData?.stats.totalProtocols || 0} |<strong>WebSocket:</strong>{' '}
            {isWebSocketConnected ? '✅ Conectado' : '❌ Desconectado'} |<strong>Canais:</strong>{' '}
            {connectedChannels.length}
          </Typography>
          <Typography variant='body2' mt={1}>
            <strong>Mensagens:</strong> {stats.totalMessages} |<strong>Sucessos:</strong> {stats.successCount} |
            <strong>Erros:</strong> {stats.errorCount}
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

export default MonitoringPageOptimized
