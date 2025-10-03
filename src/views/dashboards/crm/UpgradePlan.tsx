// file: src/views/pages/pricing/UpgradePlan.tsx
'use client'

import { useState } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { CreditCard, Shield, Zap, Crown } from 'lucide-react'

import Link from '@components/Link'
import { useUserMe } from '@/hooks/useUserMe'
import { currencyFormatter } from '@/utils/currency'

const PLANS = {
  platinum: {
    name: 'Platinum',
    price: 15500,
    icon: Crown,
    color: '#9333EA',
    features: ['API ilimitadas', 'Suporte 24/7', 'Webhooks avançados', 'Analytics em tempo real']
  },
  pro: {
    name: 'Pro',
    price: 8900,
    icon: Zap,
    color: '#3B82F6',
    features: ['Até 50 APIs', 'Suporte prioritário', 'Webhooks básicos', 'Relatórios semanais']
  }
}

const UpgradePlan = () => {
  const { user, plan: planUser } = useUserMe()
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix'>('credit')
  const [selectedPlan, setSelectedPlan] = useState<'platinum' | 'pro'>('platinum')

  console.log(setSelectedPlan)

  const plan = PLANS[selectedPlan]
  const PlanIcon = plan.icon

  return (
    <Card>
      <CardHeader title='Melhore seu Plano' subheader={user?.name ? `Olá, ${user.name}!` : undefined} />
      <CardContent className='flex flex-col gap-4'>
        <Typography variant='body2' color='text.secondary'>
          Desbloqueie recursos avançados e acelere sua integração.
        </Typography>

        {/* Plano Selecionado */}
        <Box className='p-4 flex gap-4 rounded bg-primaryLight border border-primary/20'>
          <Box
            className='is-12 bs-12 p-2.5 rounded-lg flex items-center justify-center'
            sx={{ bgcolor: plan.color + '15', border: `2px solid ${plan.color}` }}
          >
            <PlanIcon size={24} color={plan.color} />
          </Box>
          <Box className='flex items-center justify-between is-full flex-wrap gap-x-4 gap-y-2'>
            <Box className='flex flex-col gap-1'>
              <Typography color='text.primary' className='font-semibold text-lg'>
                {planUser?.name}
              </Typography>
              <Typography variant='body2' component={Link} color='primary.main' className='hover:underline'>
                Ver todos os planos
              </Typography>
            </Box>
            <Box className='flex items-baseline gap-0.5'>
              <Typography variant='body2' component='sup' color='text.primary'></Typography>
              <Typography variant='h4' component='span' className='font-bold'>
                {currencyFormatter(planUser?.price)}
              </Typography>
              <Typography variant='body2' component='sub' color='text.secondary'>
                /mês
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Features */}
        <Box className='flex flex-col gap-2'>
          {plan.features.map((feature, idx) => (
            <Box key={idx} className='flex items-center gap-2'>
              <Shield size={16} className='text-success' />
              <Typography variant='body2' color='text.secondary'>
                {feature}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider />

        {/* Método de Pagamento */}
        <Box className='flex flex-col gap-3'>
          <Typography color='text.primary' className='font-medium'>
            Método de pagamento
          </Typography>

          <Box className='flex gap-3'>
            <Button
              variant={paymentMethod === 'credit' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('credit')}
              startIcon={<CreditCard size={18} />}
              fullWidth
            >
              Cartão
            </Button>
            <Button
              variant={paymentMethod === 'pix' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('pix')}
              fullWidth
            >
              PIX
            </Button>
          </Box>

          {paymentMethod === 'credit' && (
            <Box className='flex flex-col gap-3 p-4 rounded bg-actionHover/50'>
              <TextField fullWidth label='Número do Cartão' placeholder='0000 0000 0000 0000' size='small' />
              <Box className='flex gap-3'>
                <TextField fullWidth label='Validade' placeholder='MM/AA' size='small' />
                <TextField fullWidth label='CVV' placeholder='123' size='small' />
              </Box>
            </Box>
          )}

          {paymentMethod === 'pix' && (
            <Box className='p-4 rounded bg-actionHover/50 text-center'>
              <Typography variant='body2' color='text.secondary'>
                Após confirmar, você receberá o QR Code PIX por e-mail
              </Typography>
            </Box>
          )}
        </Box>

        <TextField
          fullWidth
          name='email'
          placeholder='Confirme seu e-mail'
          size='small'
          defaultValue={user?.email || ''}
        />

        <Button variant='contained' color='primary' size='large' fullWidth>
          Confirmar Assinatura
        </Button>

        <Typography variant='caption' color='text.secondary' className='text-center'>
          Ao confirmar, você concorda com os{' '}
          <Link color='primary.main' className='hover:underline'>
            Termos de Serviço
          </Link>
        </Typography>
      </CardContent>
    </Card>
  )
}

export default UpgradePlan
