'use client'

// React Imports
import { useState } from 'react'

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

import StepperWrapper from '@core/styles/stepper'
import StepperCustomDot from '@components/stepper-dot'

import StepReviewProject from './StepReviewConfigs'

import StepCreateProject from './StepCreateProject'
import StepCreateAssistant from './StepCreateAssistant'
import StepCreateApi from './StepCreateApi'

// Vars
const steps = [
  {
    title: 'Projeto',
    subtitle: 'Criar projeto'
  },
  {
    title: 'Assistente',
    subtitle: 'Crie e vincule um assistente ao projeto'
  },
  {
    title: "Suas Api's",
    subtitle: 'Cadastro de funções externas'
  },
  {
    title: 'Seus Endpoints',
    subtitle: 'Visualize a ordem dos seus projetos'
  },
  {
    title: 'Visualização geral',
    subtitle: 'Visualize a ordem dos seus projetos'
  }
]

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
        <StepCreateApi />
      ) : step === 3 ? (
        <StepCreateProject />
      ) : step === 4 ? (
        <StepReviewProject
          activeStep={0}
          handleNext={function (): void {
            throw new Error('Function not implemented.')
          }}
          handlePrev={function (): void {
            throw new Error('Function not implemented.')
          }}
          steps={[]}
        />
      ) : (
        <Typography variant='h6' className='text-center'>
          Etapa não encontrada
        </Typography>
      )}
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

export default PropertyListingWizard
