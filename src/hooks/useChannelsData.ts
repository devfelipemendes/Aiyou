// hooks/useChannelsData.ts
import { useState, useEffect, useMemo } from 'react'

// Tipos
export interface ChannelDataItem {
  name: string
  value: number
  color: string
  icon: string
  trend?: number // Crescimento/decrescimento em %
  avgResponseTime?: number // Tempo médio de resposta em minutos
}

export interface ChannelsStats {
  total: number
  topChannel: ChannelDataItem
  avgGrowth: number
  avgResponseTime: number
}

// Dados mockados (futuramente virá de uma API)
const mockChannelsData: ChannelDataItem[] = [
  {
    name: 'WhatsApp',
    value: 342,
    color: '#25D366',
    icon: '💬',
    trend: 15.2,
    avgResponseTime: 1.8
  },
  {
    name: 'Telegram',
    value: 195,
    color: '#0088cc',
    icon: '✈️',
    trend: 8.7,
    avgResponseTime: 2.1
  },
  {
    name: 'Web Chat',
    value: 156,
    color: 'var(--mui-palette-primary-main)',
    icon: '🌐',
    trend: 22.3,
    avgResponseTime: 3.2
  },
  {
    name: 'E-mail',
    value: 89,
    color: 'var(--mui-palette-warning-main)',
    icon: '📧',
    trend: -2.1,
    avgResponseTime: 12.5
  },
  {
    name: 'SMS',
    value: 43,
    color: 'var(--mui-palette-secondary-main)',
    icon: '📱',
    trend: 5.4,
    avgResponseTime: 0.5
  }
]

interface UseChannelsDataOptions {
  refreshInterval?: number

  /** Filtrar apenas canais ativos */
  activeOnly?: boolean

  /** Ordenar por valor (desc) */
  sortByValue?: boolean
}

export const useChannelsData = (options: UseChannelsDataOptions = {}) => {
  const { refreshInterval, activeOnly = false, sortByValue = true } = options

  const [data, setData] = useState<ChannelDataItem[]>(mockChannelsData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simular carregamento de dados da API
  const fetchChannelsData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500))

      // Simular variação nos dados
      const updatedData = mockChannelsData.map(channel => ({
        ...channel,
        value: channel.value + Math.floor(Math.random() * 10) - 5, // ±5 variação
        trend: channel.trend ? channel.trend + (Math.random() - 0.5) * 2 : undefined
      }))

      setData(updatedData)
    } catch (err) {
      setError('Erro ao carregar dados dos canais')
      console.error('Erro ao buscar dados dos canais:', err)
    } finally {
      setLoading(false)
    }
  }

  // Processar dados baseado nas opções
  const processedData = useMemo(() => {
    let processed = [...data]

    // Filtrar apenas canais ativos
    if (activeOnly) {
      processed = processed.filter(channel => channel.value > 0)
    }

    // Ordenar por valor
    if (sortByValue) {
      processed.sort((a, b) => b.value - a.value)
    }

    return processed
  }, [data, activeOnly, sortByValue])

  // Calcular estatísticas
  const stats: ChannelsStats = useMemo(() => {
    const total = processedData.reduce((sum, channel) => sum + channel.value, 0)
    const topChannel = processedData[0] // Já está ordenado

    const avgGrowth = processedData.reduce((sum, channel) => sum + (channel.trend || 0), 0) / processedData.length

    const avgResponseTime =
      processedData.reduce((sum, channel) => sum + (channel.avgResponseTime || 0), 0) / processedData.length

    return {
      total,
      topChannel,
      avgGrowth,
      avgResponseTime
    }
  }, [processedData])

  // Atualização automática
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchChannelsData, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [refreshInterval])

  // Carregar dados iniciais
  useEffect(() => {
    fetchChannelsData()
  }, [])

  return {
    data: processedData,
    stats,
    loading,
    error,
    refetch: fetchChannelsData
  }
}

// Hook especializado para o chart de canais
export const useChannelsChart = () => {
  const { data, stats, loading, error, refetch } = useChannelsData({
    sortByValue: true,
    activeOnly: true
  })

  // Formatrar stats para o componente DonutChart
  const formattedStats = useMemo(
    () => [
      {
        label: 'Mais Usado',
        value: stats.topChannel?.name || '-',
        color: 'success.main',
        icon: '🚀'
      },
      {
        label: 'Crescimento',
        value: `+${stats.avgGrowth.toFixed(1)}%`,
        color: stats.avgGrowth >= 0 ? 'primary.main' : 'error.main',
        icon: stats.avgGrowth >= 0 ? '📈' : '📉'
      },
      {
        label: 'Tempo Médio',
        value: `${stats.avgResponseTime.toFixed(1)}min`,
        color: 'warning.main',
        icon: '⏱️'
      }
    ],
    [stats]
  )

  return {
    channelsData: data,
    chartStats: formattedStats,
    totalInteractions: stats.total,
    loading,
    error,
    refetch
  }
}
