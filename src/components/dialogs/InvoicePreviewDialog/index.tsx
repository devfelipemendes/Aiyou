// file: src/components/dialogs/InvoicePreviewDialog.tsx
'use client'

import { Dialog, DialogContent, DialogTitle, IconButton, Box, useMediaQuery, useTheme } from '@mui/material'

import PreviewCard from '@/views/invoice/preview/PreviewCard'

interface InvoicePreviewDialogProps {
  open: boolean
  onClose: () => void
  paymentId: string | null
  title?: string
}

export const InvoicePreviewDialog = ({ open, onClose, paymentId, title = 'Fatura' }: InvoicePreviewDialogProps) => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))

  if (!paymentId) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
      fullScreen={fullScreen}
      scroll='paper'
      PaperProps={{
        sx: {
          maxHeight: fullScreen ? '100vh' : '90vh',
          m: fullScreen ? 0 : 2
        }
      }}
    >
      <DialogTitle className='flex items-center justify-between'>
        <span>{title}</span>
        <IconButton onClick={onClose} size='small' aria-label='fechar'>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ width: '100%' }}>
          <PreviewCard id={paymentId} />
        </Box>
      </DialogContent>
    </Dialog>
  )
}
