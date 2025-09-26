// src/components/dialogs/chat-monitoring/ChatMonitoringSidebar.tsx
'use client'

// React Imports
import { useState, useCallback, useMemo, useEffect } from 'react'
import type { ChangeEvent, ReactNode } from 'react'

import Grid from '@mui/material/Grid2'

// MUI Imports
import {
  Drawer,
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  TextField,
  Autocomplete,
  InputAdornment,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Icon Imports
import { MessageSquare, XCircle, UserCheck, MessageCircleIcon } from 'lucide-react'

// Component Imports

// Types
import type { ChatWithHistory } from '@/api/endpoints/chat/history'
import { ProtocolHistoryList } from './ProtocolHistoryList'
import { useAppDispatch, useAppSelector } from '@/redux-store'
import { useOperatorToggleMutation } from '@/api/endpoints/chat/operatorMode'

import { toggleAssumeChat } from '@/redux-store/slices/monitoring'
import { useUpdateChatStatusMutation } from '@/api/endpoints/chat/changeStatus'

// Utils

// ===== TIPOS ESPECÍFICOS PARA O SIDEBAR =====
type ActionType = 'assume_chat' | 'transfer_operator' | 'add_comment' | 'client_details' | 'end_chat' | 'update_status'

interface ActionState {
  loading: ActionType | null
  error: string | null
  success: ActionType | null
}

interface ChatMonitoringSidebarProps {
  open: boolean
  onClose: () => void

  // Props dos dados do chat
  chatData: ChatWithHistory | null
  selectedProtocol: string

  // Props do histórico
  historyData: any
  historyLoading: boolean
  historyError: string | null
  onRefreshHistory: () => void
  onProtocolSelect: (protocol: string, protocolData: any) => void

  // Props de responsividade
  isBelowLgScreen: boolean
  isBelowMdScreen: boolean
  isBelowSmScreen: boolean

  // Props de ações
  onAssumeChat?: () => Promise<void>
  onTransferOperator?: () => Promise<void>
  onAddComment?: () => Promise<void>
  onClientDetails?: () => void
  onEndChat?: () => Promise<void>
}

// ===== COMPONENTE SCROLL WRAPPER (adaptado do SidebarLeft) =====
const ScrollWrapper = ({ children, isBelowLgScreen }: { children: ReactNode; isBelowLgScreen: boolean }) => {
  if (isBelowLgScreen) {
    return <div className='bs-full overflow-y-auto overflow-x-hidden'>{children}</div>
  } else {
    return (
      <PerfectScrollbar style={{ height: '100%' }} options={{ wheelPropagation: false }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

// ===== OBJETO DE STATUS (reutilizado) =====
export const statusObj = {
  busy: 'error' as const,
  away: 'warning' as const,
  online: 'success' as const,
  offline: 'secondary' as const
}

// ===== COMPONENTE PRINCIPAL =====
const ChatMonitoringSidebar = ({
  open,
  onClose,
  chatData,
  selectedProtocol,
  historyData,
  historyLoading,
  historyError,
  onRefreshHistory,
  onProtocolSelect,
  isBelowLgScreen,
  isBelowMdScreen,
  isBelowSmScreen,
  onEndChat
}: ChatMonitoringSidebarProps) => {
  // ===== ESTADOS INTERNOS =====
  const [actionState, setActionState] = useState<ActionState>({
    loading: null,
    error: null,
    success: null
  })

  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [filteredProtocols, setFilteredProtocols] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'recent' | 'resolved' | 'unresolved'>('all')
  const [chatStatus, setChatStatus] = useState<'active' | 'inactive' | 'resolved' | 'unresolved'>('active')

  const dispatch = useAppDispatch()
  const monitoringChats = useAppSelector((state: any) => state.monitoring?.chatsByProtocol || {})

  // ===== API HOOKS =====
  const [operatorToggle] = useOperatorToggleMutation()
  const [updateChatStatus] = useUpdateChatStatusMutation()

  const currentChat = useMemo(() => {
    return monitoringChats[selectedProtocol]
  }, [monitoringChats, selectedProtocol])

  const isAssumed = currentChat?.operator || false

  // ===== HANDLERS DAS AÇÕES COM CONTROLE DE ESTADO =====
  const handleAssumeChat = useCallback(async () => {
    console.log('🔍 ANTES - selectedProtocol:', selectedProtocol)
    console.log('🔍 ANTES - isAssumed:', isAssumed)

    if (!selectedProtocol) {
      console.warn('⚠️ Nenhum protocolo selecionado')

      return
    }

    setActionState(prev => ({ ...prev, loading: 'assume_chat', error: null }))

    try {
      // 1️⃣ Atualizar estado Redux (toggle)
      dispatch(toggleAssumeChat(selectedProtocol))

      // 2️⃣ Obter novo estado (após toggle)
      const newState = !isAssumed

      // 3️⃣ Chamar API para informar backend
      await operatorToggle({
        protocol: selectedProtocol,
        operator: newState
      }).unwrap()

      setActionState(prev => ({ ...prev, loading: null, success: 'assume_chat' }))
      setTimeout(() => setActionState(prev => ({ ...prev, success: null })), 3000)
    } catch (error) {
      // 🔄 Reverter estado Redux se API falhou
      dispatch(toggleAssumeChat(selectedProtocol))

      setActionState(prev => ({
        ...prev,
        loading: null,
        error: 'Erro ao assumir chat. Tente novamente.'
      }))
    }
  }, [selectedProtocol, isAssumed, dispatch, operatorToggle])

  const handleEndChat = useCallback(async () => {
    if (!selectedProtocol) {
      console.warn('⚠️ Nenhum protocolo selecionado para encerrar')

      return
    }

    setActionState(prev => ({ ...prev, loading: 'end_chat', error: null }))

    try {
      // 1️⃣ Alterar status para 'inactive' via API
      await updateChatStatus({
        protocol: selectedProtocol,
        status: 'inactive'
      }).unwrap()

      // 2️⃣ Atualizar estado local
      setChatStatus('inactive')

      // 3️⃣ Chamar callback externo se existir
      if (onEndChat) {
        await onEndChat()
      }

      // 4️⃣ Atualizar histórico após encerrar
      onRefreshHistory()

      setActionState(prev => ({ ...prev, loading: null, success: 'end_chat' }))
      setTimeout(() => setActionState(prev => ({ ...prev, success: null })), 3000)
    } catch (error) {
      console.error('❌ Erro ao encerrar chat:', error)
      setActionState(prev => ({
        ...prev,
        loading: null,
        error: 'Erro ao encerrar atendimento.'
      }))
    }
  }, [selectedProtocol, updateChatStatus, onEndChat, onRefreshHistory])

  // ===== HANDLER PARA MUDANÇA DE STATUS VIA RADIO =====
  const handleStatusChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const newStatus = event.target.value as 'active' | 'inactive' | 'resolved' | 'unresolved'

      if (!selectedProtocol) {
        console.warn('⚠️ Nenhum protocolo selecionado para alterar status')

        return
      }

      setActionState(prev => ({ ...prev, loading: 'update_status', error: null }))

      try {
        // Chamar API para alterar status
        await updateChatStatus({
          protocol: selectedProtocol,
          status: newStatus
        }).unwrap()

        // Atualizar estado local
        setChatStatus(newStatus)

        setActionState(prev => ({ ...prev, loading: null, success: 'update_status' }))
        setTimeout(() => setActionState(prev => ({ ...prev, success: null })), 2000)
      } catch (error) {
        console.error('❌ Erro ao alterar status:', error)
        setActionState(prev => ({
          ...prev,
          loading: null,
          error: 'Erro ao alterar status.'
        }))
      }
    },
    [selectedProtocol, updateChatStatus]
  )

  // ===== HELPERS =====
  const isLoading = (action: ActionType) => actionState.loading === action
  const isSuccess = (action: ActionType) => actionState.success === action

  // ===== FUNÇÕES DE BUSCA E FILTRO DE PROTOCOLOS =====
  const filterProtocolsByStatus = useCallback((protocols: any[], status: string) => {
    if (!protocols) return []

    switch (status) {
      case 'recent':
        const weekAgo = new Date()

        weekAgo.setDate(weekAgo.getDate() - 7)

        return protocols.filter(p => new Date(p.createdAt) >= weekAgo)

      case 'resolved':
        return protocols.filter(p => p.status === 'resolved' || p.resolved === true)

      case 'unresolved':
        return protocols.filter(p => p.status !== 'resolved' && p.resolved !== true)

      case 'all':
      default:
        return protocols
    }
  }, [])

  const searchProtocols = useCallback((protocols: any[], searchTerm: string) => {
    if (!searchTerm || !protocols) return protocols

    const term = searchTerm.toLowerCase()

    return protocols.filter(
      protocol =>
        protocol.protocol.toLowerCase().includes(term) ||
        protocol.clientName?.toLowerCase().includes(term) ||
        protocol.summary?.toLowerCase().includes(term) ||
        (protocol.history && protocol.history.some((msg: any) => msg.content.toLowerCase().includes(term)))
    )
  }, [])

  const applyFilters = useCallback(() => {
    if (!historyData?.data) {
      setFilteredProtocols([])

      return
    }

    let filtered = [...historyData.data]

    // Aplicar filtro por status
    filtered = filterProtocolsByStatus(filtered, filterStatus)

    // Aplicar busca por texto
    if (searchValue) {
      filtered = searchProtocols(filtered, searchValue)
    }

    // Ordenar por data (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Fixar protocolo ativo do CardMonitor no topo
    const activeProtocolFromMonitor = chatData?.protocol

    if (activeProtocolFromMonitor) {
      const activeProtocolIndex = filtered.findIndex(p => p.protocol === activeProtocolFromMonitor)

      if (activeProtocolIndex > 0) {
        const activeProtocol = filtered[activeProtocolIndex]
        const otherProtocols = filtered.filter(p => p.protocol !== activeProtocolFromMonitor)

        filtered = [activeProtocol, ...otherProtocols]
      }
    }

    setFilteredProtocols(filtered)
  }, [historyData?.data, filterStatus, searchValue, chatData?.protocol, filterProtocolsByStatus, searchProtocols])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const handleSearchChange = useCallback((event: any, newValue: string | null) => {
    setSearchValue(newValue)
  }, [])

  const handleProtocolSelection = useCallback(
    (protocolId: string) => {
      const protocol = filteredProtocols.find(p => p.protocol === protocolId)

      if (protocol) {
        onProtocolSelect(protocolId, protocol)
        setSearchValue(null)
      }
    },
    [filteredProtocols, onProtocolSelect]
  )

  const autocompleteOptions = useMemo(() => {
    if (!filteredProtocols) return []

    return filteredProtocols.map(protocol => ({
      label: `${protocol.protocol} - ${protocol.clientName || 'Cliente'}`,
      value: protocol.protocol,
      subtitle: protocol.summary || `${protocol.history?.length || 0} mensagens`,
      date: protocol.createdAt,
      isActive: protocol.protocol === selectedProtocol
    }))
  }, [filteredProtocols, selectedProtocol])

  if (!chatData) return null

  return (
    <Box>
      <Drawer
        open={open}
        onClose={onClose}
        className='bs-full'
        variant={!isBelowMdScreen ? 'permanent' : 'persistent'}
        ModalProps={{
          disablePortal: true,
          keepMounted: true
        }}
        sx={{
          height: '100%',
          zIndex: isBelowMdScreen && open ? 11 : 10,
          display: 'flex',
          flexDirection: 'column',
          position: !isBelowMdScreen ? 'static' : 'absolute',
          ...(isBelowSmScreen && open && { width: '100%' }),
          '& .MuiDrawer-paper': {
            overflow: 'hidden',
            boxShadow: 'none',
            width: isBelowSmScreen ? '100%' : '370px',
            position: !isBelowMdScreen ? 'static' : 'absolute',
            borderRadius: 0,
            borderRight: 1,
            borderColor: 'divider'
          }
        }}
      >
        {/* ===== HEADER DE BUSCA E FILTROS DE PROTOCOLOS ===== */}
        <div className='flex flex-col plb-[18px] pli-5 gap-4 border-be'>
          <div className='flex gap-4 items-center'>
            {isBelowMdScreen && (
              <IconButton className='p-0 mis-2' onClick={onClose}>
                <i className='ri-close-line' />
              </IconButton>
            )}
          </div>

          <div className='flex gap-2 items-center'>
            <Autocomplete
              fullWidth
              size='small'
              freeSolo
              id='search-protocols'
              options={autocompleteOptions.map(opt => opt.label)}
              value={searchValue}
              onChange={handleSearchChange}
              onInputChange={(event, newInputValue) => {
                setSearchValue(newInputValue || null)
              }}
              className=''
              renderInput={params => (
                <TextField
                  {...params}
                  variant='outlined'
                  placeholder='Buscar nos protocolos...'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 50
                    },
                    '& fieldset': {
                      borderRadius: 50
                    }
                  }}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='ri-search-line text-xl' />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              )}
              renderOption={(props, option) => {
                const optionData = autocompleteOptions.find(opt => opt.label === option)

                return (
                  <li
                    {...props}
                    key={optionData?.value}
                    className={classnames('gap-3 max-sm:pli-3', props.className)}
                    onClick={() => {
                      if (optionData) {
                        handleProtocolSelection(optionData.value)
                      }
                    }}
                  >
                    <div className='flex-auto'>
                      <Typography variant='body2' fontWeight={optionData?.isActive ? 'medium' : 'normal'}>
                        {optionData?.label}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {optionData?.subtitle}
                      </Typography>
                    </div>
                    {optionData?.isActive && <Chip label='Atual' size='small' color='primary' variant='outlined' />}
                  </li>
                )
              }}
            />
          </div>

          {(searchValue || filterStatus !== 'all') && (
            <Box display='flex' alignItems='center' gap={1}>
              <Typography variant='caption' color='text.secondary'>
                {filteredProtocols.length} de {historyData?.data?.length || 0} protocolos
              </Typography>
              {(searchValue || filterStatus !== 'all') && (
                <Button
                  size='small'
                  variant='text'
                  onClick={() => {
                    setSearchValue(null)
                    setFilterStatus('all')
                  }}
                  sx={{ minWidth: 'auto', p: 0.5, fontSize: '0.7rem' }}
                >
                  Limpar filtros
                </Button>
              )}
            </Box>
          )}
        </div>

        <ScrollWrapper isBelowLgScreen={isBelowLgScreen}>
          <Box paddingInline={4}>
            <Typography variant='h6' color='textPrimary' className='my-2'>
              Ações
            </Typography>

            {/* Mensagem de erro geral */}
            {actionState.error && (
              <Alert severity='error' sx={{ mb: 2, fontSize: '0.75rem' }}>
                {actionState.error}
              </Alert>
            )}

            <Box display='flex' flexDirection='column' gap={1}>
              {/* Botão: Assumir Chat */}
              <Button
                variant='contained'
                startIcon={
                  isLoading('assume_chat') ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : isSuccess('assume_chat') ? (
                    <UserCheck size={16} />
                  ) : (
                    <MessageSquare size={16} />
                  )
                }
                fullWidth
                size='small'
                onClick={handleAssumeChat}
                disabled={!!actionState.loading}
                color={isAssumed ? 'warning' : 'info'}
              >
                {isLoading('assume_chat')
                  ? isAssumed
                    ? 'Liberando...'
                    : 'Assumindo...'
                  : isSuccess('assume_chat')
                    ? isAssumed
                      ? 'Chat Liberado!'
                      : 'Chat Assumido!'
                    : isAssumed
                      ? 'Liberar Chat'
                      : 'Assumir Chat'}
              </Button>

              {/* Botão: Encerrar Atendimento */}
              <Button
                variant='contained'
                color='error'
                startIcon={
                  isLoading('end_chat') ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : isSuccess('end_chat') ? (
                    <UserCheck size={16} />
                  ) : (
                    <XCircle size={16} />
                  )
                }
                fullWidth
                size='small'
                onClick={handleEndChat}
                disabled={!!actionState.loading}
              >
                {isLoading('end_chat')
                  ? 'Encerrando...'
                  : isSuccess('end_chat')
                    ? 'Encerrado!'
                    : 'Encerrar Atendimento'}
              </Button>
            </Box>
          </Box>

          {/* ===== SEÇÃO DE STATUS ===== */}
          <Box sx={{ padding: 4 }}>
            <Typography variant='h6' color='textPrimary' mb={2}>
              Status do Chat
            </Typography>

            {/* Indicador de carregamento para mudanças de status */}
            {isLoading('update_status') && (
              <Box display='flex' alignItems='center' gap={1} mb={2}>
                <CircularProgress size={16} />
                <Typography variant='body2' color='text.secondary'>
                  Atualizando status...
                </Typography>
              </Box>
            )}

            <RadioGroup
              row
              aria-label='chat-status'
              name='chat-status'
              value={chatStatus}
              onChange={handleStatusChange}
              sx={{
                gap: 1,
                opacity: isLoading('update_status') ? 0.6 : 1,
                pointerEvents: isLoading('update_status') ? 'none' : 'auto'
              }}
            >
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    value='active'
                    control={<Radio size='small' />}
                    label={
                      <Typography variant='body2'>
                        Ativo {isSuccess('update_status') && chatStatus === 'active' && '✓'}
                      </Typography>
                    }
                    disabled={!!actionState.loading}
                  />
                  <FormControlLabel
                    value='resolved'
                    control={<Radio size='small' />}
                    label={
                      <Typography variant='body2'>
                        Resolvido {isSuccess('update_status') && chatStatus === 'resolved' && '✓'}
                      </Typography>
                    }
                    disabled={!!actionState.loading}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    value='inactive'
                    control={<Radio size='small' />}
                    label={
                      <Typography variant='body2'>
                        Inativo {isSuccess('update_status') && chatStatus === 'inactive' && '✓'}
                      </Typography>
                    }
                    disabled={!!actionState.loading}
                  />
                  <FormControlLabel
                    value='unresolved'
                    control={<Radio size='small' />}
                    label={
                      <Typography variant='body2'>
                        Não Resolvido {isSuccess('update_status') && chatStatus === 'unresolved' && '✓'}
                      </Typography>
                    }
                    disabled={!!actionState.loading}
                  />
                </Grid>
              </Grid>
            </RadioGroup>
          </Box>

          {/* ===== HISTÓRICO DE INTERAÇÕES COM FILTROS ===== */}
          <Box px={4}>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={1}>
              <Typography variant='h6' color='textPrimary'>
                Historico de interações com este cliente:
              </Typography>
            </Box>

            {/* Loading State */}
            {historyLoading && (
              <Box display='flex' alignItems='center' gap={1} py={2}>
                <CircularProgress size={16} />
                <Typography variant='body2' color='text.secondary'>
                  Carregando protocolos...
                </Typography>
              </Box>
            )}

            {/* Error State */}
            {historyError && (
              <Alert severity='error' sx={{ mb: 2 }}>
                <Typography variant='body2'>{historyError}</Typography>
                <Button size='small' onClick={() => window.location.reload()}>
                  Tentar novamente
                </Button>
              </Alert>
            )}

            {/* Data State - Usa os protocolos filtrados */}
            {historyData && !historyLoading && (
              <>
                {filteredProtocols.length === 0 ? (
                  <Box textAlign='center' py={3}>
                    <MessageCircleIcon size={32} color='#ccc' />
                    <Typography variant='body2' color='text.secondary' mt={1}>
                      {searchValue || filterStatus !== 'all'
                        ? 'Nenhum protocolo encontrado com os filtros aplicados'
                        : 'Primeiro contato do cliente'}
                    </Typography>
                    {(searchValue || filterStatus !== 'all') && (
                      <Button
                        size='small'
                        variant='text'
                        onClick={() => {
                          setSearchValue(null)
                          setFilterStatus('all')
                        }}
                        sx={{ mt: 1 }}
                      >
                        Limpar filtros
                      </Button>
                    )}
                  </Box>
                ) : (
                  <>
                    <Box sx={{ width: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
                      <ProtocolHistoryList
                        historyData={filteredProtocols}
                        currentProtocol={selectedProtocol}
                        onProtocolSelect={onProtocolSelect}
                      />
                    </Box>
                  </>
                )}
              </>
            )}
          </Box>
        </ScrollWrapper>
      </Drawer>
    </Box>
  )
}

export default ChatMonitoringSidebar
