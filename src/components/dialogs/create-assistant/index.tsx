'use client'

import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import * as v from 'valibot'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  MenuItem,
  Typography
} from '@mui/material'

import LoadingButton from '@mui/lab/LoadingButton'

import { toast } from 'react-toastify'

import { useCreateAssistantMutation } from '@/api/endpoints/assistant/assistant'
import { useGetProjectsQuery } from '@/api/endpoints/Projects/project'

type CreateAssistantProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

// 🎯 Validação com Valibot no padrão pipe
const createAssistantSchema = v.object({
  project_id: v.pipe(v.string(), v.minLength(1, 'Selecione um projeto')),
  name: v.pipe(v.string(), v.minLength(1, 'Nome do assistente é obrigatório'))
})

type CreateAssistantFormData = v.InferInput<typeof createAssistantSchema>

const CreateAssistant = ({ open, setOpen }: CreateAssistantProps) => {
  const { data: projectsData, error, isLoading } = useGetProjectsQuery()
  const [createAssistant, { isLoading: isLoadingCreateAssistant }] = useCreateAssistantMutation()

  const { handleSubmit, control, reset } = useForm<CreateAssistantFormData>({
    resolver: valibotResolver(createAssistantSchema),
    defaultValues: {
      project_id: '',
      name: ''
    }
  })

  const handleClose = () => {
    setOpen(false)
    reset()
  }

  const onSubmit = async (data: CreateAssistantFormData) => {
    try {
      const response = await createAssistant(data).unwrap()

      if (response.status === 201) {
        toast.success('Assistete criado com sucesso!')
      }

      console.log('✅ Assistente criado:', response)
      handleClose()
    } catch (error) {
      toast.error('Erro ao criar assistente!')
      console.error('❌ Erro ao criar assistente:', error)
    }
  }

  // Normaliza os projetos para o select
  const projects =
    projectsData?.data.map(p => ({
      ...p,
      img_url: p.img_url ?? undefined
    })) ?? []

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <DialogTitle variant='h4' className='flex flex-col gap-2 text-center'>
        Criar Assistente
      </DialogTitle>
      <Typography component='span' className='flex flex-col text-center'>
        Criar Assistente
      </Typography>
      <DialogContent className='overflow-visible'>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line' />
        </IconButton>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          {/* Select de Projetos */}
          <Controller
            name='project_id'
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label='Projeto'
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ||
                  (isLoading ? 'Carregando projetos...' : error ? 'Erro ao carregar projetos' : '')
                }
              >
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          {/* Input de Nome do Assistente */}
          <Controller
            name='name'
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label='Nome do Assistente'
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* Ações */}
          <DialogActions className='justify-center'>
            <LoadingButton variant='contained' type='submit' loading={isLoadingCreateAssistant}>
              Salvar
            </LoadingButton>
            <Button variant='outlined' type='button' color='secondary' onClick={handleClose}>
              Cancelar
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateAssistant
