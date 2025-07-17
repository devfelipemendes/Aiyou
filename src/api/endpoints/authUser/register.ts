// src/api/endpoints/authUser/register.ts
import { apiSlice } from '../../ApiCreate/apiSlice'
import type { RegisterUserType } from '@/app/(blank-layout-pages)/register/(steps)/StepAccountDetails'
import type { StepPersonalInfoType } from '@/app/(blank-layout-pages)/register/(steps)/StepPersonalInfo'

type RegisterResponse = {
  data: {
    name: string
    email: string
    token: string
    permissions: string[]
    device: string
  }
  message: string
}

export type CompleteRegistrationData = {
  name: string
  email: string
  password: string
  password_confirmation: string

  radio: string // 'cpf' ou 'cnpj'
  dataNascimento: string
  cpf?: string
  cnpj?: string
  whatsApp: string
  celular: string
  cep: string
  uf: string
  cidade: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string

  razaoSocial?: string
  dataFundacao?: string
  emailCorp?: string
  whatsAppCorp?: string
}

export const transformRegistrationData = (
  accountDetails: RegisterUserType,
  personalInfo: StepPersonalInfoType
): CompleteRegistrationData => {
  return {
    // Dados da conta
    name: accountDetails.name,
    email: accountDetails.email,
    password: accountDetails.password,
    password_confirmation: accountDetails.confirmePassword,

    // Dados pessoais
    radio: personalInfo.radio,
    dataNascimento: personalInfo.dataNascimento,
    cpf: personalInfo.cpf,
    cnpj: personalInfo.cnpj,
    whatsApp: personalInfo.whatsApp,
    celular: personalInfo.celular,
    cep: personalInfo.cep,
    uf: personalInfo.uf,
    cidade: personalInfo.cidade,
    logradouro: personalInfo.logradouro,
    numero: personalInfo.numero,
    complemento: personalInfo.complemento,
    bairro: personalInfo.bairro,
    razaoSocial: personalInfo.razaoSocial,
    dataFundacao: personalInfo.dataFundacao,
    emailCorp: personalInfo.emailCorp,
    whatsAppCorp: personalInfo.whatsAppCorp
  }
}

export const registerApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    registerUser: builder.mutation<RegisterResponse, CompleteRegistrationData>({
      query: registrationData => ({
        url: '/register',
        method: 'POST',
        body: registrationData
      })
    })
  })
})

export const { useRegisterUserMutation } = registerApi
