'use client'

// React Imports
import { useState, useEffect, forwardRef, type ReactElement, type Ref } from 'react'

// MUI Imports

import Image from 'next/image'

import { Dialog, DialogContent, Stepper, Step, StepLabel, Typography, Box, Slide } from '@mui/material'
import type { TransitionProps } from '@mui/material/transitions'

import StepConnector from '@mui/material/StepConnector'

import { styled } from '@mui/material/styles'

import { useAppSelector, useAppDispatch } from '@/redux-store'
import { closeModal, openModal } from '@/redux-store/slices/firstAccessSlice'
import StepCreateProject from '@/views/projects_register/StepCreateProject'
import StepCreateAssistant from '@/views/projects_register/StepCreateAssistant'
import StepCreateApi from '@/views/projects_register/StepCreateApi'
import StepCreateEndpoints from '@/views/projects_register/StepCreateEndpoints'
import StepReviewProject from '@/views/projects_register/StepReviewConfigs'
import StepperWrapper from '@/@core/styles/stepper'
import StepperCustomDot from '@components/stepper-dot'

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
  const { firstAccess, modalOpen } = useAppSelector((state: any) => state.firstAccess)

  // Estados locais para dados do wizard

  const [activeStep, setActiveStep] = useState<number>(0)

  const handleNext = () => {
    if (activeStep !== steps.length - 1) {
      setActiveStep(activeStep + 1)
    } else {
      alert('Submitted..!!')
    }
  }

  const handlePrev = () => {
    if (activeStep !== 0) {
      setActiveStep(activeStep - 1)
    }
  }

  // Controla a abertura automática do modal
  useEffect(() => {
    if (firstAccess && !modalOpen) {
      dispatch(openModal())
    }
  }, [firstAccess, modalOpen, dispatch])

  const handleCloseAttempt = () => {
    if (!firstAccess) {
      dispatch(closeModal())
    }
  }

  const ConnectorHeight = styled(StepConnector)(() => ({
    '& .MuiStepConnector-line': {
      minHeight: 20
    }
  }))

  const getStepContent = (step: number, handleNext: () => void, handlePrev: () => void) => {
    return (
      <>
        <div className='mb-6 relative'>
          <Image
            src='/images/iaImages/icons.png'
            alt={`Step ${step + 1} Header`}
            width={800}
            height={208}
            className='w-full h-52 object-cover rounded-lg'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            quality={85}
          />
        </div>

        {step === 0 ? (
          <StepCreateProject
            onNextStep={handleNext} // ✅ Passa a prop correta
          />
        ) : step === 1 ? (
          <StepCreateAssistant onNextStep={handleNext} />
        ) : step === 2 ? (
          <StepCreateApi onNextStep={handleNext} />
        ) : step === 3 ? (
          <StepCreateEndpoints onNextStep={handleNext} />
        ) : step === 4 ? (
          <StepReviewProject
            projectData={[]}
            assistantData={[]}
            apiData={[]}
            endpointData={[]}
            onPrevStep={handlePrev}
          />
        ) : (
          <Typography variant='h6' className='text-center'>
            Etapa não encontrada
          </Typography>
        )}
      </>
    )
  }

  return (
    <Dialog
      open={modalOpen}
      onClose={handleCloseAttempt}
      TransitionComponent={Transition}
      disableEscapeKeyDown={firstAccess}
      sx={{
        '& .MuiDialog-paper': {
          minHeight: '80vh',
          borderRadius: 2,
          minWidth: '90%'
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
        <Typography variant='h5' fontWeight='bold' className='p-4'>
          Bem-vindo ao Aiyou! Vamos começar criando seu primeiro projeto
        </Typography>

        {/* Botão fechar - só funciona se firstAccess for false */}
      </Box>

      <DialogContent sx={{ p: 0, minHeight: 500, display: 'flex', padding: 4, gap: 4 }}>
        <StepperWrapper className='bs-full'>
          <Stepper activeStep={activeStep} connector={<ConnectorHeight />} orientation='vertical'>
            {steps.map((step, index) => {
              return (
                <Step key={index} onClick={() => setActiveStep(index)}>
                  <StepLabel
                    className='p-0'
                    slots={{
                      stepIcon: StepperCustomDot
                    }}
                  >
                    <div className='step-label cursor-pointer'>
                      <Typography className='step-number' color='text.primary'>{`0${index + 1}`}</Typography>
                      <div>
                        <Typography className='step-title' color='text.primary'>
                          {step.title}
                        </Typography>
                        <Typography className='step-subtitle' color='text.primary'>
                          {step.subtitle}
                        </Typography>
                      </div>
                    </div>
                  </StepLabel>
                </Step>
              )
            })}
          </Stepper>
        </StepperWrapper>
        <Box className='w-full flex flex-col'>{getStepContent(activeStep, handleNext, handlePrev)}</Box>
      </DialogContent>
    </Dialog>
  )
}

export default FirstAccessModal
