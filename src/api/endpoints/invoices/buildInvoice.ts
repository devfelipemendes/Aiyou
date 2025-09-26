// file: src/api/endpoints/invoice/buildInvoice.ts
import { apiSlice } from '@/api/ApiCreate/apiSlice'

export type BuildInvoiceData = {
  nome: string
  cpf: string
  nomeempresa: string
  cnpj: string | null
  email: string
  plan: string
  planvalue: string
  invoiceNumber: string
  value: number
  dueDate: string
  description: string
  customer: string
  status: string
  id: string
  codigoboleto: string
  barcode: string
  encodedimage: string
  payload: string
  link: string
  email_aiyou: string
}

export type BuildInvoiceResponse = {
  message: string
  status: number
  data: BuildInvoiceData
}

export type BuildInvoiceError = {
  status: number
  message: string
}

export const buildInvoiceApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    buildInvoice: builder.query<BuildInvoiceResponse, string>({
      query: paymentId => ({
        url: `/buildInvoice/${paymentId}`,
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }),

      transformResponse: (response: BuildInvoiceResponse) => {
        console.log('🔍 DEBUG - Build Invoice response:', response)

        const { data } = response

        console.log('✅ Fatura construída para:', data.nome)
        console.log('📋 Plano:', data.plan, '| Valor:', `R$ ${data.planvalue}`)
        console.log('📄 Fatura #:', data.invoiceNumber, '| Status:', data.status)
        console.log('💳 Customer ID:', data.customer)

        return response
      },

      transformErrorResponse: (response: any): BuildInvoiceError => {
        console.error('❌ Erro ao construir fatura:', response)

        return {
          status: response.status || 500,
          message: response?.data?.message || response?.message || 'Erro ao construir dados da fatura'
        }
      },

      providesTags: (result, error, paymentId) => [
        { type: 'BuildInvoice', id: paymentId },
        { type: 'BuildInvoice', id: 'LIST' }
      ],

      keepUnusedDataFor: 300 // 5 minutos de cache
    })
  })
})

export const { useBuildInvoiceQuery, useLazyBuildInvoiceQuery } = buildInvoiceApi
