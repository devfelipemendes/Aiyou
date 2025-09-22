import { valibotResolver } from '@hookform/resolvers/valibot'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'

// Utils para validação de cartões
const validateLuhn = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '').split('').map(Number)
  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i]

    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

const getCardBrand = (cardNumber: string): string => {
  const number = cardNumber.replace(/\D/g, '')

  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]|^2[2-7]/,
    amex: /^3[47]/,
    elo: /^(4011|4312|4389|4514|4573|4576|5041|5066|5067|6277|6362|6363|6504|6505|6516|6550)/,
    hipercard: /^(6062|384100|384140|384160|606282)/
  }

  for (const [brand, pattern] of Object.entries(patterns)) {
    if (pattern.test(number)) return brand
  }

  return 'unknown'
}

const validateBrazilianCard = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\D/g, '')

  if (cleanNumber.length < 13) return false
  if (!validateLuhn(cleanNumber)) return false

  const brand = getCardBrand(cleanNumber)

  return ['visa', 'mastercard', 'amex', 'elo', 'hipercard'].includes(brand)
}

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

// Schema otimizado
const CreditCardSchema = v.object({
  cardNumber: v.pipe(
    v.string('Número do cartão é obrigatório'),
    v.minLength(13, 'Mínimo 13 dígitos'),
    v.maxLength(19, 'Máximo 19 dígitos'),
    v.regex(/^[\d\s]+$/, 'Apenas números e espaços'),
    v.check(value => validateBrazilianCard(value.replace(/\D/g, '')), 'Cartão inválido ou não aceito no Brasil')
  ),
  nameOnCard: v.pipe(
    v.string('Nome é obrigatório'),
    v.minLength(2, 'Mínimo 2 caracteres'),
    v.maxLength(50, 'Máximo 50 caracteres'),
    v.regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Apenas letras e espaços')
  ),
  expiryDate: v.pipe(
    v.string('Data de expiração é obrigatória'),
    v.regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Formato MM/AA'),
    v.check(validateExpiryDate, 'Data inválida ou cartão expirado')
  ),
  cvv: v.pipe(
    v.string('CVV é obrigatório'),
    v.regex(/^\d{3,4}$/, 'CVV deve ter 3 ou 4 dígitos'),

    // @ts-ignore - Valibot context type issue
    v.check((value, context) => {
      const cardNumber = (context as any)?.cardNumber || ''
      const brand = getCardBrand(cardNumber)

      return brand === 'amex' ? value.length === 4 : value.length === 3
    }, 'CVV inválido para este tipo de cartão')
  ),
  plan: v.union([v.literal('basic'), v.literal('standard'), v.literal('enterprise')], 'Plano inválido'),
  active: v.boolean()
})

export type CreditCardFormData = v.InferInput<typeof CreditCardSchema>

export const useCreditCardForm = () => {
  const form = useForm<CreditCardFormData>({
    resolver: valibotResolver(CreditCardSchema),
    mode: 'onChange',
    defaultValues: {
      cardNumber: '',
      plan: 'basic',
      nameOnCard: '',
      expiryDate: '',
      cvv: ''
    }
  })

  // Funções de formatação
  const formatCardNumber = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '')
    const brand = getCardBrand(cleanValue)

    if (brand === 'amex') {
      return cleanValue.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
    }

    return cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiryDate = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '')

    return cleanValue.length >= 2 ? cleanValue.replace(/(\d{2})(\d{0,2})/, '$1/$2') : cleanValue
  }

  return {
    form,
    formatCardNumber,
    formatExpiryDate,
    getCardBrand
  }
}
