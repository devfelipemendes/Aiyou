'use client'

import { useEffect, useMemo, useState } from 'react'

import { useForm, Controller } from 'react-hook-form'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import {
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid2 as Grid,
  InputAdornment,
  InputLabel,
  Select,
  Typography
} from '@mui/material'
import { LockKeyhole, MapPinHouse, UserPen } from 'lucide-react'

import { toast } from 'react-toastify'

import { useLazyGetCepInfoQuery } from '@/api/endpoints/cep'
import type { Project } from '@/api/endpoints/Projects/project'
import { useGetProjectsQuery } from '@/api/endpoints/Projects/project'
import { useCreateOperatorMutation } from '@/api/endpoints/operator/operator'
import { isValidCpfOrCnpj } from '@/utils/validatorCPF_CNPJ'
import { maskCep, maskCnpjCpf, unmaskValue } from '@/utils/masks'

type CreateOperatorDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

type FormData = {
  name: string
  project_id: string
  identifier: string
  date: string
  phone_number: string
  whatsapp_number: string
  email: string
  password: string
  password_confirmation: string
  cep: string
  uf: string
  city: string
  street: string
  number: string
  neighborhood: string
  complement: string
}

export default function CreateOperatorDialog({ open, setOpen }: CreateOperatorDialogProps) {
  const { control, handleSubmit, setValue, watch, reset, formState } = useForm<FormData>({
    defaultValues: {
      name: '',
      project_id: '',
      date: '',
      phone_number: '',
      whatsapp_number: '',
      email: '',
      password: '',
      identifier: '',
      password_confirmation: '',
      cep: '',
      uf: '',
      city: '',
      street: '',
      number: '',
      neighborhood: '',
      complement: ''
    }
  })

  const [getCepInfo] = useLazyGetCepInfoQuery()
  const cepValue = watch('cep')
  const passwordValue = watch('password')
  const [loadingCep, setLoadingCep] = useState(false)
  const { data: projectsResponse } = useGetProjectsQuery()
  const [createOperator, { isLoading }] = useCreateOperatorMutation()

  const projects: Project[] = useMemo(() => {
    if (!projectsResponse?.data) return []

    return projectsResponse.data
  }, [projectsResponse])

  useEffect(() => {
    const fetchCep = async () => {
      const cep = unmaskValue(cepValue)

      if (cep?.length === 8) {
        setLoadingCep(true)

        try {
          const res = await getCepInfo(cep)

          if (res.data && !('erro' in res.data)) {
            setValue('uf', res.data.uf)
            setValue('city', res.data.localidade)
            setValue('street', res.data.logradouro)
            setValue('neighborhood', res.data.bairro)
          }
        } finally {
          setLoadingCep(false)
        }
      }
    }

    fetchCep()
  }, [cepValue, getCepInfo, setValue])

  const onSubmit = async (data: FormData) => {
    try {
      const { project_id, ...body } = data // remove project_id do body

      const res = await createOperator({ project_id, ...body }).unwrap()

      console.log('resssssssssssssssssssssssssssssss', res)

      toast.success(res.message)

      reset()
      setOpen(false)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle className='w-full text-center mt-2'>Cadastrar Operador</DialogTitle>
      <DialogContent>
        <form
          id='edit-form'
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}
        >
          {' '}
          <Grid container spacing={2}>
            <Typography className='w-full mt-4 mb-1 text-primary flex flex-row items-center gap-2'>
              <UserPen /> Dados Pessoais
            </Typography>
            <Grid size={{ xs: 6 }}>
              <Controller
                name='name'
                control={control}
                rules={{ required: 'Nome obrigatório' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='Nome'
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name='identifier'
                control={control}
                rules={{
                  required: 'CPF ou CNPJ Obrigatório',
                  validate: value => isValidCpfOrCnpj(value) || 'CPF ou CNPJ inválido'
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='CPF / CNPJ'
                    fullWidth
                    value={maskCnpjCpf(field.value || '')} // mostra mascarado
                    onChange={e => {
                      // sempre salva sem máscara no form
                      const rawValue = e.target.value.replace(/\D/g, '')

                      field.onChange(rawValue)
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name='date'
                control={control}
                rules={{ required: 'Data obrigatória' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='Data Nascimento'
                    type='date'
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name='phone_number'
                control={control}
                rules={{ required: 'Telefone obrigatório' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='Telefone'
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Controller
                name='whatsapp_number'
                control={control}
                rules={{ required: 'Whatsapp obrigatório' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='Whatsapp'
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Controller
                name='email'
                control={control}
                rules={{
                  required: 'Email obrigatório',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email inválido'
                  }
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='Email'
                    type='email'
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name='project_id'
                control={control}
                rules={{ required: 'Projeto obrigatório' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!formState.errors.project_id}>
                    <InputLabel>Projeto</InputLabel>
                    <Select {...field} label='Projeto'>
                      {projects.map(project => (
                        <MenuItem key={project.id} value={project.id}>
                          {project.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formState.errors.project_id && (
                      <FormHelperText>{formState.errors.project_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Typography className='w-full mt-4 mb-1 text-primary flex flex-row items-center gap-2'>
              <MapPinHouse />
              Endereço
            </Typography>
            <Grid size={{ xs: 6 }}>
              <Controller
                name='cep'
                control={control}
                rules={{ required: 'CEP obrigatório' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='CEP'
                    fullWidth
                    value={maskCep(field.value || '')} // aplica a máscara no valor
                    onChange={e => field.onChange(maskCep(e.target.value))} // aplica a máscara ao digitar
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    InputProps={{
                      endAdornment: loadingCep ? (
                        <InputAdornment position='end'>
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ) : null
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Controller
                name='uf'
                control={control}
                render={({ field }) => <TextField {...field} label='UF' fullWidth disabled={loadingCep} />}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name='city'
                control={control}
                render={({ field }) => <TextField {...field} label='Cidade' fullWidth disabled={loadingCep} />}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Controller
                name='street'
                control={control}
                render={({ field }) => <TextField {...field} label='Rua' fullWidth disabled={loadingCep} />}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name='number'
                control={control}
                render={({ field }) => <TextField {...field} label='Número' fullWidth />}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Controller
                name='neighborhood'
                control={control}
                render={({ field }) => <TextField {...field} label='Bairro' fullWidth disabled={loadingCep} />}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name='complement'
                control={control}
                render={({ field }) => <TextField {...field} label='Complemento' fullWidth />}
              />
            </Grid>
            <Typography className='w-full mt-4 mb-1 text-primary flex flex-row items-center gap-2'>
              <LockKeyhole />
              Segurança
            </Typography>
            <Grid size={{ xs: 6 }}>
              <Controller
                name='password'
                control={control}
                rules={{
                  required: 'Senha obrigatória',
                  minLength: {
                    value: 8,
                    message: 'A senha deve ter pelo menos 8 caracteres'
                  }
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='Senha'
                    type='password'
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name='password_confirmation'
                control={control}
                rules={{
                  required: 'Confirmação de senha obrigatória',
                  validate: value => value === passwordValue || 'As senhas não coincidem'
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='Confirmar Senha'
                    type='password'
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button type='submit' form='edit-form' variant='contained' color='primary' disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
