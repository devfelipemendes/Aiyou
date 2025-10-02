'use client'

import { useEffect } from 'react'

import { useForm, Controller } from 'react-hook-form'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

import {
  useGetAssistantPhoneQuery,
  useUpdateAssistantPhoneMutation
} from '@/api/endpoints/assistantPhone/assistantPhone'
import type { useGetSingleAssistantQuery } from '@/api/endpoints/assistant/assistant'
import { maskTelefone, unmaskTelefone } from '@/utils/masks'

type EditPhoneProps = {
  open: boolean
  setOpen: (open: boolean) => void
  phone_id: string
  assistant_id: string
  refetch: ReturnType<typeof useGetSingleAssistantQuery>['refetch']
}

type FormValues = {
  phone: string
  wa_id: string
  wa_key: string
}

const EditPhone = ({ open, setOpen, phone_id, assistant_id, refetch }: EditPhoneProps) => {
  const { data, isLoading } = useGetAssistantPhoneQuery(phone_id)
  const [updatePhone, { isLoading: isUpdating }] = useUpdateAssistantPhoneMutation()

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      phone: '',
      wa_id: '',
      wa_key: ''
    }
  })

  // Limpa o formulário sempre que o modal abre ou o phone_id muda

  // Popula os campos quando os dados forem carregados
  useEffect(() => {
    if (!open) return

    // limpa sempre que mudar o phone_id
    reset({
      phone: '',
      wa_id: '',
      wa_key: ''
    })

    if (data?.data) {
      reset({
        phone: maskTelefone(data.data.phone),
        wa_id: data.data.wa_id,
        wa_key: data.data.wa_key
      })
    }
  }, [open, phone_id, data, reset])

  const handleClose = () => {
    reset({
      phone: '',
      wa_id: '',
      wa_key: ''
    })
    setOpen(false)
  }

  const onSubmit = async (formData: FormValues) => {
    try {
      await updatePhone({
        phone_id,
        data: { assistant_id, phone: unmaskTelefone(formData.phone), wa_id: formData.wa_id, wa_key: formData.wa_key }
      }).unwrap()
      reset()
      refetch()
      setOpen(false)
    } catch (error: any) {
      console.error('Erro ao atualizar número:', error)
    }
  }

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <DialogTitle variant='h4' className='flex flex-col gap-2 text-center'>
        Editar whatsapp do assistente
      </DialogTitle>
      <Typography component='span' className='flex flex-col text-center mb-4'>
        Atualize os dados do número
      </Typography>

      <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
        <i className='ri-close-line' />
      </IconButton>

      <DialogContent className='overflow-visible'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3'>
          {isLoading ? (
            <Box className='flex w-full h-full justify-center items-center'>
              <CircularProgress size={15} />
            </Box>
          ) : (
            <>
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
                    disabled={isLoading}
                    onChange={e => field.onChange(maskTelefone(e.target.value))}
                    value={field.value} // mantém o valor controlado
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                )}
              />
            </>
          )}

          <DialogActions className='justify-center mt-2'>
            <LoadingButton variant='contained' type='submit' loading={isUpdating || isLoading}>
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

export default EditPhone
