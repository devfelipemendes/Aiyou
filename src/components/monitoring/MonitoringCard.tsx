// components/monitoring/MonitoringCard.tsx
'use client'

import { useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Badge from '@mui/material/Badge'
import { keyframes, useTheme } from '@mui/material/styles'

// Types
import type { ChatData, CardVisualConfig } from '@/types/chatTypes'

// Props do componente
interface MonitoringCardProps {
  chat: ChatData
  isSelected?: boolean
  onClick: (chat: ChatData) => void
  className?: string
}

/**
 * Animação de piscar para cards urgentes
 */
const blinkAnimation = keyframes`
  0%, 50% { 
    background-color: rgba(244, 67, 54, 0.1);
    border-color: rgba(244, 67, 54, 0.5);
  }
  51%, 100% { 
    background-color: rgba(244, 67, 54, 0.25);
    border-color: rgba(244, 67, 54, 0.8);
  }
`

/**
 * Componente Card individual para exibir informações do chat
 *
 * Funcionalidades:
 * - Visual baseado no status do chat
 * - Animação de piscar para chamadas urgentes
 * - Estado de seleção (borda + elevation)
 * - Hover effects
 * - Badge para mensagens não lidas
 */
export const MonitoringCard = ({ chat, isSelected = false, onClick, className }: MonitoringCardProps) => {
  const theme = useTheme()

  /**
   * Configuração visual baseada no status do chat
   */
  const visualConfig = useMemo((): CardVisualConfig => {
    switch (chat.status) {
      case 'operator_call':
        return {
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          borderColor: 'rgba(244, 67, 54, 0.3)',
          animation: `${blinkAnimation} 1.5s infinite`,
          chipColor: 'error',
          statusText: 'Chamada Urgente'
        }

      case 'unsolved_closed':
        return {
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          borderColor: 'rgba(255, 193, 7, 0.3)',
          chipColor: 'warning',
          statusText: 'Não Resolvido'
        }

      case 'operator_control':
        return {
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderColor: 'rgba(33, 150, 243, 0.3)',
          chipColor: 'info',
          statusText: 'Sob Controle'
        }

      case 'no_response':
        return {
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          borderColor: 'rgba(255, 152, 0, 0.3)',
          chipColor: 'warning',
          statusText: 'Sem Resposta'
        }

      case 'active':
        return {
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderColor: 'rgba(76, 175, 80, 0.3)',
          chipColor: 'success',
          statusText: 'Ativo'
        }

      default:
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          chipColor: 'default',
          statusText: 'Desconhecido'
        }
    }
  }, [chat.status])

  /**
   * Estilos dinâmicos do card
   */
  const cardStyles = useMemo(() => {
    const baseStyles = {
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '2px solid',
      borderColor: 'transparent',
      position: 'relative',
      overflow: 'visible',

      // Hover effects
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[12],
        '& .card-avatar': {
          transform: 'scale(1.1)'
        }
      }
    }

    // Card selecionado - borda primary + elevation
    if (isSelected) {
      return {
        ...baseStyles,
        borderColor: theme.palette.primary.main,
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[12],
        '&:hover': {
          ...baseStyles['&:hover'],
          borderColor: theme.palette.primary.dark
        }
      }
    }

    // Aplicar estilos baseados no status
    const style: any = {
      ...baseStyles,
      backgroundColor: visualConfig.backgroundColor,
      borderColor: visualConfig.borderColor,
      '&:hover': {
        ...baseStyles['&:hover'],
        backgroundColor: visualConfig.backgroundColor,
        borderColor: visualConfig.borderColor
      }
    }

    if (visualConfig.animation) {
      style.animation = visualConfig.animation
      style['&:hover'].animation = 'none' // Remove animação no hover
    }

    return style
  }, [theme, isSelected, visualConfig])

  /**
   * Formatar timestamp de forma amigável
   */
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins}min`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`

    return timestamp.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  /**
   * Obter iniciais do nome para o avatar
   */
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  /**
   * Cor do avatar baseada no status
   */
  const getAvatarColor = () => {
    switch (chat.status) {
      case 'operator_call':
        return 'error'
      case 'operator_control':
        return 'info'
      case 'active':
        return 'success'
      default:
        return 'primary'
    }
  }

  return (
    <Card sx={cardStyles} onClick={() => onClick(chat)} className={className} elevation={isSelected ? 8 : 2}>
      <CardContent sx={{ p: 2 }}>
        {/* Header do Card */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          {/* Avatar com badge de mensagens não lidas */}
          <Badge
            badgeContent={chat.unreadCount || 0}
            color='error'
            invisible={!chat.unreadCount}
            sx={{
              '& .MuiAvatar-root': {
                transition: 'transform 0.3s ease'
              }
            }}
          >
            <Avatar
              className='card-avatar'
              src={chat.customerAvatar}
              sx={{
                bgcolor: `${getAvatarColor()}.main`,
                width: 48,
                height: 48,
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              {chat.customerAvatar ? null : getInitials(chat.customerName)}
            </Avatar>
          </Badge>

          {/* Info do cliente e status */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
              <Typography
                variant='h6'
                noWrap
                sx={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                {chat.customerName}
              </Typography>

              <Chip
                label={visualConfig.statusText}
                color={visualConfig.chipColor}
                size='small'
                sx={{
                  fontSize: '0.75rem',
                  height: 24,
                  fontWeight: 500
                }}
              />
            </Box>

            {/* ID do chat e departamento */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Typography variant='caption' color='text.secondary'>
                #{chat.id}
              </Typography>
              {chat.department && (
                <>
                  <Typography variant='caption' color='text.secondary'>
                    •
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {chat.department}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Última mensagem */}
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4
          }}
        >
          {chat.lastMessage}
        </Typography>

        {/* Footer com timestamp e operador */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='caption' color='text.secondary'>
            {formatTimestamp(chat.timestamp)}
          </Typography>

          {chat.operatorName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'success.main'
                }}
              />
              <Typography variant='caption' color='primary.main' fontWeight={500}>
                {chat.operatorName}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Indicador de prioridade */}
        {chat.priority === 'high' && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: 'error.main',
              boxShadow: '0 0 0 2px white'
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default MonitoringCard
