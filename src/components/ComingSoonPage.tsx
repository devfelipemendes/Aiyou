// file: src/components/ComingSoon/ComingSoonPage.tsx
'use client'

import { Box, Typography, Card, useTheme } from '@mui/material'
import { Construction, Sparkles } from 'lucide-react'

interface ComingSoonPageProps {
  title?: string
  description?: string
  icon?: React.ReactNode
}

export const ComingSoonPage = ({
  title = 'Em Desenvolvimento',
  description = 'Esta funcionalidade está sendo desenvolvida e estará disponível em breve.',
  icon
}: ComingSoonPageProps) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: 4
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          width: '100%',
          padding: 6,
          textAlign: 'center',
          background:
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)'
              : 'linear-gradient(135deg, #474360 0%, #3a3654 100%)',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          boxShadow: theme.shadows[4]
        }}
      >
        {/* Ícone animado */}
        <Box
          sx={{
            display: 'inline-flex',
            padding: 3,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            marginBottom: 3,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%, 100%': {
                transform: 'scale(1)',
                opacity: 1
              },
              '50%': {
                transform: 'scale(1.05)',
                opacity: 0.9
              }
            }
          }}
        >
          {icon || <Construction size={48} color='white' />}
        </Box>

        {/* Título */}
        <Typography
          variant='h4'
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 600,
            marginBottom: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          {title}
          <Sparkles size={24} />
        </Typography>

        {/* Descrição */}
        <Typography
          variant='body1'
          sx={{
            color: theme.palette.text.secondary,
            lineHeight: 1.8,
            marginBottom: 3
          }}
        >
          {description}
        </Typography>

        {/* Badge "Em Breve" */}
        <Box
          sx={{
            display: 'inline-block',
            padding: '8px 24px',
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
            color: theme.palette.mode === 'light' ? theme.palette.secondary.dark : '#fff',
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: 1
          }}
        >
          🚀 Em Breve
        </Box>
      </Card>
    </Box>
  )
}
