// file: src/views/admin/plans/index.tsx
'use client'

import React, { useState, useEffect } from 'react'

import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  InputAdornment,
  Slider,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import * as v from 'valibot'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

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

// Assets
import Curve from '@/assets/svg/front-pages/landing-page/Curve'
import Arrow from '@/assets/svg/front-pages/landing-page/Arrow'

// API
import {
  useGetPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  type CreatePlanRequest,
  type Plan
} from '@/api/endpoints/plans/plans'

// Validation Schema
const planSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty('Nome é obrigatório'), v.minLength(3, 'Nome deve ter no mínimo 3 caracteres')),
  description: v.pipe(
    v.string(),
    v.nonEmpty('Descrição é obrigatória'),
    v.minLength(10, 'Descrição deve ter no mínimo 10 caracteres')
  ),
  price: v.pipe(
    v.string(),
    v.nonEmpty('Preço é obrigatório'),
    v.transform(val => parseFloat(val)),
    v.check(val => !isNaN(val) && val >= 0, 'Preço deve ser maior ou igual a 0')
  ),
  max_assistants: v.pipe(
    v.string(),
    v.nonEmpty('Número de assistentes é obrigatório'),
    v.transform(val => parseInt(val)),
    v.check(val => !isNaN(val) && val >= 1, 'Mínimo 1 assistente')
  ),
  max_tokens: v.pipe(
    v.string(),
    v.nonEmpty('Número de tokens é obrigatório'),
    v.transform(val => parseInt(val)),
    v.check(val => !isNaN(val) && val >= 1000, 'Mínimo 1000 tokens')
  ),
  max_seconds: v.pipe(
    v.string(),
    v.nonEmpty('Tempo de uso é obrigatório'),
    v.transform(val => parseInt(val)),
    v.check(val => !isNaN(val) && val >= 60, 'Mínimo 60 segundos')
  )
})

type FormData = v.InferInput<typeof planSchema>

interface PlanFormModalProps {
  open: boolean
  onClose: () => void
  plan?: Plan | null
  onSuccess: () => void
}

const PlanFormModal: React.FC<PlanFormModalProps> = ({ open, onClose, plan, onSuccess }) => {
  const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation()
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(planSchema as any),
    defaultValues: {
      name: '',
      description: '',
      price: '0',
      max_assistants: '1',
      max_tokens: '1000000',
      max_seconds: '3600'
    }
  })

  // Watch form values for live preview
  const watchedValues = watch()

  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name,
        description: plan.description,
        price: plan.price.toString(),
        max_assistants: plan.max_assistants.toString(),
        max_tokens: plan.max_tokens.toString(),
        max_seconds: plan.max_seconds.toString()
      })
    } else {
      reset({
        name: '',
        description: '',
        price: '0',
        max_assistants: '1',
        max_tokens: '1000000',
        max_seconds: '3600'
      })
    }
  }, [plan, reset, open])

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        price: data.price,
        max_assistants: parseInt(data.max_assistants),
        max_tokens: parseInt(data.max_tokens),
        max_seconds: parseInt(data.max_seconds)
      }

      console.log('📤 Payload sendo enviado:', payload)

      if (plan) {
        const result = await updatePlan({
          id: plan.id,
          ...payload
        }).unwrap()

        console.log('✅ Resposta do update:', result)
        toast.success('Plano atualizado com sucesso!')
      } else {
        const result = await createPlan(payload as CreatePlanRequest).unwrap()

        console.log('✅ Resposta do create:', result)
        toast.success('Plano criado com sucesso!')
      }

      onSuccess()
      onClose()
      reset() // Reset form after success
    } catch (error: any) {
      console.error('❌ Erro detalhado:', error)
      console.error('❌ Tipo do erro:', typeof error)
      console.error('❌ Stack trace:', error?.stack)

      // Verifica se é um erro de validação do RTK Query
      if (error?.data?.message) {
        toast.error(error.data.message)
      } else if (error?.message) {
        toast.error(error.message)
      } else {
        toast.error(plan ? 'Erro ao atualizar plano' : 'Erro ao criar plano')
      }
    }
  }

  // Generate features for preview
  const generateFeatures = () => {
    const features = []

    const maxAssistants = parseInt(watchedValues.max_assistants) || 0
    const maxTokens = parseInt(watchedValues.max_tokens) || 0
    const maxSeconds = parseInt(watchedValues.max_seconds) || 0

    // Assistentes
    if (maxAssistants >= 99) {
      features.push('Assistentes ilimitados')
    } else {
      features.push(`Até ${maxAssistants} assistentes`)
    }

    // Tokens
    if (maxTokens >= 1000000000) {
      features.push('Tokens ilimitados')
    } else {
      features.push(`${(maxTokens / 1000000).toFixed(0)}M tokens inclusos`)
    }

    // Tempo de uso
    if (maxSeconds >= 999999) {
      features.push('Tempo de uso ilimitado')
    } else {
      const hours = Math.floor(maxSeconds / 3600)

      features.push(`${hours} horas de uso mensal`)
    }

    // Additional features based on plan name
    const planName = watchedValues.name.toLowerCase()

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

    return features
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
      <DialogTitle>{plan ? 'Editar Plano' : 'Criar Novo Plano'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Form Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Controller
                  name='name'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Nome do Plano'
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />

                <Controller
                  name='description'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Descrição'
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />

                <Controller
                  name='price'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Preço'
                      fullWidth
                      type='number'
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>R$</InputAdornment>
                      }}
                      error={!!errors.price}
                      helperText={errors.price?.message}
                    />
                  )}
                />

                <Controller
                  name='max_assistants'
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <FormLabel>Número de Assistentes</FormLabel>
                      <Box sx={{ px: 2 }}>
                        <Slider
                          {...field}
                          value={parseInt(field.value) || 1}
                          onChange={(e, value) => field.onChange(value.toString())}
                          valueLabelDisplay='auto'
                          min={1}
                          max={100}
                          marks={[
                            { value: 1, label: '1' },
                            { value: 25, label: '25' },
                            { value: 50, label: '50' },
                            { value: 75, label: '75' },
                            { value: 100, label: 'Ilimitado' }
                          ]}
                        />
                      </Box>
                      {errors.max_assistants && (
                        <Typography color='error' variant='caption'>
                          {errors.max_assistants.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />

                <Controller
                  name='max_tokens'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Quantidade de Tokens'
                      fullWidth
                      type='number'
                      InputProps={{
                        endAdornment: <InputAdornment position='end'>tokens</InputAdornment>
                      }}
                      error={!!errors.max_tokens}
                      helperText={errors.max_tokens?.message || 'Ex: 1000000 = 1M tokens'}
                    />
                  )}
                />

                <Controller
                  name='max_seconds'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Tempo de Uso (segundos)'
                      fullWidth
                      type='number'
                      InputProps={{
                        endAdornment: <InputAdornment position='end'>segundos</InputAdornment>
                      }}
                      error={!!errors.max_seconds}
                      helperText={
                        errors.max_seconds?.message ||
                        `${Math.floor(parseInt(watchedValues.max_seconds) / 3600) || 0} horas`
                      }
                    />
                  )}
                />
              </Box>
            </Grid>

            {/* Preview Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ position: 'sticky', top: 0 }}>
                <Typography variant='h6' gutterBottom>
                  Pré-visualização
                </Typography>
                <Card variant='outlined' sx={{ height: '100%', minHeight: '525px' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', p: 3 }}>
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                      <Typography align='center' variant='h4' sx={{ mt: 4 }}>
                        {watchedValues.name || 'Nome do Plano'}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Typography variant='h5' component='sup' sx={{ fontSize: '1.125rem', fontWeight: 'medium' }}>
                            R$
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <Typography
                                color='text.primary'
                                sx={{ fontWeight: 'bold', fontSize: '3rem', lineHeight: 1 }}
                              >
                                {Math.floor(parseFloat(watchedValues.price) || 0)}
                              </Typography>
                              {(parseFloat(watchedValues.price) || 0) % 1 !== 0 && (
                                <Typography
                                  component='sup'
                                  sx={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'medium',
                                    color: 'text.primary',
                                    ml: 0.5
                                  }}
                                >
                                  .{(((parseFloat(watchedValues.price) || 0) % 1) * 100).toFixed(0).padStart(2, '0')}
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
                        {generateFeatures().map((feature, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Arrow />
                            <Typography variant='body1'>{feature}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type='submit'
            variant='contained'
            disabled={isCreating || isUpdating}
            startIcon={(isCreating || isUpdating) && <CircularProgress size={20} />}
          >
            {plan ? 'Atualizar' : 'Criar'} Plano
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

// Main Component
const PlansManagement: React.FC = () => {
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null)

  const { data: plansResponse, isLoading, error, refetch } = useGetPlansQuery()
  const [deletePlan, { isLoading: isDeleting }] = useDeletePlanMutation()

  const plans = plansResponse?.data || []
  const useSwiper = plans.length > 3

  // Inject custom styles for swiper pagination
  useEffect(() => {
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
  }, [])

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan)
    setFormModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedPlan(null)
    setFormModalOpen(true)
  }

  const handleDeleteClick = (plan: Plan) => {
    setPlanToDelete(plan)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return

    try {
      await deletePlan({ id: planToDelete.id }).unwrap()
      toast.success('Plano excluído com sucesso!')
      setDeleteDialogOpen(false)
      setPlanToDelete(null)
    } catch (error) {
      console.error('Erro ao excluir plano:', error)
      toast.error('Erro ao excluir plano')
    }
  }

  const renderPlanCard = (plan: Plan) => {
    // Generate features
    const features = []

    if (plan.max_assistants >= 99) {
      features.push('Assistentes ilimitados')
    } else {
      features.push(`Até ${plan.max_assistants} assistentes`)
    }

    if (plan.max_tokens >= 1000000000) {
      features.push('Tokens ilimitados')
    } else {
      features.push(`${(plan.max_tokens / 1000000).toFixed(0)}M tokens inclusos`)
    }

    if (plan.max_seconds >= 999999) {
      features.push('Tempo de uso ilimitado')
    } else {
      const hours = Math.floor(plan.max_seconds / 3600)

      features.push(`${hours} horas de uso mensal`)
    }

    const planName = plan.name.toLowerCase()
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
      features.push('Relatórios completos', 'Suporte 24/7', 'Dashboard personalizado')
    } else if (planName.includes('standard')) {
      supportInfo = {
        supportType: 'Padrão',
        supportMedium: 'Email & Chat',
        respondTime: '24h'
      }
      features.push('Relatórios avançados', 'Suporte prioritário', 'Dashboard completo')
    } else {
      features.push('Relatórios básicos', 'Suporte por email', 'Dashboard simples')
    }

    return (
      <Card
        variant='outlined'
        sx={{ height: '100%', minHeight: '525px', position: 'relative', border: 2, borderColor: 'primary.main' }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', p: 3, height: '100%' }}>
          {/* Action Buttons */}
          <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
            <Tooltip title='Editar'>
              <IconButton
                size='small'
                onClick={() => handleEdit(plan)}
                sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
              >
                <i className='ri-edit-line' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Excluir'>
              <IconButton
                size='small'
                onClick={() => handleDeleteClick(plan)}
                sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
              >
                <i className='ri-delete-bin-line' />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Typography align='center' variant='h4' sx={{ mt: 4 }}>
              {plan.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Typography variant='h5' component='sup' sx={{ fontSize: '1.125rem', fontWeight: 'medium' }}>
                  R$
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Typography color='text.primary' sx={{ fontWeight: 'bold', fontSize: '3rem', lineHeight: 1 }}>
                      {Math.floor(parseFloat(plan.price))}
                    </Typography>
                    {parseFloat(plan.price) % 1 !== 0 && (
                      <Typography
                        component='sup'
                        sx={{
                          fontSize: '1.5rem',
                          fontWeight: 'medium',
                          color: 'text.primary',
                          ml: 0.5
                        }}
                      >
                        .{((parseFloat(plan.price) % 1) * 100).toFixed(0).padStart(2, '0')}
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
              {features.slice(0, 5).map((feature, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Arrow />
                  <Typography variant='body1'>{feature}</Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography color='text.primary' sx={{ fontWeight: 'medium' }}>
                  Suporte {supportInfo.supportType}
                </Typography>
                <Typography variant='body2'>{supportInfo.supportMedium}</Typography>
              </Box>
              <Chip variant='outlined' size='small' color='primary' label={supportInfo.respondTime} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Alert severity='error'>Erro ao carregar planos. Tente novamente.</Alert>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4'>Gerenciamento de Planos</Typography>
        <Button variant='contained' color='primary' startIcon={<i className='ri-add-line' />} onClick={handleCreate}>
          Criar Novo Plano
        </Button>
      </Box>

      {/* Plans Grid/Swiper */}
      {plans.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant='h6' color='text.secondary'>
            Nenhum plano cadastrado ainda.
          </Typography>
          <Button
            variant='contained'
            color='primary'
            sx={{ mt: 3 }}
            onClick={handleCreate}
            startIcon={<i className='ri-add-line' />}
          >
            Criar Primeiro Plano
          </Button>
        </Card>
      ) : (
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
                {plans.map(plan => (
                  <SwiperSlide key={plan.id}>{renderPlanCard(plan)}</SwiperSlide>
                ))}
              </Swiper>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {plans.map(plan => (
                <Grid size={{ xs: 12, lg: 4 }} key={plan.id}>
                  {renderPlanCard(plan)}
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Form Modal */}
      <PlanFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false)
          setSelectedPlan(null)
        }}
        plan={selectedPlan}
        onSuccess={() => {
          refetch()
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o plano <strong>{planToDelete?.name}</strong>? Esta ação não pode ser
            desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            color='error'
            variant='contained'
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            startIcon={isDeleting && <CircularProgress size={20} />}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PlansManagement
