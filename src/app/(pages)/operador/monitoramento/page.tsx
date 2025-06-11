/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useState, useMemo, useCallback } from 'react'

// Redux hooks

import Grid from '@mui/material/Grid2'
import {
  Box as BoxIcon,
  Settings,
  ChevronDown,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  UserCheck,
  AlertTriangle
} from 'lucide-react'
import {
  Button,
  Chip,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
  Slider,
  Paper,
  Popover,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Card,
  CardContent,
  Switch,
  Tooltip
} from '@mui/material'

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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { useAppDispatch, useAppSelector } from '@/redux-store'
import { setFilterOrder, selectFilterOrders } from '@/redux-store/slices/monitoring'

// 🔥 IMPORTS: Sistema de notificação
import { useCardNotifications } from '@/hooks/useCardNotifications'
import type { NotificationType } from '@/types/monitoring'

// Imports existentes
import CardMonitor from '@/components/card_monitormanto/CardMonitor'
import { clientsData } from './fakeJson'
import ChatViewDialog from '@/components/dialogs/chat-view'

// Tipos para os filtros
type PriorityLevel = 'baixa' | 'media' | 'alta' | 'urgente'
type ChatStatus = 'ativo' | 'encerrado' | 'resolvido' | 'nao_resolvido' | 'chamou_operador'
type ChannelType = 'whatsapp' | 'telegram' | 'webchat' | 'email' | 'sms'

interface ChatFilters {
  orderBy: 'chegada' | 'prioridade'
  showClosed: boolean
  statuses: ChatStatus[]
  channels: ChannelType[]
  priorities: PriorityLevel[]
  messagesLimit: number
  cardsPerRow: number
}

// Função para gerar chave única dos filtros
const generateFilterKey = (filters: ChatFilters): string => {
  return JSON.stringify({
    orderBy: filters.orderBy,
    showClosed: filters.showClosed,
    statuses: filters.statuses.sort(),
    channels: filters.channels.sort(),
    priorities: filters.priorities.sort()
  })
}

// 🔥 ATUALIZADO: DraggableCard com sistema de notificação
interface DraggableCardProps {
  clientId: string
  channel: string
  messages: any[]
  operatorName?: string
  buttonName: string

  // Novas props
  client: any
  notificationType: NotificationType
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

const KanbanPage = () => {
  // Redux
  const dispatch = useAppDispatch()
  const filterOrders = useAppSelector(selectFilterOrders)

  // Estados dos filtros
  const [filters, setFilters] = useState<ChatFilters>({
    orderBy: 'chegada',
    showClosed: false,
    statuses: [],
    channels: [],
    priorities: [],
    messagesLimit: 10,
    cardsPerRow: 4
  })

  // Estados dos menus
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null)
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState<null | HTMLElement>(null)
  const [showComponentWaring, setShowComponentWarning] = useState(true)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedClientData, setSelectedClientData] = useState<(typeof enrichedClientsData)[number] | null>(null)

  //? Hook para notificações
  const {
    selectedCardId,
    handleCardClick,
    handleCardHover,
    isCardSelected,
    getNotificationType,
    getNotificationCounts
  } = useCardNotifications()

  //? Configuração dos sensores para o drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const enrichedClientsData = useMemo(() => {
    return clientsData.map(client => {
      // Determinar status baseado no clientId para teste
      let status: ChatStatus = 'ativo'

      // Aqui está o codigo de teste para notificação
      if (['CHAT001'].includes(client.clientId)) {
        status = 'chamou_operador' // Vermelho piscando
      } else if (['CHAT003'].includes(client.clientId)) {
        status = 'nao_resolvido' // Amarelo
      } else if (['CHAT008'].includes(client.clientId)) {
        status = 'resolvido' // Normal
      }

      return {
        ...client,
        priority: ['baixa', 'media', 'alta', 'urgente'][Math.floor(Math.random() * 4)] as PriorityLevel,
        status,
        channelType: client.channel.toLowerCase() as ChannelType,
        tags: ['vip', 'urgente', 'suporte'].slice(0, Math.floor(Math.random() * 3)),

        // 🔥 NOVO: Dados para sistema de notificação
        lastActivity:
          client.messages.length > 0
            ? client.messages[client.messages.length - 1].timestamp
            : new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000) // Últimas 2h
      }
    })
  }, [])

  //* Funções
  //? Dialog
  const handleOpenModalCard = useCallback(
    (clientId: string) => {
      const clientData = enrichedClientsData.find(client => client.clientId === clientId)

      if (clientData) {
        setSelectedClientData(clientData)
        setIsDialogOpen(true)
      }
    },
    [enrichedClientsData]
  )

  // const handleCloseDialog = useCallback(() => {
  //   setIsDialogOpen(false)
  //   setSelectedClientData(null)
  // }, [])

  //? Filtro para notificaçoes
  const notificationCounts = useMemo(() => {
    return getNotificationCounts(enrichedClientsData)
  }, [enrichedClientsData, getNotificationCounts])

  const filteredClientsBase = useMemo(() => {
    let filtered = [...enrichedClientsData]

    //? Filtro por status
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(client => filters.statuses.includes(client.status))
    }

    //? Filtro por canal
    if (filters.channels.length > 0) {
      filtered = filtered.filter(client => filters.channels.includes(client.channelType))
    }

    //? Filtro por prioridade
    if (filters.priorities.length > 0) {
      filtered = filtered.filter(client => filters.priorities.includes(client.priority))
    }

    //? Filtro de chats encerrados
    if (!filters.showClosed) {
      filtered = filtered.filter(client => !['encerrado', 'resolvido'].includes(client.status))
    }

    return filtered
  }, [enrichedClientsData, filters.statuses, filters.channels, filters.priorities, filters.showClosed])

  const filteredClients = useMemo(() => {
    const filterKey = generateFilterKey(filters)
    const savedOrder = filterOrders[filterKey] || null

    const orderedClients = [...filteredClientsBase]

    if (savedOrder && savedOrder.length > 0) {
      const positionMap = new Map(savedOrder.map((id: string, index: number) => [id, index]))

      orderedClients.sort((a, b) => {
        const posA = positionMap.get(a.clientId) ?? Number.MAX_SAFE_INTEGER
        const posB = positionMap.get(b.clientId) ?? Number.MAX_SAFE_INTEGER

        return posA - posB
      })
    } else {
      if (filters.orderBy === 'prioridade') {
        const priorityOrder = { urgente: 4, alta: 3, media: 2, baixa: 1 }

        orderedClients.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      } else {
        orderedClients.sort((a, b) => {
          const timeA = parseInt(a.clientId.replace(/\D/g, '')) || 0
          const timeB = parseInt(b.clientId.replace(/\D/g, '')) || 0

          return timeB - timeA
        })
      }
    }

    return orderedClients
  }, [filteredClientsBase, filters.orderBy, filterOrders])

  //? Função para Final

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const currentOrder = filteredClients.map(client => client.clientId)
        const oldIndex = currentOrder.findIndex(id => id === active.id)
        const newIndex = currentOrder.findIndex(id => id === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(currentOrder, oldIndex, newIndex)
          const filterKey = generateFilterKey(filters)

          dispatch(setFilterOrder({ key: filterKey, order: newOrder }))
        }
      }
    },
    [filteredClients, filters, dispatch]
  )

  const handleFilterChange = useCallback((key: keyof ChatFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleStatusToggle = useCallback((status: ChatStatus) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s: ChatStatus) => s !== status)
        : [...prev.statuses, status]
    }))
  }, [])

  const handleChannelToggle = useCallback((channel: ChannelType) => {
    setFilters(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c: ChannelType) => c !== channel)
        : [...prev.channels, channel]
    }))
  }, [])

  const handlePriorityToggle = useCallback((priority: PriorityLevel) => {
    setFilters(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter((p: PriorityLevel) => p !== priority)
        : [...prev.priorities, priority]
    }))
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters({
      orderBy: 'chegada',
      showClosed: false,
      statuses: [],
      channels: [],
      priorities: [],
      messagesLimit: 10,
      cardsPerRow: 4
    })
  }, [])

  const getActiveFiltersCount = useCallback(() => {
    return (
      filters.statuses.length +
      filters.channels.length +
      filters.priorities.length +
      (filters.showClosed ? 1 : 0) +
      (filters.orderBy !== 'chegada' ? 1 : 0)
    )
  }, [filters])

  //? Mudança da organização dos grids

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

  //? Dialog

  return (
    <>
      {/* Aqui vai os Cards de estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant='h4' color='primary'>
                800
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
                900
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
                10000
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
                2010
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Sob Controle
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Header com Filtros */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Título */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BoxIcon size={24} />
              <div>
                <Typography variant='h5' component='h1'>
                  Monitoramento de Interações
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {filteredClients.length} de {enrichedClientsData.length} conversas
                  {selectedCardId && <span> • Selecionado: {selectedCardId}</span>}
                  {process.env.NODE_ENV === 'development' && (
                    <span> • {Object.keys(filterOrders).length} ordens salvas</span>
                  )}
                </Typography>
              </div>
            </Box>
          </Grid>
          {/*Aqui vai o componente de filtros */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Tooltip title='Visualizar alerta de chamados' className='mr-3'>
                <FormControlLabel
                  control={<Switch />}
                  label=''
                  checked={showComponentWaring}
                  onChange={(_, checkedWarnings) => setShowComponentWarning(checkedWarnings)}
                  labelPlacement='start'
                />
              </Tooltip>

              {/* Ordenação */}
              <Button
                variant={filters.orderBy === 'chegada' ? 'contained' : 'outlined'}
                size='small'
                startIcon={<i className='ri-filter-2-line' />}
                onClick={() => handleFilterChange('orderBy', filters.orderBy === 'chegada' ? 'prioridade' : 'chegada')}
                className='rounded-full'
              >
                {filters.orderBy === 'chegada' ? 'Por Chegada' : 'Por Prioridade'}
              </Button>

              <Button
                variant={filters.showClosed ? 'contained' : 'outlined'}
                size='small'
                startIcon={filters.showClosed ? <CheckCircle size={16} /> : <i className='ri-filter-2-line' />}
                onClick={() => handleFilterChange('showClosed', !filters.showClosed)}
                className='rounded-full'
              >
                {filters.showClosed ? 'Com Encerrados' : 'Apenas Ativos'}
              </Button>

              <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />

              <Button
                variant={filters.priorities.length > 0 ? 'contained' : 'outlined'}
                size='small'
                startIcon={<Tag size={16} />}
                endIcon={<ChevronDown size={16} />}
                onClick={e => setFilterMenuAnchor(e.currentTarget)}
                color={filters.priorities.length > 0 ? 'warning' : 'inherit'}
                className='rounded-full'
              >
                Filtros Avançados {filters.priorities.length > 0 && `(${filters.priorities.length})`}
              </Button>

              <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />

              {/* Configurações - conectado ao settingsMenuAnchor */}
              <Button
                variant='outlined'
                size='small'
                startIcon={<Settings size={16} />}
                onClick={e => setSettingsMenuAnchor(e.currentTarget)}
              >
                Config
              </Button>

              {/* Limpar Filtros */}
              {getActiveFiltersCount() > 0 && (
                <Button variant='text' size='small' color='error' onClick={clearAllFilters}>
                  Limpar Filtros
                </Button>
              )}
            </Box>

            {/* Chips dos Filtros Ativos */}
            {getActiveFiltersCount() > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {filters.statuses.map(status => (
                  <Chip
                    key={status}
                    label={status.replace('_', ' ')}
                    size='small'
                    onDelete={() => handleStatusToggle(status)}
                    color='primary'
                  />
                ))}
                {filters.channels.map(channel => (
                  <Chip
                    key={channel}
                    label={channel}
                    size='small'
                    onDelete={() => handleChannelToggle(channel)}
                    color='secondary'
                  />
                ))}
                {filters.priorities.map(priority => (
                  <Chip
                    key={priority}
                    label={priority}
                    size='small'
                    onDelete={() => handlePriorityToggle(priority)}
                    color='warning'
                  />
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
      {/* 🔥 Alert com contadores de notificação */}
      {showComponentWaring &&
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
                  label={`${notificationCounts.operator_call} Chamadas Urgentes`}
                  color='error'
                  size='small'
                  variant='filled'
                />
              )}

              {notificationCounts.unresolved > 0 && (
                <Chip
                  icon={<XCircle size={14} />}
                  label={`${notificationCounts.unresolved} Não Resolvidos`}
                  color='warning'
                  size='small'
                  variant='filled'
                />
              )}

              {notificationCounts.no_response > 0 && (
                <Chip
                  icon={<Clock size={14} />}
                  label={`${notificationCounts.no_response} Sem Resposta`}
                  color='info'
                  size='small'
                  variant='filled'
                />
              )}

              {notificationCounts.operator_control > 0 && (
                <Chip
                  icon={<UserCheck size={14} />}
                  label={`${notificationCounts.operator_control} Em Controle`}
                  color='primary'
                  size='small'
                  variant='outlined'
                />
              )}
            </Box>
          </Alert>
        )}
      {/* Menu de Filtros Avançados - Agora funcional! */}
      <Popover
        open={Boolean(filterMenuAnchor)}
        anchorEl={filterMenuAnchor}
        onClose={() => setFilterMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Paper sx={{ p: 2, minWidth: 300, maxWidth: 400 }}>
          <Typography variant='subtitle2' gutterBottom>
            Filtros Avançados
          </Typography>
          {/* Status dos Chats */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ChevronDown size={16} />}>
              <Typography variant='body2'>Status dos Chats</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {(['ativo', 'encerrado', 'resolvido', 'nao_resolvido', 'chamou_operador'] as ChatStatus[]).map(
                  status => (
                    <FormControlLabel
                      key={status}
                      control={
                        <Checkbox
                          checked={filters.statuses.includes(status)}
                          onChange={() => handleStatusToggle(status)}
                          size='small'
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant='body2'>{status.replace('_', ' ')}</Typography>
                          {status === 'chamou_operador' && <Bell size={12} color='red' />}
                          {status === 'nao_resolvido' && <XCircle size={12} color='orange' />}
                        </Box>
                      }
                    />
                  )
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
          {/* Canais */}
          <Accordion>
            <AccordionSummary expandIcon={<ChevronDown size={16} />}>
              <Typography variant='body2'>Canais de Atendimento</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {(['whatsapp', 'telegram', 'webchat', 'email', 'sms'] as ChannelType[]).map(channel => (
                  <FormControlLabel
                    key={channel}
                    control={
                      <Checkbox
                        checked={filters.channels.includes(channel)}
                        onChange={() => handleChannelToggle(channel)}
                        size='small'
                      />
                    }
                    label={
                      <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
                        {channel}
                      </Typography>
                    }
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
          {/* Prioridades */}
          <Accordion>
            <AccordionSummary expandIcon={<ChevronDown size={16} />}>
              <Typography variant='body2'>Níveis de Prioridade</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {(['baixa', 'media', 'alta', 'urgente'] as PriorityLevel[]).map(priority => (
                  <FormControlLabel
                    key={priority}
                    control={
                      <Checkbox
                        checked={filters.priorities.includes(priority)}
                        onChange={() => handlePriorityToggle(priority)}
                        size='small'
                      />
                    }
                    label={
                      <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
                        {priority}
                      </Typography>
                    }
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Popover>

      {/* Menu de Configurações - Agora funcional! */}
      <Popover
        open={Boolean(settingsMenuAnchor)}
        anchorEl={settingsMenuAnchor}
        onClose={() => setSettingsMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Paper sx={{ p: 3, minWidth: 280 }}>
          <Typography variant='subtitle2' gutterBottom>
            Configurações de Visualização
          </Typography>

          {/* Limite de Mensagens */}
          <Box sx={{ mb: 3 }}>
            <Typography variant='body2' gutterBottom>
              Últimas {filters.messagesLimit} mensagens por chat
            </Typography>
            <Slider
              value={filters.messagesLimit}
              onChange={(_, value) => handleFilterChange('messagesLimit', value)}
              min={5}
              max={50}
              step={5}
              marks={[
                { value: 5, label: '5' },
                { value: 25, label: '25' },
                { value: 50, label: '50' }
              ]}
              valueLabelDisplay='auto'
            />
          </Box>

          {/* Cards por Linha */}
          <Box>
            <Typography variant='body2' gutterBottom>
              Cards por linha: {filters.cardsPerRow}
            </Typography>
            <Slider
              value={filters.cardsPerRow}
              onChange={(_, value) => handleFilterChange('cardsPerRow', value)}
              min={1}
              max={6}
              step={1}
              marks={[
                { value: 1, label: '1' },
                { value: 3, label: '3' },
                { value: 6, label: '6' }
              ]}
              valueLabelDisplay='auto'
            />
          </Box>
        </Paper>
      </Popover>

      {/* Grid de Cards com sistema de notificação */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredClients.map(client => client.clientId)} strategy={rectSortingStrategy}>
          <Grid container spacing={3}>
            {filteredClients.map(client => (
              <Grid key={client.clientId} size={getGridSize()}>
                <DraggableCard
                  clientId={client.clientId}
                  channel={client.channel}
                  messages={client.messages.slice(0, filters.messagesLimit)}
                  operatorName={client.operatorName}
                  buttonName='IA'
                  client={client}
                  notificationType={getNotificationType(client)}
                  isSelected={isCardSelected(client.clientId)}
                  onCardClick={handleCardClick}
                  onCardHover={handleCardHover}
                  onOpenModalCard={handleOpenModalCard}
                />
              </Grid>
            ))}
          </Grid>
        </SortableContext>
      </DndContext>
      {selectedClientData && (
        <ChatViewDialog
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          clientData={selectedClientData}
          clientId={selectedClientData.clientId}
          messages={selectedClientData.messages}
          channel={selectedClientData.channel}
          operatorName={selectedClientData.operatorName}
        />
      )}

      {/* Estado Vazio */}
      {filteredClients.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant='h6' color='text.secondary' gutterBottom>
            Nenhum chat encontrado
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Ajuste os filtros para ver mais resultados
          </Typography>
          <Button variant='outlined' onClick={clearAllFilters} sx={{ mt: 2 }}>
            Limpar Filtros
          </Button>
        </Paper>
      )}
    </>
  )
}

export default KanbanPage
