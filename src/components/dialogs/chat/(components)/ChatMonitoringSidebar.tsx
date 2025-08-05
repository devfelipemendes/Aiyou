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
import { MessageSquare, UserPlus, MessageCircle, User, XCircle, UserCheck, MessageCircleIcon } from 'lucide-react'

// Component Imports

// Types
import type { ChatWithHistory } from '@/api/endpoints/chat/history'
import { ProtocolHistoryList } from './ProtocolHistoryList'
import { useAppDispatch, useAppSelector } from '@/redux-store'
import { useOperatorToggleMutation } from '@/api/endpoints/chat/operatorMode'
import { toggleAssumeChat } from '@/redux-store/slices/monitoring'

// Utils

// ===== TIPOS ESPECÍFICOS PARA O SIDEBAR =====
type ActionType = 'assume_chat' | 'transfer_operator' | 'add_comment' | 'client_details' | 'end_chat'

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
  onProtocolSelect,
  isBelowLgScreen,
  isBelowMdScreen,
  isBelowSmScreen,
  onTransferOperator,
  onAddComment,
  onClientDetails,
  onEndChat
}: ChatMonitoringSidebarProps) => {
  // ===== ESTADOS INTERNOS =====
  const [actionState, setActionState] = useState<ActionState>({
    loading: null,
    error: null,
    success: null
  })

  // const [userSidebar, setUserSidebar] = useState(false)
  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [filteredProtocols, setFilteredProtocols] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'recent' | 'resolved' | 'unresolved'>('all')

  const [value, setValue] = useState<string>('controlled-checked')

  const dispatch = useAppDispatch()

  const monitoringChats = useAppSelector((state: any) => state.monitoring?.chatsByProtocol || {})

  const [operatorToggle] = useOperatorToggleMutation()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value)
  }

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

  const handleTransferOperator = useCallback(async () => {
    setActionState(prev => ({ ...prev, loading: 'transfer_operator', error: null }))

    try {
      if (onTransferOperator) {
        await onTransferOperator()
      }

      setActionState(prev => ({ ...prev, loading: null, success: 'transfer_operator' }))
      setTimeout(() => setActionState(prev => ({ ...prev, success: null })), 3000)
    } catch (error) {
      setActionState(prev => ({
        ...prev,
        loading: null,
        error: 'Erro ao transferir chat.'
      }))
    }
  }, [onTransferOperator])

  const handleAddComment = useCallback(async () => {
    setActionState(prev => ({ ...prev, loading: 'add_comment', error: null }))

    try {
      if (onAddComment) {
        await onAddComment()
      }

      setActionState(prev => ({ ...prev, loading: null, success: 'add_comment' }))
      setTimeout(() => setActionState(prev => ({ ...prev, success: null })), 3000)
    } catch (error) {
      setActionState(prev => ({
        ...prev,
        loading: null,
        error: 'Erro ao adicionar comentário.'
      }))
    }
  }, [onAddComment])

  const handleEndChat = useCallback(async () => {
    setActionState(prev => ({ ...prev, loading: 'end_chat', error: null }))

    try {
      if (onEndChat) {
        await onEndChat()
      }

      setActionState(prev => ({ ...prev, loading: null, success: 'end_chat' }))
    } catch (error) {
      setActionState(prev => ({
        ...prev,
        loading: null,
        error: 'Erro ao encerrar atendimento.'
      }))
    }
  }, [onEndChat])

  // ===== HELPERS =====
  const isLoading = (action: ActionType) => actionState.loading === action
  const isSuccess = (action: ActionType) => actionState.success === action

  // ===== FUNÇÕES DE BUSCA E FILTRO DE PROTOCOLOS =====

  // Filtrar protocolos baseado no status
  const filterProtocolsByStatus = useCallback((protocols: any[], status: string) => {
    if (!protocols) return []

    switch (status) {
      case 'recent':
        // Protocolos dos últimos 7 dias
        const weekAgo = new Date()

        weekAgo.setDate(weekAgo.getDate() - 7)

        return protocols.filter(p => new Date(p.createdAt) >= weekAgo)

      case 'resolved':
        // Protocolos marcados como resolvidos
        return protocols.filter(p => p.status === 'resolved' || p.resolved === true)

      case 'unresolved':
        // Protocolos não resolvidos
        return protocols.filter(p => p.status !== 'resolved' && p.resolved !== true)

      case 'all':
      default:
        return protocols
    }
  }, [])

  // Buscar protocolos por texto
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

  // Aplicar filtros combinados
  // Aplicar filtros combinados
  // Aplicar filtros combinados
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

    // 🎯 NOVA LÓGICA CORRIGIDA: Fixar protocolo ativo do CardMonitor no topo
    const activeProtocolFromMonitor = chatData?.protocol // <- Protocolo FIXO do CardMonitor

    if (activeProtocolFromMonitor) {
      const activeProtocolIndex = filtered.findIndex(p => p.protocol === activeProtocolFromMonitor)

      if (activeProtocolIndex > 0) {
        // Se o protocolo ativo existe e não está em primeiro lugar
        const activeProtocol = filtered[activeProtocolIndex]
        const otherProtocols = filtered.filter(p => p.protocol !== activeProtocolFromMonitor)

        // Reorganizar: [protocoloAtivoDoCardMonitor, ...demaisProtocolos]
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
        setSearchValue(null) // Limpar busca após seleção
      }
    },
    [filteredProtocols, onProtocolSelect]
  )

  // Gerar opções para o autocomplete
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

  // const clientStatus = chatData.status === 'active' ? 'Ativo' : 'Inativo'

  return (
    <Box>
      {/* ===== DRAWER PRINCIPAL (estrutura adaptada do SidebarLeft) ===== */}
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
          {/* Linha 1: Avatar do cliente + Info básica */}
          <div className='flex gap-4 items-center'>
            {/* Botão fechar em telas pequenas */}
            {isBelowMdScreen && (
              <IconButton className='p-0 mis-2' onClick={onClose}>
                <i className='ri-close-line' />
              </IconButton>
            )}
          </div>

          {/* Linha 2: Busca de protocolos */}
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
                      borderRadius: 50 // ou use '8px' diretamente
                    },
                    '& fieldset': {
                      borderRadius: 50 // também garante o arredondamento da borda do contorno
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

          {/* Info sobre filtros ativos */}
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
                color={isAssumed ? 'warning' : 'info'} // 🔥 Cor muda baseado no estado
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
                      : 'Assumir Chat'}{' '}
                {/* 🔥 Texto toggle */}
              </Button>

              {/* Botão: Transferir Operador */}
              <Button
                variant='contained'
                startIcon={
                  isLoading('transfer_operator') ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : isSuccess('transfer_operator') ? (
                    <UserCheck size={16} />
                  ) : (
                    <UserPlus size={16} />
                  )
                }
                fullWidth
                size='small'
                onClick={handleTransferOperator}
                disabled={!!actionState.loading}
                color={'primary'}
              >
                {isLoading('transfer_operator')
                  ? 'Transferindo...'
                  : isSuccess('transfer_operator')
                    ? 'Transferido!'
                    : 'Transferir Para Outro Operador'}
              </Button>

              {/* Botão: Adicionar Comentário */}
              <Button
                variant='contained'
                startIcon={
                  isLoading('add_comment') ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : isSuccess('add_comment') ? (
                    <UserCheck size={16} />
                  ) : (
                    <MessageCircle size={16} />
                  )
                }
                fullWidth
                size='small'
                onClick={handleAddComment}
                disabled={!!actionState.loading}
                color={'primary'}
              >
                {isLoading('add_comment')
                  ? 'Adicionando...'
                  : isSuccess('add_comment')
                    ? 'Comentário Adicionado!'
                    : 'Adicionar Comentário'}
              </Button>

              {/* Botão: Detalhes do Cliente */}
              <Button
                variant='contained'
                startIcon={isSuccess('client_details') ? <UserCheck size={16} /> : <User size={16} />}
                fullWidth
                size='small'
                onClick={onClientDetails}
                disabled={!!actionState.loading}
                color={'primary'}
              >
                {isSuccess('client_details') ? 'Abrindo Detalhes!' : 'Ir Para Detalhes Do Cliente'}
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
            <Typography variant='h6' color='textPrimary'>
              Status
            </Typography>
            <Grid container spacing={6}>
              <RadioGroup row aria-label='controlled' name='controlled' value={value} onChange={handleChange}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel value='controlled-checked' control={<Radio />} label='Ativo' />
                  <FormControlLabel value='controlled-unchecked' control={<Radio />} label='Encerrado' />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel value='uncontrolled-checked' control={<Radio />} label='Inativo' />
                  <FormControlLabel value='uncontrolled-unchecked' control={<Radio />} label='Campanha' />
                </Grid>
              </RadioGroup>
            </Grid>
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
