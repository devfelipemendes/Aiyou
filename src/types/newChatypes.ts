import type { ChatHistoryMessage } from '@/api/endpoints/chat/history'

export interface Phone {
  id: string
  phone: string
}

export interface Assistant {
  id: string
  name: string
  phones: Phone[]
}

export interface ActiveProtocol {
  protocol: string
  assistant: Assistant
  source: 'whatsapp' | 'telegram' | 'webchat' | 'email' | 'sms'
  identifier: string
  status: 'active' | 'inactive' | 'resolved' | 'unresolved'
  created_at: string
}

export interface ApiChatMessage {
  id: string
  content: string
  role: 'assistant' | 'operator' | 'user'
  operator: number | null
  created_at: string
}

// ===== TIPOS PARA O CHATLOG (MANTENDO COMPATIBILIDADE) =====

export interface ChatLogMessage {
  senderId: number
  time: string
  message: string
  msgStatus?: {
    isSent: boolean
    isDelivered: boolean
    isSeen: boolean
  }
}

export interface MsgGroupType {
  senderId: number
  messages: Omit<ChatLogMessage, 'senderId'>[]
}

export interface UserProfile {
  id: number
  fullName: string
  avatar?: string
}

export interface ChatLogData {
  profileUser: UserProfile
  activeChat: {
    userId: number
    userInfo: UserProfile
    messages: ChatLogMessage[]
  }
}

export interface ChatLogProps {
  chatStore: ChatHistoryMessage
  isBelowLgScreen: boolean
  isBelowMdScreen: boolean
  isBelowSmScreen: boolean
}

// ===== TIPOS PARA O CHATMONITOR =====

export interface ChatMonitorProps {
  protocol: string
  dragListeners?: any
  dragAttributes?: any
  isDragging?: boolean
  chatData: ChatLogData
  clientProtocolName: string
  statusChat: ActiveProtocol['status']
  progressTime: string
  attendant: string
  callOperator: boolean
}

export interface ChatMonitorData {
  protocol: ActiveProtocol
  messages: ApiChatMessage[]
  isLoading: boolean
  error: string | null
}

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Converte dados da API para o formato esperado pelo ChatLog
 */
export const convertApiDataToChatLog = (protocolData: ActiveProtocol, apiMessages: ApiChatMessage[]): ChatLogData => {
  // Perfil do cliente
  const clientProfile: UserProfile = {
    id: 1,
    fullName: formatClientIdentifier(protocolData.identifier, protocolData.source),
    avatar: undefined
  }

  // Perfil do assistente
  const assistantProfile: UserProfile = {
    id: 2,
    fullName: protocolData.assistant.name,
    avatar: undefined
  }

  // Converte mensagens da API para o formato ChatLog
  const chatLogMessages: ChatLogMessage[] = apiMessages.map(apiMsg => ({
    senderId: apiMsg.role === 'user' ? 1 : 2, // 1 = cliente, 2 = assistente/operador
    time: apiMsg.created_at,
    message: apiMsg.content,
    msgStatus: {
      isSent: true,
      isDelivered: true,
      isSeen: apiMsg.role === 'user' // Assume que mensagens do usuário foram vistas
    }
  }))

  return {
    profileUser: clientProfile,
    activeChat: {
      userId: 2,
      userInfo: assistantProfile,
      messages: chatLogMessages
    }
  }
}

/**
 * Formata identificador do cliente baseado na fonte
 */
export const formatClientIdentifier = (identifier: string, source: string): string => {
  switch (source) {
    case 'whatsapp':
      // Formato: 55611234567893 -> +55 (61) 12345-67893
      if (identifier.length >= 12) {
        const match = identifier.match(/(\d{2})(\d{2})(\d{4,5})(\d{4})/)

        if (match) {
          return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`
        }
      }

      return `+${identifier}`
    case 'email':
      return identifier
    case 'telegram':
      return `@${identifier}`
    default:
      return identifier
  }
}

/**
 * Obtém status do chat em português
 */
export const getChatStatus = (status: string): string => {
  switch (status) {
    case 'active':
      return 'ativo'
    case 'inactive':
      return 'inativo'
    case 'resolved':
      return 'resolvido'
    case 'pending':
      return 'pendente'
    default:
      return 'ativo'
  }
}

/**
 * Calcula tempo decorrido desde a criação
 */
export const getTimeElapsed = (createdAt: string): string => {
  const now = new Date()
  const created = new Date(createdAt)
  const diffMs = now.getTime() - created.getTime()

  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays > 0) {
    return `${diffDays}d`
  } else if (diffHours > 0) {
    return `${diffHours}h`
  } else if (diffMinutes > 0) {
    return `${diffMinutes}min`
  } else {
    return 'agora'
  }
}

export const getChannelIcon = (source: string): string => {
  switch (source) {
    case 'whatsapp':
      return 'ri-whatsapp-line'
    case 'telegram':
      return 'ri-telegram-line'
    case 'webchat':
      return 'ri-chat-1-line'
    case 'email':
      return 'ri-mail-line'
    case 'sms':
      return 'ri-message-line'
    default:
      return 'ri-chat-1-line'
  }
}
