'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next.js Imports
import Image from 'next/image'

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

const ONBOARDING_COOKIE_NAME = 'first_project_onboarding_completed'
const COOKIE_EXPIRY_DAYS = 365

const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date()

  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

const getCookie = (name: string): string | null => {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]

    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }

  return null
}

const hasCompletedOnboarding = (): boolean => {
  if (typeof window === 'undefined') return false

  return getCookie(ONBOARDING_COOKIE_NAME) === 'true'
}

const markOnboardingAsCompleted = () => {
  setCookie(ONBOARDING_COOKIE_NAME, 'true', COOKIE_EXPIRY_DAYS)
}

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
    icon: (
      <Image
        src='/images/illustrations/characters/3.png'
        alt='Personagem de boas-vindas'
        width={144}
        height={144}
        className='w-36 h-auto'
        priority
      />
    ),
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
  const [modalOpen, setModalOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const completed = hasCompletedOnboarding()

    setModalOpen(!completed)
  }, [])

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

  const handleOnboardingComplete = () => {
    markOnboardingAsCompleted()
    setModalOpen(false)
  }

  const handleModalClose = () => {
    setModalOpen(false)
  }

  const resetOnboarding = () => {
    setCookie(ONBOARDING_COOKIE_NAME, '', -1) // Delete cookie
    setModalOpen(true)
  }

  if (!isClient) {
    return (
      <Card className='flex flex-col lg:flex-row'>
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

  return (
    <Card className='flex flex-col lg:flex-row'>
      <Box sx={{ mb: 4 }}>
        <FirstModulePresentation
          open={modalOpen}
          steps={onboardingSteps}
          onFinaly={handleOnboardingComplete} // Save to cookies when completed
          onClose={handleModalClose} // Close without saving
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

      {/* Development helper - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={resetOnboarding}
          className='fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg'
          title='Reset Onboarding (Development only)'
        >
          Reset Onboarding
        </button>
      )}
    </Card>
  )
}

export default PropertyListingWizard
