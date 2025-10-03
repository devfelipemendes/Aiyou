'use client'

import { useEffect } from 'react'

import { useForm, Controller } from 'react-hook-form'
import {
  Grid2 as Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material'

import { useAddUserToProjectMutation } from '@/api/endpoints/operator/operator'

interface EditOperatorDialogProps {
  open: boolean
  projects: { id: string; name: string }[]
  user_id: string
  onClose: () => void
  project_id: string
  refetch: () => Promise<any>
}

interface FormValues {
  project_id: string
}

export default function EditOperatorDialog({
  open,
  onClose,
  projects,
  user_id,
  project_id,
  refetch
}: EditOperatorDialogProps) {
  const { handleSubmit, control, formState, reset } = useForm<FormValues>({
    defaultValues: { project_id: project_id } // inicializa já com o projeto vinculado
  })

  const isFormValid = !!formState.isValid || true // para garantir que o botão não fique bloqueado

  useEffect(() => {
    reset({ project_id: project_id })
  }, [project_id, reset])

  const [addUserToProject, { isLoading }] = useAddUserToProjectMutation()

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        user_id, // vem do props
        project_ids: [data.project_id] // vem do formulário, agora como array
      }

      const response = await addUserToProject(payload).unwrap()

      console.log('✅ Sucesso:', response)

      // refaz a query principal para atualizar a lista
      refetch?.()

      // fecha o modal
      onClose()
    } catch (error) {
      console.error('❌ Erro ao salvar alterações:', error)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Editar Operador</DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} id='edit-assistant-form'>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='project_id'
                control={control}
                defaultValue={project_id} // 👈 valor inicial correto
                render={({ field }) => (
                  <FormControl fullWidth required>
                    <InputLabel id='project-label'>Projeto</InputLabel>
                    <Select {...field} label='Projeto' error={!!formState.errors.project_id}>
                      {projects.map(project => (
                        <MenuItem key={project.id} value={project.id}>
                          {project.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formState.errors.project_id && (
                      <Typography variant='caption' color='error' sx={{ mt: 1, ml: 2 }}>
                        {formState.errors.project_id.message}
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
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          type='submit'
          form='edit-assistant-form'
          variant='contained'
          color='primary'
          disabled={!isFormValid || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <i className='ri-check-line' />}
        >
          {isLoading ? 'Atualizando...' : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
