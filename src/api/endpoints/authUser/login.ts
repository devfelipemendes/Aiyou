import { apiSlice } from '@/api/ApiCreate/apiSlice'

type LoginResponse = {
  message: string
  data: {
    token: string
    user_permissions: UserPermission[]
    user: User
    clients: Client[]
  }
}

type UserPermission = {
  name: string
  description: string
  order: number
}

type User = {
  id: string
  name: string
  identifier: string
  date: string
  age: number
  phone_number: string
  whatsapp_number: string
  is_juridic: boolean
  address: string
  cep: string
  uf: string
  city: string
  street: string
  number: string
  neighborhood: string
  complement: string
  email: string
  is_operator: boolean
  plan: Plan[]
}

type Plan = {
  id: string
  name: string
  description: string
  max_assistants: number
  max_tokens: number
  price: string
}

type Client = {
  id: string
  name: string
  img_url: string | null
  description: string | null
  used_tokens: number
  assistants: Assistant[]
}

type Assistant = {
  id: string
  name: string
  img_url: string | null
  description: string | null
}

// Tipo para os parâmetros de login
type LoginCredentials = {
  email: string
  password: string
  device_name: string
}

export const SignIn = apiSlice.injectEndpoints({
  endpoints: builder => ({
    postLogin: builder.mutation<LoginResponse, LoginCredentials>({
      query: ({ email, password, device_name }) => ({
        url: '/login',
        method: 'POST',
        body: {
          email,
          password,
          device_name
        }
      })
    })
  })
})
export const { usePostLoginMutation } = SignIn
