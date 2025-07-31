import { createApi } from '@reduxjs/toolkit/query/react'
import type { AxiosRequestConfig, AxiosError } from 'axios'

import { apiClient } from '../AxiosCreate/apiClient'
import { forceLogout } from '@/utils/authLogout' // 🆕 NOVO

interface CustomAxiosRequestConfig extends Omit<AxiosRequestConfig, 'data'> {
  body?: any
}

const axiosBaseQuery =
  ({ baseUrl }: { baseUrl: string }) =>
  async (config: CustomAxiosRequestConfig) => {
    try {
      const axiosConfig: AxiosRequestConfig = {
        ...config,
        url: `${baseUrl}${config.url}`,
        data: config.body
      }

      const result = await apiClient(axiosConfig)

      return { data: result.data }
    } catch (error) {
      const axiosError = error as AxiosError

      // 🚨 NOVO: Interceptar 401 e fazer logout automático
      if (axiosError.response?.status === 401) {
        const isLoginEndpoint = config.url?.includes('/login')
        const isRegisterEndpoint = config.url?.includes('/register')

        // Só faz logout se NÃO for tentativa de login/registro
        if (!isLoginEndpoint && !isRegisterEndpoint) {
          console.log('🚨 API retornou 401 - fazendo logout automático')
          forceLogout('Token inválido ou expirado')

          return {
            error: {
              status: 401,
              data: { message: 'Sessão expirada. Redirecionando...' }
            }
          }
        }
      }

      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data
        }
      }
    }
  }

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_AIYOU_BASE_URL || '' }),
  endpoints: () => ({}),
  tagTypes: [
    'Auth',
    'ActiveChats',
    'Chat',
    'ChatItem',
    'User',
    'Project',
    'Client',
    'ProtocolHistory',
    'ProtocolHistoryItem'
  ]
})
