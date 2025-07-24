import { createApi } from '@reduxjs/toolkit/query/react'

import type { AxiosRequestConfig, AxiosError } from 'axios'

import { apiClient } from '../AxiosCreate/apiClient'

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
    'Auth', // ✅ Para login/logout
    'ActiveChats', // ✅ Para lista de chats
    'Chat', // ✅ Para chats individuais
    'ChatItem',
    'User', // ✅ Para dados do usuário
    'Project', // ✅ Para projetos
    'Client', // ✅ Para clientes
    'ProtocolHistory', // ✅ Para histórico de protocolos
    'ProtocolHistoryItem' // ✅ Para itens individuais do histórico de protocolos
  ]
})
