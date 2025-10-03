'use client'

import { useForm, Controller } from 'react-hook-form'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

import { Info } from 'lucide-react'

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
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Tooltip
                        title={
                          <div style={{ maxWidth: 220 }}>
                            Insira aqui o número de telefone que será usado para enviar e receber mensagens no WhatsApp.
                            Exemplo: +55 11 91234-5678
                          </div>
                        }
                        arrow
                        placement='top'
                      >
                        <IconButton size='small'>
                          <Info size={17} />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />

          <Controller
            name='wa_id'
            control={control}
            rules={{ required: 'ID do número do WhatsApp da Meta é obrigatório' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label='ID do WhatsApp'
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Tooltip
                        title={
                          <div style={{ maxWidth: 220 }}>
                            Este é o <strong>ID do número de WhatsApp</strong> gerado pela Meta (Facebook Business).
                            Você pode encontrar esse ID no painel de desenvolvedores da Meta.
                          </div>
                        }
                        arrow
                        placement='top'
                      >
                        <IconButton size='small'>
                          <Info size={17} />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />

          <Controller
            name='wa_key'
            control={control}
            rules={{ required: 'Token do WhatsApp é obrigatório' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label='Token do WhatsApp'
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Tooltip
                        title={
                          <div style={{ maxWidth: 220 }}>
                            Insira aqui o <strong>token de autenticação</strong> fornecido pela API do WhatsApp da Meta.
                            Esse token é necessário para validar as requisições.
                          </div>
                        }
                        arrow
                        placement='top'
                      >
                        <IconButton size='small'>
                          <Info size={17} />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
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
