'use client'

// React Imports
import { useState, useEffect, forwardRef, type ReactElement, type Ref } from 'react'

// MUI Imports
import { Dialog, DialogContent, Stepper, Step, StepLabel, Typography, IconButton, Box, Slide } from '@mui/material'
import type { TransitionProps } from '@mui/material/transitions'

// Redux Imports
import { useAppSelector, useAppDispatch } from '@/redux-store'
import { closeModal, setCurrentStep, openModal } from '@/redux-store/slices/firstAccessSlice'
import StepCreateProject from '@/views/projects_register/StepCreateProject'
import StepCreateAssistant from '@/views/projects_register/StepCreateAssistant'
import StepCreateApi from '@/views/projects_register/StepCreateApi'
import StepCreateEndpoints from '@/views/projects_register/StepCreateEndpoints'
import StepReviewProject from '@/views/projects_register/StepReviewConfigs'

// Component Imports

// Transition para o modal
const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>
  },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Steps do wizard
const steps = [
  {
    title: 'Projeto',
    subtitle: 'Criar projeto',
    icon: 'ri-folder-line'
  },
  {
    title: 'Assistente',
    subtitle: 'Crie e vincule um assistente ao projeto',
    icon: 'ri-robot-line'
  },
  {
    title: "Suas Api's",
    subtitle: 'Cadastro de funções externas',
    icon: 'ri-api-line'
  },
  {
    title: 'Seus Endpoints',
    subtitle: 'Configure seus endpoints',
    icon: 'ri-links-line'
  },
  {
    title: 'Revisão Final',
    subtitle: 'Visualize a configuração completa',
    icon: 'ri-eye-line'
  }
]

const FirstAccessModal = () => {
  const dispatch = useAppDispatch()

  // Estados do Redux
  const { firstAccess, modalOpen, currentStep } = useAppSelector((state: any) => state.firstAccess)

  // Estados locais para dados do wizard
  const [projectData, setProjectData] = useState<any>(null)
  const [assistantData, setAssistantData] = useState<any>(null)
  const [apiData, setApiData] = useState<any>(null)
  const [endpointData, setEndpointData] = useState<any>(null)

  // Controla a abertura automática do modal
  useEffect(() => {
    if (firstAccess && !modalOpen) {
      dispatch(openModal())
    }
  }, [firstAccess, modalOpen, dispatch])

  // Navegação entre steps
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      dispatch(setCurrentStep(currentStep + 1))
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      dispatch(setCurrentStep(currentStep - 1))
    }
  }

  const handleFinishProject = async () => {
    try {
      alert('Projeto finalizado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao finalizar projeto:', error)
    }
  }

  const handleCloseAttempt = () => {
    if (!firstAccess) {
      dispatch(closeModal())
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepCreateProject onNextStep={handleNext} />
      case 1:
        return <StepCreateAssistant onNextStep={handleNext} />
      case 2:
        return <StepCreateApi />
      case 3:
        return <StepCreateEndpoints />
      case 4:
        return (
          <StepReviewProject
            onPrevStep={handlePrev}
            onFinish={handleFinishProject}
            projectData={projectData}
            assistantData={assistantData}
            apiData={apiData}
            endpointData={endpointData}
          />
        )
      default:
        return <Typography>Step não encontrado</Typography>
    }
  }

  return (
    <Dialog
      open={modalOpen}
      onClose={handleCloseAttempt} // Só fecha se firstAccess for false
      maxWidth='lg'
      fullWidth
      TransitionComponent={Transition}
      disableEscapeKeyDown={firstAccess} // Bloqueia ESC se firstAccess for true
      sx={{
        '& .MuiDialog-paper': {
          minHeight: '80vh',
          borderRadius: 2
        }
      }}
    >
      {/* Header com título e botão fechar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant='h5' fontWeight='bold'>
          🎯 Configuração Inicial do Projeto
        </Typography>

        {/* Botão fechar - só funciona se firstAccess for false */}
        <IconButton
          onClick={handleCloseAttempt}
          disabled={firstAccess} // Desabilitado se firstAccess for true
          sx={{
            opacity: firstAccess ? 0.3 : 1,
            cursor: firstAccess ? 'not-allowed' : 'pointer'
          }}
        >
          <i className='ri-close-line' />
        </IconButton>
      </Box>

      {/* Stepper horizontal */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>
                <Box display='flex' flexDirection='column' alignItems='center'>
                  <i className={step.icon} style={{ fontSize: 20, marginBottom: 4 }} />
                  <Typography variant='caption' fontWeight='medium'>
                    {step.title}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {step.subtitle}
                  </Typography>
                </Box>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Conteúdo do modal */}
      <DialogContent sx={{ p: 0, minHeight: 500 }}>{renderStepContent()}</DialogContent>
    </Dialog>
  )
}

export default FirstAccessModal
