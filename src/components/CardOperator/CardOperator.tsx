import { useState } from 'react'

import Grid from '@mui/material/Grid2'
import { Card, CardContent, Typography, Avatar, Chip, Link, Tooltip, IconButton, useTheme } from '@mui/material'

import { getInitials } from '@/utils/getInitials'
import { formatNumberBR } from '@/utils/masks'
import { useDeleteOperatorMutation } from '@/api/endpoints/operator/operator'
import ConfirmDialog from '../dialogs/confirmation-dialog'

const CardOperator = ({ operator, onClick }: { operator: any; onClick: () => void }) => {
  const theme = useTheme()

  // 🔹 Estado do ConfirmDialog
  const [confirmDialog, setConfirmDialog] = useState({ open: false, loading: false })

  const [deleteOperator] = useDeleteOperatorMutation()

  // Abrir diálogo
  const handleOpenDelete = () => setConfirmDialog({ ...confirmDialog, open: true })

  // Cancelar exclusão
  const handleCancelDelete = () => setConfirmDialog({ open: false, loading: false })

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    setConfirmDialog({ ...confirmDialog, loading: true })

    try {
      await deleteOperator({ user_id: operator.id }).unwrap()

      // Aqui você pode mostrar um toast/sucesso se quiser
      setConfirmDialog({ open: false, loading: false })
    } catch (error) {
      console.error('Erro ao deletar operador:', error)
      setConfirmDialog({ open: false, loading: false })
    }
  }

  return (
    <Grid size={{ xs: 12, sm: 12, md: 12 }}>
      <Card className='relative'>
        <CardContent className='flex items-center flex-col gap-6'>
          <Avatar className='mbs-2 bs-[100px] is-[100px] text-[25px]'>
            {getInitials(operator.user.name).toLocaleUpperCase()}
          </Avatar>
          <div className='flex flex-col items-center'>
            <Typography variant='h5'>{operator.user.name}</Typography>
          </div>

          <div className='flex items-center gap-1'>
            <Link>
              <Chip variant='tonal' label={operator.user.email} color={'primary'} size='small' />
            </Link>
            <Link>
              <Chip variant='tonal' label={operator.user.phone_number} color={'primary'} size='small' />
            </Link>
          </div>

          <div className='flex is-full items-center justify-around flex-wrap'>
            <div className='flex items-center flex-col'>
              <Typography variant='h5'>{formatNumberBR(operator.user.plan_usage.total_tokens)}</Typography>
              <Typography>Total Tokens</Typography>
            </div>
          </div>

          <div
            className='flex w-full justify-center gap-4 mt-4 flex-shrink-0 border-t pt-3'
            style={{ borderColor: theme.palette.divider }}
          >
            <Tooltip title='Editar operador'>
              <IconButton color='primary' size='small'>
                <i className='ri-edit-line' />
              </IconButton>
            </Tooltip>

            <Tooltip title='Remover operador'>
              <IconButton color='error' size='small' onClick={handleOpenDelete}>
                <i className='ri-delete-bin-line' />
              </IconButton>
            </Tooltip>

            <Tooltip title='Visualizar operador'>
              <IconButton onClick={onClick} color='info' size='small'>
                <i className='ri-eye-line' />
              </IconButton>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDialog.open}
        loading={confirmDialog.loading}
        type='error'
        title='Deletar Operador'
        message={`Tem certeza que deseja deletar o operador "${operator.user.name}"?`}
        subtitle='Esta ação não pode ser desfeita.'
        confirmText='Deletar'
        cancelText='Cancelar'
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Grid>
  )
}

export default CardOperator
