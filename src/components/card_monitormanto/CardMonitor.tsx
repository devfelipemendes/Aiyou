'use client'

import React, { useCallback } from 'react'

import { Avatar, Box, Button, Card, CardContent, CardHeader, Chip, Typography } from '@mui/material'

import { useSettings } from '@core/hooks/useSettings'

// 🔥 NOVOS IMPORTS
import styles from './CardMonitor.module.css' // CSS que criamos

import type { NotificationType } from '@/types/monitoring'
import { NOTIFICATION_CONFIG } from '@/types/monitoring'

// 🔥 MANTIDA: Sua interface Message original
interface Message {
  id: string
  sender: 'operador' | 'client' | 'IA'
  content: string
  timestamp: Date
}

// 🔥 ATUALIZADA: Props expandidas (suas + novas)
interface CardMonitorProps {
  clientId: string
  buttonName: string
  channel?: 'web' | 'whatsapp' | 'telegram' | 'email' | string
  messages: Message[]
  operatorName?: string

  // Props novas (opcionais para não quebrar código existente)
  notificationType?: NotificationType
  isSelected?: boolean
  isHovered?: boolean
  onClick?: (clientId: string) => void
  onHover?: (clientId: string, isHovered: boolean) => void
}

export default function CardMonitor({
  clientId,
  channel,
  messages,
  operatorName,
  buttonName,

  // Valores padrão para não quebrar código existente
  notificationType = 'normal',
  isSelected = false,

  // isHovered = false,
  onClick,
  onHover
}: CardMonitorProps) {
  // 🔥 MANTIDAS: Suas funções originais
  const getSenderLabel = (sender: Message['sender']) => {
    switch (sender) {
      case 'IA':
        return 'IA'
      case 'operador':
        return 'Operador'
      case 'client':
        return 'Cliente'
      default:
        return sender
    }
  }

  const lastFourMessages = messages.slice(-4)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return '📱'
      case 'telegram':
        return '✈️'
      case 'email':
        return '📧'
      default:
        return '🌐'
    }
  }

  const getSenderColor = (sender: Message['sender']) => {
    switch (sender) {
      case 'IA':
        return 'var(--mui-palette-primary-main)' // azul
      case 'operador':
        return 'var(--mui-palette-warning-main)' // verde
      case 'client':
        return '#ed6c02' // laranja
      default:
        return 'var(--mui-palette-secondary-main)'
    }
  }

  const { settings } = useSettings()

  // 🔥 NOVAS: Funções para interatividade
  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick(clientId)
    }
  }, [clientId, onClick])

  const handleMouseEnter = useCallback(() => {
    if (onHover) {
      onHover(clientId, true)
    }
  }, [clientId, onHover])

  const handleMouseLeave = useCallback(() => {
    if (onHover) {
      onHover(clientId, false)
    }
  }, [clientId, onHover])

  // 🔥 NOVA: Função para gerar classes CSS baseadas no estado
  const getCardClasses = useCallback(() => {
    const classes = [styles.cardMonitor]

    // Adicionar classe de notificação
    switch (notificationType) {
      case 'operator_call':
        classes.push(styles.operatorCall)
        break
      case 'unresolved':
        classes.push(styles.unresolved)
        break
      case 'operator_control':
        classes.push(styles.operatorControl)
        break
      case 'no_response':
        classes.push(styles.noResponse)
        break
      default:
        classes.push(styles.normal)
    }

    // Adicionar classe de seleção
    if (isSelected) {
      classes.push(styles.selected)
    }

    return classes.join(' ')
  }, [notificationType, isSelected])

  // 🔥 NOVA: Função para obter configuração da notificação
  const getNotificationConfig = useCallback(() => {
    return NOTIFICATION_CONFIG[notificationType] || NOTIFICATION_CONFIG.normal
  }, [notificationType])

  const config = getNotificationConfig()

  return (
    <Card
      className={getCardClasses()}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        height: 320, // Aumentei um pouco para acomodar indicadores
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',

        // Aplicar estilos de notificação via sx também
        ...(notificationType !== 'normal' && {
          backgroundColor: config.backgroundColor
        })
      }}
    >
      {/* 🔥 NOVO: Indicador visual no canto superior direito */}
      {notificationType !== 'normal' && (
        <div
          className={`${styles.notificationIndicator} ${styles[notificationType.replace('_', '')]}`}
          title={config.label}
        />
      )}

      {/* 🔥 NOVO: Badge de status (se necessário) */}
      {notificationType !== 'normal' && (
        <Chip
          label={config.label}
          size='small'
          className={`${styles.statusChip} ${styles[notificationType.replace('_', '')]}`}
        />
      )}

      {/* 🔥 MANTIDO: Seu CardHeader original com pequenos ajustes */}
      <CardHeader
        title={clientId}
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{getChannelIcon(channel ?? '')}</span>
            <Typography variant='body2' color='text.secondary'>
              {channel}
            </Typography>
            {operatorName && (
              <Chip label={operatorName} size='small' variant='outlined' sx={{ fontSize: '0.7rem', height: '20px' }} />
            )}
          </Box>
        }
        action={
          <Button
            variant={isSelected ? 'contained' : 'outlined'}
            size='small'
            sx={{
              // Adicionar cor especial se houver notificação crítica
              ...(notificationType === 'operator_call' && {
                backgroundColor: '#f44336',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#d32f2f'
                }
              })
            }}
          >
            {buttonName}
          </Button>
        }
        sx={{
          // Adicionar padding top se houver badge
          ...(notificationType !== 'normal' && {
            paddingTop: '24px'
          })
        }}
      />

      {/* 🔥 MANTIDO: Seu CardContent original */}
      <CardContent
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          pb: 2
        }}
      >
        {lastFourMessages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              color: 'text.secondary'
            }}
          >
            <Typography variant='body2'>Nenhuma mensagem</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              overflow: 'auto'
            }}
          >
            {lastFourMessages.map(message => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  flexDirection: message.sender === 'client' ? 'row' : 'row-reverse',
                  alignItems: 'flex-start',
                  gap: 1
                }}
              >
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: '0.75rem',
                    bgcolor: getSenderColor(message.sender)
                  }}
                >
                  {message.sender === 'IA' ? 'IA' : message.sender === 'operador' ? 'OP' : 'CL'}
                </Avatar>

                <Box
                  sx={{
                    flex: 1,
                    maxWidth: '80%'
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor:
                        message.sender === 'client'
                          ? settings.mode === 'dark'
                            ? '#838383'
                            : '#e4e4e4'
                          : getSenderColor(message.sender),
                      borderRadius: 2,
                      padding: '8px 12px',
                      wordWrap: 'break-word',
                      fontSize: '0.875rem',
                      lineHeight: 1.3
                    }}
                  >
                    <Typography
                      variant='body2'
                      component='div'
                      color={
                        message.sender === 'operador' || message.sender === 'IA'
                          ? settings.mode === 'dark'
                            ? 'black'
                            : '#ffffff'
                          : undefined
                      }
                    >
                      {message.content}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      mt: 0.5,
                      alignItems: 'center',
                      justifyContent: message.sender === 'client' ? 'flex-start' : 'flex-end'
                    }}
                  >
                    <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.7rem' }}>
                      {getSenderLabel(message.sender)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.7rem' }}>
                      {formatTime(message.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>

      {/* 🔥 NOVO: Rodapé com informações de notificação (opcional) */}
      {notificationType !== 'normal' && (
        <Box
          sx={{
            padding: '4px 16px',
            backgroundColor: config.backgroundColor,
            borderTop: `1px solid ${config.borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography
            variant='caption'
            sx={{
              color: config.color,
              fontWeight: 500,
              fontSize: '0.7rem'
            }}
          >
            {config.label}
          </Typography>
        </Box>
      )}
    </Card>
  )
}
