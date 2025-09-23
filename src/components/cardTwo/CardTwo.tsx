import { useState } from 'react'

import { styled } from '@mui/material/styles'
import { Box, Card, CardContent, IconButton, Tooltip, Typography } from '@mui/material'

import ConfirmDialog from '../dialogs/confirmation-dialog'
import { useDeleteOperatorMutation } from '@/api/endpoints/operator/operator'
import { useGetProjectsQuery } from '@/api/endpoints/Projects/project'
import EditOperatorDialog from '../dialogs/edit-operator/EditOperatorDialog'

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  '&:hover': {
    boxShadow: theme.shadows[4]
  }
}))

const OperatorAvatar = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: 16,
  marginRight: '1rem'
}))

const CardTwo = ({ operator, refetch }: { operator: any; refetch: () => Promise<any> }) => {
  // Dados fictícios
  const [confirmDialog, setConfirmDialog] = useState({ open: false, loading: false })
  const { data: projectsResponse } = useGetProjectsQuery()
  const [deleteOperator] = useDeleteOperatorMutation()
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // Abrir diálogo
  const handleOpenDelete = () => setConfirmDialog({ ...confirmDialog, open: true })
  const handleOpenEdit = () => setEditDialogOpen(true)
  const handleCloseEdit = () => setEditDialogOpen(false)

  // Cancelar exclusão
  const handleCancelDelete = () => setConfirmDialog({ open: false, loading: false })

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    setConfirmDialog({ ...confirmDialog, loading: true })

    try {
      await deleteOperator({ project_operator_id: operator.id }).unwrap()

      // Aqui você pode mostrar um toast/sucesso se quiser
      setConfirmDialog({ open: false, loading: false })
    } catch (error) {
      console.error('Erro ao deletar operador:', error)
      setConfirmDialog({ open: false, loading: false })
    }
  }

  return (
    <StyledCard variant='outlined'>
      <CardContent sx={{ p: 3 }} className='relative'>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 2, marginBottom: 6 }}>
          {/* Avatar inicial do operador */}

          <OperatorAvatar>{operator.user.name.split(' ')[0][0]}</OperatorAvatar>

          <Box sx={{ flex: 1 }}>
            {/* Nome e status */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, height: '100%' }}>
              <Typography variant='h6' sx={{ fontWeight: 600 }}>
                {operator.user.name}
              </Typography>
              <i className='ri-customer-service-2-fill absolute right-0  mr-8 mt-2 text-[35px] text-primary' />
            </Box>

            <Box className='flex flex-col gap-1 mt-2'>
              <Typography className='flex flex-row gap-2 items-center' variant='body1' color='textSecondary'>
                Email:<Typography variant='body2'> {operator.user.email}</Typography>
              </Typography>
              <Typography className='flex flex-row gap-2 items-center' variant='body1' color='textSecondary'>
                CPF/CNPJ: <Typography variant='body2'>{operator.user.identifier}</Typography>
              </Typography>
              <Typography className='flex flex-row gap-2 items-center' variant='body1' color='textSecondary'>
                Telefone:<Typography variant='body2'>{operator.user.phone_number}</Typography>{' '}
                <Typography variant='body2' className='text-primary'>
                  |
                </Typography>
                WhatsApp:
                <Typography variant='body2'> {operator.user.whatsapp_number}</Typography>
              </Typography>
            </Box>
            {/* Informações de contato */}
          </Box>
          <Box className='absolute right-0 bottom-0 p-2'>
            <Tooltip title='Remover operador'>
              <IconButton color='error' size='medium'>
                <i className='ri-delete-bin-line' onClick={handleOpenDelete} />
              </IconButton>
            </Tooltip>

            <Tooltip title='Editar operador'>
              <IconButton color='primary' size='medium'>
                <i className='ri-edit-line' onClick={handleOpenEdit} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Typography
          className='flex flex-row gap-2 items-center absolute bottom-0'
          variant='body1'
          color='textSecondary'
        >
          ID Projeto: <Typography variant='body2'>{operator.project_id}</Typography>
        </Typography>
      </CardContent>
      {projectsResponse && (
        <EditOperatorDialog
          open={editDialogOpen}
          onClose={handleCloseEdit}
          projects={projectsResponse?.data} // lista de projetos
          user_id={operator.user.id} // id do usuário
          project_id={operator.project_id}
          refetch={refetch}
        />
      )}

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
    </StyledCard>
  )
}

export default CardTwo
