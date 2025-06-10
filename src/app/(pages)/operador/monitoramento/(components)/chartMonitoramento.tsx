// components/charts/DonutChart.tsx
'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Tipos
interface ChartDataItem {
  name: string
  value: number
  color: string
  icon?: string
}

interface StatItem {
  label: string
  value: string
  color?: string
  icon?: string
}

interface DonutChartProps {
  data: ChartDataItem[]

  /** Título principal do card */
  title: string

  /** Subtítulo/descrição */
  subtitle?: string

  /** Altura do chart */
  height?: number

  /** Stats extras para exibir no footer */
  stats?: StatItem[]

  /** Mostrar valores absolutos na legenda */
  showValuesInLegend?: boolean

  /** Mostrar percentuais no chart */
  showPercentages?: boolean

  /** Tamanho do buraco do donut (0-100) */
  donutSize?: string

  /** Loading state */
  loading?: boolean

  /** Função de callback ao clicar em uma fatia */
  onSliceClick?: (dataIndex: number, data: ChartDataItem) => void
}

const DonutChart = ({
  data,
  title,
  subtitle,
  height = 280,
  stats,
  showValuesInLegend = true,
  showPercentages = true,
  donutSize = '65%',
  loading = false,
  onSliceClick
}: DonutChartProps) => {
  // Hooks
  const theme = useTheme()

  // Calcular total
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Preparar dados para o chart
  const series = data.map(item => item.value)
  const labels = data.map(item => item.name)
  const colors = data.map(item => item.color)

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      animations: {
        enabled: !loading,
        speed: 800
      },
      events: onSliceClick
        ? {
            dataPointSelection: config => {
              const dataIndex = config.dataPointIndex

              if (dataIndex >= 0 && data[dataIndex]) {
                onSliceClick(dataIndex, data[dataIndex])
              }
            }
          }
        : undefined
    },
    labels: labels,
    colors: colors,
    dataLabels: {
      enabled: showPercentages,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: {
        fontSize: '11px',
        fontWeight: '600'
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: donutSize,
          labels: {
            show: true,
            name: {
              show: false, // Oculta o nome individual no hover
              fontSize: '14px',
              fontWeight: 600,
              color: theme.palette.text.primary
            },
            value: {
              show: false, // Oculta o valor individual no hover
              fontSize: '20px',
              fontWeight: 700,
              color: theme.palette.primary.main,
              formatter: (val: string) => parseInt(val).toLocaleString()
            },
            total: {
              show: true,
              showAlways: true, // Sempre mostra o total
              label: 'Total',
              fontSize: '14px',
              fontWeight: 500,
              color: theme.palette.text.secondary,
              formatter: () => {
                return total.toLocaleString()
              }
            }
          }
        }
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '11px',
      fontWeight: 500,
      labels: {
        colors: theme.palette.text.secondary
      },
      markers: {
        size: 8
      },
      itemMargin: {
        horizontal: 8,
        vertical: 2
      },
      formatter: showValuesInLegend
        ? (seriesName: string, opts: any) => {
            const value = data[opts.seriesIndex]?.value || 0

            return `${seriesName}: ${value}`
          }
        : undefined
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (value: number) => `${value.toLocaleString()} interações`
      }
    },
    states: {
      hover: {
        filter: {
          type: 'lighten'
        }
      },
      active: {
        filter: {
          type: 'darken'
        }
      }
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.sm,
        options: {
          chart: {
            height: height * 0.8
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ]
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: height + 100,
              color: 'text.secondary'
            }}
          >
            <Typography variant='body2'>Carregando dados...</Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ cursor: onSliceClick ? 'pointer' : 'default' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant='h6' sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant='body2' color='text.secondary'>
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Donut Chart */}
        <AppReactApexCharts type='donut' height={height} width='100%' options={options} series={series} />

        {/* Stats Footer */}
        {stats && stats.length > 0 && (
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              justifyContent: 'space-around',
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            {stats.map((stat, index) => (
              <Box key={index} sx={{ textAlign: 'center', minWidth: 'fit-content' }}>
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: 600,
                    color: stat.color || 'text.primary'
                  }}
                >
                  {stat.icon} {stat.label}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default DonutChart
