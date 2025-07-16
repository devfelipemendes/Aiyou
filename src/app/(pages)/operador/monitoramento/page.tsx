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
import { sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { useAppSelector } from '@/redux-store'

// Imports dos componentes existentes
import CardMonitor from '@/components/card_monitormanto/CardMonitor'
import { chatFakeData } from '@/components/card_monitormanto/datafake'

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

  const [loading, setLoading] = useState(false)

  // Hook para notificações (substituído por implementação simples)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

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

  // 🔧 Função para recarregar dados (fake)
  const handleRefreshData = useCallback(async () => {
    setLoading(true)

    // Simular carregamento
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }, [])

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
        <Grid container spacing={3}>
          <Grid size={getGridSize()}>
            <DraggableCard
              clientId={'1'}
              channel={'channel'}
              messages={['teste']}
              operatorName={'teste'}
              buttonName={'teste'}
              client={'1321321321'}
              notificationType={() => {}}
              isSelected={isCardSelected('1')}
              onCardClick={handleCardClick}
              onCardHover={handleCardHover}
              onOpenModalCard={() => {}}
            />
          </Grid>
        </Grid>
      </DndContext>
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

const DraggableCard = ({ clientId }: DraggableCardProps) => {
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
        dragListeners={listeners} // Função de pegar e Soltar
        dragAttributes={attributes} // Função de pegar e Soltar
        isDragging={isCurrentlyDragging} // Função de pegar e soltar
        ChatData={chatFakeData} // Dados do chat
        clientProtocolName={'teste'} // Nome no Header
        statusChat={'unresolved'} // Status do chat
        progressTime={'teste'} // tempo de progresso do chat
        attendant={'teste'} // Tipo do atendente do momento
        protocol={'teste'} // Id do Protocolo
        callOperator={false} // Chamada do operador
      />
    </div>
  )
}

export default MonitoringPage
