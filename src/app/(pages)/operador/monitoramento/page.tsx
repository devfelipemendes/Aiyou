'use client'
import { useState, useMemo } from 'react'

import Grid from '@mui/material/Grid2'
import {
  Box as BoxIcon,
  Filter,
  Settings,
  ChevronDown,
  Tag,
  Clock,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone
} from 'lucide-react'
import {
  Button,
  Chip,
  Typography,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  Divider,
  Slider,
  Paper,
  Popover,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'

// Imports do DnD Kit
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

import CardMonitor from '@/components/card_monitormanto/CardMonitor'
import { clientsData } from './fakeJson'

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

// Componente wrapper para tornar o card draggável
interface DraggableCardProps {
  clientId: string
  channel: string
  messages: any[]
  operatorName?: string
  buttonName: string
  isDragging?: boolean
}

const DraggableCard = ({ clientId, channel, messages, operatorName, buttonName, isDragging }: DraggableCardProps) => {
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
      />
    </div>
  )
}

const KanbanPage = () => {
  // Estados principais
  const [orderedClients, setOrderedClients] = useState(clientsData)

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

  // Configuração dos sensores para o drag
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

  // Mock: adicionar propriedades extras aos dados para demonstração
  const enrichedClientsData = useMemo(() => {
    return orderedClients.map(client => ({
      ...client,
      priority: ['baixa', 'media', 'alta', 'urgente'][Math.floor(Math.random() * 4)] as PriorityLevel,
      status: ['ativo', 'encerrado', 'resolvido', 'nao_resolvido', 'chamou_operador'][
        Math.floor(Math.random() * 5)
      ] as ChatStatus,
      channelType: client.channel.toLowerCase() as ChannelType,
      tags: ['vip', 'urgente', 'suporte'].slice(0, Math.floor(Math.random() * 3))
    }))
  }, [orderedClients])

  // Aplicar todos os filtros
  const filteredClients = useMemo(() => {
    let filtered = [...enrichedClientsData]

    // Filtro por status
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(client => filters.statuses.includes(client.status))
    }

    // Filtro por canal
    if (filters.channels.length > 0) {
      filtered = filtered.filter(client => filters.channels.includes(client.channelType))
    }

    // Filtro por prioridade
    if (filters.priorities.length > 0) {
      filtered = filtered.filter(client => filters.priorities.includes(client.priority))
    }

    // Filtro de chats encerrados
    if (!filters.showClosed) {
      filtered = filtered.filter(client => client.status !== 'encerrado')
    }

    // Ordenação
    if (filters.orderBy === 'prioridade') {
      const priorityOrder = { urgente: 4, alta: 3, media: 2, baixa: 1 }

      filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    } else {
      // Ordenar por chegada (timestamp da última mensagem)
      filtered.sort((a, b) => {
        const timeA = Date.now() - Math.random() * 86400000
        const timeB = Date.now() - Math.random() * 86400000

        return timeB - timeA
      })
    }

    return filtered
  }, [enrichedClientsData, filters])

  // Função para lidar com o fim do drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setOrderedClients(items => {
        const oldIndex = items.findIndex(item => item.clientId === active.id)
        const newIndex = items.findIndex(item => item.clientId === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // Handlers dos filtros
  const handleFilterChange = (key: keyof ChatFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleStatusToggle = (status: ChatStatus) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status) ? prev.statuses.filter(s => s !== status) : [...prev.statuses, status]
    }))
  }

  const handleChannelToggle = (channel: ChannelType) => {
    setFilters(prev => ({
      ...prev,
      channels: prev.channels.includes(channel) ? prev.channels.filter(c => c !== channel) : [...prev.channels, channel]
    }))
  }

  const handlePriorityToggle = (priority: PriorityLevel) => {
    setFilters(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...prev.priorities, priority]
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      orderBy: 'chegada',
      showClosed: false,
      statuses: [],
      channels: [],
      priorities: [],
      messagesLimit: 10,
      cardsPerRow: 4
    })
  }

  const getActiveFiltersCount = () => {
    return (
      filters.statuses.length +
      filters.channels.length +
      filters.priorities.length +
      (filters.showClosed ? 1 : 0) +
      (filters.orderBy !== 'chegada' ? 1 : 0)
    )
  }

  // Calcular tamanho do grid baseado na configuração
  const getGridSize = () => {
    const sizeMap = {
      6: { md: 2, xl: 2, sm: 4 },
      4: { md: 3, xl: 3, sm: 6 },
      3: { md: 4, xl: 4, sm: 6 },
      2: { md: 6, xl: 6, sm: 12 },
      1: { md: 12, xl: 12, sm: 12 }
    }

    return sizeMap[filters.cardsPerRow as keyof typeof sizeMap] || sizeMap[4]
  }

  return (
    <>
      {/* Header com Filtros Agrupados */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
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
                </Typography>
              </div>
            </Box>
          </Grid>

          {/* Grupo de Filtros e Controles */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
              {/* Ordenação */}
              <Button
                variant={filters.orderBy === 'chegada' ? 'contained' : 'outlined'}
                size='small'
                startIcon={<Clock size={16} />}
                onClick={() => handleFilterChange('orderBy', filters.orderBy === 'chegada' ? 'prioridade' : 'chegada')}
              >
                {filters.orderBy === 'chegada' ? 'Por Chegada' : 'Por Prioridade'}
              </Button>

              {/* Chats Encerrados */}
              <Button
                variant={filters.showClosed ? 'contained' : 'outlined'}
                size='small'
                startIcon={filters.showClosed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                onClick={() => handleFilterChange('showClosed', !filters.showClosed)}
              >
                {filters.showClosed ? 'Com Encerrados' : 'Apenas Ativos'}
              </Button>

              <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />

              {/* Status */}
              <Button
                variant={filters.statuses.length > 0 ? 'contained' : 'outlined'}
                size='small'
                startIcon={<AlertCircle size={16} />}
                endIcon={<ChevronDown size={16} />}
                onClick={e => setFilterMenuAnchor(e.currentTarget)}
                color={filters.statuses.length > 0 ? 'primary' : 'inherit'}
              >
                Status {filters.statuses.length > 0 && `(${filters.statuses.length})`}
              </Button>

              {/* Canais */}
              <Button
                variant={filters.channels.length > 0 ? 'contained' : 'outlined'}
                size='small'
                startIcon={<MessageCircle size={16} />}
                endIcon={<ChevronDown size={16} />}
                onClick={e => setFilterMenuAnchor(e.currentTarget)}
                color={filters.channels.length > 0 ? 'secondary' : 'inherit'}
              >
                Canais {filters.channels.length > 0 && `(${filters.channels.length})`}
              </Button>

              {/* Prioridades */}
              <Button
                variant={filters.priorities.length > 0 ? 'contained' : 'outlined'}
                size='small'
                startIcon={<Tag size={16} />}
                endIcon={<ChevronDown size={16} />}
                onClick={e => setFilterMenuAnchor(e.currentTarget)}
                color={filters.priorities.length > 0 ? 'warning' : 'inherit'}
              >
                Prioridade {filters.priorities.length > 0 && `(${filters.priorities.length})`}
              </Button>

              <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />

              {/* Configurações */}
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
                  Limpar
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

      {/* Menu de Filtros Avançados */}
      <Popover
        open={Boolean(filterMenuAnchor)}
        anchorEl={filterMenuAnchor}
        onClose={() => setFilterMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
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
              {(['ativo', 'encerrado', 'resolvido', 'nao_resolvido', 'chamou_operador'] as ChatStatus[]).map(status => (
                <FormControlLabel
                  key={status}
                  control={
                    <Checkbox
                      checked={filters.statuses.includes(status)}
                      onChange={() => handleStatusToggle(status)}
                      size='small'
                    />
                  }
                  label={status.replace('_', ' ')}
                />
              ))}
            </AccordionDetails>
          </Accordion>

          {/* Canais */}
          <Accordion>
            <AccordionSummary expandIcon={<ChevronDown size={16} />}>
              <Typography variant='body2'>Canais de Atendimento</Typography>
            </AccordionSummary>
            <AccordionDetails>
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
                  label={channel}
                />
              ))}
            </AccordionDetails>
          </Accordion>

          {/* Prioridades */}
          <Accordion>
            <AccordionSummary expandIcon={<ChevronDown size={16} />}>
              <Typography variant='body2'>Níveis de Prioridade</Typography>
            </AccordionSummary>
            <AccordionDetails>
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
                  label={priority}
                />
              ))}
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Popover>

      {/* Menu de Configurações */}
      <Popover
        open={Boolean(settingsMenuAnchor)}
        anchorEl={settingsMenuAnchor}
        onClose={() => setSettingsMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

      {/* Grid de Cards */}
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
                  buttonName={'IA'}
                />
              </Grid>
            ))}
          </Grid>
        </SortableContext>
      </DndContext>

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
