// app/(pages)/operador/monitoramento/(components)/ChannelsChart.tsx
'use client'

import { useCallback } from 'react'

import DonutChart from './chartMonitoramento'
import { useChannelsChart } from '@/hooks/useChannelsData'

interface ChannelsChartProps {
  title?: string

  /** Subtítulo customizado */
  subtitle?: string

  /** Altura do chart */
  height?: number

  /** Callback ao clicar em um canal */
  onChannelClick?: (channelName: string) => void

  /** Atualização automática em ms */
  refreshInterval?: number
}

const ChannelsChart = ({
  title = '🎯 Distribuição de Canais',
  subtitle = 'Interações por plataforma hoje',
  height = 280,
  onChannelClick
}: ChannelsChartProps) => {
  // Hook para dados dos canais
  const { channelsData, chartStats, totalInteractions, loading, error } = useChannelsChart()

  // Handler para clique no canal
  const handleChannelClick = useCallback(
    (dataIndex: number) => {
      if (onChannelClick && channelsData[dataIndex]) {
        onChannelClick(channelsData[dataIndex].name)
      }
    },
    [channelsData, onChannelClick]
  )

  // Exibir erro se houver
  if (error) {
    return <DonutChart data={[]} title='❌ Erro nos Dados' subtitle={error} height={height} loading={false} />
  }

  return (
    <DonutChart
      data={channelsData}
      title={title}
      subtitle={`${subtitle} • ${totalInteractions.toLocaleString()} total`}
      height={height}
      stats={chartStats}
      loading={loading}
      showValuesInLegend={true}
      showPercentages={true}
      donutSize='65%'
      onSliceClick={onChannelClick ? handleChannelClick : undefined}
    />
  )
}

export default ChannelsChart
