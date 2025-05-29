// MUI Imports
'use client'
import { forwardRef, useEffect, useState } from 'react'

import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import TextField, { type TextFieldProps } from '@mui/material/TextField'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'

import * as v from 'valibot'

// Component Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import { CircularProgress, styled } from '@mui/material'

import { registerLocale } from 'react-datepicker'
import { ptBR } from 'date-fns/locale/pt-BR'

import { mask } from 'remask'

import { cpf, cnpj } from 'cpf-cnpj-validator'

import { toast } from 'react-toastify'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import DirectionalIcon from '@components/DirectionalIcon'
import type { CustomInputVerticalData } from '@/@core/components/custom-inputs/types'
import CustomInputVertical from '@/@core/components/custom-inputs/Vertical'

// Import masks
import { maskCpf, maskCnpj, maskCelular, maskCep, maskUF, unmaskValue } from '@/utils/masks'
import { useGetCepInfoQuery } from '@/api/endpoints/cep'
import { useAppDispatch, useAppSelector, type RootState } from '@/redux-store'
import { selectAccountDetails, selectPersonalInfo, setPersonalInfo } from '@/redux-store/slices/register'
import { transformRegistrationData, useRegisterUserMutation } from '@/api/endpoints/authUser/register'

type StepPersonalInfoProps = {
  handleNext: () => void
  handlePrev: () => void
  activeStep: number
}

const CustomInput = forwardRef<HTMLInputElement, TextFieldProps>(({ label, value, ...props }, ref) => {
  return <TextField fullWidth inputRef={ref} label={label || ''} value={maskDate(value)} {...props} />
})

const StepPersonalInfoSchema = v.object({
  radio: v.pipe(v.string(), v.minLength(1, 'Selecione uma opção')),
  dataNascimento: v.pipe(v.string(), v.minLength(1, 'Data de nascimento é obrigatória')),
  cpf: v.pipe(
    v.string(),
    v.minLength(1, 'CPF é obrigatório'),
    v.custom(value => {
      if (!value) return true
      const cleanValue = unmaskValue(typeof value === 'string' ? value : '')

      return cpf.isValid(cleanValue)
    }, 'CPF inválido')
  ),
  cnpj: v.pipe(
    v.string(),
    v.custom(value => {
      if (!value) return true
      const cleanValue = unmaskValue(typeof value === 'string' ? value : '')

      return cnpj.isValid(cleanValue)
    }, 'CNPJ Inválido')
  ),
  whatsApp: v.pipe(v.string(), v.minLength(1, 'WhatsApp é obrigatório')),
  celular: v.pipe(v.string(), v.minLength(1, 'Celular é obrigatório')),
  cep: v.pipe(v.string(), v.minLength(1, 'CEP é obrigatório')),
  uf: v.pipe(v.string(), v.minLength(1, 'UF é obrigatória')),
  cidade: v.pipe(v.string(), v.minLength(1, 'Cidade é obrigatória')),
  logradouro: v.pipe(v.string(), v.minLength(1, 'Logradouro é obrigatório')),
  numero: v.pipe(v.string(), v.minLength(1, 'Número é obrigatório')),
  complemento: v.pipe(v.string()),
  bairro: v.pipe(v.string(), v.minLength(1, 'Bairro é obrigatório')),
  razaoSocial: v.pipe(
    v.string(),

    //@ts-ignore
    v.custom((value, ctx) => {
      return ctx.parent.radio === 'cnpj' ? !!value && value.trim() !== '' : true
    }, 'Razão social é obrigatória')
  ),
  dataFundacao: v.pipe(
    v.string(),

    //@ts-ignore
    v.custom((value, ctx) => {
      if (ctx.parent.radio !== 'cnpj') return true
      if (!value) return false
      const [day, month, year] = value.split('/').map(Number)
      const date = new Date(year, month - 1, day)

      return !isNaN(date.getTime())
    }, 'Data de fundação inválida ou obrigatória')
  ),
  emailCorp: v.pipe(
    v.string(),
    v.email('Email corporativo inválido'),

    //@ts-ignore
    v.custom((value, ctx) => {
      return ctx.parent.radio === 'cnpj' ? !!value && value.trim() !== '' : true
    }, 'Email corporativo é obrigatório')
  ),
  whatsAppCorp: v.pipe(
    v.string(),

    //@ts-ignore
    v.custom((value, ctx) => {
      return ctx.parent.radio === 'cnpj' ? !!value && value.trim() !== '' : true
    }, 'WhatsApp corporativo é obrigatório')
  )
})

const Content = styled(Typography, {
  name: 'MuiCustomInputVertical',
  slot: 'content'
})<TypographyProps>(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: 'center'
}))

const customInputData: CustomInputVerticalData[] = [
  {
    title: 'Pessoa Física',
    value: 'cpf',
    content: (
      <Content component='div' className='flex justify-center items-center flex-col bs-full gap-2'>
        <div>
          <i className='ri-id-card-line text-[40px]' />
        </div>
        <Typography variant='body2' className='mlb-auto'>
          Quero me cadastrar com CPF
        </Typography>
      </Content>
    ),
    isSelected: true
  },
  {
    title: 'Pessoa Jurídica',
    value: 'cnpj',
    content: (
      <Content component='div' className='flex justify-center items-center flex-col bs-full'>
        <div>
          <i className='ri-briefcase-2-line text-[40px]' />
        </div>
        <Typography variant='body2' className='mlb-auto'>
          Quero me cadastrar com CNPJ
        </Typography>
      </Content>
    )
  }
]

// Função para máscara de data
const maskDate = (value: any) => (!!value ? mask(value, ['99/99/9999']) : '')

export type StepPersonalInfoType = v.InferInput<typeof StepPersonalInfoSchema>

const StepPersonalInfo = ({ handleNext, handlePrev, activeStep }: StepPersonalInfoProps) => {
  registerLocale('pt-BR', ptBR)

  //states
  const [cepValue, setCepValue] = useState('')
  const [shouldSkipCepQuery, setShouldSkipCepQuery] = useState(true)

  //Redux

  const dispatch = useAppDispatch()
  const savedAccountDetails = useAppSelector((state: RootState) => selectAccountDetails(state))
  const savedPersonalInfo = useAppSelector((state: RootState) => selectPersonalInfo(state))

  const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation()

  //hook-form
  const {
    control,
    watch,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors }
  } = useForm<StepPersonalInfoType>({
    resolver: valibotResolver(StepPersonalInfoSchema),
    mode: 'onChange',
    defaultValues: {
      radio: savedPersonalInfo?.radio || 'cpf',
      dataNascimento: savedPersonalInfo?.dataNascimento || '',
      cpf: savedPersonalInfo?.cpf || '',
      cnpj: savedPersonalInfo?.cnpj || '',
      whatsApp: savedPersonalInfo?.whatsApp || '',
      celular: savedPersonalInfo?.celular || '',
      cep: savedPersonalInfo?.cep || '',
      uf: savedPersonalInfo?.uf || '',
      cidade: savedPersonalInfo?.cidade || '',
      logradouro: savedPersonalInfo?.logradouro || '',
      numero: savedPersonalInfo?.numero || '',
      complemento: savedPersonalInfo?.complemento || '',
      bairro: savedPersonalInfo?.bairro || '',
      razaoSocial: savedPersonalInfo?.razaoSocial || '',
      dataFundacao: savedPersonalInfo?.dataFundacao || '',
      emailCorp: savedPersonalInfo?.emailCorp || '',
      whatsAppCorp: savedPersonalInfo?.whatsAppCorp || ''
    }
  })

  const radioValue = watch('radio')

  const onSubmit = async (data: StepPersonalInfoType) => {
    try {
      console.log('Iniciando processo de registro...')

      // 1. Salvar dados pessoais no Redux
      console.log('Salvando dados pessoais no Redux:', data)
      dispatch(setPersonalInfo(data))

      // 2. Verificar se temos os dados da conta
      if (!savedAccountDetails) {
        toast.error('Dados da conta não encontrados. Por favor, volte ao primeiro step.')

        return
      }

      // 3. Combinar todos os dados
      const completeData = transformRegistrationData(savedAccountDetails, data)

      console.log('Dados completos para envio:', completeData)

      // 4. Enviar para a API
      console.log('Enviando registro para a API...')
      const response = await registerUser(completeData).unwrap()

      console.log('Registro bem-sucedido:', response)

      // 5. Se sucesso, salvar token e redirecionar
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token)
        toast.success('Cadastro realizado! Prossiga para o próximo passo.')
        handleNext()
      }
    } catch (error: any) {
      console.error('Erro no registro:', error)

      // Tratar diferentes tipos de erro
      if (error?.data?.message) {
        toast.error(`Erro: ${error.data.message}`)
      } else if (error?.message) {
        toast.error(`Erro: ${error.message}`)
      } else {
        toast.error('Erro inesperado. Tente novamente.')
      }
    }
  }

  //Functions
  const isFormValid = () => {
    const requiredFields = [
      'radio',
      'dataNascimento',
      'whatsApp',
      'celular',
      'cep',
      'uf',
      'cidade',
      'logradouro',
      'numero',
      'bairro'
    ]

    // Adiciona campos específicos baseado no tipo de pessoa
    if (radioValue === 'cpf') {
      requiredFields.push('cpf')
    } else if (radioValue === 'cnpj') {
      requiredFields.push('cnpj', 'razaoSocial', 'dataFundacao', 'emailCorp', 'whatsAppCorp')
    }

    // Verifica se todos os campos obrigatórios estão preenchidos
    const allRequiredFieldsFilled = requiredFields.every(field => {
      const value = watch(field as keyof StepPersonalInfoType)

      return value && value.trim() !== ''
    })

    // Verifica se não há erros de validação
    const noValidationErrors = requiredFields.every(field => !errors[field as keyof typeof errors])

    return allRequiredFieldsFilled && noValidationErrors && !loadingCep && !isRegistering
  }

  const handleCepChange = (value: string) => {
    const maskedValue = maskCep(value)

    setCepValue(maskedValue)
    setValue('cep', maskedValue)

    // Habilita a query quando o CEP tem 8 dígitos
    if (unmaskValue(maskedValue).length === 8) {
      setShouldSkipCepQuery(false)
    } else {
      setShouldSkipCepQuery(true)

      // Limpa os campos de endereço se CEP incompleto
      setValue('uf', '')
      setValue('cidade', '')
      setValue('logradouro', '')
      setValue('bairro', '')
    }
  }

  const {
    data: cepData,
    isLoading: loadingCep,
    error: cepError
  } = useGetCepInfoQuery(unmaskValue(cepValue), {
    skip: shouldSkipCepQuery || unmaskValue(cepValue).length !== 8
  })

  useEffect(() => {
    if (cepData && !cepData.erro) {
      setValue('uf', cepData.uf || '')
      setValue('cidade', cepData.localidade || '')
      setValue('logradouro', cepData.logradouro || '')
      setValue('bairro', cepData.bairro || '')

      // Trigger validation para os campos preenchidos
      trigger(['uf', 'cidade', 'logradouro', 'bairro'])
    }
  }, [cepData, setValue, trigger])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='mbe-5'>
        <Typography variant='h4'>Informações Pessoais</Typography>
        <Typography>
          Suas informações não serão compartilhadas e podem ser excluídas a qualquer momento ao excluir sua conta
        </Typography>
      </div>
      <Grid container spacing={5}>
        <Controller
          name='radio'
          control={control}
          render={({ field }) => (
            <Grid container spacing={5} className='justify-center w-full'>
              {customInputData.map((item, index) => (
                <CustomInputVertical
                  type='radio'
                  key={index}
                  data={item}
                  gridProps={{ size: { xs: 12, sm: 6 } }}
                  selected={field.value}
                  name={field.name}
                  handleChange={field.onChange}
                />
              ))}
            </Grid>
          )}
        />

        {/* CPF Field - only show when radio is 'cpf' */}

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='cpf'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='CPF'
                placeholder='000.000.000-00'
                value={field.value}
                onChange={e => {
                  const maskedValue = maskCpf(e.target.value)

                  field.onChange(maskedValue)
                }}
                error={!!errors.cpf}
                helperText={errors.cpf?.message}
              />
            )}
          />
        </Grid>

        {/* Data de Nascimento */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='dataNascimento'
            control={control}
            render={({ field }) => (
              <AppReactDatepicker
                selected={field.value ? new Date(field.value) : null}
                id='data-nascimento'
                onChange={(date: Date | null) => field.onChange(date?.toISOString())}
                placeholderText='Selecione uma data'
                customInput={<CustomInput label='Data de Nascimento' />}
                locale='pt-BR'
                dateFormat='dd/MM/yyyy'
                maxDate={new Date()}
                showMonthDropdown
                showYearDropdown
                dropdownMode='select'
              />
            )}
          />
        </Grid>

        {/* Celular */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='celular'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Celular'
                placeholder='(00) 00000-0000'
                value={field.value}
                onChange={e => {
                  const maskedValue = maskCelular(e.target.value)

                  field.onChange(maskedValue)
                }}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position='start'>BR (+55)</InputAdornment>
                  }
                }}
                error={!!errors.celular}
                helperText={errors.celular?.message}
              />
            )}
          />
        </Grid>

        {/* WhatsApp */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='whatsApp'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='WhatsApp'
                placeholder='(00) 00000-0000'
                value={field.value}
                onChange={e => {
                  const maskedValue = maskCelular(e.target.value)

                  field.onChange(maskedValue)
                }}
                error={!!errors.whatsApp}
                helperText={errors.whatsApp?.message}
              />
            )}
          />
        </Grid>

        {/* Dados da empresa - only show when radio is 'cnpj' */}
        {radioValue === 'cnpj' && (
          <>
            <Grid size={{ xs: 12 }}>
              <Typography variant='h6'>Dados da empresa</Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='razaoSocial'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Razão Social'
                    placeholder='Nome da empresa'
                    error={!!errors.razaoSocial}
                    helperText={errors.razaoSocial?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='cnpj'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='CNPJ'
                    placeholder='00.000.000/0000-00'
                    value={field.value}
                    onChange={e => {
                      const maskedValue = maskCnpj(e.target.value)

                      field.onChange(maskedValue)
                    }}
                    error={!!errors.cnpj}
                    helperText={errors.cnpj?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='dataFundacao'
                control={control}
                render={({ field }) => (
                  <AppReactDatepicker
                    selected={field.value ? new Date(field.value) : null}
                    id='data-fundacao'
                    onChange={(date: Date | null) => field.onChange(date?.toISOString())}
                    placeholderText='Selecione uma data'
                    customInput={<CustomInput label='Data da fundação' />}
                    locale='pt-BR'
                    dateFormat='dd/MM/yyyy'
                    maxDate={new Date()}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode='select'
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='emailCorp'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='email'
                    label='Email Corporativo'
                    placeholder='contato@empresa.com'
                    error={!!errors.emailCorp}
                    helperText={errors.emailCorp?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='whatsAppCorp'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='WhatsApp Corporativo'
                    placeholder='(00) 00000-0000'
                    value={field.value}
                    onChange={e => {
                      const maskedValue = maskCelular(e.target.value)

                      field.onChange(maskedValue)
                    }}
                    error={!!errors.whatsAppCorp}
                    helperText={errors.whatsAppCorp?.message}
                  />
                )}
              />
            </Grid>
          </>
        )}

        {/* Endereço */}
        <Grid size={{ xs: 12 }}>
          <Typography variant='h6'>Endereço</Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='cep'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='CEP'
                placeholder='00000-000'
                value={cepValue}
                onChange={e => {
                  const maskedValue = maskCep(e.target.value)

                  handleCepChange(maskedValue)
                }}
                error={!!(errors.cep || (cepError && !loadingCep))}
                helperText={errors.cep?.message}
                slotProps={{
                  input: {
                    endAdornment: loadingCep ? (
                      <InputAdornment position='end'>
                        <CircularProgress size={20} />
                      </InputAdornment>
                    ) : null
                  }
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='uf'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='UF'
                placeholder='SP'
                value={field.value}
                onChange={e => {
                  const maskedValue = maskUF(e.target.value)

                  field.onChange(maskedValue)
                }}
                inputProps={{ maxLength: 2 }}
                error={!!errors.uf}
                helperText={errors.uf?.message}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='cidade'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Cidade'
                placeholder='Nome da cidade'
                error={!!errors.cidade}
                helperText={errors.cidade?.message}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='bairro'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Bairro'
                placeholder='Nome do bairro'
                error={!!errors.bairro}
                helperText={errors.bairro?.message}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='logradouro'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Logradouro'
                placeholder='Rua, Avenida, etc.'
                error={!!errors.logradouro}
                helperText={errors.logradouro?.message}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='numero'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Número'
                placeholder='123'
                error={!!errors.numero}
                helperText={errors.numero?.message}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Controller
            name='complemento'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Complemento'
                placeholder='Apartamento, casa, etc. (opcional)'
                error={!!errors.complemento}
                helperText={errors.complemento?.message}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }} className='flex justify-between'>
          <Button
            disabled={activeStep === 0}
            variant='outlined'
            color='secondary'
            onClick={handlePrev}
            startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
          >
            Voltar
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={!isFormValid()}
            endIcon={
              isRegistering ? (
                <CircularProgress size={20} color='inherit' />
              ) : (
                <DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />
              )
            }
          >
            {isRegistering ? 'Processando...' : 'Finalizar Cadastro'}
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default StepPersonalInfo
