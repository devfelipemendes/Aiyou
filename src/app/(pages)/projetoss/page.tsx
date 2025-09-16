'use client'

import React, { useState, useMemo, useCallback } from 'react'

import { useTheme } from '@mui/material/styles'
import { Card, CardHeader, CardContent, Button, CircularProgress } from '@mui/material'
import Grid from '@mui/material/Grid2'

import { useForm } from 'react-hook-form'

import {
  useGetProjectsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  type Project
} from '@/api/endpoints/Projects/project'
import ProjectCard from '@/components/cardProject'
import ConfirmDialog, { useConfirmDialog } from '@/components/dialogs/confirmation-dialog'
import EditProjectDialog from '@/components/dialogs/edit-project/ProjectEditDialog'

export interface UIProject extends Project {
  status?: 'pending' | 'success' | 'error'
}

export interface ProjectFormData {
  name: string
  description: string
  img_url?: string
}

export default function ProjectList() {
  const theme = useTheme()
  const confirmDialog = useConfirmDialog()

  const { data: projectsResponse, isLoading, isError, refetch } = useGetProjectsQuery()
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation()
  const [deleteProject] = useDeleteProjectMutation()

  const [projectToDelete, setProjectToDelete] = useState<UIProject | null>(null)
  const [editingProject, setEditingProject] = useState<UIProject | null>(null)
  const [editImageMode, setEditImageMode] = useState<'file' | 'url'>('file')
  const [editImageFile, setEditImageFile] = useState<File | null>(null)

  // Form controlado com react-hook-form
  const editForm = useForm<ProjectFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      img_url: ''
    }
  })

  const projects = useMemo<UIProject[]>(() => {
    return projectsResponse?.data?.map(p => ({ ...p, status: 'success' })) || []
  }, [projectsResponse])

  // Abrir modal de edição e resetar form
  const handleOpenEditModal = useCallback(
    (project: UIProject) => {
      setEditingProject(project)
      setEditImageMode('file')
      setEditImageFile(null)
      editForm.reset({
        name: project.name,
        description: project.description,
        img_url: project.img_url || ''
      })
    },
    [editForm]
  )

  const handleCloseEditModal = useCallback(() => setEditingProject(null), [])

  const handleEditImageChange = useCallback((file: File | null) => {
    setEditImageFile(file)
  }, [])

  const handleEditImageModeChange = useCallback((_e: any, mode: 'file' | 'url') => {
    if (mode) setEditImageMode(mode)
  }, [])

  const handleEditSubmit = useCallback(
    async (data: ProjectFormData) => {
      if (!editingProject) return

      const payload: any = {
        id: editingProject.id,
        name: data.name,
        description: data.description
      }

      if (editImageMode === 'url') payload.img_url = data.img_url
      if (editImageMode === 'file') payload.img_file = editImageFile

      const result = await updateProject(payload)

      if ('error' in result) return alert('Erro ao atualizar projeto')
      setEditingProject(null)
    },
    [editingProject, editImageFile, editImageMode, updateProject]
  )

  const isEditFormValid = editForm.formState.isValid

  const handleDeleteProject = useCallback(
    (id: string) => {
      const project = projects.find(p => p.id === id)

      if (!project) return
      setProjectToDelete(project)
      confirmDialog.openDialog()
    },
    [projects, confirmDialog]
  )

  const handleConfirmDelete = useCallback(async () => {
    if (!projectToDelete) return
    confirmDialog.setLoading(true)
    const result = await deleteProject({ id: projectToDelete.id })

    confirmDialog.setLoading(false)
    if ('error' in result) return alert('Erro ao deletar projeto')
    setProjectToDelete(null)
    confirmDialog.closeDialog()
  }, [projectToDelete, deleteProject, confirmDialog])

  const handleCancelDelete = useCallback(() => {
    setProjectToDelete(null)
    confirmDialog.closeDialog()
  }, [confirmDialog])

  if (isError) {
    return (
      <Card sx={{ p: 3 }}>
        <Button onClick={() => refetch()}>Erro ao carregar projetos. Tentar novamente</Button>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader title='Projetos Cadastrados' />
        <CardContent>
          <Grid container spacing={3}>
            {projects.map(project => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={project.id}>
                <ProjectCard
                  project={project}
                  onEdit={() => handleOpenEditModal(project)}
                  onRemove={() => handleDeleteProject(project.id)}
                  isUpdating={isUpdating || confirmDialog.loading}
                  backgroundColor={theme.palette.primary.main}
                  backgroundImage='/images/iaImages/projects.png'
                  showEye
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <EditProjectDialog
        editingProject={editingProject}
        editForm={editForm}
        editImageMode={editImageMode}
        editImageFile={editImageFile}
        isUpdating={isUpdating}
        handleEditImageChange={handleEditImageChange}
        handleEditImageModeChange={handleEditImageModeChange}
        handleCloseEditModal={handleCloseEditModal}
        handleEditSubmit={handleEditSubmit}
        isEditFormValid={isEditFormValid}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        loading={confirmDialog.loading}
        type='error'
        title='Deletar Projeto'
        message={projectToDelete ? `Tem certeza que deseja deletar o projeto "${projectToDelete.name}"?` : ''}
        subtitle='Esta ação não pode ser desfeita.'
        confirmText='Deletar'
        cancelText='Cancelar'
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  )
}
