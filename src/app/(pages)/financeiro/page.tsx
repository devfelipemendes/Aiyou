'use client'

// React Imports
import { useState } from 'react'

import Card from '@mui/material/Card'

import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import Grid from '@mui/material/Grid2'

import { Button, Chip, Divider } from '@mui/material'

import { useUserMe } from '@/hooks/useUserMe'
import { useGetCustomerInvoicesQuery } from '@/api/endpoints/invoices/invoice'
import Curve from '@/assets/svg/front-pages/landing-page/Curve'
import Arrow from '@/assets/svg/front-pages/landing-page/Arrow'
import Link from '@/components/Link'

// Icons

const billingHistory = [
  {
    id: 1,
    date: '2024-01-15',
    description: 'Plano Standard - Janeiro 2024',
    amount: 99.0,
    status: 'paid',
    method: 'Cartão **** 1234'
  },
  {
    id: 2,
    date: '2023-12-15',
    description: 'Plano Standard - Dezembro 2023',
    amount: 99.0,
    status: 'paid',
    method: 'Cartão **** 1234'
  },
  {
    id: 3,
    date: '2023-11-15',
    description: 'Plano Basic - Novembro 2023',
    amount: 0.0,
    status: 'paid',
    method: 'Gratuito'
  }
]

const currentPlan = {
  name: 'Standard',
  price: 99,
  nextBilling: '2024-02-15',
  features: ['Até 1.000 conversas/mês', 'Suporte via email', 'Integração API', 'Relatórios básicos']
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`financeiro-tabpanel-${index}`}
      aria-labelledby={`financeiro-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const FinanceiroPage = () => {
  const [tabValue, setTabValue] = useState(0)
  const [planFree, setPlanFree] = useState(true)
  const { plan } = useUserMe()

  const { data: response, isLoading, isError, error, refetch } = useGetCustomerInvoicesQuery({})

  const pricingPlans = [
    {
      title: 'Basic Plan',
      price: 500,
      features: [
        'Timeline',
        'Basic search',
        'Live chat widget',
        'Email marketing',
        'Custom Forms',
        'Traffic analytics'
      ],
      supportType: 'Basic',
      supportMedium: 'Only Email',
      respondTime: 'AVG. Time: 24h',
      current: false
    },
    {
      title: 'Favourite Plan',
      price: 1000,
      features: [
        'Everything in basic',
        'Timeline with database',
        'Advanced search',
        'Marketing automation',
        'Advanced chatbot',
        'Campaign management'
      ],
      supportType: 'Standard',
      supportMedium: 'Email & Chat',
      respondTime: 'AVG. Time: 6h',
      current: true
    },
    {
      title: 'Standard Plan',
      price: 100,
      features: [
        'Campaign management',
        'Timeline with database',
        'Fuzzy search',
        'A/B testing sanbox',
        'Custom permissions',
        'Social media automation'
      ],
      supportType: 'Exclusive',
      supportMedium: 'Email, Chat & Google Meet',
      respondTime: 'Live Support',
      current: false
    }
  ]

  const invoices = response?.data.data || []
  const pagination = response?.data || { totalCount: 0, hasMore: false }

  console.log('Testando resposta dos planos' + plan?.description)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <Box>
      {!planFree ? (
        <>
          <Box className='mb-6'>
            <Typography variant='h4' className='mb-2'>
              Financeiro
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Gerencie seus planos, pagamentos e faturas
            </Typography>
          </Box>

          {/* Cards de Estatísticas */}
          <Grid container spacing={4} className='mb-6'>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card className='h-full'>
                <CardContent>
                  <Box className='flex items-center justify-between'>
                    <Box>
                      <Typography variant='body2' className='opacity-80'>
                        Plano Atual
                      </Typography>
                      <Typography variant='h5' className='font-bold'>
                        {plan?.name}
                      </Typography>
                    </Box>
                    <i className='ri-vip-crown-line text-3xl opacity-80' />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Card className='h-full'>
                <CardContent>
                  <Box className='flex items-center justify-between'>
                    <Box>
                      <Typography variant='body2' color='text.secondary'>
                        Próxima Cobrança
                      </Typography>
                      <Typography variant='h6' className='font-bold'>
                        R$ {currentPlan.price},00
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {new Date(currentPlan.nextBilling).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Box>
                    <i className='ri-calendar-line text-3xl text-primary' />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Card className='h-full'>
                <CardContent>
                  <Box className='flex items-center justify-between'>
                    <Box>
                      <Typography variant='body2' color='text.secondary'>
                        Faturas Pagas
                      </Typography>
                      <Typography variant='h6' className='font-bold'>
                        {billingHistory.filter(item => item.status === 'paid').length}
                      </Typography>
                    </Box>
                    <i className='ri-file-check-line text-3xl text-success' />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Card className='h-full'>
                <CardContent>
                  <Box className='flex items-center justify-between'>
                    <Box>
                      <Typography variant='body2' color='text.secondary'>
                        Total de tokens Gasto
                      </Typography>
                      <Typography variant='h6' className='font-bold'>
                        50.5878
                      </Typography>
                    </Box>
                    <i className='ri-money-dollar-circle-line text-3xl text-info' />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs de Navegação */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label='financeiro tabs'>
                <Tab label='Cobranças' icon={<i className='ri-arrow-up-circle-line' />} />
                <Tab label='Histórico de pagamentos' icon={<i className='ri-history-line' />} />
                <Tab label='Métodos de Pagamento' icon={<i className='ri-bank-card-line' />} />
              </Tabs>
            </Box>

            {/* Tab 1: Plano Atual */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Box component='div' className='flex   flex-col '>
                    teste
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 2: Alterar Plano */}
            <TabPanel value={tabValue} index={1}>
              <Box></Box>
            </TabPanel>

            {/* Tab 3: Histórico */}
            <TabPanel value={tabValue} index={2}></TabPanel>
          </Card>
        </>
      ) : (
        <Grid container spacing={4}>
          {pricingPlans.map((plan, index) => (
            <Grid size={{ xs: 12, lg: 4 }} key={index}>
              <Card variant='outlined' {...(plan.current && { className: 'border-2 border-primary' })}>
                <CardContent className='flex flex-col gap-8 p-8'>
                  <div className='is-full flex flex-col gap-3'>
                    <Typography className='text-center' variant='h4'>
                      {plan.title}
                    </Typography>
                    <div className='flex items-center gap-3'>
                      <div className='flex items-start'>
                        <Typography variant='h5' component='sup' className='text-lg font-medium'>
                          R$
                        </Typography>
                        <Typography color='text.primary' className='font-bold text-5xl'>
                          {plan.price}
                        </Typography>
                      </div>
                      <div className='flex flex-col gap-0.5'>
                        <Typography variant='h6'>Per month</Typography>
                        <Typography variant='body2'>10% off for yearly subscription</Typography>
                      </div>
                    </div>
                    <Curve />
                  </div>
                  <div>
                    <div className='flex flex-col gap-3'>
                      {plan.features.map((feature, index) => (
                        <div key={index} className='flex items-center gap-[12px]'>
                          <Arrow />
                          <Typography variant='h5'>{feature}</Typography>
                        </div>
                      ))}
                    </div>
                    <Divider className='border mlb-4' />
                    <div className='flex gap-1 items-center justify-between'>
                      <div className='flex flex-col gap-0.25'>
                        <Typography color='text.primary' className='font-medium'>
                          {plan.supportType} Support
                        </Typography>
                        <Typography variant='body2'>{plan.supportMedium}</Typography>
                      </div>
                      <Chip variant='tonal' size='small' color='primary' label={plan.respondTime} />
                    </div>
                  </div>
                  <Button
                    component={Link}
                    href='/front-pages/payment'
                    variant={plan.current ? 'contained' : 'outlined'}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default FinanceiroPage
