'use client'

import { useForm, Controller } from 'react-hook-form'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

import { useCreateAssistantPhoneMutation } from '@/api/endpoints/assistantPhone/assistantPhone'
import type { useGetSingleAssistantQuery } from '@/api/endpoints/assistant/assistant'

type CreatePhoneProps = {
  open: boolean
  setOpen: (open: boolean) => void
  assistant_id: string
  refetch: ReturnType<typeof useGetSingleAssistantQuery>['refetch']
}

type FormValues = {
  phone: string
  wa_id: string
  wa_key: string
}

const CreatePhone = ({ open, setOpen, assistant_id, refetch }: CreatePhoneProps) => {
  const [createPhone, { isLoading }] = useCreateAssistantPhoneMutation()

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      phone: '',
      wa_id: '',
      wa_key: ''
    }
  })

  const handleClose = () => {
    setOpen(false)
    reset()
  }

  const onSubmit = async (data: FormValues) => {
    try {
      await createPhone({ assistant_id, ...data }).unwrap()
      reset()
      refetch()
      setOpen(false)

      // Aqui você pode adicionar um toast de sucesso, se quiser
    } catch (error: any) {
      console.error('Erro ao criar número:', error)

      // Aqui você pode adicionar um toast de erro, se quiser
    }
  }

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <DialogTitle variant='h4' className='flex flex-col gap-2 text-center'>
        Novo whatsapp para o assistente
      </DialogTitle>
      <Typography component='span' className='flex flex-col text-center mb-4'>
        Cadastre um novo número
      </Typography>

      <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
        <i className='ri-close-line' />
      </IconButton>

      <DialogContent className='overflow-visible'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3'>
          <Controller
            name='phone'
            control={control}
            rules={{ required: 'O número é obrigatório' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label='Número'
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name='wa_id'
            control={control}
            rules={{ required: 'WA ID é obrigatório' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label='WA ID'
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name='wa_key'
            control={control}
            rules={{ required: 'WA Key é obrigatório' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label='WA Key'
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <DialogActions className='justify-center mt-2'>
            <LoadingButton variant='contained' type='submit' loading={isLoading}>
              Salvar
            </LoadingButton>
            <Button variant='outlined' type='button' color='error' onClick={handleClose}>
              Cancelar
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePhone
