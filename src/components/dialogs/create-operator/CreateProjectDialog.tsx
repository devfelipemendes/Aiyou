'use client'

import { useState, useMemo, useCallback } from 'react'

import { useForm, Controller } from 'react-hook-form'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import {
  CircularProgress,
  FormControl,
  FormLabel,
  ToggleButton,
  ToggleButtonGroup,
  Grid2 as Grid,
  Box
} from '@mui/material'
import { valibotResolver } from '@hookform/resolvers/valibot'
import * as v from 'valibot'

import { useCreateProjectMutation, type CreateProjectRequest } from '@/api/endpoints/Projects/project'
import ImageDropzone from '@/components/dropDonwLogo'

export type ProjectFormData = {
  name: string
  description: string
  imageMode: 'file' | 'url'
  img_url?: string
}

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

type CreateProjectDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: (project: any) => void
}

export default function CreateProjectDialog({ open, setOpen, onSuccess }: CreateProjectDialogProps) {
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation()
  const [createImageFile, setCreateImageFile] = useState<File | null>(null)
  const [createImageMode, setCreateImageMode] = useState<'file' | 'url'>('file')

  const form = useForm<ProjectFormData>({
    resolver: valibotResolver(ProjectSchema),
    defaultValues: { name: '', description: '', imageMode: 'file', img_url: '' },
    mode: 'onChange'
  })

  const isFormValid = useMemo(() => {
    const baseValid = form.formState.isValid
    const imgUrl = form.watch('img_url')

    if (createImageMode === 'file') return baseValid && createImageFile !== null

    return baseValid && !!imgUrl
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formState.isValid, createImageMode, createImageFile, form.watch('img_url')])

  const handleClose = useCallback(() => {
    form.reset()
    setCreateImageFile(null)
    setCreateImageMode('file')
    setOpen(false)
  }, [form, setOpen])

  const handleSubmit = useCallback(
    async (data: ProjectFormData) => {
      try {
        if (createImageMode === 'file' && !createImageFile) {
          alert('Selecione uma imagem ou mude para URL')

          return
        }

        if (createImageMode === 'url' && !data.img_url) {
          alert('Digite a URL da imagem ou mude para arquivo')

          return
        }

        const requestData: CreateProjectRequest = {
          name: data.name,
          description: data.description
        }

        if (createImageMode === 'file' && createImageFile) requestData.image = createImageFile
        if (createImageMode === 'url' && data.img_url) requestData.img_url = data.img_url

        const result = await createProject(requestData)

        if (result.error) {
          console.error('Erro ao criar projeto:', result.error)
          alert('Erro ao criar projeto')

          return
        }

        form.reset()
        setCreateImageFile(null)
        setCreateImageMode('file')
        setOpen(false)
        if (onSuccess) onSuccess(result.data)
      } catch (error) {
        console.error('Erro inesperado:', error)
        alert('Erro inesperado ao criar projeto')
      }
    },
    [createProject, createImageFile, createImageMode, form, onSuccess, setOpen]
  )

  const handleImageModeChange = (_: React.MouseEvent<HTMLElement>, newMode: 'file' | 'url') => {
    if (!newMode) return
    setCreateImageMode(newMode)
    setCreateImageFile(null)
    if (newMode === 'file') form.resetField('img_url')
  }

  const handleImageChange = (file: File | null) => setCreateImageFile(file)

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle className='w-full text-center mt-2'>Criar Projeto</DialogTitle>
      <DialogContent>
        <form id='create-project-form' onSubmit={form.handleSubmit(handleSubmit)}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl component='fieldset' sx={{ width: '100%' }}>
                <FormLabel component='legend' sx={{ mb: 2 }}>
                  Imagem do Projeto
                </FormLabel>
                <ToggleButtonGroup
                  value={createImageMode}
                  exclusive
                  onChange={handleImageModeChange}
                  sx={{ mb: 2 }}
                  disabled={isCreating}
                >
                  <ToggleButton value='file'>📁 Upload de Arquivo</ToggleButton>
                  <ToggleButton value='url'>🔗 URL da Imagem</ToggleButton>
                </ToggleButtonGroup>
                {createImageMode === 'file' ? (
                  <Box display='flex' justifyContent='center' sx={{ mb: 2 }}>
                    <ImageDropzone
                      onImageChange={handleImageChange}
                      size='lg'
                      placeholder='Imagem do projeto'
                      maxSizeMB={10}
                      disabled={isCreating}
                    />
                  </Box>
                ) : (
                  <Controller
                    name='img_url'
                    control={form.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='URL da Imagem'
                        disabled={isCreating}
                        error={!!form.formState.errors.img_url}
                        helperText={form.formState.errors.img_url?.message}
                        placeholder='https://exemplo.com/imagem.jpg'
                      />
                    )}
                  />
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name='name'
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='Nome do Projeto'
                    fullWidth
                    disabled={isCreating}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name='description'
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='Descrição'
                    fullWidth
                    multiline
                    rows={4}
                    disabled={isCreating}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message || `${field.value?.length || 0}/255 caracteres`}
                  />
                )}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isCreating}>
          Cancelar
        </Button>
        <Button
          type='submit'
          form='create-project-form'
          variant='contained'
          color='success'
          disabled={!isFormValid || isCreating}
          startIcon={isCreating ? <CircularProgress size={16} /> : null}
        >
          {isCreating ? 'Criando...' : 'Criar Projeto'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
