// Type Imports
import type { ThemeColor } from '@core/types'

export type StatusType = 'busy' | 'away' | 'online' | 'offline'

export type StatusObjType = Record<StatusType, ThemeColor>

export type ProfileUserType = {
  id: number
  role: string
  about: string
  avatar: string
  fullName: string
  status: StatusType
  settings: {
    isNotificationsOn: boolean
    isTwoStepAuthVerificationEnabled: boolean
  }
}

export type ContactType = {
  id: number
  fullName: string
  role: string
  about: string
  avatar?: string
  avatarColor?: ThemeColor
  status: StatusType
}

// 🔥 CORRIGIDO: time agora usa apenas timestamp (number)
export type UserChatType = {
  message: string
  time: number // ✅ Mudança: sempre timestamp para serialização
  senderId: number
  msgStatus?: Record<'isSent' | 'isDelivered' | 'isSeen', boolean>
}

export type ChatType = {
  id: number
  userId: number
  unseenMsgs: number
  chat: UserChatType[]
}

export interface ActiveChat {
  protocol: string // ID do protocolo (usado como canal WebSocket)
  assistant_id: string
  client_id: string
  source: 'whatsapp' | 'telegram' | 'webchat' | 'email' | 'sms'
  identifier: string // Número de telefone ou identificador
  operator: number // 0 = IA, 1 = Operador
  active: number // 0 = inativo, 1 = ativo
  updated_at: string
  created_at: string
}

// 🎯 RESPONSE: Estrutura da resposta da API
export interface ActiveChatsResponse {
  data: ActiveChat[]
}

// 🔥 NOVO: Utilitários para trabalhar com timestamps
export class DateUtils {
  /**
   * Converte timestamp para string legível
   * @param timestamp - Timestamp em milissegundos
   * @returns String formatada (ex: "14:30")
   */
  static formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Converte timestamp para data completa
   * @param timestamp - Timestamp em milissegundos
   * @returns String formatada (ex: "10/06/2025 14:30")
   */
  static formatDateTime(timestamp: number): string {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Converte timestamp para data relativa
   * @param timestamp - Timestamp em milissegundos
   * @returns String como "há 2 minutos", "ontem", etc.
   */
  static formatRelativeTime(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp

    // Menos de 1 minuto
    if (diff < 60000) {
      return 'agora mesmo'
    }

    // Menos de 1 hora
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)

      return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`
    }

    // Menos de 1 dia
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)

      return `há ${hours} hora${hours > 1 ? 's' : ''}`
    }

    // Mais de 1 dia - mostrar data
    const date = new Date(timestamp)
    const today = new Date()

    if (date.toDateString() === today.toDateString()) {
      return 'hoje'
    }

    const yesterday = new Date(today)

    yesterday.setDate(today.getDate() - 1)

    if (date.toDateString() === yesterday.toDateString()) {
      return 'ontem'
    }

    return date.toLocaleDateString('pt-BR')
  }

  /**
   * Cria timestamp atual
   * @returns Timestamp atual em milissegundos
   */
  static now(): number {
    return Date.now()
  }

  /**
   * Converte string de data para timestamp
   * @param dateString - String no formato ISO ou formato brasileiro
   * @returns Timestamp em milissegundos
   */
  static parseToTimestamp(dateString: string): number {
    return new Date(dateString).getTime()
  }
}

export type ChatMessage = {
  senderId: number
  time: string
  message: string
  msgStatus?: {
    isSent: boolean
    isDelivered: boolean
    isSeen: boolean
  }
}

export type UserProfile = {
  id: number
  fullName: string
  avatar?: string
}

export type ChatData = {
  profileUser: UserProfile // Usuário atual
  activeChat: {
    userId: number
    userInfo: UserProfile // Info do outro usuário
    messages: ChatMessage[]
  }
}

export type MsgGroupType = {
  senderId: number
  messages: Omit<ChatMessage, 'senderId'>[]
}

export type ChatLogProps = {
  chatStore: ChatData
  isBelowLgScreen: boolean
  isBelowMdScreen: boolean
  isBelowSmScreen: boolean
}
