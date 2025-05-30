'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Image from 'next/image'

import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Type Imports

// Component Imports

// Hook Imports

import type { Locale } from '@/configs/i18n'
import StepAccountDetails from './StepAccountDetails'
import StepPersonalInfo from './StepPersonalInfo'
import StepBillingDetails from './StepBillingDetails'
import { useSettings } from '@/@core/hooks/useSettings'
import { getLocalizedUrl } from '@/utils/i18n'
import StepperWrapper from '@/@core/styles/stepper'
import StepperCustomDot from '@/components/stepper-dot'
import Logo from '@/components/layout/shared/Logo'

// Util Imports

// Vars
const steps = [
  {
    title: 'Conta',
    subtitle: 'Detalhes da conta'
  },
  {
    title: 'Dados Pessoais',
    subtitle: 'Informações importantes!'
  },
  {
    title: 'Cobrança',
    subtitle: 'Detalhes para o pagamento'
  }
]

const getStepContent = (step: number, handleNext: () => void, handlePrev: () => void) => {
  switch (step) {
    case 0:
      return <StepAccountDetails activeStep={step} handleNext={handleNext} />
    case 1:
      return <StepPersonalInfo activeStep={step} handleNext={handleNext} handlePrev={handlePrev} />
    case 2:
      return <StepBillingDetails activeStep={step} handlePrev={handlePrev} />

    default:
      return null
  }
}

const RegisterMultiSteps = () => {
  // States
  const [activeStep, setActiveStep] = useState<number>(0)

  // Hooks
  const { settings } = useSettings()
  const theme = useTheme()
  const { lang: locale } = useParams()

  // Handle Stepper
  const handleNext = () => {
    setActiveStep(activeStep + 1)
  }

  const handlePrev = () => {
    if (activeStep !== 0) {
      setActiveStep(activeStep - 1)
    }
  }

  return (
    <div className='flex bs-full justify-between items-center'>
      <div
        className={classnames(
          'fixed start-0 top-0 h-screen w-[30vw] flex items-center justify-center overflow-hidden z-10 ',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <Image
          src='/images/logoimg.png'
          alt='multi-steps-character-background'
          className={classnames('object-cover ', {
            'scale-x-[-1]': theme.direction === 'rtl'
          })}
          fill
          priority
          unoptimized={true}
          quality={100}
          style={{
            objectFit: 'cover' // Garante que cubra todo o espaço
          }}
        />
      </div>
      <div className='ms-[30vw] flex justify-center items-center bs-full is-full bg-backgroundPaper'>
        <Link
          href={locale ? getLocalizedUrl('/', locale as Locale) : '/'}
          className='absolute block-start-5 sm:block-start-[25px] inline-start-6 sm:inline-start-[25px] z-[20]'
        >
          <Logo color='white' />
        </Link>
        <StepperWrapper className='p-5 sm:p-8 is-[700px]'>
          <Stepper className='mbe-12 mbs-16 sm:mbs-0' activeStep={activeStep}>
            {steps.map((step, index) => {
              return (
                <Step key={index}>
                  <StepLabel
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
          {getStepContent(activeStep, handleNext, handlePrev)}
        </StepperWrapper>
      </div>
    </div>
  )
}

export default RegisterMultiSteps
