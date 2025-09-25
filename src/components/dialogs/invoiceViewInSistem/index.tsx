// file: src/components/InvoiceViewModal/InvoiceViewModal.tsx
'use client'

import React from 'react'

import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  IconButton,
  Button,
  Box,
  CircularProgress,
  Alert,
  Typography
} from '@mui/material'

import InvoiceContent from './InvoiceContent'
import { useBuildInvoiceQuery } from '@/api/endpoints/invoices/buildInvoice'
import PreviewCard from '@/views/invoice/preview/PreviewCard'

interface InvoiceViewModalProps {
  open: boolean
  onClose: () => void
  paymentId: string | null
  title?: string
  showDownloadButton?: boolean
  showCloseButton?: boolean
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
  fullWidth?: boolean
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  open,
  onClose,
  paymentId,
  title = 'Visualizar Fatura',
  showDownloadButton = true,
  showCloseButton = true,
  maxWidth = 'lg',
  fullWidth = true
}) => {
  const {
    data: invoiceResponse,
    isLoading,
    error
  } = useBuildInvoiceQuery(paymentId || '', {
    skip: !paymentId || !open
  })

  const invoice = invoiceResponse?.data

  const handleClose = () => {
    onClose()
  }

  if (!open) return null

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '95vh'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='h6' component='div'>
          {title} {invoice && `#${invoice.invoiceNumber}`}
        </Typography>

        <IconButton
          aria-label='close'
          onClick={handleClose}
          sx={{
            color: theme => theme.palette.grey[500]
          }}
        >
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {!paymentId ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity='error'>ID do pagamento não fornecido</Alert>
          </Box>
        ) : isLoading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress size={40} />
            <Typography sx={{ ml: 2 }}>Carregando fatura...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity='error'>Erro ao carregar dados da fatura. Tente novamente.</Alert>
          </Box>
        ) : !invoice ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity='warning'>Dados da fatura não encontrados</Alert>
          </Box>
        ) : (
          <PreviewCard id={''} />
        )}
      </DialogContent>

      {(showDownloadButton || showCloseButton) && invoice && (
        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderTopColor: 'divider' }}>
          {showCloseButton && (
            <Button onClick={handleClose} variant='outlined' color='secondary'>
              Fechar
            </Button>
          )}

          {showDownloadButton && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<i className='ri-download-line' />}
              onClick={() => {
                // Implementar download da fatura
                console.log('Download fatura:', invoice.id)
              }}
            >
              Baixar PDF
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  )
}

export default InvoiceViewModal
