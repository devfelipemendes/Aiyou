// ===== CUSTOM LOADING BUTTON COMPONENT =====
import React from 'react'

import type { ButtonProps } from '@mui/material'
import { Button, Box, Fade, alpha } from '@mui/material'
import { styled, keyframes } from '@mui/material/styles'

// Animações suaves
const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const shimmerAnimation = keyframes`
  0% { 
    background-position: -300px 0;
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% { 
    background-position: calc(300px + 100%) 0;
    opacity: 0.8;
  }
`

// ✅ NOVA: Animação de pulse para background
const backgroundPulse = keyframes`
  0% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.1);
  }
  100% {
    filter: brightness(1);
  }
`

// Styled Button com animações e transições suaves
const StyledLoadingButton = styled(Button, {
  shouldForwardProp: prop => prop !== 'isLoading'
})<{ isLoading?: boolean }>(({ theme, isLoading }) => ({
  position: 'relative',
  overflow: 'hidden',
  minHeight: '48px',
  fontWeight: 600,
  fontSize: '16px',

  // ✅ TRANSIÇÕES MELHORADAS - Diferentes propriedades com tempos específicos
  transition: [
    'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    'background 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    'opacity 0.3s ease-in-out'
  ].join(', '),

  // Estado normal - hover suave
  ...(!isLoading && {
    // ✅ Background transition suave para estado normal
    backgroundImage: 'none',
    backgroundSize: 'auto',
    animation: 'none',

    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.25)}`,

      // ✅ Darkening suave no hover
      filter: 'brightness(1.05)'
    },
    '&:active': {
      transform: 'translateY(0)',
      filter: 'brightness(0.95)'
    }
  }),

  // Estado loading - efeito shimmer sutil
  ...(isLoading && {
    // ✅ Background animado com transição suave
    background: `linear-gradient(
      90deg,
      ${theme.palette.primary.main} 0%,
      ${alpha(theme.palette.primary.light, 0.9)} 30%,
      ${theme.palette.primary.main} 60%,
      ${alpha(theme.palette.primary.light, 0.9)} 100%
    )`,
    backgroundSize: '300px 100%',
    animation: `${shimmerAnimation} 2.5s infinite linear`,

    '&:hover': {
      transform: 'none',
      filter: 'none'
    },

    // ✅ Suavizar transição quando sai do loading
    '&.loading-exit': {
      animation: 'none',
      background: theme.palette.primary.main
    }
  })
}))

const LoadingContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px'
})

const SpinIcon = styled('div')({
  display: 'flex',
  animation: `${spinAnimation} 1s linear infinite`
})

interface SimpleLoadingButtonProps extends Omit<ButtonProps, 'children'> {
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
}

const SimpleLoadingButton: React.FC<SimpleLoadingButtonProps> = ({
  loading = false,
  loadingText = 'Carregando...',
  children,
  disabled,
  ...buttonProps
}) => {
  // ✅ Estado para controlar transições suaves
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const [wasLoading, setWasLoading] = React.useState(false)

  // ✅ Effect para gerenciar transições
  React.useEffect(() => {
    if (loading !== wasLoading) {
      setIsTransitioning(true)

      // Dar tempo para a transição visual
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setWasLoading(loading)
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [loading, wasLoading])

  return (
    <StyledLoadingButton
      {...buttonProps}
      disabled={disabled || loading}
      isLoading={loading}
      className={isTransitioning ? 'transitioning' : undefined}
      sx={{
        // ✅ Adicionar transições específicas via sx
        ...buttonProps.sx,

        // ✅ Transições customizadas
        '&.transitioning': {
          background: 'linear-gradient(135deg, #028175 0%, #76b901 100%)',
          animation: `${backgroundPulse} 0.3s ease-in-out`
        },

        // ✅ Melhorar as transições do background
        '& .MuiButton-root': {
          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
        }
      }}
    >
      {/* Conteúdo normal com transição suave */}
      <Fade in={!loading} timeout={400}>
        <Box
          sx={{
            position: loading ? 'absolute' : 'static',
            opacity: loading ? 0 : 1,
            transition: 'all 400ms cubic-bezier(0.23, 1, 0.32, 1)',
            transform: loading ? 'scale(0.9)' : 'scale(1)' // ✅ Scale transition
          }}
        >
          {children}
        </Box>
      </Fade>

      {/* Conteúdo loading com transição suave */}
      <Fade in={loading} timeout={400}>
        <LoadingContent
          sx={{
            position: loading ? 'static' : 'absolute',
            opacity: loading ? 1 : 0,
            transition: 'all 400ms cubic-bezier(0.23, 1, 0.32, 1)',
            transform: loading ? 'scale(1)' : 'scale(0.9)' // ✅ Scale transition
          }}
        >
          <SpinIcon>
            <i className='ri-loader-4-line' style={{ fontSize: '20px' }} />
          </SpinIcon>
          {loadingText}
        </LoadingContent>
      </Fade>
    </StyledLoadingButton>
  )
}

export default SimpleLoadingButton
