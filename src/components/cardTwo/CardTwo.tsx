import { useState } from 'react'

import { styled } from '@mui/material/styles'
import type { ButtonProps } from '@mui/material'
import { Box, Button, Card, CardContent, Collapse, Divider, IconButton, Typography } from '@mui/material'

import { Fingerprint, Mail, Smartphone } from 'lucide-react'

import ConfirmDialog from '../dialogs/confirmation-dialog'
import { useDeleteOperatorMutation, useDeleteUserFromProjectMutation } from '@/api/endpoints/operator/operator'
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
  const [confirmDialog, setConfirmDialog] = useState({ open: false, loading: false })
  const [confirmProjectDialog, setConfirmProjectDialog] = useState({ open: false, loading: false, projectId: '' })
  const { data: projectsResponse } = useGetProjectsQuery()
  const [deleteOperator] = useDeleteOperatorMutation()
  const [deleteUserFromProject] = useDeleteUserFromProjectMutation()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [openProjects, setOpenProjects] = useState(false)

  // Excluir operador
  // const handleOpenDelete = () => setConfirmDialog({ ...confirmDialog, open: true })
  const handleCancelDelete = () => setConfirmDialog({ open: false, loading: false })

  const handleConfirmDelete = async () => {
    setConfirmDialog({ ...confirmDialog, loading: true })

    try {
      await deleteOperator({ user_id: operator.id }).unwrap()
      setConfirmDialog({ open: false, loading: false })
      refetch?.()
    } catch (error) {
      console.error('Erro ao deletar operador:', error)
      setConfirmDialog({ open: false, loading: false })
    }
  }

  // Excluir projeto
  const handleOpenProjectDelete = (projectId: string) => {
    setConfirmProjectDialog({ open: true, loading: false, projectId })
  }

  const handleCancelProjectDelete = () => setConfirmProjectDialog({ open: false, loading: false, projectId: '' })

  const handleConfirmProjectDelete = async () => {
    setConfirmProjectDialog({ ...confirmProjectDialog, loading: true })

    try {
      await deleteUserFromProject({ user_id: operator.id, project_ids: [confirmProjectDialog.projectId] }).unwrap()
      setConfirmProjectDialog({ open: false, loading: false, projectId: '' })
      refetch?.()
    } catch (error) {
      console.error('Erro ao remover projeto:', error)
      setConfirmProjectDialog({ open: false, loading: false, projectId: '' })
    }
  }

  return (
    <StyledCard variant='outlined' className='px-4 pt-4'>
      <CardContent className='relative'>
        {/* Informações do operador */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 2 }}>
          <Box className='flex flex-row w-full items-center gap-2 flex-wrap'>
            <OperatorAvatar>{operator.name.split(' ')[0][0]}</OperatorAvatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  {operator.name}
                </Typography>
                <i
                  className='
    ri-customer-service-2-fill
    absolute
    text-[35px]
    text-primary
    top-0          
    right-0
    lg:top-auto    /* remove top quando for grande */
    lg:right-0
    lg:mr-8
    lg:mt-2
  '
                />
              </Box>
              <Box className='flex flex-col gap-1 mt-2'>
                <Typography className='flex flex-row gap-2 items-center mb-1' variant='body1' color='textSecondary'>
                  <Mail size={20} className='text-primary' />
                  Email:{' '}
                  <Typography component='span' variant='body2'>
                    {operator.email}
                  </Typography>
                </Typography>
                <Typography className='flex flex-row gap-2 items-center mb-1' variant='body1' color='textSecondary'>
                  <Fingerprint size={20} className='text-primary' />
                  CPF/CNPJ:{' '}
                  <Typography component='span' variant='body2'>
                    {operator.identifier}
                  </Typography>
                </Typography>
                <Typography
                  className='flex flex-row gap-2 items-center mb-1 flex-wrap'
                  variant='body1'
                  color='textSecondary'
                >
                  <Smartphone size={20} className='text-primary' /> Telefone:{' '}
                  <Typography component='span' variant='body2'>
                    {operator.phone_number}
                  </Typography>
                  <Typography component='span' variant='body2' className='text-primary'>
                    |
                  </Typography>
                  WhatsApp:{' '}
                  <Typography component='span' variant='body2'>
                    {operator.whatsapp_number}
                  </Typography>
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* <Box className='flex flex-row items-end mt-12'>
            <Tooltip title='Remover operador'>
              <IconButton color='error' size='medium' onClick={handleOpenDelete}>
                <i className='ri-delete-bin-line' />
              </IconButton>
            </Tooltip>
          </Box> */}
        </Box>
      </CardContent>

      {/* Projetos vinculados */}
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

        <Collapse in={openProjects} timeout='auto' unmountOnExit>
          <Typography variant='h6' className='flex flex-row gap-2 items-center justify-center ml-2'>
            PROJETOS VINCULADOS
          </Typography>
          <Box className='p-8'>
            {operator.projects.map((projeto: any) => (
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
                    <IconButton color='error' size='small' onClick={() => handleOpenProjectDelete(projeto.id)}>
                      <i className='ri-delete-bin-line' />
                    </IconButton>
                  </div>
                </div>
                <Divider orientation='horizontal' className='mt-4' />
              </Box>
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
          onClose={() => setEditDialogOpen(false)}
          projects={projectsResponse?.data}
          user_id={operator.identifier}
          project_id={operator.project_id}
          refetch={refetch}
        />
      )}

      {/* Dialog de exclusão do operador */}
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

      {/* Dialog de exclusão do projeto */}
      <ConfirmDialog
        open={confirmProjectDialog.open}
        loading={confirmProjectDialog.loading}
        type='error'
        title='Remover Projeto do Operador'
        message={
          operator.projects.length === 1
            ? 'AO DELETAR O ULTIMO PROJETO DO OPERADOR O MESMO SERÁ DELETADO DA BASE DE DADOS'
            : 'Tem certeza que deseja remover este projeto do operador?'
        }
        subtitle='Esta ação não pode ser desfeita.'
        confirmText='Remover'
        cancelText='Cancelar'
        onConfirm={handleConfirmProjectDelete}
        onCancel={handleCancelProjectDelete}
      />

      <ConfirmDialog
        open={confirmProjectDialog.open}
        loading={confirmProjectDialog.loading}
        type='error'
        title={
          operator.projects.length === 1
            ? 'AO DELETAR O ULTIMO PROJETO DO OPERADOR O MESMO SERÁ DELETADO DA BASE DE DADOS'
            : ''
        }
        message='Tem certeza que deseja remover este projeto do operador?'
        subtitle='Esta ação não pode ser desfeita.'
        confirmText='Remover'
        cancelText='Cancelar'
        onConfirm={handleConfirmProjectDelete}
        onCancel={handleCancelProjectDelete}
      />
    </StyledCard>
  )
}

export default CardTwo
