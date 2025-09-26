'use client'

import {
  Grid2 as Grid,
  TextField,
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
import type { UseFormReturn } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import type { AssistantFormData, UIAssistant } from '@/views/projects_register/StepCreateAssistant'

interface EditAssistantDialogProps {
  open: boolean
  assistant: UIAssistant | null
  editForm: UseFormReturn<AssistantFormData>
  projects: { id: string; name: string }[]
  onClose: () => void
  onSubmit: (data: any) => void
  isUpdating: boolean
  isLoadingProjects: boolean
  isFormValid: boolean
}

export default function EditAssistantDialog({
  open,
  assistant,
  editForm,
  projects,
  onClose,
  onSubmit,
  isUpdating,
  isLoadingProjects,
  isFormValid
}: EditAssistantDialogProps) {
  if (!assistant) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Editar Assistente: {assistant.name}</DialogTitle>

      <DialogContent>
        <form onSubmit={editForm.handleSubmit(onSubmit)} id='edit-assistant-form'>
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
        <Button onClick={onClose} disabled={isUpdating}>
          Cancelar
        </Button>
        <Button
          type='submit'
          form='edit-assistant-form'
          variant='contained'
          color='primary'
          disabled={!isFormValid || isUpdating}
          startIcon={isUpdating ? <CircularProgress size={16} /> : <i className='ri-check-line' />}
        >
          {isUpdating ? 'Atualizando...' : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
