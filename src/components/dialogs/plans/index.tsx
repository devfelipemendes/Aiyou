import React, { useEffect, useState, type ChangeEvent } from 'react'

import {
  Dialog,
  DialogContent,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  IconButton,
  Box,
  Radio,
  CircularProgress
} from '@mui/material'

import Grid from '@mui/material/Grid2'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'

import Link from '@/components/Link'
import Curve from '@/assets/svg/front-pages/landing-page/Curve'
import Arrow from '@/assets/svg/front-pages/landing-page/Arrow'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { useGetPlansQuery } from '@/api/endpoints/plans/plans'
import CustomInputVertical from '@/@core/components/custom-inputs/Vertical'
import type { CustomInputVerticalData } from '@/@core/components/custom-inputs/types'
import { AnimatedReveal } from '@/components/AnimetedReveal'
import CreditCard from '@/components/CreditCard'

// Custom styles para as dots do pagination
const swiperPaginationStyles = `
  .custom-swiper-pagination .swiper-pagination-bullet {
    background-color: var(--mui-palette-primary-main);
    opacity: 0.3;
    width: 12px;
    height: 12px;
    margin: 0 6px !important;
    transition: all 0.3s ease;
  }

  .custom-swiper-pagination .swiper-pagination-bullet-active {
    opacity: 1;
    transform: scale(1.2);
    background-color: var(--mui-palette-primary-main);
  }

  .custom-swiper-pagination .swiper-pagination {
    bottom: 10px !important;
  }

  .custom-swiper-pagination .swiper-pagination-bullet:hover {
    opacity: 0.8;
    transform: scale(1.1);
  }
`

interface PricingPlan {
  id: string
  title: string
  price: number
  features: string[]
  supportType: string
  supportMedium: string
  respondTime: string
  current: boolean
}

interface PricingPlansModalProps {
  open: boolean
  onClose: () => void
}

const data: CustomInputVerticalData[] = [
  {
    value: 'recorrencia',
    title: 'Recorrência',
    isSelected: true,
    content:
      'Ative a recorrencia no seu cartão de credito, e facilite a forma de pagemnto sem se preocupar com o vencimento',
    asset: 'ri-bank-card-fill'
  },
  {
    value: 'boleto',
    title: 'Boleto',
    content: 'Faça pagamento via boleto ou pix, com sua faltura gerada mensalmente',
    asset: 'ri-barcode-line'
  }
]

const PricingPlansModal: React.FC<PricingPlansModalProps> = ({ open, onClose }) => {
  const initialSelected: string = data.filter(item => item.isSelected)[data.filter(item => item.isSelected).length - 1]
    .value

  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [selectedMethod, setSelectedMethod] = useState<string>(initialSelected)

  const handleChange = (prop: string | ChangeEvent<HTMLInputElement>) => {
    if (typeof prop === 'string') {
      setSelectedMethod(prop)
    } else {
      setSelectedMethod((prop.target as HTMLInputElement).value)
    }
  }

  const { data: plansResponse, isLoading, error } = useGetPlansQuery()

  useEffect(() => {
    if (open) {
      const styleElement = document.createElement('style')

      styleElement.innerHTML = swiperPaginationStyles
      styleElement.id = 'swiper-pagination-custom-styles'

      const existingStyles = document.getElementById('swiper-pagination-custom-styles')

      if (existingStyles) {
        existingStyles.remove()
      }

      document.head.appendChild(styleElement)

      return () => {
        const styles = document.getElementById('swiper-pagination-custom-styles')

        if (styles) {
          styles.remove()
        }
      }
    }
  }, [open])

  // Transformar dados da API para o formato do componente
  const pricingPlans: PricingPlan[] = (plansResponse?.data || []).map(apiPlan => {
    // Gerar features baseadas nos dados da API
    const features = []

    // Assistentes
    if (apiPlan.max_assistants >= 99) {
      features.push('Assistentes ilimitados')
    } else {
      features.push(`Até ${apiPlan.max_assistants} assistentes`)
    }

    // Tokens
    if (apiPlan.max_tokens >= 1000000000) {
      features.push('Tokens ilimitados')
    } else {
      features.push(`${(apiPlan.max_tokens / 1000000).toFixed(0)}M tokens inclusos`)
    }

    // Tempo de uso
    if (apiPlan.max_seconds >= 999999) {
      features.push('Tempo de uso ilimitado')
    } else {
      const hours = Math.floor(apiPlan.max_seconds / 3600)

      features.push(`${hours} horas de uso mensal`)
    }

    // Features adicionais baseadas no nome do plano
    const planName = apiPlan.name.toLowerCase()

    if (planName.includes('basic')) {
      features.push('Relatórios básicos', 'Suporte por email', 'Dashboard simples')
    } else if (planName.includes('standard')) {
      features.push('Relatórios avançados', 'Suporte prioritário', 'Dashboard completo', 'Integrações básicas')
    } else if (planName.includes('enterprise')) {
      features.push(
        'Relatórios completos',
        'Suporte 24/7',
        'Dashboard personalizado',
        'API completa',
        'Gerente dedicado'
      )
    }

    // Informações de suporte baseadas no plano
    let supportInfo = {
      supportType: 'Básico',
      supportMedium: 'Email',
      respondTime: '48h'
    }

    if (planName.includes('enterprise')) {
      supportInfo = {
        supportType: 'Enterprise',
        supportMedium: 'Email, Chat & Phone',
        respondTime: '2h'
      }
    } else if (planName.includes('standard')) {
      supportInfo = {
        supportType: 'Padrão',
        supportMedium: 'Email & Chat',
        respondTime: '24h'
      }
    }

    return {
      id: apiPlan.id,
      title: apiPlan.name,
      price: parseFloat(apiPlan.price),
      features: features,
      supportType: supportInfo.supportType,
      supportMedium: supportInfo.supportMedium,
      respondTime: supportInfo.respondTime,
      current: false // TODO: Implementar lógica para detectar plano atual do usuário
    }
  })

  const useSwiper = pricingPlans.length > 3

  const handlePlanSelection = (planId: string, isCurrent: boolean) => {
    if (!isCurrent) {
      setSelectedPlan(planId)
    }
  }

  const renderPlanCard = (plan: PricingPlan) => {
    const isSelected = selectedPlan === plan.id
    const isSelectable = !plan.current

    const getCardStyles = () => {
      const baseStyles = {
        height: '100%',
        minHeight: '525px',
        position: 'relative' as const
      }

      if (plan.current) {
        return {
          ...baseStyles,
          border: 2,
          borderColor: 'info.main',
          backgroundColor: 'info.50'
        }
      }

      if (isSelected) {
        return {
          ...baseStyles,
          border: 2,
          borderColor: 'primary.main',
          backgroundColor: 'primary.50',
          transition: 'all 0.2s ease-in-out'
        }
      }

      if (isSelectable) {
        return {
          ...baseStyles,
          border: 1,
          borderColor: 'divider',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)'
          }
        }
      }

      return {
        ...baseStyles,
        border: 1,
        borderColor: 'divider'
      }
    }

    return (
      <Card variant='outlined' onClick={() => handlePlanSelection(plan.id, plan.current)} sx={getCardStyles()}>
        {plan.current && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '0%',
              bgcolor: 'info.main',
              color: 'info.contrastText',
              px: 4,
              py: 0.5,
              borderBottomRightRadius: 10,
              fontSize: '0.75rem',
              fontWeight: 'bold',
              zIndex: 1
            }}
          >
            PLANO ATUAL
          </Box>
        )}

        {isSelected && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: '0%',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              px: 4,
              py: 0.5,
              borderBottomLeftRadius: 10,
              fontSize: '0.75rem',
              fontWeight: 'bold',
              zIndex: 1
            }}
          >
            SELECIONADO
          </Box>
        )}

        <CardContent sx={{ display: 'flex', flexDirection: 'column', p: 3, height: '100%' }}>
          {isSelectable && (
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <Radio
                checked={isSelected}
                onChange={() => handlePlanSelection(plan.id, plan.current)}
                value={plan.id}
                color='primary'
                size='medium'
              />
            </Box>
          )}

          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Typography align='center' variant='h4' sx={{ mt: plan.current ? 2 : 4 }}>
              {plan.title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Typography variant='h5' component='sup' sx={{ fontSize: '1.125rem', fontWeight: 'medium' }}>
                  R$
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Typography color='text.primary' sx={{ fontWeight: 'bold', fontSize: '3rem', lineHeight: 1 }}>
                      {Math.floor(plan.price)}
                    </Typography>
                    {/* Renderizar centavos se houver */}
                    {plan.price % 1 !== 0 && (
                      <Typography
                        component='sup'
                        sx={{
                          fontSize: '1.5rem',
                          fontWeight: 'medium',
                          color: 'text.primary',
                          ml: 0.5
                        }}
                      >
                        .{((plan.price % 1) * 100).toFixed(0).padStart(2, '0')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant='h6'>Por mês</Typography>
                <Typography variant='body2'>10% off para assinatura anual</Typography>
              </Box>
            </Box>

            <Curve />
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              {plan.features.map((feature, featureIndex) => (
                <Box key={featureIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Arrow />
                  <Typography variant='body1'>{feature}</Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography color='text.primary' sx={{ fontWeight: 'medium' }}>
                  Suporte {plan.supportType}
                </Typography>
                <Typography variant='body2'>{plan.supportMedium}</Typography>
              </Box>
              <Chip
                variant='outlined'
                size='small'
                color={plan.current ? 'info' : 'primary'}
                label={plan.respondTime}
              />
            </Box>
          </Box>

          <Box sx={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
            <Button
              component={Link}
              href='/front-pages/payment'
              variant={plan.current ? 'contained' : isSelected ? 'contained' : 'outlined'}
              color={plan.current ? 'info' : 'primary'}
              fullWidth
              size='large'
              disabled={plan.current}
            >
              {plan.current ? 'Plano Atual' : isSelected ? 'Plano Selecionado' : 'Selecionar Plano'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
          width: '90vw',
          maxWidth: 'none',
          margin: 'auto'
        }
      }}
    >
      <Box sx={{ m: 0, p: 2, pl: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant='h5' component='div'>
          Escolha seu Plano
        </Typography>
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{
            color: theme => theme.palette.grey[500]
          }}
        >
          <i className='ri-close-fill' />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 10 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
            <Typography variant='h6' sx={{ ml: 2 }}>
              Carregando planos...
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Typography variant='h6' color='error'>
              Erro ao carregar planos. Tente novamente mais tarde.
            </Typography>
          </Box>
        )}

        {!isLoading && !error && pricingPlans.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Typography variant='h6'>Nenhum plano disponível no momento.</Typography>
          </Box>
        )}

        {!isLoading && !error && pricingPlans.length > 0 && (
          <>
            {useSwiper ? (
              <Box sx={{ position: 'relative' }}>
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={24}
                  slidesPerView={1}
                  navigation={{
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom'
                  }}
                  pagination={{
                    clickable: true,
                    dynamicBullets: true
                  }}
                  breakpoints={{
                    640: {
                      slidesPerView: 2,
                      spaceBetween: 20
                    },
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 24
                    }
                  }}
                  style={{
                    paddingBottom: '40px',
                    paddingTop: '20px'
                  }}
                  className='custom-swiper-pagination'
                >
                  {pricingPlans.map(plan => (
                    <SwiperSlide key={plan.id}>{renderPlanCard(plan)}</SwiperSlide>
                  ))}
                </Swiper>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {pricingPlans.map(plan => (
                  <Grid size={{ xs: 12, lg: 4 }} key={plan.id}>
                    {renderPlanCard(plan)}
                  </Grid>
                ))}
              </Grid>
            )}
            {selectedPlan && (
              <Grid size={{ xs: 12 }} className='mt-2'>
                <AnimatedReveal animation='slideInRight' duration={400} show={true}>
                  <Divider className='pb-5' />
                  <Grid container spacing={4} className='mb-0'>
                    <Grid size={{ xs: 12 }}>
                      <Box>
                        <Typography variant='h5' component='div' className='pt-5'>
                          Escolha o metodo de pagemento
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12 }} className='flex items-center justify-center gap-4'>
                      {data.map((item, index) => {
                        let asset

                        if (item.asset && typeof item.asset === 'string') {
                          asset = <i className={item.asset + ' text-[40px]'} />
                        }

                        return (
                          <CustomInputVertical
                            type='radio'
                            key={index}
                            data={{ ...item, asset }}
                            selected={selectedMethod}
                            name='custom-radios-icons'
                            handleChange={handleChange}
                            gridProps={{ size: { xs: 12, sm: 4 } }}
                          />
                        )
                      })}
                    </Grid>
                  </Grid>
                </AnimatedReveal>
                {selectedMethod === 'boleto' && (
                  <AnimatedReveal animation='slideInRight' duration={400} show={true}>
                    <Box className='w-full flex items-center justify-center pt-10'>
                      <Button
                        component={Link}
                        href='/front-pages/payment'
                        variant={'contained'}
                        color={'primary'}
                        size='large'
                      >
                        Gerar boleto
                      </Button>
                    </Box>
                  </AnimatedReveal>
                )}
                {selectedMethod === 'recorrencia' && (
                  <AnimatedReveal animation='slideInRight' duration={400} show={true}>
                    <Box className='w-full pt-10'>
                      <CreditCard selectedPlanId={selectedPlan} onPlanSuccess={onClose} />
                    </Box>
                  </AnimatedReveal>
                )}
              </Grid>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PricingPlansModal
