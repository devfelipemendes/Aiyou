import { useState, useCallback, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { Divider } from '@mui/material'

import { useForm } from 'react-hook-form'
import * as v from 'valibot'
import { valibotResolver } from '@hookform/resolvers/valibot'

import type { QueryActionCreatorResult } from '@reduxjs/toolkit/query'

import CustomAvatar from '@core/components/mui/Avatar'
import EditAssistantDialog from '@/components/dialogs/edit-assistant/EditAssistantDialog'

// Supondo que UIAssistant tenha: id, name, img_url, project_id
import type { UIAssistant } from '@/views/projects_register/StepCreateAssistant'
import { useUpdateAssistantMutation, useDeleteAssistantMutation } from '@/api/endpoints/assistant/assistant'
import type { GetProjectByIdResponse } from '@/api/endpoints/Projects/project'
import { useGetProjectsQuery } from '@/api/endpoints/Projects/project'
import ConfirmDialog, { useConfirmDialog } from '@/components/dialogs/confirmation-dialog'

type Props = {
  data: GetProjectByIdResponse | undefined
  refetchProject: () => QueryActionCreatorResult<any>
}

export default function SimpleTableAssistents({ data, refetchProject }: Props) {
  const { data: projectsResponse, isLoading: isLoadingProjects } = useGetProjectsQuery()
  const [updateAssistant, { isLoading: isUpdating }] = useUpdateAssistantMutation()
  const [deleteAssistant] = useDeleteAssistantMutation()

  const projects = useMemo(() => projectsResponse?.data || [], [projectsResponse])

  // Schema e form
  const AssistantSchema = v.object({
    name: v.pipe(v.string(), v.minLength(1, 'Nome do assistente é obrigatório')),
    project_id: v.pipe(v.string(), v.minLength(1, 'Projeto é obrigatório'))
  })

  type AssistantFormData = v.InferInput<typeof AssistantSchema>

  const [editingAssistant, setEditingAssistant] = useState<UIAssistant | null>(null)
  const [assistantToDelete, setAssistantToDelete] = useState<UIAssistant | null>(null)

  const confirmDialog = useConfirmDialog()

  const editForm = useForm<AssistantFormData>({
    resolver: valibotResolver(AssistantSchema),
    defaultValues: { name: '', project_id: '' },
    mode: 'onChange'
  })

  const isEditFormValid = useMemo(() => editForm.formState.isValid, [editForm.formState.isValid])

  // --- EDIÇÃO ---
  const handleOpenEditModal = useCallback(
    (assistant: UIAssistant) => {
      setEditingAssistant(assistant)
      editForm.reset({
        name: assistant.name,
        project_id: data?.data.id
      })
    },
    [editForm, data?.data.id]
  )

  const handleCloseEditModal = useCallback(() => {
    setEditingAssistant(null)
    editForm.reset()
  }, [editForm])

  const handleEditSubmit = useCallback(
    async (data: AssistantFormData) => {
      if (!editingAssistant) return

      await updateAssistant({
        id: editingAssistant.id,
        ...data
      })

      handleCloseEditModal()
      refetchProject()
    },
    [editingAssistant, updateAssistant, handleCloseEditModal, refetchProject]
  )

  // --- EXCLUSÃO ---
  const handleDeleteAssistant = useCallback(
    (assistant: UIAssistant) => {
      setAssistantToDelete(assistant)
      confirmDialog.openDialog()
    },
    [confirmDialog]
  )

  const handleConfirmDelete = useCallback(async () => {
    if (!assistantToDelete) return

    try {
      confirmDialog.setLoading(true)
      await deleteAssistant({ id: assistantToDelete.id })

      confirmDialog.closeDialog()
      setAssistantToDelete(null)
      refetchProject()
    } catch (err) {
      console.error('Erro ao deletar assistente:', err)
    } finally {
      confirmDialog.setLoading(false)
    }
  }, [assistantToDelete, deleteAssistant, confirmDialog, refetchProject])

  const handleCancelDelete = useCallback(() => {
    confirmDialog.closeDialog()
    setAssistantToDelete(null)
    refetchProject()
  }, [confirmDialog, refetchProject])

  return (
    <Card>
      <CardHeader title='Assistentes' />
      <CardContent className='flex flex-col gap-[1.71rem]'>
        {data?.data.assistants.map((item: UIAssistant) => (
          <div key={item.id} className='flex items-center gap-3'>
            <CustomAvatar src={item.img_url ?? ''} size={38} />

            <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
              <div className='flex flex-col gap-0.5'>
                <Typography color='text.primary' className='font-medium'>
                  {item.name}
                </Typography>
                <div className='flex items-center gap-2'>
                  <i className='ri-file-text-line text-base text-primary' />
                  <Typography variant='body2'>{item.id}</Typography>
                </div>
              </div>

              {/* Botões de ação */}
              <div className='flex gap-1'>
                <IconButton color='primary' size='large' onClick={() => handleOpenEditModal(item)}>
                  <i className='ri-pencil-line' />
                </IconButton>

                <IconButton color='error' size='large' onClick={() => handleDeleteAssistant(item)}>
                  <i className='ri-delete-bin-line' />
                </IconButton>
              </div>
            </div>
            <Divider orientation='horizontal' />
          </div>
        ))}

        {/* Modal de edição */}
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

        {/* Dialog de exclusão */}
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
      </CardContent>
    </Card>
  )
}
