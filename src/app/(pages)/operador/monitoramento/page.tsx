// pages/monitoring/page.tsx (atualização da página principal)
'use client'
import { useState, useMemo, useCallback } from 'react'

// Imports existentes...
import Grid from '@mui/material/Grid2'
import { Box as BoxIcon, Clock, XCircle, Bell, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button, Chip, Typography, Paper, Box, Alert, Card, CardContent, CircularProgress } from '@mui/material'

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
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import WebSocketDebugger from '@/components/WebSocketDebugger'
import { useMonitoringData } from '@/hooks/useMonitoringData'
import { useClientWebSocketManager } from '@/hooks/useWebsocketmanager'
import { useAppSelector } from '@/redux-store'

// Imports dos componentes existentes
import CardMonitor from '@/components/card_monitormanto/CardMonitor'
import ChatViewDialog from '@/components/dialogs/chat-view'
import { useCardNotifications } from '@/hooks/useCardNotifications'

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

const MonitoringPage = () => {
  // 🔧 Obter dados dos clients do login
  const user = useAppSelector((state: any) => state.authReducer?.user)
  const clients = user?.clients || []

  // 🔧 WebSocket Manager
  const { isInitialized, activeChannels, protocolChannels, totalChannels, refetchClientData } =
    useClientWebSocketManager({
      clients,
      enabled: clients.length > 0
    })

  // 🔧 Dados de monitoramento
  const { stats, loading, enrichedProtocols, urgentCount, unreadCount, activeCount } = useMonitoringData()

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

  const [showComponentWarning, setShowComponentWarning] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProtocolData, setSelectedProtocolData] = useState<any>(null)

  // Hook para notificações (mantido)
  const { handleCardClick, handleCardHover, isCardSelected, getNotificationType } = useCardNotifications()

  // Sensores DnD (mantidos)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // 🔧 Filtros aplicados aos protocolos reais
  const filteredProtocols = useMemo(() => {
    let filtered = [...enrichedProtocols]

    // Filtro por status
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(protocol => filters.statuses.includes(protocol.status))
    }

    // Filtro por canal
    if (filters.channels.length > 0) {
      filtered = filtered.filter(protocol => filters.channels.includes(protocol.channel))
    }

    // Filtro por prioridade
    if (filters.priorities.length > 0) {
      filtered = filtered.filter(protocol => filters.priorities.includes(protocol.priority))
    }

    // Filtro de protocolos fechados
    if (!filters.showClosed) {
      filtered = filtered.filter(protocol => !['closed', 'resolved'].includes(protocol.status))
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (filters.orderBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 }

          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'last_activity':
          return (
            new Date(b.last_activity || b.updated_at).getTime() - new Date(a.last_activity || a.updated_at).getTime()
          )
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return filtered
  }, [enrichedProtocols, filters])

  // 🔧 Contadores de notificação baseados nos dados reais
  const notificationCounts = useMemo(() => {
    return {
      operator_call: urgentCount,
      unresolved: filteredProtocols.filter(p => p.status === 'pending').length,
      no_response: unreadCount,
      operator_control: filteredProtocols.filter(p => p.operator_name && p.status === 'active').length
    }
  }, [filteredProtocols, urgentCount, unreadCount])

  // Funções existentes (mantidas com adaptações mínimas)
  const handleOpenModalCard = useCallback(
    (protocolId: string) => {
      const protocolData = enrichedProtocols.find(p => p.id === protocolId)

      if (protocolData) {
        setSelectedProtocolData(protocolData)
        setIsDialogOpen(true)
      }
    },
    [enrichedProtocols]
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    // Implementar reordenação se necessário
    console.log('Drag end:', event)
  }, [])

  const handleFilterChange = useCallback((key: keyof ChatFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

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

  // 🔧 Função para recarregar dados
  const handleRefreshData = useCallback(async () => {
    for (const client of clients) {
      await refetchClientData(client.id)
    }
  }, [clients, refetchClientData])

  return (
    <>
      {/* 🔧 Debugger WebSocket */}
      <WebSocketDebugger isConnected={isInitialized} activeChannels={[...activeChannels, ...protocolChannels]} />

      {/* 🔧 Status de Inicialização */}
      {!isInitialized && clients.length > 0 && (
        <Alert severity='info' sx={{ mb: 2 }}>
          <Box display='flex' alignItems='center' gap={1}>
            <CircularProgress size={16} />
            <Typography variant='body2'>
              Inicializando conexões WebSocket para {clients.length} cliente(s)...
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Cards de Estatísticas - Dados Reais */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant='h4' color='primary'>
                {stats.total}
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
                {urgentCount}
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
                {unreadCount}
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
                {activeCount}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Ativos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Header com informações de conexão */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BoxIcon size={24} />
              <div>
                <Typography variant='h5' component='h1'>
                  Monitoramento de Interações
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {filteredProtocols.length} de {enrichedProtocols.length} conversas
                  {isInitialized && <span> • {totalChannels} canais WebSocket ativos</span>}
                </Typography>
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
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Atualizar'}
              </Button>

              {/* Restante dos filtros existentes... */}
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

              {/* Outros controles de filtro mantidos... */}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Alertas de notificação baseados em dados reais */}
      {showComponentWarning &&
        (notificationCounts.operator_call > 0 ||
          notificationCounts.unresolved > 0 ||
          notificationCounts.no_response > 0) && (
          <Alert severity='warning' sx={{ mb: 2 }} icon={<AlertTriangle size={20} />}>
            <Box display='flex' gap={1} alignItems='center' flexWrap='wrap'>
              <Typography variant='body2' fontWeight={500}>
                Atenção necessária:
              </Typography>

              {notificationCounts.operator_call > 0 && (
                <Chip
                  icon={<Bell size={14} />}
                  label={`${notificationCounts.operator_call} Urgentes`}
                  color='error'
                  size='small'
                />
              )}

              {notificationCounts.unresolved > 0 && (
                <Chip
                  icon={<XCircle size={14} />}
                  label={`${notificationCounts.unresolved} Pendentes`}
                  color='warning'
                  size='small'
                />
              )}

              {notificationCounts.no_response > 0 && (
                <Chip
                  icon={<Clock size={14} />}
                  label={`${notificationCounts.no_response} Não Lidas`}
                  color='info'
                  size='small'
                />
              )}
            </Box>
          </Alert>
        )}

      {/* Grid de Cards com dados reais */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredProtocols.map(p => p.id)} strategy={rectSortingStrategy}>
          <Grid container spacing={3}>
            {filteredProtocols.map((protocol, index) => (
              <Grid key={index} size={getGridSize()}>
                <DraggableCard
                  clientId={protocol.id}
                  channel={protocol.channel}
                  messages={protocol.messages}
                  operatorName={protocol.operatorName}
                  buttonName={protocol.buttonName}
                  client={protocol}
                  notificationType={getNotificationType(protocol)}
                  isSelected={isCardSelected(protocol.id)}
                  onCardClick={handleCardClick}
                  onCardHover={handleCardHover}
                  onOpenModalCard={handleOpenModalCard}
                />
              </Grid>
            ))}
          </Grid>
        </SortableContext>
      </DndContext>

      {/* Estado vazio */}
      {filteredProtocols.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant='h6' color='text.secondary' gutterBottom>
            {enrichedProtocols.length === 0 ? 'Nenhum chat encontrado' : 'Nenhum chat corresponde aos filtros'}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {enrichedProtocols.length === 0
              ? 'Aguarde novos chats serem iniciados'
              : 'Ajuste os filtros para ver mais resultados'}
          </Typography>
        </Paper>
      )}

      {/* Dialog de chat */}
      {selectedProtocolData && (
        <ChatViewDialog
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          clientData={selectedProtocolData}
          clientId={selectedProtocolData.id}
          messages={selectedProtocolData.messages}
          channel={selectedProtocolData.channel}
          operatorName={selectedProtocolData.operatorName}
        />
      )}
    </>
  )
}

// 🔧 Componente DraggableCard para os protocolos
interface DraggableCardProps {
  clientId: string
  channel: string
  messages: any[]
  operatorName?: string
  buttonName: string
  client: any
  notificationType: any
  isSelected: boolean
  onCardClick: (clientId: string) => void
  onOpenModalCard: (clientId: string) => void
  onCardHover: (clientId: string, isHovered: boolean) => void
}

const DraggableCard = ({
  clientId,
  channel,
  messages,
  operatorName,
  buttonName,
  notificationType,
  isSelected,
  onCardClick,
  onOpenModalCard,
  onCardHover
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

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CardMonitor
        clientId={clientId}
        channel={channel}
        messages={messages}
        operatorName={operatorName}
        buttonName={buttonName}
        notificationType={notificationType}
        isSelected={isSelected}
        onClick={onCardClick}
        onOpenModal={onOpenModalCard}
        onHover={onCardHover}
      />
    </div>
  )
}

export default MonitoringPage
