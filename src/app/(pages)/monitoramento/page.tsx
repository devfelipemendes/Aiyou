// app/(pages)/operador/monitoramento/page.tsx - COMPLETA E OTIMIZADA
'use client'
import React, { useState, useCallback, useMemo, useEffect, memo } from 'react'

import { Box as BoxIcon, ChevronDown, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Button, Typography, Paper, Box, Alert, CircularProgress, Chip, MenuItem, Menu } from '@mui/material'
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
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import CardMonitorOptimized from '@/components/card_monitormanto/CardMonitor'
import { useAppSelector } from '@/redux-store'
import { selectChatOrder } from '@/redux-store/slices/monitoring'
import { useGetAllHistoryByProtocolQuery } from '@/api/endpoints/chat/protocolHistory'
import ChatMonitoringModal from '@/components/dialogs/chat'
import { selectRenderableChats } from '@/redux-store/selectors/monitoring'
import { useMonitoringChatWithWebSocket } from '@/hooks/useMonitoringWithWebSocket'

// 🔧 TIPOS COMPLETOS
type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent'
type ChatStatus = 'active' | 'resolved' | 'closed' | 'pending' | 'inactive' | 'unresolved'
type ChannelType = 'whatsapp' | 'telegram' | 'webchat' | 'email' | 'sms'

// No tipo ChatFilters, certifique-se que cardsPerRow suporte o range:
interface ChatFilters {
  orderBy: 'created_at' | 'priority' | 'last_activity'
  showClosed: boolean
  statuses: ChatStatus[]
  channels: ChannelType[]
  priorities: PriorityLevel[]
  messagesLimit: number
  cardsPerRow: 2 | 3 | 4 | 5 | 6 // ✅ Suporte para 2-6
}

// 🚀 CARD DRAGGABLE OTIMIZADO - ISOLADO COMPLETAMENTE
const OptimizedDraggableCard = memo<{
  protocol: string
  onSelect: (protocol: string) => void
  onDoubleClick: (protocol: string) => void
  isSelected: boolean
  isWebSocketConnected: boolean
  isInModal: boolean
}>(
  ({ protocol, onSelect, onDoubleClick, isSelected, isWebSocketConnected, isInModal }) => {
    // 🎯 DnD HOOKS
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: protocol })

    // 🎨 ESTILOS DRAGGABLE
    const style = useMemo(
      () => ({
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
      }),
      [transform, transition, isDragging]
    )

    // ✅ PROPS TOTALMENTE ESTÁVEIS - CardMonitor vai pegar dados do Redux internamente
    const cardProps = useMemo(
      () => ({
        protocol,
        onChatSelect: onSelect,
        onChatDoubleClick: onDoubleClick,
        isSelected,
        isWebSocketConnected,
        isInModal,
        isDragging,
        dragListeners: listeners,
        dragAttributes: attributes
      }),
      [
        protocol,
        onSelect,
        onDoubleClick,
        isSelected,
        isWebSocketConnected,
        isInModal,
        isDragging,
        listeners,
        attributes
      ]
    )

    if (process.env.NODE_ENV === 'development') {
      console.log(`🎯 DraggableCard ${protocol} renderizou`)
    }

    return (
      <div ref={setNodeRef} style={style}>
        <CardMonitorOptimized {...cardProps} />
      </div>
    )
  },
  (prevProps, nextProps) => {
    // ✅ NUNCA bloquear re-render durante drag
    //@ts-ignore
    if (nextProps.isDragging !== prevProps.isDragging) {
      return false // Permitir re-render
    }

    // ✅ Resto da lógica igual
    const shouldSkip =
      prevProps.protocol === nextProps.protocol &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isWebSocketConnected === nextProps.isWebSocketConnected &&
      prevProps.isInModal === nextProps.isInModal

    return shouldSkip
  }
)

OptimizedDraggableCard.displayName = 'OptimizedDraggableCard'

// 🚀 HEADER ISOLADO
// 🚀 HEADER ISOLADO
const MonitoringHeader = memo<{
  stats: any
  isWebSocketConnected: boolean
  connectedChannels: string[]
  isLoadingHistory: boolean
  isRefreshing: boolean
  filters: ChatFilters
  onRefresh: () => void
  onFilterChange: (key: keyof ChatFilters, value: any) => void
}>(
  ({
    stats,
    isWebSocketConnected,
    connectedChannels,
    isLoadingHistory,
    isRefreshing,
    filters,
    onRefresh,
    onFilterChange
  }) => {
    // ✅ ESTADO PARA O MENU - SEMPRE NO TOPO!
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const isMenuOpen = Boolean(anchorEl)

    // ✅ FUNÇÕES DO MENU
    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget)
    }

    const handleCloseMenu = () => {
      setAnchorEl(null)
    }

    const handleSelectCards = (value: number) => {
      onFilterChange('cardsPerRow', value)
      handleCloseMenu()
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🏠 MonitoringHeader renderizou`)
    }

    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box display='flex' flexDirection='column' gap={1}>
              <Typography variant='h5'>Monitoramento de Chats ({stats.total})</Typography>

              {/* 📊 ESTATÍSTICAS */}
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

                {isLoadingHistory && (
                  <Chip
                    icon={<CircularProgress size={14} />}
                    label='Carregando históricos...'
                    color='info'
                    size='small'
                  />
                )}
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box display='flex' gap={1} justifyContent='flex-end' flexWrap='wrap'>
              {/* 🔄 BOTÃO REFRESH */}
              <Button
                variant='outlined'
                onClick={onRefresh}
                startIcon={<RefreshCw />}
                disabled={isRefreshing}
                size='small'
              >
                {isRefreshing ? 'Atualizando...' : 'Atualizar'}
              </Button>

              {/* ✅ BOTÃO COM MENU DROPDOWN */}
              <>
                <Button
                  variant='outlined'
                  size='small'
                  onClick={handleOpenMenu}
                  endIcon={<ChevronDown size={14} />}
                  sx={{ minWidth: 70 }}
                >
                  {filters.cardsPerRow}x
                </Button>

                <Menu anchorEl={anchorEl} open={isMenuOpen} onClose={handleCloseMenu} MenuListProps={{ dense: true }}>
                  {[1, 2, 3, 4, 5].map(value => (
                    <MenuItem
                      key={value}
                      onClick={() => handleSelectCards(value)}
                      selected={filters.cardsPerRow === value}
                    >
                      {value} por linha
                    </MenuItem>
                  ))}
                </Menu>
              </>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    )
  },

  // ✅ MEMO continua igual...
  (prevProps, nextProps) => {
    const shouldSkip =
      prevProps.stats.total === nextProps.stats.total &&
      prevProps.stats.totalMessages === nextProps.stats.totalMessages &&
      prevProps.stats.successCount === nextProps.stats.successCount &&
      prevProps.stats.errorCount === nextProps.stats.errorCount &&
      prevProps.isWebSocketConnected === nextProps.isWebSocketConnected &&
      prevProps.connectedChannels.length === nextProps.connectedChannels.length &&
      prevProps.isLoadingHistory === nextProps.isLoadingHistory &&
      prevProps.isRefreshing === nextProps.isRefreshing &&
      prevProps.filters.orderBy === nextProps.filters.orderBy &&
      prevProps.filters.showClosed === nextProps.filters.showClosed &&
      prevProps.filters.cardsPerRow === nextProps.filters.cardsPerRow

    return shouldSkip
  }
)

MonitoringHeader.displayName = 'MonitoringHeader'

// 🚀 GRID DE CARDS ISOLADO
const CardsGrid = memo<{
  protocols: string[]
  gridSize: { xs: number; sm: number; md: number; lg?: number }
  onCardSelect: (protocol: string) => void
  onCardDoubleClick: (protocol: string) => void
  selectedCardId: string | null
  selectedProtocolForDialog: string | null
  isWebSocketConnected: boolean
}>(
  ({
    protocols,
    gridSize,
    onCardSelect,
    onCardDoubleClick,
    selectedCardId,
    selectedProtocolForDialog,
    isWebSocketConnected
  }) => {
    return (
      <Grid container spacing={3}>
        {protocols.map(protocol => (
          <Grid key={protocol} size={gridSize}>
            <OptimizedDraggableCard
              protocol={protocol}
              onSelect={onCardSelect}
              onDoubleClick={onCardDoubleClick}
              isSelected={selectedCardId === protocol}
              isInModal={selectedProtocolForDialog === protocol}
              isWebSocketConnected={isWebSocketConnected}
            />
          </Grid>
        ))}
      </Grid>
    )
  },
  (prevProps, nextProps) => {
    // ✅ VERIFICAR PROTOCOLOS
    const protocolsChanged =
      prevProps.protocols.length !== nextProps.protocols.length ||
      !prevProps.protocols.every((p, i) => p === nextProps.protocols[i])

    // ✅ VERIFICAR GRIDSIZE
    const gridSizeChanged =
      prevProps.gridSize.xs !== nextProps.gridSize.xs ||
      prevProps.gridSize.sm !== nextProps.gridSize.sm ||
      prevProps.gridSize.md !== nextProps.gridSize.md ||
      prevProps.gridSize.lg !== nextProps.gridSize.lg

    // ✅ VERIFICAR OUTRAS PROPS
    const otherPropsChanged =
      prevProps.selectedCardId !== nextProps.selectedCardId ||
      prevProps.selectedProtocolForDialog !== nextProps.selectedProtocolForDialog ||
      prevProps.isWebSocketConnected !== nextProps.isWebSocketConnected

    const shouldRerender = protocolsChanged || gridSizeChanged || otherPropsChanged

    // ✅ Só bloquear se NADA mudou
    return !shouldRerender
  }
)

CardsGrid.displayName = 'CardsGrid'

// 🚀 COMPONENTE PRINCIPAL
const MonitoringPageComplete = () => {
  // 🔥 HOOKS PRINCIPAIS
  const {
    chats,
    stats,
    isLoading,
    isRefreshing,
    error,
    refetch,
    isLoadingHistory,
    selectChat,
    updateChatOrder,
    isWebSocketConnected,
    connectedChannels
  } = useMonitoringChatWithWebSocket()

  const chatOrder = useAppSelector(selectChatOrder)
  const renderableChats = useAppSelector(selectRenderableChats)
  const { data: protocolHistoryData } = useGetAllHistoryByProtocolQuery()

  // 🎯 ESTADOS LOCAIS
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProtocolForDialog, setSelectedProtocolForDialog] = useState<string | null>(null)

  // No useState dos filters, altere o valor inicial:
  const [filters, setFilters] = useState<ChatFilters>({
    orderBy: 'created_at',
    showClosed: false,
    statuses: [],
    channels: [],
    priorities: [],
    messagesLimit: 10,
    cardsPerRow: 4 // ✅ Manter 4 como padrão
  })

  // 🔧 HELPERS MEMOIZADOS
  const getChatChannel = useCallback((chat: any): ChannelType => {
    const sourceToChannel: Record<string, ChannelType> = {
      whatsapp: 'whatsapp',
      telegram: 'telegram',
      webchat: 'webchat',
      email: 'email',
      sms: 'sms'
    }

    return sourceToChannel[chat.source] || 'whatsapp'
  }, [])

  const getChatPriority = useCallback((chat: any): PriorityLevel => {
    if (chat.operator && chat.question_operator) return 'urgent'
    if (chat.messageCount > 10) return 'high'
    if (chat.messageCount > 5) return 'normal'

    return 'low'
  }, [])

  const getChatLastActivity = useCallback((chat: any): string => {
    return chat.lastMessage?.created_at || chat.updated_at
  }, [])

  const filteredProtocols = useMemo(() => {
    // 1️⃣ Primeiro, filtrar os chats que devem aparecer
    const validChats = renderableChats.filter(chat => {
      if (!filters.showClosed && chat.status === 'inactive') return false
      if (filters.statuses.length > 0 && !filters.statuses.includes(chat.status as ChatStatus)) return false

      const chatChannel = getChatChannel(chat)

      if (filters.channels.length > 0 && !filters.channels.includes(chatChannel)) return false

      const chatPriority = getChatPriority(chat)

      if (filters.priorities.length > 0 && !filters.priorities.includes(chatPriority)) return false

      return true
    })

    // 2️⃣ Pegar apenas os protocolos dos chats válidos
    const validProtocols = validChats.map(chat => chat.protocol)

    // 3️⃣ Ordenar baseado no chatOrder global
    const orderedProtocols = chatOrder.filter((protocol: any) => validProtocols.includes(protocol))

    // 4️⃣ ✅ NOVA FUNCIONALIDADE: Separar urgentes (question_operator) dos normais
    const protocolToChat = new Map(validChats.map(chat => [chat.protocol, chat]))

    const urgentProtocols: string[] = []
    const normalProtocols: string[] = []

    orderedProtocols.forEach((protocol: any) => {
      const chat = protocolToChat.get(protocol)

      if (chat?.question_operator) {
        urgentProtocols.push(protocol)
      } else {
        normalProtocols.push(protocol)
      }
    })

    // 5️⃣ Aplicar ordenação adicional se necessário (mantendo separação urgente/normal)
    if (filters.orderBy !== 'created_at') {
      const sortFunction = (a: string, b: string) => {
        const chatA = protocolToChat.get(a)!
        const chatB = protocolToChat.get(b)!

        switch (filters.orderBy) {
          case 'priority':
            const priorityOrder: Record<PriorityLevel, number> = { urgent: 3, high: 2, normal: 1, low: 0 }
            const aPriority = getChatPriority(chatA)
            const bPriority = getChatPriority(chatB)

            return priorityOrder[bPriority] - priorityOrder[aPriority]

          case 'last_activity':
            const aActivity = getChatLastActivity(chatA)
            const bActivity = getChatLastActivity(chatB)

            return new Date(bActivity).getTime() - new Date(aActivity).getTime()

          default:
            return 0
        }
      }

      // Ordenar cada grupo separadamente
      urgentProtocols.sort(sortFunction)
      normalProtocols.sort(sortFunction)
    }

    // 6️⃣ ✅ RESULTADO FINAL: Urgentes primeiro, depois normais
    const finalOrder = [...urgentProtocols, ...normalProtocols]

    return finalOrder
  }, [renderableChats, chatOrder, filters, getChatChannel, getChatPriority, getChatLastActivity])

  // 🔧 MODAL DATA
  const selectedChatForDialog = useMemo(() => {
    if (!selectedProtocolForDialog) return null
    const chat = chats.find(c => c.protocol === selectedProtocolForDialog)

    if (!chat) {
      console.warn('⚠️ Chat não encontrado para protocolo:', selectedProtocolForDialog)

      return null
    }

    return chat
  }, [chats, selectedProtocolForDialog])

  const modalData = useMemo(() => {
    if (!selectedChatForDialog || !protocolHistoryData?.protocolsMap) return null

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

  // 🎛️ CALLBACKS ESTÁVEIS
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

  const handleRefreshData = useCallback(() => {
    console.log('🔄 Refresh manual iniciado')
    refetch()
  }, [refetch])

  const handleFilterChange = useCallback((key: keyof ChatFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  // 🔄 DRAG AND DROP
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (!over || active.id === over.id) return

      const activeProtocol = active.id as string
      const overProtocol = over.id as string

      // 1️⃣ Debug inicial - vamos ver o que está acontecendo
      console.log('🎯 DRAG START DEBUG:', {
        activeProtocol,
        overProtocol,
        filteredProtocols,
        chatOrder
      })

      // 2️⃣ Posições na lista FILTRADA
      const filteredOldIndex = filteredProtocols.findIndex(p => p === activeProtocol)
      const filteredNewIndex = filteredProtocols.findIndex(p => p === overProtocol)

      if (filteredOldIndex === -1 || filteredNewIndex === -1) {
        console.warn('⚠️ Protocolos não encontrados na lista filtrada')

        return
      }

      // 3️⃣ Se não mudou de posição VISUAL, não faz nada
      if (filteredOldIndex === filteredNewIndex) {
        console.log('✅ Mesmo item - ignorando')

        return
      }

      // 4️⃣ Posições GLOBAIS
      const globalOldIndex = chatOrder.findIndex((p: any) => p === activeProtocol)
      const globalOverIndex = chatOrder.findIndex((p: any) => p === overProtocol)

      if (globalOldIndex === -1 || globalOverIndex === -1) {
        console.warn('⚠️ Protocolos não encontrados na ordem global')

        return
      }

      // 5️⃣ NOVA LÓGICA: Calcular onde inserir baseado na direção do movimento
      let globalNewIndex: number

      if (filteredOldIndex < filteredNewIndex) {
        // 📍 Movendo para BAIXO na lista visual
        globalNewIndex = globalOverIndex
      } else {
        // 📍 Movendo para CIMA na lista visual
        globalNewIndex = globalOverIndex
      }

      // 6️⃣ Debug detalhado
      console.log('🔄 DRAG CALCULATION:', {
        visual: { old: filteredOldIndex, new: filteredNewIndex },
        global: { old: globalOldIndex, over: globalOverIndex, new: globalNewIndex },
        direction: filteredOldIndex < filteredNewIndex ? 'DOWN' : 'UP'
      })

      // 7️⃣ Executar se realmente mudou
      if (globalOldIndex !== globalNewIndex) {
        console.log('🚀 EXECUTANDO DRAG:', { globalOldIndex, globalNewIndex })
        updateChatOrder(globalOldIndex, globalNewIndex)
      } else {
        console.log('⚠️ Posições globais iguais - ignorando')
      }
    },
    [chatOrder, filteredProtocols, updateChatOrder]
  )

  // 🔧 GRID SIZE
  const gridSize = useMemo(() => {
    const cardsPerRow = filters.cardsPerRow

    // Calculo das colunas Bootstrap (12 colunas totais)
    const colSize = Math.floor(12 / cardsPerRow)

    return {
      xs: 12, // Mobile: sempre 1 por linha
      sm: cardsPerRow <= 2 ? 6 : colSize, // Tablet: ajustar baseado na escolha
      md: colSize, // Desktop: usar o cálculo
      lg: colSize // Desktop grande: usar o cálculo
    }
  }, [filters.cardsPerRow])

  // 🔧 DnD SENSORS
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // ✅ DEBUG OTIMIZADO - apenas mudanças importantes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Monitoramento: ${filteredProtocols.length} chats renderizáveis`)
    }
  }, [filteredProtocols.length]) // ✅ Só quando número de chats muda

  // 🔄 VERIFICAR SE CHAT AINDA EXISTE
  useEffect(() => {
    if (dialogOpen && selectedProtocolForDialog && !selectedChatForDialog) {
      console.warn('⚠️ Chat removido enquanto modal estava aberto, fechando...')
      handleCloseDialog()
    }
  }, [dialogOpen, selectedProtocolForDialog, selectedChatForDialog, handleCloseDialog])

  // 🚨 LOADING STATE
  if (isLoading && filteredProtocols.length === 0) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
        <Typography variant='h6' sx={{ ml: 2 }}>
          Carregando chats e históricos...
        </Typography>
      </Box>
    )
  }

  // 🚨 ERROR STATE
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
      {/* ✅ HEADER ISOLADO */}
      <MonitoringHeader
        stats={stats}
        isWebSocketConnected={isWebSocketConnected}
        connectedChannels={connectedChannels}
        isLoadingHistory={isLoadingHistory}
        isRefreshing={isRefreshing}
        filters={filters}
        onRefresh={handleRefreshData}
        onFilterChange={handleFilterChange}
      />

      {/* ✅ GRID COM DRAG & DROP */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredProtocols} strategy={rectSortingStrategy}>
          <CardsGrid
            protocols={filteredProtocols}
            gridSize={gridSize}
            onCardSelect={handleCardClick}
            onCardDoubleClick={handleCardDoubleClick}
            selectedCardId={selectedCardId}
            selectedProtocolForDialog={selectedProtocolForDialog}
            isWebSocketConnected={isWebSocketConnected}
          />
        </SortableContext>
      </DndContext>

      {/* 🔥 EMPTY STATE */}
      {filteredProtocols.length === 0 && (
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

      {/* ✅ MODAL */}
      {dialogOpen && modalData && (
        <ChatMonitoringModal open={dialogOpen} onClose={handleCloseDialog} chatData={modalData.chatData} />
      )}
    </Box>
  )
}

export default MonitoringPageComplete
