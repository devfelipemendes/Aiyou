import { useCallback, useEffect, useRef } from 'react'

import { useGetActiveChatsQuery } from '@/api/endpoints/chat/queries'
import { useAppDispatch, useAppSelector } from '@/redux-store'
import {
  initializeChats,
  markChannelConnected,
  selectActiveChats,
  selectActiveChatsStats,
  selectConnectedChannels,
  setError,
  setLoading
} from '@/redux-store/slices/activeChats'
import { getEcho, isEchoConnected } from '@/redux-store/websocket/echo'
import { listenProtocolEvents } from '@/redux-store/websocket/listeners/chatlistener'

interface UseActiveChatsManagerOptions {
  autoConncts?: boolean
  refetchInterval?: number
  maxRetries?: number
  retryDelay?: number
}

interface UseActiveChatsManagerReturn {
  chats: any[]
  stats: any
  connectedChannels: Set<string>
  loading: boolean
  error: string | null | undefined
  isWebSocketConnected: boolean
  refetch: () => void
  connectAllChannels: () => Promise<void>
  disconnecteAllChannels: () => void
  connectChannel: (protocol: string) => Promise<boolean>
}

export function useActiveChatsManager(options: UseActiveChatsManagerOptions = {}): UseActiveChatsManagerReturn {
  const { autoConncts = true, refetchInterval = 30000, maxRetries = 3, retryDelay = 2000 } = options

  const dispatch = useAppDispatch()
  const chats = useAppSelector(selectActiveChats)
  const connectedChannels = useAppSelector(selectConnectedChannels)
  const stats = useAppSelector(selectActiveChatsStats)

  const {
    data: apiResponse,
    error: apiError,
    isLoading: apiLoading,
    refetch
  } = useGetActiveChatsQuery(undefined, {
    pollingInterval: refetchInterval,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true
  })

  const connectingChannels = useRef<Set<string>>(new Set())
  const retryCounters = useRef<Map<string, number>>(new Map())

  const connectChannel = useCallback(
    async (protocol: string): Promise<boolean> => {
      if (connectingChannels.current.has(protocol)) {
        console.warn(`Já está tentando conectar ao canal ${protocol}.`)

        return false
      }

      if (connectedChannels.has(protocol)) {
        console.warn(`Já está sendo conectado ao canal ${protocol}.`)

        return false
      }

      if (connectedChannels.has(protocol)) {
        console.warn(`Já está conectado ao canal ${protocol}.`)

        return true
      }

      connectingChannels.current.add(protocol)

      try {
        const echo = getEcho()

        if (!echo || !isEchoConnected()) {
          throw new Error('WebSocket não está conectado.')
        }

        console.log(`Tentando conectar ao canal ${protocol}...`)

        const projectId = chats.find((chat: any) => chat.protocol === protocol)?.project_id

        listenProtocolEvents(echo, protocol, projectId, dispatch)

        dispatch(markChannelConnected(protocol))

        retryCounters.current.delete(protocol)

        console.log(`Conectado ao canal ${protocol}.`)

        return true
      } catch (error) {
        console.error('Erro ao conectar ao canal:', protocol, error)

        const retryCount = retryCounters.current.get(protocol) || 0

        if (retryCount < maxRetries) {
          retryCounters.current.set(protocol, retryCount + 1)
          console.log(`Tentando reconectar ao canal ${protocol} (${retryCount + 1}/${maxRetries})...`)
          setTimeout(
            () => {
              connectChannel(protocol)
            },
            retryDelay * (retryCount + 1)
          )
        } else {
          console.error(`Falha ao conectar ao canal ${protocol} após ${maxRetries} tentativas.`)
          retryCounters.current.delete(protocol)
        }

        return false
      } finally {
        connectingChannels.current.delete(protocol)
      }
    },
    [chats, connectedChannels, dispatch, maxRetries, retryDelay]
  )

  const connectAllChannels = useCallback(async () => {
    if (!chats.length) {
      console.warn('Nenhum chat ativo para conectar.')

      return
    }

    for (const chat of chats) {
      if (chat.active === 1 && !connectedChannels.has(chat.protocol)) {
        await connectChannel(chat.protocol)

        await new Promise(resolve => setTimeout(resolve, 500)) // Atraso para evitar sobrecarga de conexões
      }
    }

    console.log('Todos os canais ativos foram processados.')
  }, [chats, connectedChannels, connectChannel])

  const disconnecteAllChannels = useCallback((): void => {
    console.log('Desconectando todos os canais...')

    connectedChannels.forEach((protocol: any) => {
      dispatch(markChannelConnected(protocol))
    })

    connectingChannels.current.clear()
    retryCounters.current.clear()
  }, [connectedChannels, dispatch])

  useEffect(() => {
    if (apiResponse?.data) {
      console.log('Chats ativos recebidos:', apiResponse.data.length)

      const mappedChats = apiResponse.data.map((chat: any) => ({
        ...chat,
        assistant_id: chat.assistant_id || null, // ou um valor padrão
        client_id: chat.client_id || null, // ou um valor padrão
        active: chat.active !== undefined ? chat.active : 1 // ou um valor padrão
      }))

      dispatch(initializeChats(mappedChats))
    }
  }, [apiResponse, dispatch])

  useEffect(() => {
    dispatch(setLoading(apiLoading))

    if (apiError) {
      const errorMessage = 'message' in apiError ? apiError.message : 'Erro ao buscar chats ativos.'

      dispatch(setError(errorMessage as string))
    } else {
      dispatch(setError(null))
    }
  }, [apiLoading, apiError, dispatch])

  useEffect(() => {
    if (autoConncts) {
      connectAllChannels()
    }
  }, [autoConncts, connectAllChannels])

  useEffect(() => {
    return () => {
      disconnecteAllChannels()
    }
  }, [disconnecteAllChannels])

  return {
    chats,
    stats,
    connectedChannels,
    loading: apiLoading,
    error: apiError ? ('message' in apiError ? apiError.message : 'Erro ao buscar chats ativos.') : null,
    isWebSocketConnected: isEchoConnected(),
    refetch: refetch,
    connectAllChannels,
    disconnecteAllChannels,
    connectChannel
  }
}
