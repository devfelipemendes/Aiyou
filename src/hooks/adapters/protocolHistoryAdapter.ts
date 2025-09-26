// src/adapters/protocolHistoryAdapter.ts

import type {
  ProcessedProtocolHistoryItem,
  AllProtocolHistoryResponse,
  ProtocolHistoryMessage
} from '@/api/endpoints/chat/protocolHistory'

import type { ChatWithHistory, ChatHistoryMessage, ChatWithHistoryListResponse } from '@/api/endpoints/chat/history'

// 🔄 ADAPTER: ProtocolHistoryMessage → ChatHistoryMessage
function adaptProtocolMessage(protocolMsg: ProtocolHistoryMessage): ChatHistoryMessage {
  return {
    id: protocolMsg.id,
    content: protocolMsg.content,
    message_type: protocolMsg.message_type || 'text', // Adicionar
    audio_url: protocolMsg.audio_url || null, // Adicionar
    role: protocolMsg.role,
    operator: protocolMsg.operator === null ? null : Boolean(protocolMsg.operator),
    operator_name: protocolMsg.operator_name || null, // Adicionar
    created_at: protocolMsg.created_at
  }
}

// 🔄 ADAPTER PRINCIPAL: ProcessedProtocolHistoryItem → ChatWithHistory
export function adaptProtocolToChat(protocolItem: ProcessedProtocolHistoryItem): ChatWithHistory {
  // Mapear mensagens
  const adaptedHistory = protocolItem.history.map(adaptProtocolMessage)

  return {
    protocol: protocolItem.protocol,

    // 🏗️ ESTRUTURAR ASSISTANT (inferir do assistant_name)
    assistant: {
      name: protocolItem.assistant_name || 'Assistente AI',
      id: 'unknown',
      phones: []
    },

    source: protocolItem.source,
    identifier: protocolItem.identifier,

    // 🎯 ASSUMIR STATUS ATIVO (já que veio da API de ativos)
    status: 'active' as const,

    // 📨 HISTÓRICO JÁ PROCESSADO
    history: adaptedHistory,
    historyLoading: false,
    historyError: null,

    // 📊 DADOS CALCULADOS
    lastMessage: adaptedHistory[adaptedHistory.length - 1],
    messageCount: protocolItem.messageCount,

    // 🏢 DADOS DE PROJETO (inferir ou usar padrões)
    project_id: 'unknown', // TODO: Precisamos pegar isso de outro lugar
    operator: false, // TODO: Inferir do contexto
    question_operator: false, // TODO: Inferir do contexto

    // 📅 TIMESTAMPS
    updated_at: protocolItem.lastActivity,
    created_at: protocolItem.createdAt || protocolItem.lastActivity,
    isAwaitingHistory: false
  }
}

// 🔄 ADAPTER COMPLETO: AllProtocolHistoryResponse → ChatWithHistoryListResponse
// 🔄 ADAPTER COMPLETO MELHORADO: Combinar dados de ambas as APIs
export function adaptProtocolHistoryResponse(
  protocolResponse: AllProtocolHistoryResponse,
  originalChatsData?: any[] // ← ADICIONAR dados do /chat original
): ChatWithHistoryListResponse {
  // Mapear cada protocolo para chat
  const adaptedChats = protocolResponse.protocols.map(protocolItem => {
    // 🔍 BUSCAR dados originais deste protocolo no /chat
    const originalChat = originalChatsData?.find(chat => chat.protocol === protocolItem.protocol)

    // 📋 Primeiro adaptar normalmente
    const basicChat = adaptProtocolToChat(protocolItem)

    // 🏗️ ENRIQUECER com dados reais se encontrou
    return enrichChatWithOriginalData(basicChat, originalChat)
  })

  return {
    chats: adaptedChats,
    totalChats: protocolResponse.stats.totalProtocols,
    totalMessages: protocolResponse.stats.totalMessages,
    loadingChats: [],
    erroredChats: [],
    successChats: adaptedChats
  }
}

// 🛠️ FUNÇÃO AUXILIAR: Enriquecer com dados da API /chat original
export function enrichChatWithOriginalData(adaptedChat: ChatWithHistory, originalChatData?: any): ChatWithHistory {
  if (!originalChatData) return adaptedChat

  return {
    ...adaptedChat,

    // 🏗️ DADOS REAIS DO ASSISTANT
    assistant: originalChatData.assistant || adaptedChat.assistant,

    // 🏢 DADOS REAIS DO PROJETO
    project_id: originalChatData.project_id || adaptedChat.project_id,
    operator: originalChatData.operator ?? adaptedChat.operator,
    question_operator: originalChatData.question_operator ?? adaptedChat.question_operator,

    // 📅 TIMESTAMPS MAIS PRECISOS
    updated_at: originalChatData.updated_at || adaptedChat.updated_at,
    created_at: originalChatData.created_at || adaptedChat.created_at,

    // 🎯 STATUS REAL
    status: originalChatData.status || adaptedChat.status
  }
}
