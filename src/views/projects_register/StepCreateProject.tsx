// MUI Imports
import { useState, useCallback, useMemo, useEffect } from 'react'

import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material'
import * as v from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

// 🎯 IMPORTAR NOSSAS APIs E COMPONENTES
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  type Project,
  type CreateProjectRequest,
  type UpdateProjectRequest
} from '@/api/endpoints/Projects/project'
import ImageDropzone from '@/components/dropDonwLogo'
import ProjectCard from '@/components/cardProject'
import ConfirmDialog, { useConfirmDialog } from '@/components/dialogs/confirmation-dialog'

// 🎯 INTERFACE LOCAL PARA UI
export interface UIProject extends Project {
  status?: 'pending' | 'success' | 'error'
  imageFile?: File | null | undefined
}

// 🎯 SCHEMA DE VALIDAÇÃO
const ProjectSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Nome do projeto é obrigatório')),
  description: v.pipe(
    v.string(),
    v.minLength(1, 'Descrição é obrigatória'),
    v.maxLength(255, 'Descrição deve ter no máximo 255 caracteres')
  ),
  imageMode: v.picklist(['file', 'url'], 'Selecione o modo de imagem'),
  img_url: v.optional(v.pipe(v.string(), v.url('Deve ser uma URL válida')))
})

type ProjectFormData = v.InferInput<typeof ProjectSchema>

export default function ProjectManager() {
  const theme = useTheme()

  // 🎯 API HOOKS
  const {
    data: projectsResponse,
    isLoading: isLoadingProjects,
    isError: isErrorProjects,
    error: projectsError,
    refetch: refetchProjects
  } = useGetProjectsQuery()

  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation()
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation()
  const [deleteProject] = useDeleteProjectMutation()

  // 🎯 ESTADOS GERAIS
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [editingProject, setEditingProject] = useState<UIProject | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<UIProject | null>(null)

  // 🎯 DIALOG DE CONFIRMAÇÃO
  const confirmDialog = useConfirmDialog()

  // 🎯 ESTADOS DO FORMULÁRIO DE CRIAÇÃO
  const [createImageFile, setCreateImageFile] = useState<File | null>(null)
  const [createImageMode, setCreateImageMode] = useState<'file' | 'url'>('file')

  // 🎯 ESTADOS DO FORMULÁRIO DE EDIÇÃO
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImageMode, setEditImageMode] = useState<'file' | 'url'>('file')

  // 🎯 FORMULÁRIOS
  const createForm = useForm<ProjectFormData>({
    resolver: valibotResolver(ProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      imageMode: 'file',
      img_url: ''
    },
    mode: 'onChange'
  })

  const editForm = useForm<ProjectFormData>({
    resolver: valibotResolver(ProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      imageMode: 'file',
      img_url: ''
    },
    mode: 'onChange'
  })

  // 🎯 SINCRONIZAR FORMS COM ESTADOS
  useEffect(() => {
    createForm.setValue('imageMode', createImageMode)
  }, [createImageMode, createForm])

  useEffect(() => {
    editForm.setValue('imageMode', editImageMode)
  }, [editImageMode, editForm])

  // 🎯 PROJETOS PROCESSADOS
  const projects: UIProject[] = useMemo(() => {
    if (!projectsResponse?.data) return []

    return projectsResponse.data.map(project => ({
      ...project,
      status: 'success' as const
    }))
  }, [projectsResponse])

  // 🎯 VALIDAÇÕES DE FORMULÁRIO
  const isCreateFormValid = useMemo(() => {
    const baseValid = createForm.formState.isValid

    if (createImageMode === 'file') {
      return baseValid && createImageFile !== null
    } else {
      return baseValid && createForm.watch('img_url')
    }
  }, [createForm.formState.isValid, createForm, createImageMode, createImageFile])

  const isEditFormValid = useMemo(() => {
    const baseValid = editForm.formState.isValid

    if (editImageMode === 'file') {
      return baseValid && (editImageFile !== null || editingProject?.img_url)
    } else {
      return baseValid && editForm.watch('img_url')
    }
  }, [editForm.formState.isValid, editForm, editImageMode, editImageFile, editingProject])

  // 🎯 HANDLERS DE IMAGEM - CRIAR
  const handleCreateImageChange = useCallback((file: File | null) => {
    setCreateImageFile(file)
  }, [])

  const handleCreateImageModeChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newMode: 'file' | 'url') => {
      if (newMode !== null) {
        setCreateImageMode(newMode)
        setCreateImageFile(null)
        createForm.setValue('img_url', '')
      }
    },
    [createForm]
  )

  // 🎯 HANDLERS DE IMAGEM - EDITAR
  const handleEditImageChange = useCallback((file: File | null) => {
    setEditImageFile(file)
  }, [])

  const handleEditImageModeChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newMode: 'file' | 'url') => {
      if (newMode !== null) {
        setEditImageMode(newMode)
        setEditImageFile(null)
        editForm.setValue('img_url', '')
      }
    },
    [editForm]
  )

  // 🎯 TOGGLE FORMULÁRIO DE CRIAÇÃO
  const handleToggleCreateForm = useCallback(() => {
    setIsCreatingProject(prev => {
      if (prev) {
        // Resetar tudo
        createForm.reset()
        setCreateImageFile(null)
        setCreateImageMode('file')
      }

      return !prev
    })
  }, [createForm])

  // 🎯 MODAL DE EDIÇÃO
  const handleOpenEditModal = useCallback(
    (project: UIProject) => {
      setEditingProject(project)

      editForm.reset({
        name: project.name,
        description: project.description,
        imageMode: project.img_url ? 'url' : 'file',
        img_url: project.img_url || ''
      })

      if (project.img_url) {
        setEditImageMode('url')
        setEditImageFile(null)
      } else {
        setEditImageMode('file')
        setEditImageFile(project.imageFile || null)
      }
    },
    [editForm]
  )

  const handleCloseEditModal = useCallback(() => {
    setEditingProject(null)
    editForm.reset()
    setEditImageFile(null)
    setEditImageMode('file')
  }, [editForm])

  // 🎯 SUBMIT CRIAÇÃO
  const handleCreateSubmit = useCallback(
    async (data: ProjectFormData) => {
      try {
        if (createImageMode === 'file' && !createImageFile) {
          alert('Selecione uma imagem ou mude para modo URL')

          return
        }

        if (createImageMode === 'url' && !data.img_url) {
          alert('Digite a URL da imagem ou mude para modo arquivo')

          return
        }

        const requestData: CreateProjectRequest = {
          name: data.name,
          description: data.description
        }

        if (createImageMode === 'file' && createImageFile) {
          requestData.image = createImageFile
        } else if (createImageMode === 'url' && data.img_url) {
          requestData.img_url = data.img_url
        }

        const result = await createProject(requestData)

        if (result.error) {
          console.error('❌ Erro na API:', result.error)
          alert('Erro ao criar projeto')

          return
        }

        // Sucesso - resetar form
        createForm.reset()
        setIsCreatingProject(false)
        setCreateImageFile(null)
        setCreateImageMode('file')

        console.log('✅ Projeto criado com sucesso!')
      } catch (error: any) {
        console.error('❌ Erro inesperado:', error)
        alert('Erro inesperado ao criar projeto')
      }
    },
    [createProject, createForm, createImageMode, createImageFile]
  )

  // 🎯 SUBMIT EDIÇÃO
  const handleEditSubmit = useCallback(
    async (data: ProjectFormData) => {
      if (!editingProject) return

      try {
        if (editImageMode === 'file' && !editImageFile && !editingProject.img_url) {
          alert('Selecione uma imagem ou mude para modo URL')

          return
        }

        if (editImageMode === 'url' && !data.img_url) {
          alert('Digite a URL da imagem')

          return
        }

        const requestData: UpdateProjectRequest = {
          id: editingProject.id,
          name: data.name,
          description: data.description
        }

        if (editImageMode === 'file' && editImageFile) {
          requestData.image = editImageFile
        } else if (editImageMode === 'url' && data.img_url) {
          requestData.img_url = data.img_url
        }

        const result = await updateProject(requestData)

        if (result.error) {
          console.error('❌ Erro na API:', result.error)
          alert('Erro ao atualizar projeto')

          return
        }

        // Sucesso - fechar modal
        handleCloseEditModal()
        console.log('✅ Projeto atualizado com sucesso!')
      } catch (error: any) {
        console.error('❌ Erro inesperado:', error)
        alert('Erro inesperado ao atualizar projeto')
      }
    },
    [updateProject, editImageMode, editImageFile, editingProject, handleCloseEditModal]
  )

  // 🎯 DELETE PROJECT
  const handleDeleteProject = useCallback(
    (id: string) => {
      // Encontrar o projeto completo
      const project = projects.find(p => p.id === id)

      if (!project) return

      // Definir projeto a ser deletado e abrir dialog
      setProjectToDelete(project)
      confirmDialog.openDialog()
    },
    [projects, confirmDialog]
  )

  const handleConfirmDelete = useCallback(async () => {
    if (!projectToDelete) return

    try {
      confirmDialog.setLoading(true)

      const result = await deleteProject({ id: projectToDelete.id })

      if (result.error) {
        console.error('❌ Erro na API:', result.error)
        alert('Erro ao deletar projeto')

        return
      }

      console.log('✅ Projeto deletado com sucesso!')

      // Fechar dialog e limpar estado
      confirmDialog.closeDialog()
      setProjectToDelete(null)
    } catch (error: any) {
      console.error('❌ Erro inesperado:', error)
      alert('Erro inesperado ao deletar projeto')
    } finally {
      confirmDialog.setLoading(false)
    }
  }, [projectToDelete, deleteProject, confirmDialog])

  const handleCancelDelete = useCallback(() => {
    confirmDialog.closeDialog()
    setProjectToDelete(null)
  }, [confirmDialog])

  // 🎯 LOADING SKELETON
  const renderLoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3].map(item => (
        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={item}>
          <Skeleton variant='rounded' height={400} />
        </Grid>
      ))}
    </Grid>
  )

  // 🎯 ERROR STATE
  if (isErrorProjects) {
    return (
      <Box sx={{ mx: 'auto', p: 3 }}>
        <Alert
          severity='error'
          action={
            <Button color='inherit' size='small' onClick={() => refetchProjects()}>
              Tentar Novamente
            </Button>
          }
        >
          Erro ao carregar projetos: {(projectsError as any)?.message || 'Erro desconhecido'}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ mx: 'auto', p: 3 }}>
      {/* 🎯 HEADER */}
      <Box sx={{ mb: 3 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
          <Typography variant='h4' component='h1'>
            Gerenciador de Projetos
          </Typography>

          <Box display='flex' gap={2} alignItems='center'>
            {/* Botão criar quando há projetos */}
            {(projects.length > 0 || isLoadingProjects) && (
              <Button
                variant='contained'
                onClick={handleToggleCreateForm}
                disabled={isCreating || isLoadingProjects || confirmDialog.loading}
                endIcon={<i className='ri-add-line' />}
              >
                Criar Projeto
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* 🎯 FORMULÁRIO DE CRIAÇÃO */}
      <Collapse in={isCreatingProject}>
        <Box sx={{ mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Criar Novo Projeto
          </Typography>

          <form onSubmit={createForm.handleSubmit(handleCreateSubmit)}>
            <Grid container spacing={3}>
              {/* Imagem */}
              <Grid size={{ xs: 12 }}>
                <FormControl component='fieldset' sx={{ width: '100%' }}>
                  <FormLabel component='legend' sx={{ mb: 2 }}>
                    Imagem do Projeto
                  </FormLabel>

                  <ToggleButtonGroup
                    value={createImageMode}
                    exclusive
                    onChange={handleCreateImageModeChange}
                    sx={{ mb: 3 }}
                    disabled={isCreating}
                  >
                    <ToggleButton value='file'>📁 Upload de Arquivo</ToggleButton>
                    <ToggleButton value='url'>🔗 URL da Imagem</ToggleButton>
                  </ToggleButtonGroup>

                  {createImageMode === 'file' ? (
                    <Box display='flex' justifyContent='center' sx={{ mb: 2 }}>
                      <ImageDropzone
                        onImageChange={handleCreateImageChange}
                        size='lg'
                        placeholder='Imagem do projeto'
                        maxSizeMB={10}
                        disabled={isCreating}
                      />
                    </Box>
                  ) : (
                    <Controller
                      name='img_url'
                      control={createForm.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='URL da Imagem'
                          disabled={isCreating}
                          error={!!createForm.formState.errors.img_url}
                          helperText={createForm.formState.errors.img_url?.message}
                          placeholder='https://exemplo.com/imagem.jpg'
                        />
                      )}
                    />
                  )}
                </FormControl>
              </Grid>

              {/* Nome */}
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='name'
                  control={createForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Nome do Projeto'
                      required
                      disabled={isCreating}
                      error={!!createForm.formState.errors.name}
                      helperText={createForm.formState.errors.name?.message}
                      placeholder='Ex: Sistema E-commerce'
                    />
                  )}
                />
              </Grid>

              {/* Descrição */}
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='description'
                  control={createForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Descrição'
                      required
                      multiline
                      rows={4}
                      disabled={isCreating}
                      error={!!createForm.formState.errors.description}
                      helperText={
                        createForm.formState.errors.description?.message || `${field.value?.length || 0}/255 caracteres`
                      }
                      placeholder='Ex: Plataforma completa de e-commerce'
                      inputProps={{ maxLength: 255 }}
                    />
                  )}
                />
              </Grid>

              {/* Botões */}
              <Grid size={{ xs: 12 }}>
                <Box display='flex' gap={2} justifyContent='flex-end'>
                  <Button variant='outlined' onClick={handleToggleCreateForm} disabled={isCreating}>
                    Cancelar
                  </Button>
                  <Button
                    type='submit'
                    variant='contained'
                    color='success'
                    disabled={!isCreateFormValid || isCreating}
                    startIcon={isCreating ? <CircularProgress size={16} /> : <i className='ri-check-line' />}
                  >
                    {isCreating ? 'Criando...' : 'Criar Projeto'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Collapse>

      {/* 🎯 LISTA DE PROJETOS */}
      {isLoadingProjects ? (
        renderLoadingSkeleton()
      ) : projects.length > 0 ? (
        <Grid container spacing={3}>
          {projects.map(project => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={project.id}>
              <ProjectCard
                project={project}
                onEdit={handleOpenEditModal}
                onRemove={id => handleDeleteProject(id)}
                isUpdating={isUpdating || confirmDialog.loading}
                backgroundColor={theme.palette.primary.main}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {!isCreatingProject && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant='h6' color='text.secondary' gutterBottom>
                Nenhum projeto criado
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Comece criando seu primeiro projeto
              </Typography>
              <Button
                variant='contained'
                color='primary'
                onClick={handleToggleCreateForm}
                disabled={isCreating || confirmDialog.loading}
                startIcon={<i className='ri-add-line' />}
                size='large'
              >
                Criar Novo Projeto
              </Button>
            </Box>
          )}
        </>
      )}

      {/* 🎯 MODAL DE EDIÇÃO */}
      <Dialog open={!!editingProject} onClose={handleCloseEditModal} maxWidth='md' fullWidth>
        <DialogTitle>Editar Projeto: {editingProject?.name}</DialogTitle>

        <DialogContent>
          <form onSubmit={editForm.handleSubmit(handleEditSubmit)} id='edit-form'>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Nome */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name='name'
                  control={editForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Nome do Projeto'
                      required
                      disabled={isUpdating}
                      error={!!editForm.formState.errors.name}
                      helperText={editForm.formState.errors.name?.message}
                    />
                  )}
                />
              </Grid>

              {/* Descrição */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name='description'
                  control={editForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Descrição'
                      required
                      disabled={isUpdating}
                      error={!!editForm.formState.errors.description}
                      helperText={
                        editForm.formState.errors.description?.message || `${field.value?.length || 0}/255 caracteres`
                      }
                      inputProps={{ maxLength: 255 }}
                    />
                  )}
                />
              </Grid>

              {/* Imagem */}
              <Grid size={{ xs: 12 }}>
                <FormControl component='fieldset' sx={{ width: '100%' }}>
                  <FormLabel component='legend' sx={{ mb: 2 }}>
                    Imagem do Projeto
                  </FormLabel>

                  <ToggleButtonGroup
                    value={editImageMode}
                    exclusive
                    onChange={handleEditImageModeChange}
                    sx={{ mb: 3 }}
                    disabled={isUpdating}
                  >
                    <ToggleButton value='file'>📁 Upload de Arquivo</ToggleButton>
                    <ToggleButton value='url'>🔗 URL da Imagem</ToggleButton>
                  </ToggleButtonGroup>

                  {editImageMode === 'file' ? (
                    <Box display='flex' justifyContent='center' sx={{ mb: 2 }}>
                      <ImageDropzone
                        initialImage={editingProject?.img_url || undefined}
                        onImageChange={handleEditImageChange}
                        size='lg'
                        placeholder='Imagem do projeto'
                        maxSizeMB={10}
                        disabled={isUpdating}
                      />
                    </Box>
                  ) : (
                    <Controller
                      name='img_url'
                      control={editForm.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='URL da Imagem'
                          disabled={isUpdating}
                          error={!!editForm.formState.errors.img_url}
                          helperText={editForm.formState.errors.img_url?.message}
                          placeholder='https://exemplo.com/imagem.jpg'
                        />
                      )}
                    />
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseEditModal} disabled={isUpdating}>
            Cancelar
          </Button>
          <Button
            type='submit'
            form='edit-form'
            variant='contained'
            color='primary'
            disabled={!isEditFormValid || isUpdating}
            startIcon={isUpdating ? <CircularProgress size={16} /> : <i className='ri-check-line' />}
          >
            {isUpdating ? 'Atualizando...' : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🎯 DIALOG DE CONFIRMAÇÃO DELETE */}
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
    </Box>
  )
}
