'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import StepConnector from '@mui/material/StepConnector'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

// Styled Component Imports
import { Box } from '@mui/material'

import StepperWrapper from '@core/styles/stepper'
import StepperCustomDot from '@components/stepper-dot'
import StepCreateFunction from './StepCreateFunctions'
import StepReviewProject from './StepReviewConfigs'

import { FirstModulePresentation, type StepData } from '@/components/FirstModulePresentation'
import StepCreateProject from './StepCreateProject'

// Vars
const steps = [
  {
    title: 'Projeto',
    subtitle: 'Criar projeto'
  },
  {
    title: 'Cadastrar funções',
    subtitle: 'Cadastro das funções'
  },
  {
    title: 'Visualização',
    subtitle: 'Visualize a ordem dos seus projetos'
  }
]

const onboardingSteps: StepData[] = [
  {
    title: 'Bem-vindo à primeira criação de projetos! ',
    description:
      'Os Projetos são como pastas de organização onde você pode atribuir assistentes Aiyou para cumprir objetivos específicos. Se o seu plano permite até 10 assistentes, você pode criar quantos projetos quiser e atribuir um ou mais assistentes a cada um deles.',
    icon: <img src='/images/illustrations/characters/3.png' className='w-36' />,
    information: 'info',
    tips: [
      'Se você quer que um assistente cuide do seu SAC, basta criar um projeto chamado SAC e atribuir um ou mais assistentes a ele.',
      'Se nesse caso você atribuir apenas 1 assistente, ainda terá 9 disponíveis para outros projetos.',
      'Você pode distribuir esses assistentes da forma que preferir: todos em um único projeto ou divididos entre vários.'
    ]
  },
  {
    title: 'IMPORTANTE!',
    description:
      'Se tiver dúvidas ou quiser mais informações, fale com um dos assistentes ou entre em contato com nossa equipe de atendimento.',
    icon: <i className='ri-alert-line text-yellow-500 text-8xl' />,
    information: 'alert',
    tips: [
      'Um projeto sem assistente não funcionará.',
      'Ao migrar um assistente para outro projeto, ele deixará de atuar no projeto anterior.',
      'Sempre verifique as especificações do assistente antes de movê-lo.'
    ]
  }
]

const getStepContent = (step: number, handleNext: () => void, handlePrev: () => void) => {
  const Tag =
    step === 0
      ? StepCreateProject
      : step === 1
        ? StepCreateFunction
        : step === 2
          ? StepReviewProject
          : StepCreateProject

  return (
    <>
      {step !== 0 && (
        <div className='mb-6'>
          <img
            src={'/images/iaImages/icons.png'}
            alt={`Step ${step + 1} Header`}
            className='w-full h-52 object-cover rounded-lg'
          />
        </div>
      )}
      <Tag activeStep={step} handleNext={handleNext} handlePrev={handlePrev} steps={steps} />
    </>
  )
}

// Styled Components
const ConnectorHeight = styled(StepConnector)(() => ({
  '& .MuiStepConnector-line': {
    minHeight: 20
  }
}))

const PropertyListingWizard = () => {
  // States
  const [activeStep, setActiveStep] = useState<number>(0)
  const [modalOpen, setModalOpen] = useState(true)

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

  return (
    <Card className='flex flex-col lg:flex-row '>
      <Box sx={{ mb: 4 }}>
        <FirstModulePresentation
          open={modalOpen}
          steps={onboardingSteps}
          onComplete={() => {
            console.log('Tutorial concluído!')

            // Lógica adicional quando completa
          }}
          onFinaly={() => {
            console.log('Finalizado!')

            // Ação específica do botão Finalizar
          }}
          onClose={() => setModalOpen(false)}
          size='large'
          variant='default'
          allowCloseOnlyAtEnd={true}
        />
      </Box>
      <CardContent className='max-lg:border-be lg:border-ie lg:min-is-[300px]'>
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
      </CardContent>

      <CardContent className='flex-1 !pbs-5 w-full'>{getStepContent(activeStep, handleNext, handlePrev)}</CardContent>
    </Card>
  )
}

export default PropertyListingWizard
