// src/api/endpoints/customer/customerInvoices.ts
import { createSelector } from '@reduxjs/toolkit'

import { apiSlice } from '@/api/ApiCreate/apiSlice'

export type Discount = {
  value: number
  limitDate: string | null
  dueDateLimitDays: number
  type: 'FIXED' | 'PERCENTAGE'
}

export type Fine = {
  value: number
  type: 'FIXED' | 'PERCENTAGE'
}

export type Interest = {
  value: number
  type: 'FIXED' | 'PERCENTAGE'
}

export type CustomerInvoice = {
  object: 'payment'
  id: string
  dateCreated: string
  customer: string
  checkoutSession: string | null
  paymentLink: string | null
  value: number
  netValue: number
  originalValue: number | null
  interestValue: number | null
  description: string
  billingType: 'UNDEFINED' | 'BOLETO' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD'
  canBePaidAfterDueDate?: boolean
  confirmedDate?: string
  pixTransaction: any | null
  status:
    | 'PENDING'
    | 'RECEIVED'
    | 'CONFIRMED'
    | 'OVERDUE'
    | 'REFUNDED'
    | 'RECEIVED_IN_CASH'
    | 'REFUND_REQUESTED'
    | 'REFUND_IN_PROGRESS'
    | 'CHARGEBACK_REQUESTED'
    | 'CHARGEBACK_DISPUTE'
    | 'AWAITING_CHARGEBACK_REVERSAL'
    | 'DUNNING_REQUESTED'
    | 'DUNNING_RECEIVED'
    | 'AWAITING_RISK_ANALYSIS'
    | ''
  dueDate: string
  originalDueDate: string
  paymentDate: string | null
  clientPaymentDate: string | null
  installmentNumber: number | null
  invoiceUrl: string
  invoiceNumber: string
  externalReference: string
  deleted: boolean
  anticipated: boolean
  anticipable: boolean
  creditDate: string | null
  estimatedCreditDate: string | null
  transactionReceiptUrl: string | null
  nossoNumero: string
  bankSlipUrl: string
  lastInvoiceViewedDate: string | null
  lastBankSlipViewedDate: string | null
  discount: Discount
  fine: Fine
  interest: Interest
  postalService: boolean
  escrow: any | null
  refunds: any | null
}

export type CustomerInvoicesData = {
  object: 'list'
  hasMore: boolean
  totalCount: number
  limit: number
  offset: number
  data: CustomerInvoice[]
}

export type GetCustomerInvoicesResponse = {
  message: string
  status: number
  data: CustomerInvoicesData
}

export type CustomerInvoicesParams = {
  customer?: string
  status?: CustomerInvoice['status']
  limit?: number
  offset?: number
  dateCreated?: string
  dueDate?: string
  externalReference?: string
  billingType?: CustomerInvoice['billingType']
}

export type CustomerInvoicesError = {
  status: number
  message: string
}

export const customerInvoicesApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getCustomerInvoices: builder.query<GetCustomerInvoicesResponse, CustomerInvoicesParams>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value))
          }
        })

        const queryString = queryParams.toString()

        return {
          url: `/listCustomerInvoices${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
          headers: {
            Accept: 'application/json'
          }
        }
      },

      transformResponse: (response: GetCustomerInvoicesResponse) => {
        console.log('🔍 DEBUG - Estrutura da resposta GET /listCustomerInvoices:', response)

        const { data } = response.data
        const totalInvoices = data.length
        const pendingInvoices = data.filter(invoice => invoice.status === 'PENDING').length
        const receivedInvoices = data.filter(invoice => invoice.status === 'RECEIVED').length
        const totalValue = data.reduce((acc, invoice) => acc + invoice.value, 0)

        console.log('✅ Faturas carregadas:', totalInvoices)
        console.log('📊 Status: Pendentes:', pendingInvoices, '| Recebidas:', receivedInvoices)
        console.log('💰 Valor total:', `R$ ${(totalValue / 100).toFixed(2)}`)
        console.log('📈 Paginação: Total:', response.data.totalCount, '| Limite:', response.data.limit)

        return response
      },

      transformErrorResponse: (response: any): CustomerInvoicesError => {
        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao carregar faturas do cliente'
        }
      },

      providesTags: result =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }) => ({ type: 'CustomerInvoice' as const, id })),
              { type: 'CustomerInvoice', id: 'LIST' }
            ]
          : [{ type: 'CustomerInvoice', id: 'LIST' }],

      keepUnusedDataFor: 120
    })
  }),
  overrideExisting: true
})

export const { useGetCustomerInvoicesQuery } = customerInvoicesApi

const selectCustomerInvoicesResult = (params: CustomerInvoicesParams = {}) =>
  customerInvoicesApi.endpoints.getCustomerInvoices.select(params)

export const selectCustomerInvoicesData = createSelector(
  [selectCustomerInvoicesResult({})],
  result => result.data?.data
)

export const selectCustomerInvoicesList = createSelector(
  [selectCustomerInvoicesData],
  invoicesData => invoicesData?.data || []
)

export const selectCustomerInvoicesPagination = createSelector([selectCustomerInvoicesData], invoicesData => ({
  hasMore: invoicesData?.hasMore || false,
  totalCount: invoicesData?.totalCount || 0,
  limit: invoicesData?.limit || 100,
  offset: invoicesData?.offset || 0
}))

export const selectPendingInvoices = createSelector([selectCustomerInvoicesList], invoices =>
  invoices.filter(invoice => invoice.status === 'PENDING')
)

export const selectReceivedInvoices = createSelector([selectCustomerInvoicesList], invoices =>
  invoices.filter(invoice => invoice.status === 'RECEIVED')
)

export const selectOverdueInvoices = createSelector([selectCustomerInvoicesList], invoices => {
  const today = new Date()

  return invoices.filter(invoice => invoice.status === 'PENDING' && new Date(invoice.dueDate) < today)
})

export const selectTotalInvoicesValue = createSelector([selectCustomerInvoicesList], invoices =>
  invoices.reduce((acc, invoice) => acc + invoice.value, 0)
)

export const selectPendingInvoicesValue = createSelector([selectPendingInvoices], pendingInvoices =>
  pendingInvoices.reduce((acc, invoice) => acc + invoice.value, 0)
)

export const selectReceivedInvoicesValue = createSelector([selectReceivedInvoices], receivedInvoices =>
  receivedInvoices.reduce((acc, invoice) => acc + invoice.value, 0)
)

export const formatCurrency = (valueInCents: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valueInCents / 100)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}
