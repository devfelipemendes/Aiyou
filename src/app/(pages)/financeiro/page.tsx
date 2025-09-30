'use client'

// React Imports
import { useEffect, useState } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'

import { useUserMe } from '@/hooks/useUserMe'

import PricingPlansModal from '@/components/dialogs/plans'
import InvoiceList from '@/views/invoice/list'
import { currencyFormatter } from '@/utils/currency'
import HorizontalWithBorderExample from '@/components/HorizontalWithBorderExample'

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
  const { plan, userTokensUsage } = useUserMe()
  const [modalOpen, setModalOpen] = useState(false)

  const isPlanFree = plan?.id === process.env.NEXT_PUBLIC_PLAN_ID_FREE

  const handleOpenModal = () => {
    if (isPlanFree) {
      setModalOpen(true)
    } else {
      setModalOpen(false)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const isFreeplan = plan?.id === process.env.NEXT_PUBLIC_PLAN_ID_FREE

  useEffect(() => {
    // Abre o modal automaticamente apenas se for plano free
    if (isFreeplan) {
      handleOpenModal()
    }
  }, [isFreeplan])

  console.log('Testando resposta dos planos' + plan?.description)

  // Se for plano free, mostra a tela especial
  if (isFreeplan) {
    return (
      <Box>
        <Box className='mb-6'>
          <Typography variant='h4' className='mb-2'>
            Financeiro
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Gerencie seus planos, pagamentos e faturas
          </Typography>
        </Box>

        <Card className='p-8 text-center'>
          <Box className='flex flex-col items-center justify-center min-h-[400px]'>
            <i className='ri-lock-line text-6xl text-gray-400 mb-4'></i>

            <Typography variant='h5' className='mb-3 font-semibold'>
              Funcionalidade Indisponível
            </Typography>

            <Typography variant='body1' color='text.secondary' className='mb-6 max-w-md'>
              Você está usando o plano <strong>Gratuito</strong>. Para acessar o painel financeiro com histórico de
              pagamentos e faturas, você precisa fazer upgrade para um plano pago.
            </Typography>

            <Box className='flex flex-col items-center gap-4'>
              <Typography variant='body2' color='text.secondary'>
                Plano atual: <strong>{plan?.name || 'Free'}</strong>
              </Typography>

              <Button
                variant='contained'
                color='primary'
                size='large'
                onClick={handleOpenModal}
                startIcon={<i className='ri-vip-crown-line'></i>}
                className='px-8 py-3'
              >
                Fazer Upgrade do Plano
              </Button>
            </Box>
          </Box>
        </Card>

        <PricingPlansModal open={modalOpen} onClose={handleCloseModal} />
      </Box>
    )
  }

  // Conteúdo normal para planos pagos
  return (
    <Box>
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
          <HorizontalWithBorderExample
            isLoading={false}
            color='info'
            icon='ri-chat-3-line'
            value={'Plano Atual'}
            title={String(plan?.name)}
            month={plan?.description || ''}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card className='h-full'>
            <HorizontalWithBorderExample
              isLoading={false}
              color='error'
              icon='ri-money-dollar-circle-line'
              value={'Próxima Cobrança'}
              title={currencyFormatter(plan?.price)}
              month={new Date(currentPlan.nextBilling).toLocaleDateString('pt-BR')}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card className='h-full'>
            <HorizontalWithBorderExample
              isLoading={false}
              color='warning'
              icon='ri-barcode-fill'
              value={'Faturas Pagas'}
              title={billingHistory.filter(item => item.status === 'paid').length || ''}
              month={'Total de faturas'}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <HorizontalWithBorderExample
            isLoading={false}
            color='success'
            icon='ri-token-swap-fill'
            value={'Total de tokens Gasto'}
            title={userTokensUsage || '0'}
            month={'Tokens Gastos neste plano'}
          />
        </Grid>
      </Grid>

      {/* Tabs de Navegação */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label='financeiro tabs'>
            <Tab label='Cobranças' icon={<i className='ri-arrow-up-circle-line' />} />
            {/* <Tab label='Histórico de pagamentos' icon={<i className='ri-history-line' />} />
            <Tab label='Métodos de Pagamento' icon={<i className='ri-bank-card-line' />} /> */}
          </Tabs>
        </Box>

        {/* Tab 1: Plano Atual */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <Box component='div' className='flex flex-col'>
                <InvoiceList />
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

      <PricingPlansModal open={modalOpen} onClose={handleCloseModal} />
    </Box>
  )
}

export default FinanceiroPage
