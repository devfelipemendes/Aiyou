import { MonitoringDashboard } from '@/views/monitoring/MonitoringDashboard'

export default function MonitoringPage() {
  return <MonitoringDashboard />
}

// Metadata para a página
export const metadata = {
  title: 'Monitor de Chats | Dashboard',
  description: 'Monitore e gerencie todos os chats em tempo real'
}

// utils/chat.utils.ts
import type { ChatStatus, ChatData } from '@/types/chatTypes'

/**
 * Utilitários para manipulação de chats
 */
export class ChatUtils {
  /**
   * Formatar timestamp de forma amigável
   */
  static formatTimestamp(timestamp: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins}min`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`

    return timestamp.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  /**
   * Obter prioridade numérica do status (para ordenação)
   */
  static getStatusPriority(status: ChatStatus): number {
    const priorities: Record<ChatStatus, number> = {
      operator_call: 1, // Mais urgente
      no_response: 2,
      unsolved_closed: 3,
      active: 4,
      operator_control: 5 // Menos urgente
    }

    return priorities[status] || 6
  }

  /**
   * Gerar iniciais do nome
   */
  static getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  /**
   * Verificar se chat precisa de atenção urgente
   */
  static isUrgent(chat: ChatData): boolean {
    return chat.status === 'operator_call' || chat.priority === 'high' || (chat.unreadCount ?? 0) > 5
  }

  /**
   * Calcular tempo de resposta esperado baseado no status
   */
  static getExpectedResponseTime(status: ChatStatus): string {
    switch (status) {
      case 'operator_call':
        return 'Imediato'
      case 'active':
        return '5 minutos'
      case 'no_response':
        return '10 minutos'
      default:
        return '30 minutos'
    }
  }

  /**
   * Ordenar chats por prioridade
   */
  static sortChatsByPriority(chats: ChatData[]): ChatData[] {
    return [...chats].sort((a, b) => {
      // Primeiro por urgência
      const aUrgent = ChatUtils.isUrgent(a)
      const bUrgent = ChatUtils.isUrgent(b)

      if (aUrgent && !bUrgent) return -1
      if (!aUrgent && bUrgent) return 1

      // Depois por status
      const aPriority = ChatUtils.getStatusPriority(a.status)
      const bPriority = ChatUtils.getStatusPriority(b.status)

      if (aPriority !== bPriority) return aPriority - bPriority

      // Por último, por timestamp (mais recente primeiro)
      return b.timestamp.getTime() - a.timestamp.getTime()
    })
  }

  /**
   * Filtrar chats por critérios
   */
  static filterChats(
    chats: ChatData[],
    criteria: {
      search?: string
      status?: ChatStatus | 'all'
      department?: string
      unreadOnly?: boolean
    }
  ): ChatData[] {
    return chats.filter(chat => {
      if (criteria.search) {
        const searchLower = criteria.search.toLowerCase()

        const matchesSearch =
          chat.customerName.toLowerCase().includes(searchLower) ||
          chat.id.toLowerCase().includes(searchLower) ||
          chat.lastMessage.toLowerCase().includes(searchLower) ||
          chat.customerEmail?.toLowerCase().includes(searchLower)

        if (!matchesSearch) return false
      }

      if (criteria.status && criteria.status !== 'all') {
        if (chat.status !== criteria.status) return false
      }

      if (criteria.department) {
        if (chat.department !== criteria.department) return false
      }

      if (criteria.unreadOnly) {
        if (!chat.unreadCount || chat.unreadCount === 0) return false
      }

      return true
    })
  }
}
