import { useState } from 'react'

import { styled } from '@mui/material/styles'
import type { ButtonProps } from '@mui/material'
import { Box, Button, Card, CardContent, Collapse, Divider, IconButton, Tooltip, Typography } from '@mui/material'

import ConfirmDialog from '../dialogs/confirmation-dialog'
import { useDeleteOperatorMutation } from '@/api/endpoints/operator/operator'
import { useGetProjectsQuery } from '@/api/endpoints/Projects/project'
import EditOperatorDialog from '../dialogs/edit-operator/EditOperatorDialog'
import CustomAvatar from '@/@core/components/mui/Avatar'
import AddOperatorToProject from '../dialogs/add-operator-to-project/AddOperatorToProject'
import OpenDialogOnElementClick from '../dialogs/OpenDialogOnElementClick'

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

const buttonProps: ButtonProps = {
  variant: 'outlined',
  endIcon: <i className='ri-add-line text-[20px]' />,
  children: ' Vincular um projeto ao operador',
  className: 'w-full flex justify-center items-center',
  size: 'small'
}

const CardTwo = ({ operator, refetch }: { operator: any; refetch: () => Promise<any> }) => {
  // Dados fictícios
  const [confirmDialog, setConfirmDialog] = useState({ open: false, loading: false })
  const { data: projectsResponse } = useGetProjectsQuery()
  const [deleteOperator] = useDeleteOperatorMutation()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [openProjects, setOpenProjects] = useState(false)

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
    <StyledCard variant='outlined' className='px-4 pt-4'>
      <CardContent className='relative'>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 2, height: '100%' }}>
          <Box className='flex flex-row w-full items-center gap-2'>
            <OperatorAvatar>{operator.name.split(' ')[0][0]}</OperatorAvatar>

            <Box sx={{ flex: 1 }}>
              {/* Nome e status */}
              <Box
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, height: '100%' }}
              >
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  {operator.name}
                </Typography>
                <i className='ri-customer-service-2-fill absolute right-0  mr-8 mt-2 text-[35px] text-primary' />
              </Box>

              <Box className='flex flex-col gap-1 mt-2'>
                <Typography className='flex flex-row gap-2 items-center' variant='body1' color='textSecondary'>
                  Email:
                  <Typography component='span' variant='body2'>
                    {' '}
                    {operator.email}
                  </Typography>
                </Typography>
                <Typography className='flex flex-row gap-2 items-center' variant='body1' color='textSecondary'>
                  CPF/CNPJ:{' '}
                  <Typography component='span' variant='body2'>
                    {operator.identifier}
                  </Typography>
                </Typography>
                <Typography className='flex flex-row gap-2 items-center' variant='body1' color='textSecondary'>
                  Telefone:
                  <Typography component='span' variant='body2'>
                    {operator.phone_number}
                  </Typography>{' '}
                  <Typography component='span' variant='body2' className='text-primary'>
                    |
                  </Typography>
                  WhatsApp:
                  <Typography component='span' variant='body2'>
                    {' '}
                    {operator.whatsapp_number}
                  </Typography>
                </Typography>
              </Box>
              {/* Informações de contato */}
            </Box>
          </Box>
          <Box className='flex flex-row items-end mt-12'>
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
      </CardContent>
      <CardContent className='relative'>
        <Box className='flex items-center justify-start flex-row mt-4 w-full'>
          <IconButton onClick={() => setOpenProjects(!openProjects)}>
            <i
              className={
                openProjects ? 'ri-subtract-line text-[30px] text-primary' : 'ri-add-line text-[30px] text-primary'
              }
            />
          </IconButton>
          <Divider orientation='horizontal' className='flex-1 ml-2' />
        </Box>

        {/* Colapse do conteúdo */}
        <Collapse in={openProjects} timeout='auto' unmountOnExit>
          <Typography variant='h6' className='flex flex-row gap-2 items-center justify-center ml-2'>
            PROJETOS VINCULADOS
          </Typography>
          <Box className='p-8'>
            {operator.projects.map((projeto: any) => (
              <>
                <Box key={projeto.id} className='mb-2'>
                  <div className='flex items-center gap-3'>
                    <CustomAvatar src={projeto.img_url ?? ''} size={38} />

                    <div className='flex justify-between items-center w-full flex-wrap gap-x-4 gap-y-2'>
                      <div className='flex flex-col gap-0.5'>
                        <Typography color='text.primary' className='font-medium'>
                          {projeto.name}
                        </Typography>
                        <div className='flex items-center gap-2'>
                          {projeto.description && <i className='ri-file-text-line text-base text-primary' />}
                          <Typography variant='body2'>{projeto.description ?? ''}</Typography>
                        </div>
                      </div>
                    </div>
                    <div className='flex gap-1'>
                      <IconButton color='error' size='small'>
                        <i className='ri-delete-bin-line' />
                      </IconButton>
                    </div>
                  </div>
                  <Divider orientation='horizontal' className='mt-4' />
                </Box>
              </>
            ))}
          </Box>

          <OpenDialogOnElementClick
            element={Button}
            elementProps={buttonProps}
            dialog={AddOperatorToProject}
            dialogProps={{ projectsOperator: operator.projects, user_id: operator.id }}
          />
        </Collapse>
      </CardContent>
      {projectsResponse && (
        <EditOperatorDialog
          open={editDialogOpen}
          onClose={handleCloseEdit}
          projects={projectsResponse?.data} // lista de projetos
          user_id={operator.identifier} // id do usuário
          project_id={operator.project_id}
          refetch={refetch}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        loading={confirmDialog.loading}
        type='error'
        title='Deletar Operador'
        message={`Tem certeza que deseja deletar o operador "${operator.name}"?`}
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
