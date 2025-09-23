'use client'

// React
import { useState, useMemo, useCallback } from 'react'

// MUI
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { IconButton, Tooltip, useColorScheme } from '@mui/material'

// Forms & validation
import { useForm } from 'react-hook-form'
import * as v from 'valibot'
import { valibotResolver } from '@hookform/resolvers/valibot'

// API
import { useUpdateAssistantMutation, useDeleteAssistantMutation } from '@/api/endpoints/assistant/assistant'
import { useGetProjectsQuery } from '@/api/endpoints/Projects/project'

// Dialogs
import EditAssistantDialog from '@/components/dialogs/edit-assistant/EditAssistantDialog'
import ConfirmDialog, { useConfirmDialog } from '@/components/dialogs/confirmation-dialog'

// Tipos
import type { UIAssistant } from '@/views/projects_register/StepCreateAssistant'

interface CardUserProps {
  avatarSrc: string
  name: string
  location: string
  projectName: string
  projectAvatarSrc: string
  onClick: () => void
  assistant: UIAssistant // 🔥 necessário para editar/excluir
}

const CardUser = ({ avatarSrc, name, location, projectName, projectAvatarSrc, onClick, assistant }: CardUserProps) => {
  // random bg do card
  const randomCardNumber = Math.floor(Math.random() * 10) + 1
  const { mode, systemMode } = useColorScheme()
  const _mode = (mode === 'system' ? systemMode : mode) || 'light'

  // API
  const { data: projectsResponse, isLoading: isLoadingProjects, refetch } = useGetProjectsQuery()
  const [updateAssistant, { isLoading: isUpdating }] = useUpdateAssistantMutation()
  const [deleteAssistant] = useDeleteAssistantMutation()
  const projects = useMemo(() => projectsResponse?.data || [], [projectsResponse])

  // --- Form Schema
  const AssistantSchema = v.object({
    name: v.pipe(v.string(), v.minLength(1, 'Nome do assistente é obrigatório')),
    project_id: v.pipe(v.string(), v.minLength(1, 'Projeto é obrigatório'))
  })

  type AssistantFormData = v.InferInput<typeof AssistantSchema>

  const editForm = useForm<AssistantFormData>({
    resolver: valibotResolver(AssistantSchema),
    defaultValues: { name: '', project_id: '' },
    mode: 'onChange'
  })

  const isEditFormValid = useMemo(() => editForm.formState.isValid, [editForm.formState.isValid])

  // --- Estados dialogs
  const [editingAssistant, setEditingAssistant] = useState<UIAssistant | null>(null)
  const [assistantToDelete, setAssistantToDelete] = useState<UIAssistant | null>(null)
  const confirmDialog = useConfirmDialog()

  // --- Handlers edição
  const handleOpenEditModal = useCallback(() => {
    setEditingAssistant(assistant)
    editForm.reset({
      name: assistant.name,
      project_id: assistant.project_id
    })
  }, [assistant, editForm])

  const handleCloseEditModal = useCallback(() => {
    setEditingAssistant(null)
    editForm.reset()
  }, [editForm])

  const handleEditSubmit = useCallback(
    async (data: AssistantFormData) => {
      if (!editingAssistant) return
      await updateAssistant({ id: editingAssistant.id, ...data })
      handleCloseEditModal()
      refetch()

      // 🔥 refetchProject() entra aqui
    },
    [editingAssistant, updateAssistant, handleCloseEditModal]
  )

  // --- Handlers exclusão
  const handleDeleteAssistant = useCallback(() => {
    setAssistantToDelete(assistant)
    confirmDialog.openDialog()
  }, [assistant, confirmDialog])

  const handleConfirmDelete = useCallback(async () => {
    if (!assistantToDelete) return

    try {
      confirmDialog.setLoading(true)
      await deleteAssistant({ id: assistantToDelete.id })
      refetch()
      confirmDialog.closeDialog()
      setAssistantToDelete(null)

      // 🔥 refetchProject() entra aqui
    } catch (err) {
      console.error('Erro ao deletar assistente:', err)
    } finally {
      confirmDialog.setLoading(false)
    }
  }, [assistantToDelete, deleteAssistant, confirmDialog])

  const handleCancelDelete = useCallback(() => {
    confirmDialog.closeDialog()
    setAssistantToDelete(null)

    // 🔥 refetchProject() entra aqui
  }, [confirmDialog])

  return (
    <Card>
      <CardMedia image={`/images/cards/${randomCardNumber}.png`} className='bs-[180px]' />
      <CardContent className='relative' sx={{ backgroundColor: _mode === 'dark' ? '#0089ad' : undefined }}>
        <Avatar
          src={avatarSrc}
          alt={name}
          className='is-[78px] bs-[78px] border-[5px] border-backgroundPaper absolute start-[11px] block-start-[-39px]'
        />
        <div className='flex justify-between items-center flex-nowrap mbe-5 mbs-[30px]'>
          <div className='flex flex-col items-start w-[40%]'>
            <Typography
              variant='h5'
              title={name}
              sx={{
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                textOverflow: 'ellipsis',
                minHeight: '56px'
              }}
            >
              {name}
            </Typography>
            <Typography variant='body2'>{location}</Typography>
          </div>

          <Button variant='contained' onClick={onClick}>
            Visualizar Assistente
          </Button>
        </div>

        <div className='flex w-full justify-center items-center'>
          <Tooltip title='Remover projeto'>
            <IconButton color='error' size='small' onClick={handleDeleteAssistant}>
              <i className='ri-delete-bin-line' />
            </IconButton>
          </Tooltip>

          <Tooltip title='Editar projeto'>
            <IconButton color='primary' size='small' onClick={handleOpenEditModal}>
              <i className='ri-edit-line' />
            </IconButton>
          </Tooltip>
        </div>

        <div className='flex justify-between items-center flex-wrap gap-x-4 gap-y-2'>
          <Typography variant='subtitle2' color='text.disabled'>
            Vinculado ao projeto: {projectName}
          </Typography>
          <Avatar src={projectAvatarSrc} alt={projectName} />
        </div>
      </CardContent>

      {/* Dialog edição */}
      <EditAssistantDialog
        open={!!editingAssistant}
        assistant={editingAssistant}
        editForm={editForm}
        projects={projects}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        isUpdating={isUpdating}
        isLoadingProjects={isLoadingProjects}
        isFormValid={isEditFormValid}
      />

      {/* Dialog exclusão */}
      <ConfirmDialog
        open={confirmDialog.open}
        loading={confirmDialog.loading}
        type='error'
        title='Deletar Assistente'
        message={assistantToDelete ? `Tem certeza que deseja deletar o assistente "${assistantToDelete.name}"?` : ''}
        subtitle='Esta ação não pode ser desfeita.'
        confirmText='Deletar'
        cancelText='Cancelar'
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Card>
  )
}

export default CardUser
