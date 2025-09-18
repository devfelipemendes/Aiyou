import React, { useState, useEffect } from 'react'

import { Box, Fade, Slide, Zoom, Grow, Collapse } from '@mui/material'
import { keyframes, styled } from '@mui/material/styles'

// Animações customizadas com keyframes
const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 30px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`

const slideInDown = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, -30px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translate3d(-30px, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translate3d(30px, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

const bounceIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

// Styled component para animações customizadas
const AnimatedContainer = styled(Box, {
  shouldForwardProp: prop => !['animationType', 'duration', 'delay'].includes(prop as string)
})<{
  animationType: string
  duration: number
  delay: number
}>`
  animation: ${({ animationType }) => {
      switch (animationType) {
        case 'slideInUp':
          return slideInUp
        case 'slideInDown':
          return slideInDown
        case 'slideInLeft':
          return slideInLeft
        case 'slideInRight':
          return slideInRight
        case 'scaleIn':
          return scaleIn
        case 'bounceIn':
          return bounceIn
        default:
          return slideInUp
      }
    }}
    ${({ duration }) => duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${({ delay }) => delay}ms both;
`

export type AnimationType =
  | 'fade'
  | 'slide'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'zoom'
  | 'grow'
  | 'collapse'
  | 'slideInUp'
  | 'slideInDown'
  | 'slideInLeft'
  | 'slideInRight'
  | 'scaleIn'
  | 'bounceIn'

export interface AnimatedRevealProps {
  children: React.ReactNode
  animation?: AnimationType
  duration?: number
  delay?: number
  show?: boolean
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
  sx?: any
  stagger?: number // Para animar elementos em sequência
  index?: number // Para stagger
}

export const AnimatedReveal: React.FC<AnimatedRevealProps> = ({
  children,
  animation = 'slideInUp',
  duration = 600,
  delay = 0,
  show = true,
  direction = 'up',
  className,
  sx,
  stagger = 0,
  index = 0
}) => {
  const [shouldShow, setShouldShow] = useState(false)

  // Calcular delay com stagger
  const calculatedDelay = delay + stagger * index

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShouldShow(true)
      }, calculatedDelay)

      return () => clearTimeout(timer)
    } else {
      setShouldShow(false)
    }
  }, [show, calculatedDelay])

  // Renderizar animações do MUI
  const renderMuiAnimation = () => {
    switch (animation) {
      case 'fade':
        return (
          <Fade in={shouldShow} timeout={duration}>
            <Box className={className} sx={sx}>
              {children}
            </Box>
          </Fade>
        )

      case 'slide':
      case 'slideUp':
        return (
          <Slide direction={direction} in={shouldShow} timeout={duration}>
            <Box className={className} sx={sx}>
              {children}
            </Box>
          </Slide>
        )

      case 'slideDown':
        return (
          <Slide direction='down' in={shouldShow} timeout={duration}>
            <Box className={className} sx={sx}>
              {children}
            </Box>
          </Slide>
        )

      case 'slideLeft':
        return (
          <Slide direction='left' in={shouldShow} timeout={duration}>
            <Box className={className} sx={sx}>
              {children}
            </Box>
          </Slide>
        )

      case 'slideRight':
        return (
          <Slide direction='right' in={shouldShow} timeout={duration}>
            <Box className={className} sx={sx}>
              {children}
            </Box>
          </Slide>
        )

      case 'zoom':
        return (
          <Zoom in={shouldShow} timeout={duration}>
            <Box className={className} sx={sx}>
              {children}
            </Box>
          </Zoom>
        )

      case 'grow':
        return (
          <Grow in={shouldShow} timeout={duration}>
            <Box className={className} sx={sx}>
              {children}
            </Box>
          </Grow>
        )

      case 'collapse':
        return (
          <Collapse in={shouldShow} timeout={duration}>
            <Box className={className} sx={sx}>
              {children}
            </Box>
          </Collapse>
        )

      default:
        // Usar animações customizadas com keyframes
        return shouldShow ? (
          <AnimatedContainer animationType={animation} duration={duration} delay={0} className={className} sx={sx}>
            {children}
          </AnimatedContainer>
        ) : null
    }
  }

  return renderMuiAnimation()
}
