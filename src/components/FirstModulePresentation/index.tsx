import React, { useState, useEffect, useCallback } from 'react'

import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Fade,
  Slide,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  useTheme,
  Dialog,
  DialogContent,
  IconButton
} from '@mui/material'

// Tipagens TypeScript
export interface StepData {
  title?: string
  description?: string
  icon?: string | React.ReactNode
  component?: React.ReactNode
  tips?: string[]
  action?: React.ReactNode
  information: 'alert' | 'error' | 'info'
}

type SlideDirection = 'left' | 'right' | 'up' | 'down'
type VariantType = 'default' | 'outlined' | 'elevated' | 'gradient'
type SizeType = 'small' | 'medium' | 'large' | 'fullwidth'

interface InstructionSwiperProps {
  steps?: StepData[]
  open?: boolean
  onComplete?: () => void
  onFinaly?: () => void
  onSkip?: () => void
  onClose?: () => void
  showSkip?: boolean
  showClose?: boolean
  autoAdvance?: boolean
  autoAdvanceDelay?: number
  variant?: VariantType
  size?: SizeType
  allowCloseOnlyAtEnd?: boolean // Nova prop para controlar o comportamento
}

interface VariantStyles {
  bgcolor?: string
  borderColor?: string
  border?: string
  elevation?: number
  background?: string
}

interface SizeStyles {
  maxWidth: string
  p: number
}

const CustomStepIcon: React.FC<{
  active: boolean
  completed: boolean
  stepNumber: number
}> = ({ active, completed, stepNumber }) => {
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: active || completed ? 'primary.main' : 'grey.300',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'scale(1.1)'
        }
      }}
    >
      {completed ? (
        <i className='ri-checkbox-circle-line' style={{ fontSize: '24px', color: 'white' }} />
      ) : (
        <Typography variant='caption' fontWeight='bold' color={active || completed ? 'white' : 'textDisabled'}>
          {stepNumber}
        </Typography>
      )}
    </Box>
  )
}

export const FirstModulePresentation: React.FC<InstructionSwiperProps> = ({
  steps = [],
  open = false,
  onComplete = () => {},
  onFinaly = () => {},
  onClose = () => {},
  autoAdvance = false,
  autoAdvanceDelay = 3000,
  variant = 'default',
  size = 'medium',
  allowCloseOnlyAtEnd = true // Por padrão, só permite fechar no último passo
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [direction, setDirection] = useState<SlideDirection>('left')
  const theme = useTheme()

  const colors = theme.palette

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setDirection('left')
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, steps.length])

  const handleComplete = useCallback(() => {
    onComplete()
    onClose()
  }, [onComplete, onClose])

  const handleFinaly = useCallback(() => {
    onFinaly()
    onClose()
  }, [onFinaly, onClose])

  useEffect(() => {
    if (autoAdvance && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        handleNext()
      }, autoAdvanceDelay)

      return () => clearTimeout(timer)
    }
  }, [currentStep, autoAdvance, autoAdvanceDelay, handleNext, steps.length])

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection('right')
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex !== currentStep) {
      setDirection(stepIndex > currentStep ? 'left' : 'right')
      setCurrentStep(stepIndex)
    }
  }

  // Função corrigida para controlar o fechamento do dialog
  const handleDialogClose = () => {
    // Se allowCloseOnlyAtEnd for true, só permite fechar no último passo
    if (allowCloseOnlyAtEnd) {
      // Só permite fechar se estiver no último passo
      if (currentStep === steps.length - 1) {
        setCurrentStep(0) // Reset para o primeiro passo quando fechar
        onClose()
      }

      // Se não estiver no último passo, não faz nada (impede o fechamento)
      return
    }

    // Se allowCloseOnlyAtEnd for false, permite fechar sempre
    setCurrentStep(0) // Reset para o primeiro passo quando fechar
    onClose()
  }

  // Função para o botão de fechar (X)
  const handleCloseButtonClick = () => {
    if (allowCloseOnlyAtEnd) {
      // Só permite fechar se estiver no último passo
      if (currentStep === steps.length - 1) {
        setCurrentStep(0)
        onClose()
      }

      // Se não estiver no último passo, não faz nada
      return
    }

    // Se allowCloseOnlyAtEnd for false, permite fechar sempre
    setCurrentStep(0)
    onClose()
  }

  const getVariantStyles = (): VariantStyles => {
    const variants: Record<VariantType, VariantStyles> = {
      default: {
        borderColor: 'divider'
      },
      outlined: {
        border: `2px solid ${theme.palette.primary.main}`,
        borderColor: 'primary.main'
      },
      elevated: {
        elevation: 8,
        borderColor: 'divider'
      },
      gradient: {
        borderColor: 'primary.light'
      }
    }

    return variants[variant] || variants.default
  }

  const getSizeStyles = (): SizeStyles => {
    const sizes: Record<SizeType, SizeStyles> = {
      small: { maxWidth: 'sm', p: 3 },
      medium: { maxWidth: 'md', p: 4 },
      large: { maxWidth: 'lg', p: 5 },
      fullwidth: { maxWidth: '100%', p: 6 }
    }

    return sizes[size] || sizes.medium
  }

  if (steps.length === 0) return null

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const getMaxWidth = () => {
    switch (size) {
      case 'small':
        return 'sm'
      case 'medium':
        return 'md'
      case 'large':
        return 'lg'
      case 'fullwidth':
        return 'xl'
      default:
        return 'md'
    }
  }

  const severityMap = {
    alert: 'warning',
    error: 'error',
    info: 'info',
    success: 'success'
  } as const

  // Verifica se pode mostrar o botão de fechar
  const canClose = !allowCloseOnlyAtEnd || currentStep === steps.length - 1

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth={getMaxWidth()}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '70vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative', overflowX: 'hidden' }}>
        {/* Botão de fechar - só aparece se pode fechar */}
        {canClose && (
          <IconButton
            onClick={handleCloseButtonClick}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1,
              bgcolor: 'background.paper'
            }}
          >
            <i className='ri-close-line' />
          </IconButton>
        )}

        {/* Indicador visual quando não pode fechar */}

        <Box
          sx={{
            width: '100%',
            ...getSizeStyles(),
            ...getVariantStyles(),
            mx: 'auto',
            borderRadius: 3,
            overflow: 'visible'
          }}
        >
          <Box sx={{ p: 0 }}>
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                p: getSizeStyles().p,
                pt: 6 // Espaço extra por causa do botão fechar
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: `${colors.primary.main}`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant='body2' fontWeight='bold' color='white'>
                    {currentStep + 1}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='h4' fontWeight='600'>
                    {currentStepData?.title || `Passo ${currentStep + 1}`}
                  </Typography>
                  <Typography variant='body1'>
                    {currentStep + 1} de {steps.length}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Stepper */}
            <Box sx={{ px: getSizeStyles().p, my: 6 }}>
              <Stepper activeStep={currentStep} alternativeLabel>
                {steps.map((_, index) => (
                  <Step key={index} completed={index < currentStep}>
                    <StepButton
                      onClick={() => handleStepClick(index)}
                      sx={{
                        '& .MuiStepLabel-root': {
                          cursor: 'pointer'
                        }
                      }}
                    >
                      <StepLabel
                        slots={{
                          stepIcon: () => (
                            <CustomStepIcon
                              active={index === currentStep}
                              completed={index < currentStep}
                              stepNumber={index + 1}
                            />
                          )
                        }}
                      />
                    </StepButton>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Content Area - COM EFEITO SLIDE + FADE */}
            <Box
              sx={{
                position: 'relative',
                minHeight: 300,
                mb: 3,
                px: getSizeStyles().p
              }}
            >
              <Fade key={`fade-${currentStep}`} in={true} timeout={600} style={{ transitionDelay: '100ms' }}>
                <div>
                  <Slide key={currentStep} direction={direction} in={true} timeout={500} mountOnEnter unmountOnExit>
                    <Box>
                      {/* Icon/Image */}
                      {currentStepData?.icon && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                          <Box
                            sx={{
                              borderRadius: 3,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '2rem'
                            }}
                          >
                            {typeof currentStepData.icon === 'string' ? (
                              <Typography variant='h3' component='span'>
                                {currentStepData.icon}
                              </Typography>
                            ) : (
                              currentStepData.icon
                            )}
                          </Box>
                        </Box>
                      )}

                      {/* Description */}
                      {currentStepData?.description && (
                        <Typography
                          variant='h5'
                          color='text.secondary'
                          sx={{
                            textAlign: 'center',
                            my: 6,
                            lineHeight: 1.6
                          }}
                        >
                          {currentStepData.description}
                        </Typography>
                      )}

                      {/* Custom Component */}
                      {currentStepData?.component && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>{currentStepData.component}</Box>
                      )}

                      {/* Tips */}
                      {currentStepData?.tips && currentStepData.tips.length > 0 && (
                        <Alert
                          icon={<i className='ri-lightbulb-line text-white' />}
                          severity={severityMap[currentStepData?.information as keyof typeof severityMap] || 'info'}
                          sx={{
                            mb: 2,
                            bgcolor: `${currentStepData?.information}.light`,
                            '& .MuiAlert-icon': {
                              color: `${currentStepData?.information}.main`
                            }
                          }}
                        >
                          <Typography variant='h5' fontWeight='600' sx={{ mb: 1 }}>
                            💡 Dicas importantes:
                          </Typography>
                          <Box component='ul' sx={{ m: 0, pl: 2 }}>
                            {currentStepData.tips.map((tip: string, index: number) => (
                              <Typography key={index} variant='body2' component='ul' sx={{ mb: 0.5 }}>
                                <Typography variant='body2' component='li' color='textPrimary' sx={{ mb: 0.5 }}>
                                  {tip}
                                </Typography>
                              </Typography>
                            ))}
                          </Box>
                        </Alert>
                      )}
                    </Box>
                  </Slide>
                </div>
              </Fade>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ px: getSizeStyles().p, my: 6 }}>
              <LinearProgress
                variant='determinate'
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3
                  }
                }}
              />
            </Box>

            {/* Navigation */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: getSizeStyles().p,
                pb: getSizeStyles().p
              }}
            >
              {currentStep !== 0 && (
                <Button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  startIcon={<i className='ri-arrow-left-line' />}
                  color='inherit'
                  sx={{
                    color: currentStep === 0 ? 'text.disabled' : 'text.secondary',
                    '&:hover': {
                      bgcolor: currentStep === 0 ? 'transparent' : 'action.hover'
                    }
                  }}
                >
                  Anterior
                </Button>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {autoAdvance && currentStep < steps.length - 1 && (
                  <Chip
                    icon={<i className='ri-play-circle-line' />}
                    label='Avançando automaticamente...'
                    size='small'
                    variant='outlined'
                    color='primary'
                  />
                )}
              </Box>

              <Button
                onClick={currentStep === steps.length - 1 ? handleFinaly : handleNext}
                endIcon={
                  currentStep === steps.length - 1 ? (
                    <i className='ri-checkbox-circle-line' />
                  ) : (
                    <i className='ri-arrow-right-line' />
                  )
                }
                variant='contained'
                color={currentStep === steps.length - 1 ? 'success' : 'primary'}
                sx={{
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                {currentStep === steps.length - 1 ? 'Concluir Instruções' : 'Próximo'}
              </Button>
            </Box>

            {/* Custom Action */}
            {currentStepData?.action && (
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  px: getSizeStyles().p
                }}
              >
                {currentStepData.action}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

//* EXEMPLO DE USO DOS DADOS E DO COMPONENTE

//* const onboardingSteps: StepData[] = [
//*     {
//*       title: 'Bem-vindo ao Aiyou!',
//*       description: 'Vamos te ensinar como usar nossa plataforma de forma simples e eficiente.',
//*       icon: '👋',
//*       tips: [
//*         'Este tutorial leva apenas 2 minutos',
//*         'Você pode navegar entre os passos livremente',
//*         'Todas as funcionalidades estão explicadas aqui'
//*       ]
//*     },
//*     {
//*       title: 'Navegação Principal',
//*       description: 'Use o menu lateral para acessar todas as funcionalidades da plataforma.',
//*       icon: '🧭',
//*       component: (
//*         <Card sx={{ p: 2, bgcolor: 'grey.100', width: 250 }}>
//*           <Box
//*             sx={{
//*               height: 120,
//*               border: '2px dashed',
//*               borderColor: 'grey.400',
//*               borderRadius: 1,
//*               display: 'flex',
//*               alignItems: 'center',
//*               justifyContent: 'center',
//*               bgcolor: 'background.paper'
//*             }}
//*           >
//*             <Typography color='text.secondary'>Simulação do Menu</Typography>
//*           </Box>
//*         </Card>
//*       ),
//*       tips: ['O menu se adapta às suas permissões', 'Use Ctrl+M para abrir/fechar rapidamente']
//*     },
//*     {
//*       title: 'Área de Trabalho',
//*       description: 'Aqui você encontrará todas as suas tarefas e projetos organizados de forma intuitiva.',
//*       icon: '💼',
//*       component: (
//*         <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, width: 300 }}>
//*           <Card sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), textAlign: 'center' }}>
//*             <Typography variant='body2' color='primary.main' fontWeight='600'>
//*               Projetos Ativos
//*             </Typography>
//*             <Typography variant='h4' color='primary.main' fontWeight='bold'>
//*               12
//*             </Typography>
//*           </Card>
//*           <Card sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), textAlign: 'center' }}>
//*             <Typography variant='body2' color='success.main' fontWeight='600'>
//*               Tarefas Concluídas
//*             </Typography>
//*             <Typography variant='h4' color='success.main' fontWeight='bold'>
//*               47
//*             </Typography>
//*           </Card>
//*         </Box>
//*       )
//*     },
//*     {
//*       title: 'Pronto para começar!',
//*       description: 'Agora você está preparado para usar todas as funcionalidades do Aiyou. Boa sorte!',
//*       icon: '🎉',
//*       component: (
//*         <Chip
//*           icon={<CheckCircle />}
//*           label='Tutorial Concluído'
//*           color='success'
//*           variant='filled'
//*           sx={{
//*             px: 2,
//*             py: 1,
//*             '& .MuiChip-label': {
//*               fontWeight: 600
//*             }
//*           }}
//*         />
//*       )
//*     }
//*   ]

//*    <Box sx={{ mb: 4 }}>
//*      <FirstModulePresentation
//*        open={modalOpen}
//*        steps={onboardingSteps}
//*        onComplete={() => {
//*          console.log('Tutorial concluído!')
//*
//*          // Lógica adicional quando completa
//*        }}
//*        onFinaly={() => {
//*          console.log('Finalizado!')
//*
//*          // Ação específica do botão Finalizar
//*        }}
//*        onClose={() => setModalOpen(false)}
//*        size='large'
//*        variant='default'
//*        allowCloseOnlyAtEnd={true}
//*      />
//*    </Box>
