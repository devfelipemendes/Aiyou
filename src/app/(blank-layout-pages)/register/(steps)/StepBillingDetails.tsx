// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { TypographyProps } from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import * as v from 'valibot'
import Cards from 'react-credit-cards-2'

// Component Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import type { CustomInputVerticalData } from '@core/components/custom-inputs/types'
import CustomInputVertical from '@/@core/components/custom-inputs/Vertical'
import DirectionalIcon from '@/components/DirectionalIcon'

type StepBillingDetailsProps = {
  handlePrev: () => void
  activeStep: number
}

// Função para validar Luhn Algorithm (usado por cartões de crédito)
const validateLuhn = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '').split('').map(Number)
  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i]

    if (isEven) {
      digit *= 2

      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

// Função para identificar a bandeira do cartão
const getCardBrand = (cardNumber: string): string => {
  const number = cardNumber.replace(/\D/g, '')

  // Visa
  if (/^4/.test(number)) return 'visa'

  // Mastercard
  if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return 'mastercard'

  // American Express
  if (/^3[47]/.test(number)) return 'amex'

  // Elo (específico do Brasil)
  if (/^(4011|4312|4389|4514|4573|4576|5041|5066|5067|6277|6362|6363|6504|6505|6516|6550)/.test(number)) return 'elo'

  // Hipercard (específico do Brasil)
  if (/^(6062|384100|384140|384160|606282)/.test(number)) return 'hipercard'

  return 'unknown'
}

// Validação customizada para cartão brasileiro
const validateBrazilianCard = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\D/g, '')

  // Verifica se tem pelo menos 13 dígitos
  if (cleanNumber.length < 13) return false

  // Verifica algoritmo de Luhn
  if (!validateLuhn(cleanNumber)) return false

  // Verifica se é uma bandeira aceita no Brasil
  const brand = getCardBrand(cleanNumber)

  return ['visa', 'mastercard', 'amex', 'elo', 'hipercard'].includes(brand)
}

// Validação de data de expiração
const validateExpiryDate = (date: string): boolean => {
  const match = date.match(/^(0[1-9]|1[0-2])\/(\d{2})$/)

  if (!match) return false

  const month = parseInt(match[1])
  const year = parseInt(`20${match[2]}`) // Assume 20XX

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Verifica se não está expirado
  if (year < currentYear) return false
  if (year === currentYear && month < currentMonth) return false

  // Verifica se não é muito distante no futuro (máximo 10 anos)
  if (year > currentYear + 10) return false

  return true
}

// Schema de validação com regras brasileiras
const StepBillingDetailsSchema = v.object({
  cardNumber: v.pipe(
    v.string('Número do cartão é obrigatório'),
    v.minLength(13, 'Número do cartão deve ter pelo menos 13 dígitos'),
    v.maxLength(19, 'Número do cartão deve ter no máximo 19 dígitos'),
    v.regex(/^[\d\s]+$/, 'Apenas números e espaços são permitidos'),
    v.check(value => {
      const cleanValue = value.replace(/\D/g, '')

      return validateBrazilianCard(cleanValue)
    }, 'Número do cartão inválido ou não aceito no Brasil')
  ),
  nameOnCard: v.pipe(
    v.string('Nome é obrigatório'),
    v.minLength(2, 'Nome deve ter pelo menos 2 caracteres'),
    v.maxLength(50, 'Nome muito longo'),
    v.regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
  ),
  expiryDate: v.pipe(
    v.string('Data de expiração é obrigatória'),
    v.regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Formato deve ser MM/AA'),
    v.check(validateExpiryDate, 'Data de expiração inválida ou cartão expirado')
  ),
  cvv: v.pipe(
    v.string('CVV é obrigatório'),
    v.regex(/^\d{3,4}$/, 'CVV deve ter 3 ou 4 dígitos'),

    //@ts-ignore
    v.check((value, context) => {
      // Para Amex, CVV deve ter 4 dígitos
      const cardNumber = (context as any)?.cardNumber || ''
      const brand = getCardBrand(cardNumber)

      if (brand === 'amex') {
        return value.length === 4
      }

      return value.length === 3
    }, 'CVV inválido para este tipo de cartão')
  ),
  plan: v.union([v.literal('basic'), v.literal('standard'), v.literal('enterprise')], 'Plano inválido')
})

export type StepBillingDetailsType = v.InferInput<typeof StepBillingDetailsSchema>

// Styled Components
const Content = styled(Typography, {
  name: 'MuiCustomInputVertical',
  slot: 'content'
})<TypographyProps>(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: 'center'
}))

// Vars
const customInputData: CustomInputVerticalData[] = [
  {
    title: 'Basic',
    value: 'basic',
    content: (
      <Content component='div' className='flex justify-center items-center flex-col bs-full gap-2'>
        <Typography variant='body2' className='mlb-auto'>
          A simple start for start ups & Students
        </Typography>
        <div>
          <Typography color='primary.main' variant='body2' component='sup' className='self-start'>
            R$
          </Typography>
          <Typography color='primary.main' variant='h4' component='span'>
            0
          </Typography>
          <Typography color='text.disabled' variant='body2' component='sub' className='self-end'>
            /mês
          </Typography>
        </div>
      </Content>
    ),
    isSelected: true
  },
  {
    title: 'Standard',
    value: 'standard',
    content: (
      <Content component='div' className='flex justify-center items-center flex-col bs-full'>
        <Typography variant='body2' className='mlb-auto'>
          For small to medium businesses
        </Typography>
        <div>
          <Typography color='primary.main' variant='body2' component='sup' className='self-start'>
            R$
          </Typography>
          <Typography color='primary.main' variant='h4' component='span'>
            99
          </Typography>
          <Typography variant='body2' component='sub' className='self-end' color='text.disabled'>
            /mês
          </Typography>
        </div>
      </Content>
    )
  },
  {
    title: 'Enterprise',
    value: 'enterprise',
    content: (
      <Content component='div' className='flex justify-center items-center flex-col bs-full'>
        <Typography variant='body2' className='mlb-auto'>
          Solution for enterprise & organizations
        </Typography>
        <div>
          <Typography color='primary.main' variant='body2' component='sup' className='self-start'>
            R$
          </Typography>
          <Typography color='primary.main' variant='h4' component='span'>
            499
          </Typography>
          <Typography variant='body2' component='sub' className='self-end' color='text.disabled'>
            /mês
          </Typography>
        </div>
      </Content>
    )
  }
]

const StepBillingDetails = ({ handlePrev, activeStep }: StepBillingDetailsProps) => {
  const {
    watch,
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<StepBillingDetailsType>({
    resolver: valibotResolver(StepBillingDetailsSchema),
    mode: 'onChange', // Validação em tempo real
    defaultValues: {
      cardNumber: '',
      plan: 'basic',
      nameOnCard: '',
      expiryDate: '',
      cvv: ''
    }
  })

  const onSubmit = (data: StepBillingDetailsType) => {
    console.log('Dados válidos:', data)

    // Aqui você pode prosseguir com o processo de pagamento
  }

  type Focused = 'number' | 'name' | 'expiry' | 'cvc' | undefined
  const [focused, setFocused] = useState<Focused>(undefined)
  const cardValues = watch()

  // Função para formatar número do cartão
  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    const brand = getCardBrand(cleanValue)

    // Formatação específica por bandeira
    if (brand === 'amex') {
      return cleanValue.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
    } else {
      return cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ')
    }
  }

  // Função para formatar data de expiração
  const formatExpiryDate = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')

    if (cleanValue.length >= 2) {
      return cleanValue.replace(/(\d{2})(\d{0,2})/, '$1/$2')
    }

    return cleanValue
  }

  return (
    <>
      <div className='mbe-5'>
        <Typography variant='h4'>Selecione o Plano</Typography>
        <Typography>Escolha o plano conforme sua necessidade</Typography>
      </div>

      <Controller
        name='plan'
        control={control}
        render={({ field }) => (
          <Grid container spacing={5}>
            {customInputData.map((item, index) => (
              <CustomInputVertical
                type='radio'
                key={index}
                data={item}
                gridProps={{ size: { xs: 12, sm: 4 } }}
                selected={field.value}
                name={field.name}
                handleChange={field.onChange}
              />
            ))}
          </Grid>
        )}
      />

      <div className='mbs-12 mbe-5'>
        <Typography variant='h4'>Informações de Pagamento</Typography>
        <Typography>Digite as informações do seu cartão</Typography>
      </div>

      <Cards
        number={cardValues.cardNumber}
        name={cardValues.nameOnCard}
        expiry={cardValues.expiryDate}
        cvc={cardValues.cvv}
        focused={focused}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={5} className='mt-5'>
          <Grid size={{ xs: 12 }}>
            <Controller
              name='cardNumber'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Número do Cartão'
                  placeholder='1234 1234 1234 1234'
                  error={!!errors.cardNumber}
                  helperText={
                    errors.cardNumber?.message || 'Aceitamos Visa, Mastercard, Elo, Hipercard e American Express'
                  }
                  onFocus={() => setFocused('number')}
                  onChange={e => {
                    const formatted = formatCardNumber(e.target.value)

                    field.onChange(formatted)
                  }}
                  inputProps={{ maxLength: 23 }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name='nameOnCard'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Nome no Cartão'
                  placeholder='João Silva'
                  error={!!errors.nameOnCard}
                  helperText={errors.nameOnCard?.message}
                  onFocus={() => setFocused('name')}
                  onChange={e => {
                    // Converte para maiúsculo como aparece nos cartões
                    field.onChange(e.target.value.toUpperCase())
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name='expiryDate'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Data de Expiração'
                  placeholder='MM/AA'
                  error={!!errors.expiryDate}
                  helperText={errors.expiryDate?.message}
                  onFocus={() => setFocused('expiry')}
                  onChange={e => {
                    const formatted = formatExpiryDate(e.target.value)

                    field.onChange(formatted)
                  }}
                  inputProps={{ maxLength: 5 }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name='cvv'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='CVV'
                  placeholder='123'
                  error={!!errors.cvv}
                  helperText={errors.cvv?.message || 'Código de 3 ou 4 dígitos'}
                  onFocus={() => setFocused('cvc')}
                  onChange={e => {
                    // Permite apenas números
                    const value = e.target.value.replace(/\D/g, '')

                    field.onChange(value)
                  }}
                  inputProps={{ maxLength: 4 }}
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
              variant='contained'
              color='success'
              type='submit'
              disabled={!isValid} // Botão habilitado apenas quando válido
              endIcon={<i className='ri-check-line' />}
            >
              Finalizar Cadastro
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  )
}

export default StepBillingDetails
