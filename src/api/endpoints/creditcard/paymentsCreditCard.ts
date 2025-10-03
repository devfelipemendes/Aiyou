// file: src/api/endpoints/payments/payInvoiceCreditCard.ts

import { apiSlice } from '@/api/ApiCreate/apiSlice'

// ========================
// TYPES
// ========================

export interface PayInvoiceCreditCardRequest {
  name: string
  card_name: string
  credit_card_brand: string
  priority: number
  active: boolean
  security_code: string
  card_number: string
  payment_id: string
  date: string // Formato: MM/YY
}

export interface PaymentError {
  code: string
  description: string
}

export interface PayInvoiceCreditCardResponse {
  message: string
  status: number
  data: {
    errors?: PaymentError[]
  }
}

export const payInvoiceCreditCardApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    payInvoiceCreditCard: builder.mutation<PayInvoiceCreditCardResponse, PayInvoiceCreditCardRequest>({
      query: body => ({
        url: '/payInvoiceCreditCard',
        method: 'POST',
        body
      }),

      transformResponse: (response: PayInvoiceCreditCardResponse) => {
        return {
          ...response,
          hasErrors: !!(response.data?.errors && response.data.errors.length > 0)
        }
      },

      invalidatesTags: (result, error, arg) => {
        if (!error && result && !result.data?.errors?.length) {
          return [
            { type: 'Invoice', id: arg.payment_id },
            { type: 'Invoice', id: 'LIST' },
            { type: 'UserPlan', id: 'CURRENT' }
          ]
        }

        return []
      },

      transformErrorResponse: (response: any) => {
        return {
          status: response.status,
          message: response.data?.message || 'Erro ao processar pagamento',
          errors: response.data?.data?.errors || []
        }
      }
    })
  }),
  overrideExisting: false
})

// ========================
// HOOKS
// ========================

export const { usePayInvoiceCreditCardMutation } = payInvoiceCreditCardApi

// ========================
// HELPER FUNCTIONS
// ========================

/**
 * Valida se o número do cartão está no formato correto
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  // Remove espaços e caracteres não numéricos
  const cleaned = cardNumber.replace(/\D/g, '')

  // Verifica se tem entre 13 e 19 dígitos (padrão internacional)
  return cleaned.length >= 13 && cleaned.length <= 19
}

/**
 * Valida se a data de vencimento está no formato MM/YY e não está expirada
 */
export const validateExpirationDate = (date: string): { valid: boolean; message?: string } => {
  const dateRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/

  if (!dateRegex.test(date)) {
    return {
      valid: false,
      message: 'Data deve estar no formato MM/YY'
    }
  }

  const [month, year] = date.split('/').map(Number)
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100 // Últimos 2 dígitos
  const currentMonth = currentDate.getMonth() + 1

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return {
      valid: false,
      message: 'Cartão expirado'
    }
  }

  return { valid: true }
}

/**
 * Valida CVV (3 ou 4 dígitos)
 */
export const validateCVV = (cvv: string): boolean => {
  const cleaned = cvv.replace(/\D/g, '')

  return cleaned.length === 3 || cleaned.length === 4
}

/**
 * Formata número do cartão com espaços (ex: 1234 5678 9012 3456)
 */
export const formatCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '')

  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
}

/**
 * Detecta bandeira do cartão baseado no número
 */
export const detectCardBrand = (cardNumber: string): string | null => {
  const cleaned = cardNumber.replace(/\D/g, '')

  if (!cleaned) return null

  const cardPatterns: Record<string, RegExp> = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    elo: /^(4011|4312|4389|4514|4576|5041|5066|5090|6277|6362|6363|6504|6505|6516)/,
    hipercard: /^(606282|3841)/,
    discover: /^(6011|622|64|65)/
  }

  for (const [brand, pattern] of Object.entries(cardPatterns)) {
    if (pattern.test(cleaned)) {
      return brand
    }
  }

  return null
}

/**
 * Extrai mensagens de erro da resposta
 */
export const extractErrorMessages = (response: PayInvoiceCreditCardResponse): string[] => {
  return response.data?.errors?.map(error => error.description) || []
}

/**
 * Verifica se há erros específicos na resposta
 */
export const hasErrorCode = (response: PayInvoiceCreditCardResponse, code: string): boolean => {
  return !!response.data?.errors?.some(error => error.code === code)
}
