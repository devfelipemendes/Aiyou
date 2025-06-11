'use client'
import { useEffect, useState } from 'react'

import { Box, Chip, Typography } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'

import ChatWrapper from './chat/page'
import { useWebSocket } from '@/hooks/useWebSoccket'

// 🔥 COMPONENTE PERSONALIZADO: Dialog com tamanho customizado
const LargeChatDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    // 🎯 TAMANHO: 90% da tela (width e height)
    width: '90vw',
    height: '90vh',
    maxWidth: 'none', // ✅ Remove limitação padrão do MUI
    maxHeight: 'none', // ✅ Remove limitação de altura
    margin: 'auto',

    // 📱 RESPONSIVO: Ajustes para telas menores
    [theme.breakpoints.down('md')]: {
      width: '95vw',
      height: '95vh',
      margin: 8
    },

    // 📱 MOBILE: Tela cheia em dispositivos muito pequenos
    [theme.breakpoints.down('sm')]: {
      width: '100vw',
      height: '100vh',
      margin: 0,
      borderRadius: 0
    }
  }
}))

// 🔥 COMPONENTE PERSONALIZADO: DialogContent sem padding excessivo
const LargeChatDialogContent = styled(DialogContent)(() => ({
  // ✅ Remove padding padrão para maximizar espaço
  padding: 0,

  // ✅ Permite que o conteúdo ocupe 100% da altura disponível
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden' // Evita scroll duplo
}))

// 🔥 COMPONENTE PERSONALIZADO: Header do dialog
const ChatDialogHeader = styled(DialogTitle)(({ theme }) => ({
  // 🎨 VISUAL: Header compacto e informativo
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.paper,

  // 📱 MOBILE: Header ainda mais compacto
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5, 1)
  }
}))

type ChatViewProps = {
  open: boolean
  setOpen: (open: boolean) => void
  clientId: string
  clientData: any
  messages: any
  channel: any
  operatorName: any
  protocolId?: string | null
  projectId?: string | null
}

const ChatViewDialog = ({
  open,
  setOpen,
  clientId,
  clientData,
  messages,
  channel,
  operatorName,
  protocolId = null,
  projectId = null
}: ChatViewProps) => {
  const { isConnected, connectionStatus } = useWebSocket()
  const [showConnectionInfo, setShowConnectionInfo] = useState(true)

  useEffect(() => {
    if (isConnected && showConnectionInfo) {
      const timer = setTimeout(() => {
        setShowConnectionInfo(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isConnected, showConnectionInfo])

  // 🔧 FUNÇÃO: Fechar dialog
  const handleClose = () => {
    setOpen(false)
  }

  // 🔧 FUNÇÃO: Gerar IDs para WebSocket baseado nos dados
  const getWebSocketIds = () => {
    // 🎯 LÓGICA: Extrair/gerar IDs baseado na estrutura do seu backend
    const derivedProtocolId = protocolId || clientData?.protocolId || `PROT_${clientId}`
    const derivedProjectId = projectId || clientData?.projectId || clientId

    return {
      protocolId: derivedProtocolId,
      clientId: derivedProjectId
    }
  }

  const webSocketIds = getWebSocketIds()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'success'
      case 'connecting':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'default'
    }
  }

  console.log(clientData, messages)

  return (
    <LargeChatDialog
      open={open}
      onClose={handleClose}
      maxWidth={false} // ✅ Remove limitação de largura
      fullWidth={true} // ✅ Usa largura total disponível
      closeAfterTransition={false}
      disableEscapeKeyDown={false} // Permite ESC para fechar
      TransitionProps={{
        timeout: 300
      }}
    >
      {/* 🔥 HEADER: Informações do chat e botão fechar */}
      <ChatDialogHeader>
        <div>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
            <Typography variant='body2' color='text.secondary'>
              {channel} • {operatorName}
            </Typography>

            {/* 🔥 NOVO: Status de Conexão WebSocket */}
            {showConnectionInfo && (
              <Chip
                label={`🔌 ${connectionStatus}`}
                color={getStatusColor(connectionStatus)}
                size='small'
                variant={isConnected ? 'filled' : 'outlined'}
              />
            )}
          </Box>
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
              <Chip label={`Protocol: ${webSocketIds.protocolId}`} size='small' variant='outlined' color='primary' />
              <Chip label={`Client: ${webSocketIds.clientId}`} size='small' variant='outlined' color='secondary' />
            </Box>
          )}
        </div>

        {/* ✅ BOTÃO FECHAR: Sempre visível */}
        <IconButton
          onClick={handleClose}
          size='small'
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          <i className='ri-close-line' />
        </IconButton>
      </ChatDialogHeader>

      {/* 🔥 CONTEÚDO: Maximiza espaço para o chat */}
      <LargeChatDialogContent>
        {/* 🔥 COMPONENTE PRINCIPAL: ChatWrapper ocupa todo espaço disponível */}
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <ChatWrapper
            protocolId={webSocketIds.protocolId}
            clientId={webSocketIds.clientId}
            autoConnct={true}
            showDebugInfo={process.env.NODE_ENV === 'development'}
          />
        </div>
      </LargeChatDialogContent>
    </LargeChatDialog>
  )
}

export default ChatViewDialog
