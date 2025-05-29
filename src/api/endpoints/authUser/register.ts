import { apiSlice } from '../../ApiCreate/apiSlice'

type DataResponse = {
  name: string
  email: string
  token: string
}

type RegisterResponse = {
  data: DataResponse
}

type RegisterBody = {
  name: string
  email: string
  password: string
  password_confirmation: string
  nome: string
  confirmePassword: string
  cardNumber: string
  plan: string
  nameOnCard: string
  expiryDate: string
  cvv: string
  cpfCnpj: string
  dataNasicmento: string
  whatsApp: string
  cep: string
  bairro: string
  complemento: string
  numeroendereco: string
}

export const Register = apiSlice.injectEndpoints({
  endpoints: builder => ({
    postLogin: builder.mutation<RegisterResponse, RegisterBody>({
      query: credentials => ({
        url: '/v1/register',
        method: 'POST',
        body: credentials
      })
    })
  })
})
