// MUI Imports
'use client'
import { forwardRef, useEffect, useState, useCallback } from 'react'

import { useRouter } from 'next/navigation'

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
import { useRegisterUserMutation } from '@/api/endpoints/authUser/register'

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

  // CPF - sempre validado, mas será condicional no form
  cpf: v.pipe(
    v.string(),
    v.custom((value: any) => {
      if (!value || value.trim() === '') return true // Permite vazio, validação condicional no form
      const cleanValue = unmaskValue(typeof value === 'string' ? value : '')

      return cpf.isValid(cleanValue)
    }, 'CPF inválido')
  ),

  // CNPJ - sempre validado, mas será condicional no form
  cnpj: v.pipe(
    v.string(),
    v.custom((value: any) => {
      if (!value || value.trim() === '') return true // Permite vazio, validação condicional no form
      const cleanValue = unmaskValue(typeof value === 'string' ? value : '')

      return cnpj.isValid(cleanValue)
    }, 'CNPJ inválido')
  ),

  whatsApp: v.pipe(v.string(), v.minLength(1, 'WhatsApp é obrigatório')),
  celular: v.pipe(v.string(), v.minLength(1, 'Celular é obrigatório')),
  cep: v.pipe(v.string(), v.minLength(1, 'CEP é obrigatório')),
  uf: v.pipe(v.string(), v.minLength(1, 'UF é obrigatória')),
  cidade: v.pipe(v.string(), v.minLength(1, 'Cidade é obrigatória')),
  logradouro: v.pipe(v.string(), v.minLength(1, 'Logradouro é obrigatório')),
  numero: v.pipe(v.string(), v.minLength(1, 'Número é obrigatório')),
  complemento: v.pipe(v.string()), // Opcional
  bairro: v.pipe(v.string(), v.minLength(1, 'Bairro é obrigatório')),

  // Campos empresariais - sem validação condicional no schema
  razaoSocial: v.string(),
  dataFundacao: v.string(),
  emailCorp: v.pipe(
    v.string(),
    v.custom((value: any) => {
      if (!value || value.trim() === '') return true // Permite vazio

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      return emailRegex.test(value)
    }, 'Email corporativo inválido')
  ),
  whatsAppCorp: v.string()
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

const StepPersonalInfo = ({ handlePrev, activeStep }: StepPersonalInfoProps) => {
  registerLocale('pt-BR', ptBR)
  const router = useRouter()

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
    setError,
    clearErrors,
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

  // Função para validar campos condicionais SEM modificar o estado
  const checkConditionalFields = useCallback((formData: StepPersonalInfoType, currentRadio: string) => {
    if (currentRadio === 'cpf') {
      return !!(formData.cpf && formData.cpf.trim() !== '')
    } else if (currentRadio === 'cnpj') {
      return !!(
        formData.cnpj &&
        formData.cnpj.trim() !== '' &&
        formData.razaoSocial &&
        formData.razaoSocial.trim() !== '' &&
        formData.dataFundacao &&
        formData.dataFundacao.trim() !== '' &&
        formData.emailCorp &&
        formData.emailCorp.trim() !== '' &&
        formData.whatsAppCorp &&
        formData.whatsAppCorp.trim() !== ''
      )
    }

    return true
  }, [])

  // Função para aplicar validações condicionais (modifica estado)
  const applyConditionalValidation = useCallback(() => {
    const formData = watch()

    // Limpar erros condicionais primeiro
    clearErrors(['cpf', 'cnpj', 'razaoSocial', 'dataFundacao', 'emailCorp', 'whatsAppCorp'])

    if (radioValue === 'cpf') {
      // Validar CPF obrigatório
      if (!formData.cpf || formData.cpf.trim() === '') {
        setError('cpf', { message: 'CPF é obrigatório' })

        return false
      }
    } else if (radioValue === 'cnpj') {
      // Validar campos empresariais
      const cnpjErrors: Array<{ field: keyof StepPersonalInfoType; message: string }> = []

      if (!formData.cnpj || formData.cnpj.trim() === '') {
        cnpjErrors.push({ field: 'cnpj', message: 'CNPJ é obrigatório' })
      }

      if (!formData.razaoSocial || formData.razaoSocial.trim() === '') {
        cnpjErrors.push({ field: 'razaoSocial', message: 'Razão social é obrigatória' })
      }

      if (!formData.dataFundacao || formData.dataFundacao.trim() === '') {
        cnpjErrors.push({ field: 'dataFundacao', message: 'Data de fundação é obrigatória' })
      }

      if (!formData.emailCorp || formData.emailCorp.trim() === '') {
        cnpjErrors.push({ field: 'emailCorp', message: 'Email corporativo é obrigatório' })
      }

      if (!formData.whatsAppCorp || formData.whatsAppCorp.trim() === '') {
        cnpjErrors.push({ field: 'whatsAppCorp', message: 'WhatsApp corporativo é obrigatório' })
      }

      cnpjErrors.forEach(({ field, message }) => {
        setError(field, { message })
      })

      return cnpjErrors.length === 0
    }

    return true
  }, [radioValue, watch, clearErrors, setError])

  const handleCepChange = useCallback(
    (value: string) => {
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
    },
    [setValue]
  )

  const {
    data: cepData,
    isLoading: loadingCep,
    error: cepError
  } = useGetCepInfoQuery(unmaskValue(cepValue), {
    skip: shouldSkipCepQuery || unmaskValue(cepValue).length !== 8
  })

  // Definir isFormValid APÓS loadingCep estar disponível
  const isFormValid = useCallback(() => {
    const formData = watch()

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

    // Verificar campos preenchidos
    const allRequiredFieldsFilled = requiredFields.every(field => {
      const value = formData[field as keyof StepPersonalInfoType]

      return value && value.toString().trim() !== ''
    })

    // Verificar erros
    const hasNoErrors = Object.keys(errors).length === 0

    // Validação condicional SEM modificar estado
    const conditionalValid = checkConditionalFields(formData, radioValue)

    return allRequiredFieldsFilled && hasNoErrors && conditionalValid && !loadingCep && !isRegistering
  }, [watch, errors, radioValue, loadingCep, isRegistering, checkConditionalFields])

  const onSubmit = async (data: StepPersonalInfoType) => {
    console.log('🚀 [DEBUG] onSubmit iniciado!')
    console.log('📋 [DEBUG] Dados do formulário:', data)
    console.log('🔍 [DEBUG] savedAccountDetails:', savedAccountDetails)

    try {
      // Validação condicional final
      if (!applyConditionalValidation()) {
        console.error('❌ Validação condicional falhou')
        toast.error('Por favor, preencha todos os campos obrigatórios')

        return
      }

      console.log('💾 Salvando dados pessoais no Redux...')
      dispatch(setPersonalInfo(data))

      if (!savedAccountDetails) {
        toast.error('Dados da conta não encontrados. Volte ao primeiro step.')

        return
      }

      console.log('🔄 Combinando dados...')

      const completeData = {
        // Dados do passo anterior
        name: savedAccountDetails.name,
        email: savedAccountDetails.email,
        password: savedAccountDetails.password,
        password_confirmation: savedAccountDetails.confirmePassword,

        // Dados do passo atual
        radio: data.radio,
        dataNascimento: data.dataNascimento,
        cpf: data.cpf,
        cnpj: data.cnpj,
        whatsApp: data.whatsApp,
        celular: data.celular,
        cep: data.cep,
        uf: data.uf,
        cidade: data.cidade,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        razaoSocial: data.razaoSocial,
        dataFundacao: data.dataFundacao,
        emailCorp: data.emailCorp,
        whatsAppCorp: data.whatsAppCorp
      }

      console.log('📦 Dados completos:', completeData)

      console.log('🌐 Chamando API...')
      const response = await registerUser(completeData).unwrap()

      console.log('✅ Resposta da API:', response)

      if (response.data?.token) {
        localStorage.setItem('token', response.data.token)
        toast.success('Cadastro realizado com sucesso!')
        router.push('/login')
      } else {
        toast.success('Cadastro realizado! Prosseguindo...')
        router.push('/login')
      }
    } catch (error: any) {
      console.error('💥 Erro:', error)

      if (error?.data?.message) {
        toast.error(`Erro: ${error.data.message}`)
      } else if (error?.message) {
        toast.error(`Erro: ${error.message}`)
      } else {
        toast.error('Erro inesperado. Tente novamente.')
      }
    }
  }

  // Effect para aplicar validação condicional quando radio muda
  useEffect(() => {
    if (radioValue) {
      const timeoutId = setTimeout(() => {
        applyConditionalValidation()
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [radioValue, applyConditionalValidation])

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
