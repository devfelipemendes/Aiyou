import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Tipos para a resposta da API ViaCEP
export interface CepResponse {
  cep: string
  logradouro: string
  complemento?: string
  bairro: string
  localidade: string
  uf: string
  ibge?: string
  gia?: string
  ddd?: string
  siafi?: string
  erro?: boolean
}

// API base - pode ser usado como base para outras APIs externas
export const externalApi = createApi({
  reducerPath: 'externalApi',
  baseQuery: fetchBaseQuery(),
  tagTypes: ['Cep'],
  endpoints: () => ({})
})
