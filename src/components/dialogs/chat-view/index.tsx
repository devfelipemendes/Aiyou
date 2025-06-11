'use client'
import { Typography } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'

import ChatWrapper from './chat/page'

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
}

const ChatViewDialog = ({ open, setOpen, clientId, clientData, messages, channel, operatorName }: ChatViewProps) => {
  const handleClose = () => {
    setOpen(false)
  }

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
          <Typography variant='h6' component='div'>
            Chat - {clientId}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {channel} • {operatorName}
          </Typography>
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
          <ChatWrapper />
        </div>
      </LargeChatDialogContent>
    </LargeChatDialog>
  )
}

export default ChatViewDialog

/*
🎓 EXPLICAÇÃO DIDÁTICA:

1. 🎯 PROBLEMA RESOLVIDO:
   - Material-UI Dialog tem maxWidth="sm" (600px) por padrão
   - Não tinha altura definida
   - Padding excessivo reduzia espaço útil

2. ✅ SOLUÇÕES IMPLEMENTADAS:
   
   A) TAMANHO CUSTOMIZADO:
      - width: '90vw' = 90% da largura da tela
      - height: '90vh' = 90% da altura da tela
      - maxWidth: 'none' = Remove limitação do MUI
   
   B) RESPONSIVIDADE:
      - Desktop: 90% da tela
      - Tablet: 95% da tela
      - Mobile: Tela cheia (100%)
   
   C) OTIMIZAÇÃO DE ESPAÇO:
      - Header compacto com informações essenciais
      - Conteúdo sem padding desnecessário
      - ChatWrapper ocupa 100% do espaço disponível

3. 🔧 COMO USAR:
   - Substitua o arquivo index.tsx pelo código acima
   - O dialog agora será bem maior
   - Mantém funcionalidade de fechar (ESC, X, backdrop)

4. 🎨 CUSTOMIZAÇÕES FUTURAS:
   - Ajuste as porcentagens (90vw/90vh) conforme necessário
   - Modifique breakpoints para outros tamanhos
   - Adicione animações personalizadas

5. 📱 BENEFÍCIOS:
   - Máximo aproveitamento da tela
   - Experiência mobile otimizada
   - Interface limpa e profissional
   - Performance mantida
*/
