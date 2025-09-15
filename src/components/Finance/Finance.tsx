'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import type { TypographyProps } from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

// Form Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import * as v from 'valibot'

// Card Component
import Cards from 'react-credit-cards-2'
import 'react-credit-cards-2/dist/es/styles-compiled.css'

// Component Imports
import type { CustomInputVerticalData } from '@core/components/custom-inputs/types'
import CustomInputVertical from '@/@core/components/custom-inputs/Vertical'

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

  if (/^4/.test(number)) return 'visa'
  if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return 'mastercard'
  if (/^3[47]/.test(number)) return 'amex'
  if (/^(4011|4312|4389|4514|4573|4576|5041|5066|5067|6277|6362|6363|6504|6505|6516|6550)/.test(number)) return 'elo'
  if (/^(6062|384100|384140|384160|606282)/.test(number)) return 'hipercard'

  return 'unknown'
}

// Validação customizada para cartão brasileiro
const validateBrazilianCard = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\D/g, '')

  if (cleanNumber.length < 13) return false
  if (!validateLuhn(cleanNumber)) return false
  const brand = getCardBrand(cleanNumber)

  return ['visa', 'mastercard', 'amex', 'elo', 'hipercard'].includes(brand)
}

// Validação de data de expiração
const validateExpiryDate = (date: string): boolean => {
  const match = date.match(/^(0[1-9]|1[0-2])\/(\d{2})$/)

  if (!match) return false

  const month = parseInt(match[1])
  const year = parseInt(`20${match[2]}`)
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  if (year < currentYear) return false
  if (year === currentYear && month < currentMonth) return false
  if (year > currentYear + 10) return false

  return true
}

// Schema de validação
const PaymentFormSchema = v.object({
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
  cvv: v.pipe(v.string('CVV é obrigatório'), v.regex(/^\d{3,4}$/, 'CVV deve ter 3 ou 4 dígitos')),
  plan: v.union([v.literal('basic'), v.literal('standard'), v.literal('enterprise')], 'Plano inválido')
})

export type PaymentFormType = v.InferInput<typeof PaymentFormSchema>

// =============================================================================
// STYLED COMPONENTS
// =============================================================================

const Content = styled(Typography, {
  name: 'MuiCustomInputVertical',
  slot: 'content'
})<TypographyProps>(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: 'center'
}))

// =============================================================================
// DADOS DOS PLANOS
// =============================================================================

const customInputData: CustomInputVerticalData[] = [
  {
    title: 'Basic',
    value: 'basic',
    content: (
      <Content component='div' className='flex justify-center items-center flex-col bs-full gap-2'>
        <Typography variant='body2' className='mlb-auto'>
          Ideal para startups & estudantes
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
          Para pequenas e médias empresas
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
          Solução para empresas & organizações
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

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

const FinanceiroPayment = () => {
  // States
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form Setup
  const {
    watch,
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<PaymentFormType>({
    resolver: valibotResolver(PaymentFormSchema),
    mode: 'onChange',
    defaultValues: {
      cardNumber: '',
      plan: 'basic',
      nameOnCard: '',
      expiryDate: '',
      cvv: ''
    }
  })

  // Card Focus State
  type Focused = 'number' | 'name' | 'expiry' | 'cvc' | undefined
  const [focused, setFocused] = useState<Focused>(undefined)
  const cardValues = watch()

  // =============================================================================
  // FUNÇÕES DE FORMATAÇÃO
  // =============================================================================

  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    const brand = getCardBrand(cleanValue)

    if (brand === 'amex') {
      return cleanValue.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
    } else {
      return cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ')
    }
  }

  const formatExpiryDate = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')

    if (cleanValue.length >= 2) {
      return cleanValue.replace(/(\d{2})(\d{0,2})/, '$1/$2')
    }

    return cleanValue
  }

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const onSubmit = async (data: PaymentFormType) => {
    setLoading(true)

    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('Dados de pagamento:', {
        ...data,
        cardNumber: '****' + data.cardNumber.slice(-4) // Mascarar para log
      })

      setPaymentSuccess(true)
    } catch (error) {
      console.error('Erro no processamento:', error)
    } finally {
      setLoading(false)
    }
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  if (paymentSuccess) {
    return (
      <Card>
        <CardContent>
          <Box className='text-center p-6'>
            <i className='ri-check-double-line text-6xl text-green-500 mb-4' />
            <Typography variant='h4' className='mb-2'>
              Pagamento Processado!
            </Typography>
            <Typography variant='body1' color='text.secondary' className='mb-4'>
              Seu plano foi ativado com sucesso.
            </Typography>
            <Button variant='contained' onClick={() => setPaymentSuccess(false)}>
              Voltar ao Financeiro
            </Button>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box className='space-y-6'>
      {/* Seleção de Plano */}
      <Card>
        <CardHeader title='Selecionar Plano' subheader='Escolha o plano conforme sua necessidade' />
        <CardContent>
          <Controller
            name='plan'
            control={control}
            render={({ field }) => (
              <Grid container spacing={3}>
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
        </CardContent>
      </Card>

      {/* Informações de Pagamento */}
      <Card>
        <CardHeader title='Informações de Pagamento' subheader='Digite as informações do seu cartão de crédito' />
        <CardContent>
          <Grid container spacing={4}>
            {/* Preview do Cartão */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box className='flex justify-center mb-4'>
                <Cards
                  number={cardValues.cardNumber || ''}
                  name={cardValues.nameOnCard || ''}
                  expiry={cardValues.expiryDate || ''}
                  cvc={cardValues.cvv || ''}
                  focused={focused}
                />
              </Box>
              <Alert severity='info' icon={<i className='ri-information-line' />}>
                Aceitamos Visa, Mastercard, Elo, Hipercard e American Express
              </Alert>
            </Grid>

            {/* Formulário */}
            <Grid size={{ xs: 12, md: 7 }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  {/* Número do Cartão */}
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
                          helperText={errors.cardNumber?.message}
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

                  {/* Nome no Cartão */}
                  <Grid size={{ xs: 12 }}>
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
                            field.onChange(e.target.value.toUpperCase())
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Data de Expiração e CVV */}
                  <Grid size={{ xs: 12, sm: 6 }}>
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

                  <Grid size={{ xs: 12, sm: 6 }}>
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
                            const value = e.target.value.replace(/\D/g, '')

                            field.onChange(value)
                          }}
                          inputProps={{ maxLength: 4 }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Botão de Submissão */}
                  <Grid size={{ xs: 12 }}>
                    <Divider className='my-4' />
                    <Button
                      type='submit'
                      variant='contained'
                      size='large'
                      fullWidth
                      disabled={!isValid || loading}
                      startIcon={
                        loading ? (
                          <i className='ri-loader-4-line animate-spin' />
                        ) : (
                          <i className='ri-secure-payment-line' />
                        )
                      }
                    >
                      {loading ? 'Processando...' : 'Processar Pagamento'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default FinanceiroPayment
