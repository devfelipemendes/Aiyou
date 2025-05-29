import { apiSlice } from '@/api/ApiCreate/apiSlice'

type LoginResponse = {
  data: {
    name: string
    email: string
    token: string
    permissions: string[]
    device: string
  }
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
        url: '/v1/login',
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
