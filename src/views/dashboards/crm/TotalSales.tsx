'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Components Imports

import { Box, CircularProgress } from '@mui/material'

import type { Protocol } from '@/api/endpoints/protocols/protocols'
import { getLastSixMonths } from '@/utils/utilDates'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const calculaInteractions = (protocols: Protocol[] | undefined) => {
  if (!protocols) return
  const meses = getLastSixMonths()

  const counts = meses.map(m => {
    return protocols.filter(p => {
      const d = new Date(p.created_at)
      const month = (d.getMonth() + 1).toString().padStart(2, '0')

      return month === m.value
    }).length
  })

  return {
    labels: meses.map(m => m.label),
    data: counts
  }
}

const TotalSales = ({
  protocols,
  isLoadingInteractions
}: {
  protocols: Protocol[] | undefined
  isLoadingInteractions: boolean
}) => {
  const theme = useTheme()

  const { labels = [], data = [] } = calculaInteractions(protocols) || {}

  const options: ApexOptions = {
    chart: { parentHeightOffset: 0, toolbar: { show: false } },
    tooltip: { enabled: false },
    fill: {
      type: 'gradient',
      gradient: { opacityTo: 0.2, opacityFrom: 1, shadeIntensity: 0, type: 'horizontal', stops: [0, 100, 100] }
    },
    stroke: { width: 6, curve: 'smooth', lineCap: 'round' },
    legend: { show: false },
    colors: [theme.palette.success.main],
    grid: { show: false, padding: { left: 0, right: 0, bottom: -10 } },
    xaxis: {
      categories: labels,
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: { style: { fontSize: '0.9375rem', colors: 'var(--mui-palette-text-disabled)' } }
    },
    yaxis: { labels: { show: false } }
  }

  return (
    <Card>
      <CardHeader
        title='Gráfico de interações'
        subheader={`${data?.reduce((a, b) => a + b, 0) ?? 0} interações`}
        subheaderTypographyProps={{ sx: { color: 'var(--mui-palette-text-primary) !important' } }}
      />
      <CardContent>
        <Box sx={{ height: 248, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isLoadingInteractions ? (
            <CircularProgress size={20} className='mb-4' />
          ) : (
            <AppReactApexCharts
              type='line'
              height={248}
              width='100%'
              options={options}
              series={[{ name: 'Interações', data }]}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default TotalSales
