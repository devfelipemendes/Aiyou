// MUI Imports
import { useState, useCallback, useMemo } from 'react'

import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'

import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import * as v from 'valibot'

import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

// 🎯 IMPORTAR NOSSAS APIs E COMPONENTES
import {
  useCreateProjectMutation,
  useUpdateProjectMutation,
  type CreateProjectRequest,
  type UpdateProjectRequest
} from '@/api/endpoints/Projects/project'
import ImageDropzone from '@/components/dropDonwLogo'

interface Project {
  id: string
  name: string
  description: string
  img_url?: string
  status: 'pending' | 'success' | 'error'
  user_id?: string
  imageFile?: File | null | undefined
  created_at?: string
  updated_at?: string
}

type ProjectFormData = v.InferInput<typeof ProjectSchema>

// 🎯 SCHEMA DE VALIDAÇÃO
const ProjectSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Nome do projeto é obrigatório')),
  description: v.pipe(v.string(), v.minLength(1, 'Descrição é obrigatória')),
  imageMode: v.picklist(['file', 'url'], 'Selecione o modo de imagem'),
  img_url: v.optional(v.pipe(v.string(), v.url('Deve ser uma URL válida')))
})

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([])

  // 🎯 ESTADOS DO FORMULÁRIO DE CRIAÇÃO
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [createImageFile, setCreateImageFile] = useState<File | null>(null)
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null)
  const [createImageMode, setCreateImageMode] = useState<'file' | 'url'>('file')

  // 🎯 ESTADOS DO MODAL DE EDIÇÃO
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [editImageMode, setEditImageMode] = useState<'file' | 'url'>('file')

  // 🎯 HOOKS DAS APIs
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation()
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation()

  // 🎯 FORMULÁRIO DE CRIAÇÃO
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

  // 🎯 FORMULÁRIO DE EDIÇÃO
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

  // 🎯 ESTATÍSTICAS
  const projectStats = useMemo(() => {
    const total = projects.length
    const success = projects.filter(p => p.status === 'success').length
    const errors = projects.filter(p => p.status === 'error').length

    return { total, success, errors }
  }, [projects])

  // 🎯 CALLBACKS PARA IMAGEM DO CRIAR
  const handleCreateImageChange = useCallback((file: File | null, imageUrl: string | null) => {
    setCreateImageFile(file)
    setCreateImagePreview(imageUrl)
  }, [])

  const handleCreateImageModeChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, newMode: 'file' | 'url') => {
      if (newMode !== null) {
        setCreateImageMode(newMode)
        createForm.setValue('imageMode', newMode)
        setCreateImageFile(null)
        setCreateImagePreview(null)
        createForm.setValue('img_url', '')
      }
    },
    [createForm]
  )

  // 🎯 CALLBACKS PARA IMAGEM DO EDITAR
  const handleEditImageChange = useCallback((file: File | null, imageUrl: string | null) => {
    setEditImageFile(file)
    setEditImagePreview(imageUrl)
  }, [])

  const handleEditImageModeChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, newMode: 'file' | 'url') => {
      if (newMode !== null) {
        setEditImageMode(newMode)
        editForm.setValue('imageMode', newMode)
        setEditImageFile(null)
        setEditImagePreview(null)
        editForm.setValue('img_url', '')
      }
    },
    [editForm]
  )

  // 🎯 TOGGLE FORMULÁRIO DE CRIAÇÃO
  const handleToggleCreateForm = useCallback(() => {
    setIsCreatingProject(prev => {
      if (prev) {
        createForm.reset()
        setCreateImageFile(null)
        setCreateImagePreview(null)
        setCreateImageMode('file')
      }

      return !prev
    })
  }, [createForm])

  // 🎯 ABRIR MODAL DE EDIÇÃO
  const handleOpenEditModal = useCallback(
    (project: Project) => {
      setEditingProject(project)

      // Pré-preencher formulário
      editForm.reset({
        name: project.name,
        description: project.description,
        imageMode: project.img_url ? 'url' : 'file',
        img_url: project.img_url || ''
      })

      // Configurar modo e imagem
      if (project.img_url) {
        setEditImageMode('url')
        setEditImageFile(null)
        setEditImagePreview(null)
      } else {
        setEditImageMode('file')
        setEditImageFile(project.imageFile || null)
        setEditImagePreview(project.imageFile ? URL.createObjectURL(project.imageFile) : null)
      }
    },
    [editForm]
  )

  // 🎯 FECHAR MODAL DE EDIÇÃO
  const handleCloseEditModal = useCallback(() => {
    setEditingProject(null)
    editForm.reset()
    setEditImageFile(null)
    setEditImagePreview(null)
    setEditImageMode('file')
  }, [editForm])

  // 🎯 VALIDAÇÃO DE FORMULÁRIO
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

        const result = await createProject(requestData).unwrap()

        const newProject: Project = {
          id: result.data.id,
          name: result.data.name,
          description: result.data.description,
          img_url: result.data.img_url,
          status: 'success',
          user_id: result.data.user_id,
          imageFile: createImageMode === 'file' ? createImageFile : undefined,
          created_at: result.data.created_at,
          updated_at: result.data.updated_at
        }

        setProjects(prev => [...prev, newProject])

        // Reset
        createForm.reset()
        setIsCreatingProject(false)
        setCreateImageFile(null)
        setCreateImagePreview(null)
        setCreateImageMode('file')

        console.log('✅ Projeto criado:', result)
      } catch (error: any) {
        const errorProject: Project = {
          id: `temp_${Date.now()}`,
          name: data.name,
          description: data.description,
          img_url: createImageMode === 'url' ? data.img_url : undefined,
          status: 'error',
          imageFile: createImageMode === 'file' ? createImageFile : undefined
        }

        setProjects(prev => [...prev, errorProject])
        console.error('❌ Erro ao criar projeto:', error)
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

        const result = await updateProject(requestData).unwrap()

        // Atualizar na lista
        setProjects(prev =>
          prev.map(p =>
            p.id === editingProject.id
              ? {
                  ...p,
                  name: result.data.name,
                  description: result.data.description,
                  img_url: result.data.img_url,
                  updated_at: result.data.updated_at,
                  imageFile: editImageMode === 'file' ? editImageFile : undefined
                }
              : p
          )
        )

        handleCloseEditModal()
        console.log('✅ Projeto atualizado:', result)
      } catch (error: any) {
        console.error('❌ Erro ao atualizar projeto:', error)
      }
    },
    [updateProject, editForm, editImageMode, editImageFile, editingProject, handleCloseEditModal]
  )

  // 🎯 REMOVER PROJETO
  const handleRemoveProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id))
  }, [])

  return (
    <Box sx={{ mx: 'auto', p: 3 }}>
      {/* 🎯 HEADER */}
      <Box sx={{ mb: 3 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
          <Typography variant='h4' component='h1'>
            Gerenciador de Projetos
          </Typography>
          {projectStats.total > 0 && (
            <Box display='flex' gap={1}>
              <Chip label={`${projectStats.success} criados`} color='success' />
              {projectStats.errors > 0 && <Chip label={`${projectStats.errors} com erro`} color='error' />}
            </Box>
          )}
        </Box>

        {/* 🎯 BOTÃO CRIAR */}
        {projects.length === 0 && (
          <Button
            variant='contained'
            color='primary'
            onClick={handleToggleCreateForm}
            disabled={isCreating}
            startIcon={<i className='ri-add-line' />}
            size='large'
          >
            Criar Novo Projeto
          </Button>
        )}
      </Box>

      {/* 🎯 FORMULÁRIO DE CRIAÇÃO */}
      <Collapse in={isCreatingProject}>
        <Box sx={{ mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Criar Novo Projeto
          </Typography>

          <form onSubmit={createForm.handleSubmit(handleCreateSubmit)}>
            <Grid container spacing={5}>
              {/* Seção de imagem */}
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
              {/* Campos básicos */}
              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name='description'
                  control={createForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Descrição'
                      required
                      disabled={isCreating}
                      error={!!createForm.formState.errors.description}
                      helperText={createForm.formState.errors.description?.message}
                      placeholder='Ex: Plataforma completa de e-commerce'
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
      {projects.length > 0 && (
        <Grid container spacing={3}>
          {projects.map(project => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={project.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    {/* Avatar com imagem do projeto */}
                    <Avatar
                      src={project.img_url || (project.imageFile ? URL.createObjectURL(project.imageFile) : undefined)}
                      sx={{ width: 56, height: 56 }}
                    >
                      {project.name.charAt(0).toUpperCase()}
                    </Avatar>

                    <Box flexGrow={1}>
                      <Typography variant='h6' noWrap>
                        {project.name}
                      </Typography>
                      <Chip
                        size='small'
                        label={project.status === 'success' ? 'Ativo' : 'Erro'}
                        color={project.status === 'success' ? 'success' : 'error'}
                      />
                    </Box>
                  </Box>

                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    {project.description}
                  </Typography>

                  {project.updated_at && (
                    <Typography variant='caption' color='text.secondary'>
                      Atualizado: {new Date(project.updated_at).toLocaleDateString('pt-BR')}
                    </Typography>
                  )}

                  {project.status === 'error' && (
                    <Alert severity='error' sx={{ mt: 1 }}>
                      Falha na criação/atualização
                    </Alert>
                  )}
                </CardContent>

                <CardActions>
                  <Tooltip title='Editar projeto'>
                    <IconButton onClick={() => handleOpenEditModal(project)} disabled={isUpdating} color='primary'>
                      <i className='ri-edit-line' />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title='Remover projeto'>
                    <IconButton onClick={() => handleRemoveProject(project.id)} color='error'>
                      <i className='ri-delete-bin-line' />
                    </IconButton>
                  </Tooltip>

                  {project.img_url && (
                    <Tooltip title='Ver imagem'>
                      <IconButton onClick={() => window.open(project.img_url, '_blank')} color='default'>
                        <i className='ri-external-link-line' />
                      </IconButton>
                    </Tooltip>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 🎯 MODAL DE EDIÇÃO */}
      <Dialog open={!!editingProject} onClose={handleCloseEditModal} maxWidth='md' fullWidth>
        <DialogTitle>Editar Projeto: {editingProject?.name}</DialogTitle>

        <DialogContent>
          <form onSubmit={editForm.handleSubmit(handleEditSubmit)} id='edit-form'>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Campos básicos */}
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
                      helperText={editForm.formState.errors.description?.message}
                    />
                  )}
                />
              </Grid>

              {/* Seção de imagem */}
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
                        initialImage={
                          editingProject?.img_url ||
                          (editingProject?.imageFile ? URL.createObjectURL(editingProject.imageFile) : null)
                        }
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

      {/* 🎯 EMPTY STATE */}
      {projects.length === 0 ||
        (!isCreatingProject && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant='h6' color='text.secondary' gutterBottom>
              Nenhum projeto criado
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              Comece criando seu primeiro projeto
            </Typography>
            <Button variant='contained' onClick={handleToggleCreateForm} startIcon={<i className='ri-add-line' />}>
              Criar Projeto
            </Button>
          </Box>
        ))}
    </Box>
  )
}
