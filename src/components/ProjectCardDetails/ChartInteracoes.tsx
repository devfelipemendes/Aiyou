'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

interface Conversa {
  id: string
  content: string
  message_type: string
  audio_url: string | null
  role: string
  operator: boolean
  instruction: string | null
  operator_name: string | null
  created_at: string
}

interface ChartInteracoesProps {
  arrayConversas: Conversa[]
}

const ChartInteracoes = ({ arrayConversas }: ChartInteracoesProps) => {
  const theme = useTheme()

  const gerarEvolucao = (arrayConversas: Conversa[]) => {
    const contagemPorDia: Record<string, number> = {}
    const hoje = new Date()

    arrayConversas.forEach(msg => {
      const dia = msg.created_at.split('T')[0]
      const dataMsg = new Date(dia)

      // calcula diferença em dias
      const diffTime = hoje.getTime() - dataMsg.getTime()
      const diffDias = diffTime / (1000 * 60 * 60 * 24)

      if (diffDias <= 14) {
        // últimos 15 dias contando o dia atual
        contagemPorDia[dia] = (contagemPorDia[dia] || 0) + 1
      }
    })

    const dias = Object.keys(contagemPorDia).sort()
    const valores = dias.map(dia => contagemPorDia[dia])

    return { dias, valores }
  }

  const { dias, valores } = gerarEvolucao(arrayConversas)

  const series = [
    {
      name: 'Interações',
      data: valores
    }
  ]

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    stroke: {
      width: 3,
      curve: 'smooth',
      lineCap: 'round'
    },
    grid: {
      show: false,
      padding: { left: 2, top: -30, right: 2, bottom: -15 }
    },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          [
            { offset: 0, opacity: 0.3, color: 'var(--mui-palette-success-main)' },
            { offset: 100, opacity: 0.1, color: 'var(--mui-palette-background-paper)' }
          ]
        ]
      }
    },
    theme: {
      monochrome: {
        enabled: true,
        shadeTo: 'light',
        shadeIntensity: 1,
        color: theme.palette.success.main
      }
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: { show: false },
    responsive: [
      {
        breakpoint: 600,
        options: { chart: { height: 90 } }
      }
    ]
  }

  const getDiaAndMonth = (dia: string) => {
    const splitado = dia.split('-')
    const result = `${splitado[2]}/${splitado[1]}`

    return result
  }

  return (
    <Box>
      <AppReactApexCharts type='area' height={100} width='100%' options={options} series={series} />

      {/* Dias embaixo do chart */}
      <Box display='flex' justifyContent='space-between' alignItems={'end'} mt={6} mb={8}>
        {dias.map((dia, index) => (
          <Typography key={index} variant='caption' color='text.secondary'>
            {getDiaAndMonth(dia)}
          </Typography>
        ))}
      </Box>
    </Box>
  )
}

export default ChartInteracoes
