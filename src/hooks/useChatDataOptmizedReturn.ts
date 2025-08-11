// hooks/useChatDataOptimized.ts
import { useMemo } from 'react'

import { useAppSelector } from '@/redux-store'
import { getChatSelector } from '@/redux-store/selectors/monitoring'
import type { ChatWithHistory } from '@/api/endpoints/chat/history'

interface UseChatDataOptimizedOptions {
  enableDeepComparison?: boolean
  debugMode?: boolean
}

interface UseChatDataOptimizedReturn {
  chatData: ChatWithHistory | null
  isLoading: boolean
  hasError: boolean
  messageCount: number
  lastMessageId: string | null
  isAwaitingHistory: boolean
}

// 🔧 TYPE GUARD: Verifica se o objeto é um ChatWithHistory válido
const isChatWithHistory = (obj: any): obj is ChatWithHistory => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.protocol === 'string' &&
    Array.isArray(obj.history) &&
    typeof obj.historyLoading === 'boolean'
  )
}

/**
 * Hook otimizado para buscar dados de um chat específico
 */
export const useChatDataOptimized = (
  protocol: string,
  options: UseChatDataOptimizedOptions = {}
): UseChatDataOptimizedReturn => {
  const { enableDeepComparison = true, debugMode = process.env.NODE_ENV === 'development' } = options

  // 🏭 FACTORY: Criar ou reutilizar selector para este protocolo
  const chatSelector = useMemo(() => {
    if (debugMode) {
      console.log(`🏭 useChatDataOptimized: Criando/reutilizando selector para ${protocol}`)
    }

    return getChatSelector(protocol)
  }, [protocol, debugMode])

  // 🎯 SELECTOR: Usar o selector individual memoizado
  const rawChatData = useAppSelector(chatSelector)

  // 🔒 SAFETY: Garantir que os dados são válidos
  const chatData = useMemo(() => {
    if (!rawChatData) {
      if (debugMode) {
        console.log(`📊 Chat ${protocol}: Sem dados no Redux`)
      }

      return null
    }

    if (!isChatWithHistory(rawChatData)) {
      if (debugMode) {
        console.warn(`⚠️ Chat ${protocol}: Dados inválidos no Redux:`, rawChatData)
      }

      return null
    }

    return rawChatData
  }, [rawChatData, protocol, debugMode])

  // 🔍 COMPARISON FUNCTION: Para evitar re-renders desnecessários
  const optimizedChatData = useAppSelector(
    chatSelector,
    enableDeepComparison
      ? (left, right) => {
          // ✅ TYPE SAFE: Verificar se ambos são válidos
          const leftValid = isChatWithHistory(left)
          const rightValid = isChatWithHistory(right)

          if (!leftValid && !rightValid) return true
          if (!leftValid || !rightValid) return false

          const isEqual =
            left.messageCount === right.messageCount &&
            left.historyLoading === right.historyLoading &&
            left.historyError === right.historyError &&
            left.isAwaitingHistory === right.isAwaitingHistory &&
            left.lastMessage?.id === right.lastMessage?.id &&
            left.status === right.status &&
            left.updated_at === right.updated_at

          if (debugMode && !isEqual) {
            console.log(`🔄 useChatDataOptimized ${protocol}: Dados mudaram`, {
              messageCountChanged: left.messageCount !== right.messageCount,
              loadingChanged: left.historyLoading !== right.historyLoading,
              errorChanged: left.historyError !== right.historyError,
              awaitingChanged: left.isAwaitingHistory !== right.isAwaitingHistory,
              lastMessageChanged: left.lastMessage?.id !== right.lastMessage?.id,
              statusChanged: left.status !== right.status,
              updatedAtChanged: left.updated_at !== right.updated_at
            })
          }

          return isEqual
        }
      : undefined
  )

  // 🎯 DADOS DERIVADOS: Computados apenas quando necessário
  const derivedData = useMemo(() => {
    const chat = enableDeepComparison ? optimizedChatData : chatData

    // ✅ TYPE SAFE: Usar type guard para garantir dados válidos
    const validChat = isChatWithHistory(chat) ? chat : null

    return {
      chatData: validChat,
      isLoading: validChat?.historyLoading ?? false,
      hasError: !!validChat?.historyError,
      messageCount: validChat?.messageCount ?? 0,
      lastMessageId: validChat?.lastMessage?.id ?? null,
      isAwaitingHistory: validChat?.isAwaitingHistory ?? false
    }
  }, [enableDeepComparison, optimizedChatData, chatData])

  // 🔍 DEBUG: Log detalhado em desenvolvimento
  if (debugMode && derivedData.chatData) {
    console.log(`📊 useChatDataOptimized ${protocol}:`, {
      messageCount: derivedData.messageCount,
      isLoading: derivedData.isLoading,
      hasError: derivedData.hasError,
      lastMessageId: derivedData.lastMessageId,
      isAwaitingHistory: derivedData.isAwaitingHistory,
      cacheHit: 'Factory selector usado'
    })
  }

  return derivedData
}

/**
 * Hook simplificado para casos onde só precisa do chatData
 */
export const useChatData = (protocol: string): ChatWithHistory | null => {
  const { chatData } = useChatDataOptimized(protocol, {
    enableDeepComparison: false,
    debugMode: false
  })

  return chatData
}

/**
 * Hook para múltiplos chats (útil para componentes que renderizam listas)
 */
export const useMultipleChatData = (protocols: string[]): ChatWithHistory[] => {
  const chatDataArray = useMemo(() => {
    return protocols.map(protocol => {
      const selector = getChatSelector(protocol)

      return { protocol, selector }
    })
  }, [protocols])

  return useAppSelector(state => {
    return chatDataArray.map(({ selector }) => selector(state)).filter(chat => isChatWithHistory(chat)) // ✅ TYPE SAFE: Filtrar apenas dados válidos
  })
}

/**
 * Hook para estatísticas de um chat específico
 */
export const useChatStats = (protocol: string) => {
  const { messageCount, isLoading, hasError, isAwaitingHistory } = useChatDataOptimized(protocol, {
    enableDeepComparison: true,
    debugMode: false
  })

  return useMemo(
    () => ({
      messageCount,
      isActive: !isLoading && !hasError && !isAwaitingHistory,
      hasActivity: messageCount > 0,
      status: isLoading ? 'loading' : hasError ? 'error' : 'ready'
    }),
    [messageCount, isLoading, hasError, isAwaitingHistory]
  )
}
