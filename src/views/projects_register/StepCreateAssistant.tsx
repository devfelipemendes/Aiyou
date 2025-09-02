// MUI Imports
import { useState, useCallback, useMemo } from 'react'

import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Skeleton from '@mui/material/Skeleton'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useTheme } from '@mui/material'
import * as v from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import {
  useGetAssistantsQuery,
  useCreateAssistantMutation,
  useUpdateAssistantMutation,
  useDeleteAssistantMutation,
  type ProcessedAssistant,
  type CreateAssistantRequest,
  type UpdateAssistantRequest
} from '@/api/endpoints/assistant/assistant'

import { useGetProjectsQuery, type Project } from '@/api/endpoints/Projects/project'

import ConfirmDialog, { useConfirmDialog } from '@/components/dialogs/confirmation-dialog'
import AssistantCard from '@/components/CardAssistant'

export interface UIAssistant extends ProcessedAssistant {}

interface AssistantManagerProps {
  onNextStep?: () => void
  showFinishButton?: boolean
  finishButtonText?: string
}

const AssistantSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Nome do assistente é obrigatório')),
  project_id: v.pipe(v.string(), v.minLength(1, 'Projeto é obrigatório'))
})

type AssistantFormData = v.InferInput<typeof AssistantSchema>

export default function StepCreateAssistant({
  onNextStep,
  showFinishButton = true,
  finishButtonText = 'Finalizar Criação de Assistentes'
}: AssistantManagerProps = {}) {
  const theme = useTheme()

  const {
    data: assistantsResponse,
    isLoading: isLoadingAssistants,
    isError: isErrorAssistants,
    error: assistantsError,
    refetch: refetchAssistants
  } = useGetAssistantsQuery()

  const { data: projectsResponse, isLoading: isLoadingProjects } = useGetProjectsQuery()

  const [createAssistant, { isLoading: isCreating }] = useCreateAssistantMutation()
  const [updateAssistant, { isLoading: isUpdating }] = useUpdateAssistantMutation()
  const [deleteAssistant] = useDeleteAssistantMutation()

  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false)
  const [editingAssistant, setEditingAssistant] = useState<UIAssistant | null>(null)
  const [assistantToDelete, setAssistantToDelete] = useState<UIAssistant | null>(null)

  const confirmDialog = useConfirmDialog()

  const createForm = useForm<AssistantFormData>({
    resolver: valibotResolver(AssistantSchema),
    defaultValues: {
      name: '',
      project_id: ''
    },
    mode: 'onChange'
  })

  const editForm = useForm<AssistantFormData>({
    resolver: valibotResolver(AssistantSchema),
    defaultValues: {
      name: '',
      project_id: ''
    },
    mode: 'onChange'
  })

  const assistants: UIAssistant[] = useMemo(() => {
    if (!assistantsResponse?.data) return []

    return assistantsResponse.data
  }, [assistantsResponse])

  const projects: Project[] = useMemo(() => {
    if (!projectsResponse?.data) return []

    return projectsResponse.data
  }, [projectsResponse])

  const isCreateFormValid = useMemo(() => {
    return createForm.formState.isValid
  }, [createForm.formState.isValid])

  const isEditFormValid = useMemo(() => {
    return editForm.formState.isValid
  }, [editForm.formState.isValid])

  const handleFinalSubmit = useCallback(() => {
    const finalData = {
      assistants: assistants,
      totalAssistants: assistants.length
    }

    console.log('Dados finais dos assistentes para envio:', finalData)

    if (onNextStep) {
      onNextStep()
    }
  }, [assistants, onNextStep])

  const handleToggleCreateForm = useCallback(() => {
    setIsCreatingAssistant(prev => !prev)

    if (isCreatingAssistant) {
      createForm.reset()
    }
  }, [createForm, isCreatingAssistant])

  const handleOpenEditModal = useCallback(
    (assistant: UIAssistant) => {
      setEditingAssistant(assistant)

      editForm.reset({
        name: assistant.name,
        project_id: assistant.project_id
      })
    },
    [editForm]
  )

  const handleCloseEditModal = useCallback(() => {
    setEditingAssistant(null)
    editForm.reset()
  }, [editForm])

  const handleCreateSubmit = useCallback(
    async (data: AssistantFormData) => {
      try {
        const requestData: CreateAssistantRequest = {
          name: data.name,
          project_id: data.project_id
        }

        console.log('🔄 Enviando CREATE assistant:', requestData)

        const result = await createAssistant(requestData)

        console.log('🔍 DEBUG - Resultado completo do CREATE:', result)

        // ✅ VERIFICAÇÃO MAIS ESPECÍFICA
        if ('error' in result) {
          console.error('❌ Erro na API:', result.error)
          console.error('❌ Detalhes do erro:', JSON.stringify(result.error, null, 2))
          alert('Erro ao criar assistente')

          return
        }

        if ('data' in result && result.data) {
          console.log('✅ Assistente criado com sucesso!', result.data)

          // Sucesso - resetar form
          createForm.reset()
          setIsCreatingAssistant(false)
        } else {
          console.error('❌ Resposta inesperada:', result)
          alert('Resposta inesperada do servidor')
        }
      } catch (error: any) {
        console.error('❌ Erro inesperado:', error)
        alert('Erro inesperado ao criar assistente')
      }
    },
    [createAssistant, createForm]
  )

  // 🎯 SUBMIT EDIÇÃO
  const handleEditSubmit = useCallback(
    async (data: AssistantFormData) => {
      if (!editingAssistant) return

      try {
        const requestData: UpdateAssistantRequest = {
          id: editingAssistant.id,
          name: data.name,
          project_id: data.project_id
        }

        console.log('🔄 Enviando UPDATE assistant:', requestData)

        const result = await updateAssistant(requestData)

        console.log('🔍 DEBUG - Resultado completo do UPDATE:', result)

        // ✅ VERIFICAÇÃO MAIS ESPECÍFICA:
        // RTK Query considera erro quando não tem 'data' ou quando tem 'error'
        if ('error' in result) {
          console.error('❌ Erro na API:', result.error)
          console.error('❌ Detalhes do erro:', JSON.stringify(result.error, null, 2))
          alert('Erro ao atualizar assistente')

          return
        }

        if ('data' in result && result.data) {
          console.log('✅ Assistente atualizado com sucesso!', result.data)

          // Sucesso - fechar modal
          handleCloseEditModal()
        } else {
          console.error('❌ Resposta inesperada:', result)
          alert('Resposta inesperada do servidor')
        }
      } catch (error: any) {
        console.error('❌ Erro inesperado:', error)
        alert('Erro inesperado ao atualizar assistente')
      }
    },
    [updateAssistant, editingAssistant, handleCloseEditModal]
  )

  // 🎯 DELETE ASSISTANT
  const handleDeleteAssistant = useCallback(
    (id: string) => {
      const assistant = assistants.find(a => a.id === id)

      if (!assistant) return

      setAssistantToDelete(assistant)
      confirmDialog.openDialog()
    },
    [assistants, confirmDialog]
  )

  const handleConfirmDelete = useCallback(async () => {
    if (!assistantToDelete) return

    try {
      confirmDialog.setLoading(true)

      console.log('🔄 Enviando DELETE assistant:', assistantToDelete.id)

      const result = await deleteAssistant({ id: assistantToDelete.id })

      console.log('🔍 DEBUG - Resultado completo do DELETE:', result)

      // ✅ VERIFICAÇÃO MAIS ESPECÍFICA
      if ('error' in result) {
        console.error('❌ Erro na API:', result.error)
        console.error('❌ Detalhes do erro:', JSON.stringify(result.error, null, 2))
        alert('Erro ao deletar assistente')

        return
      }

      if ('data' in result && result.data) {
        console.log('✅ Assistente deletado com sucesso!', result.data)

        // Fechar dialog e limpar estado
        confirmDialog.closeDialog()
        setAssistantToDelete(null)
      } else {
        console.error('❌ Resposta inesperada:', result)
        alert('Resposta inesperada do servidor')
      }
    } catch (error: any) {
      console.error('❌ Erro inesperado:', error)
      alert('Erro inesperado ao deletar assistente')
    } finally {
      confirmDialog.setLoading(false)
    }
  }, [assistantToDelete, deleteAssistant, confirmDialog])

  const handleCancelDelete = useCallback(() => {
    confirmDialog.closeDialog()
    setAssistantToDelete(null)
  }, [confirmDialog])

  // 🎯 CHAT HANDLER (placeholder - você pode implementar depois)
  const handleChatAssistant = useCallback((assistant: UIAssistant) => {
    console.log('Iniciar chat com assistente:', assistant.name)

    // TODO: Implementar navegação para chat
  }, [])

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
  if (isErrorAssistants) {
    return (
      <Box sx={{ mx: 'auto', p: 3 }}>
        <Alert
          severity='error'
          action={
            <Button color='inherit' size='small' onClick={() => refetchAssistants()}>
              Tentar Novamente
            </Button>
          }
        >
          Erro ao carregar assistentes: {(assistantsError as any)?.message || 'Erro desconhecido'}
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
            Crie seus assistentes
          </Typography>

          <Box display='flex' gap={2} alignItems='center'>
            {(assistants.length > 0 || isLoadingAssistants) && (
              <Button
                variant='contained'
                onClick={handleToggleCreateForm}
                disabled={isCreating || isLoadingAssistants || confirmDialog.loading || projects.length === 0}
                endIcon={<i className='ri-add-line' />}
              >
                Criar Assistente
              </Button>
            )}
          </Box>
        </Box>

        {projects.length === 0 && !isLoadingProjects && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            Você precisa criar pelo menos um projeto antes de criar assistentes.
          </Alert>
        )}
      </Box>

      {/* 🎯 FORMULÁRIO DE CRIAÇÃO */}
      <Collapse in={isCreatingAssistant}>
        <Box sx={{ mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Criar Novo Assistente
          </Typography>

          <form onSubmit={createForm.handleSubmit(handleCreateSubmit)}>
            <Grid container spacing={3}>
              {/* Nome */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name='name'
                  control={createForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Nome do Assistente'
                      required
                      disabled={isCreating}
                      error={!!createForm.formState.errors.name}
                      helperText={createForm.formState.errors.name?.message}
                      placeholder='Ex: Assistente de Vendas, Suporte Técnico'
                    />
                  )}
                />
              </Grid>

              {/* Projeto */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name='project_id'
                  control={createForm.control}
                  render={({ field }) => (
                    <FormControl fullWidth required disabled={isCreating || isLoadingProjects}>
                      <InputLabel>Projeto</InputLabel>
                      <Select {...field} label='Projeto' error={!!createForm.formState.errors.project_id}>
                        {projects.map(project => (
                          <MenuItem key={project.id} value={project.id}>
                            {project.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {createForm.formState.errors.project_id && (
                        <Typography variant='caption' color='error' sx={{ mt: 1, ml: 2 }}>
                          {createForm.formState.errors.project_id.message}
                        </Typography>
                      )}
                    </FormControl>
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
                    {isCreating ? 'Criando...' : 'Criar Assistente'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Collapse>

      {/* 🎯 LISTA DE ASSISTENTES */}
      {isLoadingAssistants ? (
        renderLoadingSkeleton()
      ) : assistants.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {assistants.map(assistant => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={assistant.id}>
                <AssistantCard
                  assistant={assistant}
                  onEdit={handleOpenEditModal}
                  onRemove={handleDeleteAssistant}
                  onChat={handleChatAssistant}
                  isUpdating={isUpdating || confirmDialog.loading}
                  height={350}
                  backgroundColor={theme.palette.primary.main}
                  backgroundImage='/images/iaImages/headerLogo.png'
                />
              </Grid>
            ))}
          </Grid>

          {!isCreatingAssistant && onNextStep && showFinishButton && (
            <Box className='flex flex-col w-full items-start mt-6'>
              <Button variant='contained' color='primary' size='small' onClick={handleFinalSubmit}>
                {finishButtonText}
              </Button>
            </Box>
          )}
        </>
      ) : (
        <>
          {!isCreatingAssistant && projects.length > 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant='h6' color='text.secondary' gutterBottom>
                Você ainda não tem assistentes criados
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Comece criando seu primeiro assistente
              </Typography>
              <Button
                variant='contained'
                color='primary'
                onClick={handleToggleCreateForm}
                disabled={isCreating || confirmDialog.loading}
                startIcon={<i className='ri-add-line' />}
                size='large'
              >
                Criar Novo Assistente
              </Button>
            </Box>
          )}
        </>
      )}

      {/* 🎯 MODAL DE EDIÇÃO */}
      <Dialog open={!!editingAssistant} onClose={handleCloseEditModal} maxWidth='sm' fullWidth>
        <DialogTitle>Editar Assistente: {editingAssistant?.name}</DialogTitle>

        <DialogContent>
          <form onSubmit={editForm.handleSubmit(handleEditSubmit)} id='edit-assistant-form'>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Nome */}
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='name'
                  control={editForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Nome do Assistente'
                      required
                      disabled={isUpdating}
                      error={!!editForm.formState.errors.name}
                      helperText={editForm.formState.errors.name?.message}
                    />
                  )}
                />
              </Grid>

              {/* Projeto */}
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='project_id'
                  control={editForm.control}
                  render={({ field }) => (
                    <FormControl fullWidth required disabled={isUpdating || isLoadingProjects}>
                      <InputLabel>Projeto</InputLabel>
                      <Select {...field} label='Projeto' error={!!editForm.formState.errors.project_id}>
                        {projects.map(project => (
                          <MenuItem key={project.id} value={project.id}>
                            {project.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {editForm.formState.errors.project_id && (
                        <Typography variant='caption' color='error' sx={{ mt: 1, ml: 2 }}>
                          {editForm.formState.errors.project_id.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
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
            form='edit-assistant-form'
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
        title='Deletar Assistente'
        message={assistantToDelete ? `Tem certeza que deseja deletar o assistente "${assistantToDelete.name}"?` : ''}
        subtitle='Esta ação não pode ser desfeita.'
        confirmText='Deletar'
        cancelText='Cancelar'
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Box>
  )
}
