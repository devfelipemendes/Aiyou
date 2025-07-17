// 🎯 HOOK PERSONALIZADO: Integra RTK Query + Redux Slice
import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/redux-store'
import { useGetActiveChatsQuery } from '@/api/endpoints/chat/queries'
import {
  setActiveChats,
  setLoading,
  setError,
  selectActiveChats,
  selectIsLoading,
  selectError
} from '@/redux-store/slices/chat'

interface UseChatIntegrationReturn {
  chats: any[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

// 🎓 HOOK QUE CONECTA API + SLICE
export function useChatIntegration(): UseChatIntegrationReturn {
  const dispatch = useAppDispatch()

  // 🔗 RTK Query - busca dados da API
  const { data: apiResponse, error: apiError, isLoading: apiLoading, refetch } = useGetActiveChatsQuery()

  // 🔗 Redux Slice - pega dados do estado local
  const chats = useAppSelector(selectActiveChats)
  const isLoading = useAppSelector(selectIsLoading)
  const error = useAppSelector(selectError)

  // 🎯 SINCRONIZAÇÃO: API → Redux Slice
  useEffect(() => {
    // Atualizar loading state
    dispatch(setLoading(apiLoading))

    if (apiError) {
      // Se tem erro da API, atualizar estado de erro
      const errorMessage = (apiError as any)?.message || 'Erro ao carregar chats'

      dispatch(setError(errorMessage))
    } else if (apiResponse?.data) {
      // Se tem dados da API, atualizar o slice
      dispatch(setActiveChats(apiResponse.data))
      dispatch(setError(null))
    }
  }, [apiResponse, apiError, apiLoading, dispatch])

  return {
    chats,
    isLoading,
    error,
    refetch
  }
}

//*  EXEMPLO DE USO EM COMPONENTE
/*
function ChatListComponent() {
  const { chats, isLoading, error, refetch } = useChatIntegration()
  
  if (isLoading) return <div>Carregando chats...</div>
  if (error) return <div>Erro: {error}</div>
  
  return (
    <div>
      <button onClick={refetch}>Atualizar</button>
      {chats.map(chat => (
        <ChatItem key={chat.protocol} chat={chat} />
      ))}
    </div>
  )
}
*/
