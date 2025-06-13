// hooks/useMonitoringData.ts
import { useEffect, useMemo } from 'react'

import { useAppSelector } from '@/redux-store'
import {
  selectAllProtocols,
  selectProtocolStats,
  selectProtocolsLoading,
  selectProtocolsError
} from '@/redux-store/slices/protocols'

// 🔧 Interface para dados enriquecidos dos protocolos
interface EnrichedProtocol {
  id: string
  client_id: string
  status: 'active' | 'resolved' | 'closed' | 'pending'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  last_activity?: string
  messages_count: number
  unread_count: number
  operator_name?: string
  client_name?: string
  channel: 'whatsapp' | 'telegram' | 'webchat' | 'email' | 'sms'
  metadata?: any

  // Dados enriquecidos para compatibilidade com componentes existentes
  clientId: string // Mesmo que 'id' para compatibilidade
  messages: any[] // Últimas mensagens do protocolo
  totalMessages: number // Total de mensagens
  lastMessage: any | null // Última mensagem
  unreadMessages: any[] // Mensagens não lidas
  buttonName: string // Para o componente CardMonitor
  operatorName: string // Nome do operador formatado

  // Dados calculados
  hasUnreadMessages: boolean
  isUrgent: boolean
  isActive: boolean
  timeSinceLastActivity: number // em minutos
}

interface MonitoringStats {
  total: number
  active: number
  urgent: number
  unread: number
  resolved: number
  pending: number
  byChannel: Record<string, number>
  byPriority: Record<string, number>
  byOperator: Record<string, number>
}

interface UseMonitoringDataReturn {
  protocols: any[]
  enrichedProtocols: EnrichedProtocol[]
  stats: MonitoringStats

  // Estados
  loading: boolean
  error: string | null
  isEmpty: boolean

  // Utilitários
  getProtocolById: (id: string) => EnrichedProtocol | undefined
  getProtocolsByClient: (clientId: string) => EnrichedProtocol[]
  getProtocolsByStatus: (status: string) => EnrichedProtocol[]
  getProtocolsByPriority: (priority: string) => EnrichedProtocol[]

  // Contadores específicos
  urgentCount: number
  unreadCount: number
  activeCount: number
}

export const useMonitoringData = (): UseMonitoringDataReturn => {
  // 📊 Selectors básicos
  const protocols = useAppSelector(selectAllProtocols)
  const protocolStats = useAppSelector(selectProtocolStats)
  const loadingStates = useAppSelector(selectProtocolsLoading)
  const error = useAppSelector(selectProtocolsError)

  // const totalMessages = useAppSelector(selectTotalMessages)

  // 🔧 Verificar se está carregando
  const loading = useMemo(() => {
    return Object.values(loadingStates).some(Boolean)
  }, [loadingStates])

  // 🔧 Enriquecer protocolos com dados das mensagens
  const enrichedProtocols = useMemo((): EnrichedProtocol[] => {
    return protocols.map((protocol: any) => {
      //! 🔧 NOTA: Em um ambiente real, você precisaria otimizar isso
      //! criando selectors que retornem todos os dados necessários de uma vez
      //! ou usando uma estrutura de dados denormalizada no Redux
      //!
      //! Para usar as mensagens reais do Redux, substitua este hook por
      //! useOptimizedMonitoringData() quando implementar os selectors corretamente

      //! Por agora, vamos simular os dados das mensagens baseado no protocolo
      const messageCount = protocol.messages_count || 0
      const unreadCount = protocol.unread_count || 0

      // Simular últimas mensagens baseado nos dados do protocolo
      const messages = Array.from({ length: Math.min(messageCount, 10) }, (_, index) => ({
        id: `msg-${protocol.id}-${index}`,
        content: `Mensagem ${index + 1}`,
        timestamp: new Date(Date.now() - index * 60000).toISOString(),
        type: index % 2 === 0 ? 'user' : 'operator'
      }))

      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

      // 🕒 Calcular tempo desde última atividade
      const lastActivityTime = protocol.last_activity || protocol.updated_at

      const timeSinceLastActivity = Math.floor((Date.now() - new Date(lastActivityTime).getTime()) / (1000 * 60))

      return {
        // Dados originais do protocolo
        ...protocol,

        // Compatibilidade com componentes existentes
        clientId: protocol.id,

        // Dados das mensagens (simulados por enquanto)
        messages,
        totalMessages: messageCount,
        lastMessage,
        unreadMessages: messages.slice(-unreadCount),

        // Formatação para componentes
        buttonName: 'IA',
        operatorName: protocol.operator_name || 'Sistema',

        // Dados calculados
        hasUnreadMessages: unreadCount > 0,
        isUrgent: protocol.priority === 'urgent',
        isActive: protocol.status === 'active',
        timeSinceLastActivity
      }
    })
  }, [protocols])

  // 📊 Estatísticas avançadas
  const stats = useMemo((): MonitoringStats => {
    const baseStats = protocolStats

    // 📈 Estatísticas por canal
    const byChannel = enrichedProtocols.reduce(
      (acc, protocol) => {
        acc[protocol.channel] = (acc[protocol.channel] || 0) + 1

        return acc
      },
      {} as Record<string, number>
    )

    // 🎯 Estatísticas por prioridade
    const byPriority = enrichedProtocols.reduce(
      (acc, protocol) => {
        acc[protocol.priority] = (acc[protocol.priority] || 0) + 1

        return acc
      },
      {} as Record<string, number>
    )

    // 👨‍💼 Estatísticas por operador
    const byOperator = enrichedProtocols.reduce(
      (acc, protocol) => {
        const operator = protocol.operator_name || 'Não atribuído'

        acc[operator] = (acc[operator] || 0) + 1

        return acc
      },
      {} as Record<string, number>
    )

    // 📊 Contadores específicos
    const resolved = enrichedProtocols.filter(p => p.status === 'resolved').length
    const pending = enrichedProtocols.filter(p => p.status === 'pending').length

    return {
      ...baseStats,
      resolved,
      pending,
      byChannel,
      byPriority,
      byOperator
    }
  }, [protocolStats, enrichedProtocols])

  // 🔧 Funções utilitárias
  const getProtocolById = useMemo(() => {
    return (id: string): EnrichedProtocol | undefined => {
      return enrichedProtocols.find(p => p.id === id)
    }
  }, [enrichedProtocols])

  const getProtocolsByClient = useMemo(() => {
    return (clientId: string): EnrichedProtocol[] => {
      return enrichedProtocols.filter(p => p.client_id === clientId)
    }
  }, [enrichedProtocols])

  const getProtocolsByStatus = useMemo(() => {
    return (status: string): EnrichedProtocol[] => {
      return enrichedProtocols.filter(p => p.status === status)
    }
  }, [enrichedProtocols])

  const getProtocolsByPriority = useMemo(() => {
    return (priority: string): EnrichedProtocol[] => {
      return enrichedProtocols.filter(p => p.priority === priority)
    }
  }, [enrichedProtocols])

  // 📊 Contadores específicos para facilitar uso
  const urgentCount = useMemo(() => {
    return enrichedProtocols.filter(p => p.priority === 'urgent').length
  }, [enrichedProtocols])

  const unreadCount = useMemo(() => {
    return enrichedProtocols.reduce((sum, p) => sum + p.unread_count, 0)
  }, [enrichedProtocols])

  const activeCount = useMemo(() => {
    return enrichedProtocols.filter(p => p.status === 'active').length
  }, [enrichedProtocols])

  return {
    // Dados principais
    protocols,
    enrichedProtocols,
    stats,

    // Estados
    loading,
    error,
    isEmpty: enrichedProtocols.length === 0,

    // Utilitários
    getProtocolById,
    getProtocolsByClient,
    getProtocolsByStatus,
    getProtocolsByPriority,

    // Contadores específicos
    urgentCount,
    unreadCount,
    activeCount
  }
}

// 🔧 Hook especializado para dados de um client específico
export const useClientMonitoringData = (clientId: string) => {
  const { getProtocolsByClient } = useMonitoringData()

  const clientProtocols = useMemo(() => {
    return getProtocolsByClient(clientId)
  }, [clientId, getProtocolsByClient])

  const clientStats = useMemo(() => {
    return {
      total: clientProtocols.length,
      active: clientProtocols.filter(p => p.status === 'active').length,
      urgent: clientProtocols.filter(p => p.priority === 'urgent').length,
      unread: clientProtocols.reduce((sum, p) => sum + p.unread_count, 0)
    }
  }, [clientProtocols])

  return {
    protocols: clientProtocols,
    stats: clientStats,
    isEmpty: clientProtocols.length === 0
  }
}

// 🔧 Hook para dados em tempo real (com refresh automático)
export const useRealTimeMonitoringData = (refreshInterval = 30000) => {
  const monitoringData = useMonitoringData()

  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger refresh se necessário
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  return monitoringData
}

// 🔧 Hook para filtros avançados
export const useFilteredMonitoringData = (filters: {
  status?: string[]
  priority?: string[]
  channel?: string[]
  operator?: string[]
  timeRange?: { start: Date; end: Date }
  searchTerm?: string
}) => {
  const { enrichedProtocols, ...rest } = useMonitoringData()

  const filteredProtocols = useMemo(() => {
    let filtered = [...enrichedProtocols]

    // Filtro por status
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(p => filters.status!.includes(p.status))
    }

    // Filtro por prioridade
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(p => filters.priority!.includes(p.priority))
    }

    // Filtro por canal
    if (filters.channel && filters.channel.length > 0) {
      filtered = filtered.filter(p => filters.channel!.includes(p.channel))
    }

    // Filtro por operador
    if (filters.operator && filters.operator.length > 0) {
      filtered = filtered.filter(p => filters.operator!.includes(p.operator_name || 'Não atribuído'))
    }

    // Filtro por período
    if (filters.timeRange) {
      filtered = filtered.filter(p => {
        const createdAt = new Date(p.created_at)

        return createdAt >= filters.timeRange!.start && createdAt <= filters.timeRange!.end
      })
    }

    // Filtro por termo de busca
    if (filters.searchTerm && filters.searchTerm.length > 0) {
      const searchLower = filters.searchTerm.toLowerCase()

      filtered = filtered.filter(
        p =>
          p.client_name?.toLowerCase().includes(searchLower) ||
          p.operator_name?.toLowerCase().includes(searchLower) ||
          p.lastMessage?.content?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [enrichedProtocols, filters])

  return {
    ...rest,
    enrichedProtocols: filteredProtocols,
    originalCount: enrichedProtocols.length,
    filteredCount: filteredProtocols.length
  }
}

export default useMonitoringData

export const useOptimizedMonitoringData = (): UseMonitoringDataReturn => {
  const protocols = useAppSelector(selectAllProtocols)
  const protocolStats = useAppSelector(selectProtocolStats)
  const loadingStates = useAppSelector(selectProtocolsLoading)
  const error = useAppSelector(selectProtocolsError)

  // 🔧 Criar um seletor que retorna todas as mensagens organizadas por protocolo
  const allMessagesByProtocol = useAppSelector((state: any) => state.messagesReducer.messagesByProtocol)

  const enrichedProtocols = useMemo((): EnrichedProtocol[] => {
    return protocols.map((protocol: any) => {
      // Agora podemos acessar as mensagens diretamente do estado global
      const messages = allMessagesByProtocol[protocol.id] || []
      const lastMessage = messages[messages.length - 1] || null
      const unreadMessages = messages.filter((m: any) => !m.is_read)

      const lastActivityTime = protocol.last_activity || protocol.updated_at

      const timeSinceLastActivity = Math.floor((Date.now() - new Date(lastActivityTime).getTime()) / (1000 * 60))

      return {
        ...protocol,
        clientId: protocol.id,
        messages: messages.slice(-10),
        totalMessages: messages.length,
        lastMessage,
        unreadMessages,
        buttonName: 'IA',
        operatorName: protocol.operator_name || 'Sistema',
        hasUnreadMessages: unreadMessages.length > 0,
        isUrgent: protocol.priority === 'urgent',
        isActive: protocol.status === 'active',
        timeSinceLastActivity
      }
    })
  }, [protocols, allMessagesByProtocol])

  // Resto da implementação igual...
  const loading = useMemo(() => Object.values(loadingStates).some(Boolean), [loadingStates])

  const stats = useMemo((): MonitoringStats => {
    const baseStats = protocolStats

    const byChannel = enrichedProtocols.reduce(
      (acc, protocol) => {
        acc[protocol.channel] = (acc[protocol.channel] || 0) + 1

        return acc
      },
      {} as Record<string, number>
    )

    const byPriority = enrichedProtocols.reduce(
      (acc, protocol) => {
        acc[protocol.priority] = (acc[protocol.priority] || 0) + 1

        return acc
      },
      {} as Record<string, number>
    )

    const byOperator = enrichedProtocols.reduce(
      (acc, protocol) => {
        const operator = protocol.operator_name || 'Não atribuído'

        acc[operator] = (acc[operator] || 0) + 1

        return acc
      },
      {} as Record<string, number>
    )

    const resolved = enrichedProtocols.filter(p => p.status === 'resolved').length
    const pending = enrichedProtocols.filter(p => p.status === 'pending').length

    return { ...baseStats, resolved, pending, byChannel, byPriority, byOperator }
  }, [protocolStats, enrichedProtocols])

  const getProtocolById = useMemo(() => (id: string) => enrichedProtocols.find(p => p.id === id), [enrichedProtocols])

  const getProtocolsByClient = useMemo(
    () => (clientId: string) => enrichedProtocols.filter(p => p.client_id === clientId),
    [enrichedProtocols]
  )

  const getProtocolsByStatus = useMemo(
    () => (status: string) => enrichedProtocols.filter(p => p.status === status),
    [enrichedProtocols]
  )

  const getProtocolsByPriority = useMemo(
    () => (priority: string) => enrichedProtocols.filter(p => p.priority === priority),
    [enrichedProtocols]
  )

  const urgentCount = useMemo(() => enrichedProtocols.filter(p => p.priority === 'urgent').length, [enrichedProtocols])

  const unreadCount = useMemo(() => enrichedProtocols.reduce((sum, p) => sum + p.unread_count, 0), [enrichedProtocols])

  const activeCount = useMemo(() => enrichedProtocols.filter(p => p.status === 'active').length, [enrichedProtocols])

  return {
    protocols,
    enrichedProtocols,
    stats,
    loading,
    error,
    isEmpty: enrichedProtocols.length === 0,
    getProtocolById,
    getProtocolsByClient,
    getProtocolsByStatus,
    getProtocolsByPriority,
    urgentCount,
    unreadCount,
    activeCount
  }
}
