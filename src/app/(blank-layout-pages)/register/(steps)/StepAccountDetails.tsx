// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { valibotResolver } from '@hookform/resolvers/valibot'
import * as v from 'valibot'
import { Controller, useForm } from 'react-hook-form'

const AccountDetailsRegisterSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Nome é obrigatório')),
  email: v.pipe(v.string(), v.minLength(1, 'Email é obrigatório'), v.email('Email inválido')),
  password: v.pipe(v.string(), v.minLength(6, 'Senha deve ter pelo menos 6 caracteres')),
  confirmePassword: v.pipe(v.string(), v.minLength(6, 'Confirmação de senha deve ter pelo menos 6 caracteres'))
})

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'

type StepAccountDetailsProps = {
  handleNext: () => void
  activeStep: number
}

export type RegisterUserType = v.InferInput<typeof AccountDetailsRegisterSchema>

const StepAccountDetails = ({ handleNext }: StepAccountDetailsProps) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState<boolean>(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState<boolean>(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)

  const {
    watch,
    control,
    handleSubmit,

    formState: { errors, isValid, isDirty }
  } = useForm<RegisterUserType>({
    resolver: valibotResolver(AccountDetailsRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmePassword: ''
    }
  })

  const handleClickShowPassword = () => {
    setIsPasswordShown(!isPasswordShown)
  }

  const handleClickShowConfirmPassword = () => {
    setIsConfirmPasswordShown(!isConfirmPasswordShown)
  }

  const passwordValue = watch('password')
  const confirmPasswordValue = watch('confirmePassword')

  useEffect(() => {
    if (confirmPasswordValue && passwordValue !== confirmPasswordValue) {
      setPasswordsMatch(false)

      return
    }

    setPasswordsMatch(true)
  }, [confirmPasswordValue, passwordValue])

  return (
    <>
      <div className='mbe-5'>
        <Typography variant='h4'>Informações da conta</Typography>
        <Typography>Adicione os dados para acesso ao sistema</Typography>
      </div>
      <form onSubmit={handleSubmit(() => console.log('enviou'))}>
        <Grid container spacing={5}>
          <Grid size={{ xs: 12 }}>
            <Controller
              control={control}
              name='name'
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Nome'
                  placeholder='Como gostaria de ser chamado?'
                  error={!!errors.name}
                  helperText={errors.name ? errors.name.message : ''}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              control={control}
              name='email'
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type='email'
                  label='Email'
                  placeholder='example@examplemail.com'
                  error={!!errors.email}
                  helperText={errors.email ? errors.email.message : ''}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              control={control}
              name='password'
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Senha'
                  placeholder='············'
                  type={isPasswordShown ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password ? errors.password.message : ''}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                            aria-label='toggle password visibility'
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
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              control={control}
              name='confirmePassword'
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Corfirme a senha'
                  placeholder='············'
                  id='outlined-confirm-password'
                  type={isConfirmPasswordShown ? 'text' : 'password'}
                  helperText={!passwordsMatch ? 'As senhas não coincidem' : ''}
                  error={!passwordsMatch}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            edge='end'
                            onClick={handleClickShowConfirmPassword}
                            onMouseDown={e => e.preventDefault()}
                            aria-label='toggle confirm password visibility'
                          >
                            <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }} className='flex justify-end'>
            <Button
              variant='contained'
              disabled={!isValid || !isDirty || !passwordsMatch || !watch('confirmePassword')}
              onClick={handleNext}
              type='submit'
              endIcon={<DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />}
            >
              Proximo passo
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  )
}

export default StepAccountDetails
