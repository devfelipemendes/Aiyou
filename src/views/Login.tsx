'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Image from 'next/image'

import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'

import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import * as v from 'valibot'
import { valibotResolver } from '@hookform/resolvers/valibot'

import Cookies from 'js-cookie'

import { Box } from '@mui/material'

import { styled, keyframes } from '@mui/material/styles'

import { useWebSocket } from '@/hooks/useWebSocket'

import type { Mode } from '@core/types'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'

// Config Imports
import themeConfig from '@/configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import { usePostLoginMutation } from '@/api/endpoints/authUser/login'
import SimpleLoadingButton from '@/components/ButtonLoading/ButtonLoading'

const shimmerAnimation = keyframes`
  0% { 
    background-position: -300px 0;
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% { 
    background-position: calc(300px + 100%) 0;
    opacity: 0.8;
  }
`

// ✅ NOVA: Animação de pulse para background

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
  const [isLoading, setIsLoading] = useState(false)

  console.log(mode)

  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [postLogin] = usePostLoginMutation()
  const navigation = useRouter()

  // Hooks
  // const dispatch = useAppDispatch()
  const { settings } = useSettings()

  const { connect: connectWebSocket, status: webSocketStatus } = useWebSocket({ autoConnect: false })

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
    console.log('Dados do formulário:', data)

    setIsLoading(true)

    try {
      const response = await postLogin({
        email: data.email,
        password: data.password,
        device_name: 'web'
      }).unwrap()

      if (response.data?.token) {
        const { token, user, clients } = response.data
        const userId = user.id.toString()

        // 💾 Salvar dados no localStorage
        localStorage.setItem('token', token)
        Cookies.set('token', token)
        localStorage.setItem('userId', userId)
        localStorage.setItem('userData', JSON.stringify(user)) // 🔧 Salvar dados completos do usuário

        console.log('🔌 Iniciando conexão WebSocket após login...')

        // 🔧 Conectar WebSocket com dados dos clients
        connectWebSocket(token, userId, clients || [])

        console.log('✅ Login realizado com sucesso')

        // Aguardar um pouco para WebSocket conectar
        setTimeout(() => {
          navigation.push('/painel')
        }, 1500)
      }
    } catch (err: any) {
      toast.error(`Erro ao fazer login: ${err.data?.message || 'Erro desconhecido'}`)
      console.error('💥 Erro no login:', err)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('📡 Status WebSocket:', webSocketStatus)
  }, [webSocketStatus])

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
            <SimpleLoadingButton
              fullWidth
              variant='contained'
              type='submit'
              loading={isLoading}
              loadingText='Entrando na sua conta...'
              sx={{
                borderRadius: '12px',
                padding: '14px 24px',
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 600,

                // ✅ GRADIENTE PRINCIPAL com transição
                background: 'linear-gradient(135deg, #028175 0%, #76b901 100%)',
                backgroundSize: '200% 200%',
                backgroundPosition: '0% 0%',

                // ✅ TRANSIÇÕES ESPECÍFICAS para diferentes propriedades
                transition: [
                  'background-position 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  'filter 0.3s ease-in-out'
                ].join(', '),

                // ✅ HOVER com transição suave de posição do gradiente
                '&:hover:not(:disabled)': {
                  backgroundPosition: '100% 100%',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 12px 28px rgba(2, 129, 117, 0.3)',
                  filter: 'brightness(1.05)'
                },

                // ✅ ACTIVE state
                '&:active': {
                  transform: 'translateY(0)',
                  filter: 'brightness(0.95)'
                },

                // ✅ LOADING state com background diferente
                '&:disabled': {
                  background: 'linear-gradient(135deg, #028175 0%, #02fc6a 100%)',
                  backgroundSize: '300% 300%',
                  backgroundPosition: '0% 0%',

                  // ✅ Animação suave do gradiente durante loading
                  animation: `${shimmerAnimation} 3s infinite ease-in-out`
                },

                // ✅ FOCUS state
                '&:focus-visible': {
                  outline: '2px solid #76b901',
                  outlineOffset: '2px'
                }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,

                  // ✅ Transição suave para o conteúdo interno
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <i
                  className='ri-login-circle-line'
                  style={{
                    fontSize: '20px',

                    // ✅ Ícone com transição suave
                    transition: 'transform 0.2s ease'
                  }}
                />
                Fazer Login
              </Box>
            </SimpleLoadingButton>

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
