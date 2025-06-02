'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Image from 'next/image'

import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import * as v from 'valibot'
import { valibotResolver } from '@hookform/resolvers/valibot'

import type { Mode } from '@core/types'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'

// Config Imports
import themeConfig from '@/configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import { usePostLoginMutation } from '@/api/endpoints/authUser/login'

const loginSchema = v.object({
  email: v.pipe(v.string('Email é obrigatório'), v.nonEmpty('Email é obrigatório'), v.email('Email inválido')),
  password: v.pipe(
    v.string('Senha é obrigatória'),
    v.nonEmpty('Senha é obrigatória'),
    v.minLength(6, 'Senha deve ter pelo menos 6 caracteres')
  ),
  rememberMe: v.boolean()
})

type LoginFormData = v.InferInput<typeof loginSchema>

const LoginV2 = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [postLogin, { isLoading, error }] = usePostLoginMutation()
  const navigation = useRouter()

  // Hooks

  const { settings } = useSettings()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: valibotResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit = async (data: { email: string; password: string }) => {
    // Prevent default form submission behavior
    console.log('Dados do formulário:', data)

    try {
      const response = await postLogin({
        email: data.email,
        password: data.password,
        device_name: 'web'
      }).unwrap()

      if (response.data?.token) {
        localStorage.setItem('token', response.data.token) // Store token in localStorage
      }

      console.log('Login successful:', response)
      navigation.push('/home')

      // alert('Login successful!') // Show success message
    } catch (err: any) {
      toast.error(`Erro ao logar error ${error}`) // Show success message
      console.log('Detalhes do erro:', {
        status: err.status,
        data: err.data,
        message: err.data?.message || 'Erro desconhecido'
      })

      // alert('Login failed. Please check your credentials and try again.' + error) // Show error message
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <Image
          src='/images/iaImages/logoApi.png'
          alt='logo3d'
          className={'object-cover '}
          unoptimized={true}
          fill
          quality={100}
        />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'>
          <Logo color='white' />
        </Link>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div>
            <Typography variant='h4'>{`Bem-vindo à ${themeConfig.templateName}! 👋🏻`}</Typography>
            <Typography className='mbs-1'>Por favor, entre em sua conta e dê o proximo passo para o futuro</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Controller
              name='email'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  autoFocus
                  fullWidth
                  label='Email'
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
            <Controller
              name='password'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Password'
                  type={isPasswordShown ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isSubmitting}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              )}
            />
            <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
              <Controller
                name='rememberMe'
                control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label='Lembre-se de mim ' />
                )}
              />

              <Typography className='text-end' color='primary.main' component={Link}>
                Esqueceu sua senha?
              </Typography>
            </div>
            <Button fullWidth variant='contained' type='submit' disabled={isSubmitting || isLoading}>
              Entrar
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>Novo na AiYou?</Typography>
              <Typography
                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                color='primary.main'
                onClick={() => navigation.push('/register')}
              >
                Criar uma conta
              </Typography>
            </div>
            <Divider className='gap-3'>ou</Divider>
            <div className='flex justify-center items-center gap-2'>
              <IconButton size='small' className='text-facebook'>
                <i className='ri-facebook-fill' />
              </IconButton>
              <IconButton size='small' className='text-twitter'>
                <i className='ri-twitter-fill' />
              </IconButton>
              <IconButton size='small' className='text-github'>
                <i className='ri-github-fill' />
              </IconButton>
              <IconButton size='small' className='text-googlePlus'>
                <i className='ri-google-fill' />
              </IconButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginV2
