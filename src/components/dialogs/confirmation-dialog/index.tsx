import React from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  useTheme
} from '@mui/material'

export interface ConfirmDialogProps {
  open: boolean

  /** Título do dialog */
  title: string

  /** Mensagem principal */
  message: string

  /** Mensagem adicional (opcional) */
  subtitle?: string

  /** Texto do botão de confirmação */
  confirmText?: string

  /** Texto do botão de cancelamento */
  cancelText?: string

  /** Tipo de ação - afeta a cor do botão */
  type?: 'default' | 'warning' | 'error' | 'success'

  /** Se está executando a ação (loading) */
  loading?: boolean

  /** Callback quando confirmar */
  onConfirm: () => void

  /** Callback quando cancelar */
  onCancel: () => void

  /** Ícone opcional */
  icon?: React.ReactNode
}

export default function ConfirmDialog({
  open,
  title,
  message,
  subtitle,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'default',
  loading = false,
  onConfirm,
  onCancel,
  icon
}: ConfirmDialogProps) {
  const theme = useTheme()

  // Cores baseadas no tipo
  const getButtonColor = () => {
    switch (type) {
      case 'error':
        return 'error'
      case 'warning':
        return 'warning'
      case 'success':
        return 'success'
      default:
        return 'primary'
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return theme.palette.error.main
      case 'warning':
        return theme.palette.warning.main
      case 'success':
        return theme.palette.success.main
      default:
        return theme.palette.primary.main
    }
  }

  const getDefaultIcon = () => {
    switch (type) {
      case 'error':
        return <i className='ri-delete-bin-line' style={{ fontSize: '48px', color: getIconColor() }} />
      case 'warning':
        return <i className='ri-alert-line' style={{ fontSize: '48px', color: getIconColor() }} />
      case 'success':
        return <i className='ri-check-line' style={{ fontSize: '48px', color: getIconColor() }} />
      default:
        return <i className='ri-question-line' style={{ fontSize: '48px', color: getIconColor() }} />
    }
  }

  return (
    <Dialog
      open={open}
      onClose={!loading ? onCancel : undefined}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        style: {
          borderRadius: 12
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
        {/* Ícone */}
        <Box sx={{ mb: 2 }}>{icon || getDefaultIcon()}</Box>

        {/* Título */}
        <Typography variant='h6' component='div' fontWeight='600'>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', px: 3, py: 2 }}>
        {/* Mensagem principal */}
        <Typography variant='body1' sx={{ mb: subtitle ? 1 : 0 }}>
          {message}
        </Typography>

        {/* Mensagem adicional */}
        {subtitle && (
          <Typography variant='body2' color='text.secondary'>
            {subtitle}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, px: 3, pb: 3 }}>
        {/* Botão Cancelar */}
        <Button onClick={onCancel} variant='outlined' disabled={loading} sx={{ minWidth: 100 }}>
          {cancelText}
        </Button>

        {/* Botão Confirmar */}
        <Button
          onClick={onConfirm}
          variant='contained'
          color={getButtonColor()}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
          sx={{ minWidth: 100 }}
        >
          {loading ? 'Processando...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Hook para facilitar o uso
export function useConfirmDialog() {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const openDialog = React.useCallback(() => {
    setOpen(true)
  }, [])

  const closeDialog = React.useCallback(() => {
    if (!loading) {
      setOpen(false)
    }
  }, [loading])

  const setLoadingState = React.useCallback((isLoading: boolean) => {
    setLoading(isLoading)
  }, [])

  return {
    open,
    loading,
    openDialog,
    closeDialog,
    setLoading: setLoadingState
  }
}
