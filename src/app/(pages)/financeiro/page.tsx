'use client'

// React Imports
import { useEffect, useState } from 'react'

import Card from '@mui/material/Card'

import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import Grid from '@mui/material/Grid2'

import { useUserMe } from '@/hooks/useUserMe'

import PricingPlansModal from '@/components/dialogs/plans'

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
  },
  {
    id: 4,
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

  const { plan } = useUserMe()

  const [modalOpen, setModalOpen] = useState(false)

  const handleOpenModal = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  console.log('Testando resposta dos planos' + plan?.description)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  useEffect(() => {
    handleOpenModal()
  }, [])

  return (
    <Box>
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

      <Grid container spacing={4}>
        <PricingPlansModal open={modalOpen} onClose={handleCloseModal} />
      </Grid>
    </Box>
  )
}

export default FinanceiroPage
