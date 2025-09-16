'use client'

import { Controller } from 'react-hook-form'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

import ImageDropzone from '@/components/dropDonwLogo'
import type { ProjectFormData, UIProject } from '@/views/projects_register/StepCreateProject'

interface EditProjectDialogProps {
  editingProject: UIProject | null
  editForm: any
  editImageMode: 'file' | 'url'
  editImageFile: File | null
  isUpdating: boolean
  handleEditImageChange: (file: File | null) => void
  handleEditImageModeChange: (_: React.MouseEvent<HTMLElement>, mode: 'file' | 'url') => void
  handleCloseEditModal: () => void
  handleEditSubmit: (data: ProjectFormData) => void
  isEditFormValid: boolean
}

export default function EditProjectDialog({
  editingProject,
  editForm,
  editImageMode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  editImageFile,
  isUpdating,
  handleEditImageChange,
  handleEditImageModeChange,
  handleCloseEditModal,
  handleEditSubmit,
  isEditFormValid
}: EditProjectDialogProps) {
  if (!editingProject) return null

  return (
    <Dialog open={!!editingProject} onClose={handleCloseEditModal} maxWidth='md' fullWidth>
      <DialogTitle>Editar Projeto: {editingProject.name}</DialogTitle>

      <DialogContent>
        <form onSubmit={editForm.handleSubmit(handleEditSubmit)} id='edit-form'>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Nome do Projeto */}
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
                      initialImage={editingProject.img_url || undefined}
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
  )
}
