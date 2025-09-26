'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

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

  // Gera evolução sequencial
  const gerarEvolucao = (arrayConversas: Conversa[]) => {
    const contagemPorDia: Record<string, number> = {}

    arrayConversas.forEach(msg => {
      const dia = msg.created_at.split('T')[0]

      contagemPorDia[dia] = (contagemPorDia[dia] || 0) + 1
    })

    const valores = Object.keys(contagemPorDia)
      .sort()
      .map(dia => contagemPorDia[dia])

    return valores
  }

  const data = gerarEvolucao(arrayConversas)

  const series = [
    {
      name: 'Interações',
      data
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
      labels: { show: false }, // sem labels
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

  return (
    <>
      <AppReactApexCharts type='area' height={100} width='100%' options={options} series={series} />
    </>
  )
}

export default ChartInteracoes
