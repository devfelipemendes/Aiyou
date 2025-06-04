'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid2'
import Divider from '@mui/material/Divider'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionsMenu from '@core/components/option-menu'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const CardWidgetsSalesOverview = () => {
  // Hooks
  const theme = useTheme()

  const textSecondary = 'var(--mui-palette-text-secondary)'

  const options: ApexOptions = {
    chart: {
      sparkline: { enabled: true }
    },
    grid: {
      padding: {
        left: 20,
        right: 20
      }
    },
    colors: [
      'var(--mui-palette-primary-main)',
      'rgba(var(--mui-palette-primary-mainChannel) / 0.7)',
      'rgba(var(--mui-palette-primary-mainChannel) / 0.5)',
      'var(--mui-palette-customColors-trackBg)'
    ],
    stroke: { width: 0 },
    legend: { show: false },
    tooltip: { theme: 'false' },
    dataLabels: { enabled: false },
    labels: ['Hunter', 'SDR', 'Closer', 'Outros tipos'],
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      pie: {
        customScale: 0.9,
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              offsetY: 25,
              fontSize: '0.875rem',
              color: textSecondary
            },
            value: {
              offsetY: -15,
              fontWeight: 500,
              fontSize: '24px',
              formatter: value => `${value}`,
              color: 'var(--mui-palette-text-primary)'
            },
            total: {
              show: true,
              fontSize: '0.875rem',
              label: 'Atendimentos',
              color: textSecondary,
              formatter: value => `${value.globals.seriesTotals.reduce((total: number, num: number) => total + num)}`
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 1300,
        options: { chart: { height: 257 } }
      },
      {
        breakpoint: theme.breakpoints.values.lg,
        options: { chart: { height: 276 } }
      },
      {
        breakpoint: 1050,
        options: { chart: { height: 250 } }
      }
    ]
  }

  return (
    <Card>
      <CardHeader
        title='Total em Vendas'
        action={
          <OptionsMenu iconClassName='text-textPrimary' options={['ultimos 28 Dias', 'Mês passado', 'Ultimo ano']} />
        }
      />
      <CardContent>
        <Grid container>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ mb: [3, 0] }}>
            <AppReactApexCharts type='donut' height={277} width='100%' series={[13, 25, 13, 50]} options={options} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ my: 'auto' }}>
            <div className='flex items-center gap-3'>
              <CustomAvatar skin='light' color='primary' variant='rounded'>
                <i className='ri-wallet-line text-primary' />
              </CustomAvatar>
              <div className='flex flex-col'>
                <Typography> Total de antendimentos</Typography>
                <Typography variant='h5'>230</Typography>
              </div>
            </div>
            <Divider className='mlb-6' />
            <Grid container spacing={6}>
              <Grid size={{ xs: 6 }}>
                <div className='flex items-center gap-2 mbe-1'>
                  <div>
                    <i className='ri-circle-fill text-[10px] text-primary' />
                  </div>
                  <Typography>Hunter</Typography>
                </div>
                <Typography className='font-medium'>13 atendimentos</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <div className='flex items-center gap-2 mbe-1'>
                  <div>
                    <i className='ri-circle-fill text-[10px] text-primary' />
                  </div>
                  <Typography>SDR</Typography>
                </div>
                <Typography className='font-medium'>24 atendimentos</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <div className='flex items-center gap-2 mbe-1'>
                  <div>
                    <i className='ri-circle-fill text-[10px] text-primary' />
                  </div>
                  <Typography>Closer</Typography>
                </div>
                <Typography className='font-medium'>12 atendimentos</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <div className='flex items-center gap-2 mbe-1'>
                  <div>
                    <i className='ri-circle-fill text-[10px] text-primary' />
                  </div>
                  <Typography>Outros tipos</Typography>
                </div>
                <Typography className='font-medium'>50 atendimentos</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CardWidgetsSalesOverview
