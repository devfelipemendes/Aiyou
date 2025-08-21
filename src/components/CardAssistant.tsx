import React, { memo, useCallback, useMemo } from 'react'

import { Avatar, Chip, Typography, Alert, IconButton, Tooltip, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// 🔧 INTERFACES
interface AssistantCardProps {
  assistant: {
    id: string
    name: string
    img_url?: string | null
    description?: string | null
    project?: {
      id: string
      name: string
    }
    status?: 'active' | 'inactive' | 'training' | 'error'
    lastActivity?: string
    messagesCount?: number
    isOnline?: boolean
  }
  isDragging?: boolean
  dragListeners?: any
  dragAttributes?: any
  onAssistantSelect?: (assistantId: string) => void
  onAssistantEdit?: (assistantId: string) => void
  onViewAssistant?: (assistantId: string) => void
  isSelected?: boolean
  height?: number
  backgroundImage?: string
  backgroundColor?: string
}

interface StatusConfig {
  label: string
  color: 'primary' | 'warning' | 'success' | 'error' | 'info'
  dotColor: string
}

// CSS para scrollbar customizado
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
  
  [data-mui-color-scheme="dark"] .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  [data-mui-color-scheme="dark"] .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`

// 🔧 FUNÇÕES HELPER
const getStatusConfig = (status: string): StatusConfig => {
  const statusConfigs: Record<string, StatusConfig> = {
    active: {
      label: 'Ativo',
      color: 'success',
      dotColor: '#4caf50'
    },
    inactive: {
      label: 'Inativo',
      color: 'warning',
      dotColor: '#ff9800'
    },
    training: {
      label: 'Treinando',
      color: 'info',
      dotColor: '#2196f3'
    },
    error: {
      label: 'Erro',
      color: 'error',
      dotColor: '#f44336'
    }
  }

  return statusConfigs[status] || statusConfigs.active
}

const formatLastActivity = (lastActivity?: string) => {
  if (!lastActivity) return 'Nunca'

  const diff = Date.now() - new Date(lastActivity).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d atrás`
  if (hours > 0) return `${hours}h atrás`
  if (minutes > 0) return `${minutes}m atrás`

  return 'Agora mesmo'
}

// 🎯 COMPONENTE PRINCIPAL
const AssistantCard = memo<AssistantCardProps>(props => {
  const {
    assistant,
    dragListeners,
    dragAttributes,
    onAssistantSelect,
    onAssistantEdit,
    onViewAssistant,
    isDragging = false,
    isSelected = false,
    height = 400,
    backgroundImage,
    backgroundColor
  } = props

  const theme = useTheme()

  // 📊 DADOS COMPUTADOS
  const statusConfig = useMemo(() => getStatusConfig(assistant.status || 'active'), [assistant.status])

  const formattedActivity = useMemo(() => formatLastActivity(assistant.lastActivity), [assistant.lastActivity])

  // Calcular posições e tamanhos
  const topSectionHeight = height * 0.4 // 40%
  const bottomSectionHeight = height * 0.6 // 60%
  const avatarOffsetFromCenter = 10 // 10px abaixo do centro
  const centerPosition = topSectionHeight - avatarOffsetFromCenter

  // Avatar responsivo: min 80px, escala com altura
  const avatarSize = Math.max(120, height * 0.2)

  // Cor de fundo padrão primary
  const finalBackgroundColor = backgroundColor || theme.palette.primary.main

  // 🎛️ CALLBACKS
  const handleCardClick = useCallback(() => {
    if (onAssistantSelect) {
      onAssistantSelect(assistant.id)
    }
  }, [onAssistantSelect, assistant.id])

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()

      if (onAssistantEdit) {
        onAssistantEdit(assistant.id)
      }
    },
    [onAssistantEdit, assistant.id]
  )

  const handleViewClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()

      if (onViewAssistant) {
        onViewAssistant(assistant.id)
      }
    },
    [onViewAssistant, assistant.id]
  )

  const handleDragClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  // 🎨 RENDER
  return (
    <>
      {/* Injetar CSS customizado */}
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />

      <div
        onClick={handleCardClick}
        className={`relative w-full rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl ${
          isDragging ? 'rotate-2 scale-105' : ''
        } ${isSelected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}`}
        style={{
          height: `${height}px`,
          transform: isDragging ? 'rotate(2deg) scale(1.02)' : undefined
        }}
      >
        {/* Seção superior - 40% */}
        <div
          className='absolute top-0 left-0 w-full'
          style={{
            height: `${topSectionHeight}px`,
            backgroundColor: backgroundImage ? 'transparent' : finalBackgroundColor,
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Seção inferior - 60% */}
        <div
          className='absolute bottom-0 left-0 w-full p-4 flex flex-col'
          style={{
            height: `${bottomSectionHeight}px`,
            backgroundColor: theme.palette.background.paper
          }}
        >
          {/* Conteúdo principal - deixa espaço para avatar + scroll */}
          <div
            className='mt-12 flex-1 overflow-y-auto flex flex-col justify-center pr-2 custom-scrollbar'
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: `${theme.palette.text.secondary} transparent`
            }}
          >
            {/* Título e Status */}
            <div className='text-center mb-3'>
              <Typography
                variant='h6'
                component='h3'
                className='font-semibold mb-2 line-clamp-1'
                style={{ color: theme.palette.text.primary }}
              >
                {assistant.name}
              </Typography>

              <div className='flex justify-center gap-1 mb-2'>
                <Chip size='small' label={statusConfig.label} color={statusConfig.color} />

                {assistant.isOnline && <Chip size='small' label='Online' color='success' variant='outlined' />}
              </div>
            </div>

            {/* Projeto vinculado */}
            {assistant.project && (
              <Typography variant='body2' className='text-center mb-2' style={{ color: theme.palette.text.secondary }}>
                <strong>Projeto:</strong> {assistant.project.name}
              </Typography>
            )}

            {/* Descrição */}
            {assistant.description && (
              <Typography
                variant='body2'
                className='text-center mb-3'
                style={{
                  color: theme.palette.text.secondary,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {assistant.description}
              </Typography>
            )}

            {/* Métricas */}
            <div className='text-center mb-2'>
              {assistant.messagesCount !== undefined && (
                <Typography variant='caption' style={{ color: theme.palette.text.secondary }}>
                  {assistant.messagesCount} mensagem{assistant.messagesCount !== 1 ? 's' : ''}
                </Typography>
              )}

              <Typography variant='caption' className='block' style={{ color: theme.palette.text.secondary }}>
                Última atividade: {formattedActivity}
              </Typography>
            </div>

            {/* Alert de erro */}
            {assistant.status === 'error' && (
              <Alert severity='error' className='mt-2'>
                Erro no assistente
              </Alert>
            )}

            {/* Botão Visualizar */}
            <div className='flex justify-center mt-3'>
              <Button
                size='small'
                variant='contained'
                onClick={handleViewClick}
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  fontSize: '0.75rem',
                  backgroundColor: theme.palette.primary.main
                }}
              >
                Visualizar Assistente
              </Button>
            </div>
          </div>

          {/* Actions - fixo na parte inferior */}
          <div
            className='flex justify-center gap-2 mt-4 flex-shrink-0 border-t pt-3'
            style={{ borderColor: theme.palette.divider }}
          >
            <Tooltip title='Editar assistente'>
              <IconButton onClick={handleEditClick} color='primary' size='small'>
                <i className='ri-edit-line' />
              </IconButton>
            </Tooltip>

            <Tooltip title='Arrastar para reordenar'>
              <IconButton
                onClick={handleDragClick}
                {...dragListeners}
                {...dragAttributes}
                sx={{
                  cursor: isDragging ? 'grabbing' : 'grab',
                  '&:hover': {
                    transform: 'scale(1.1)'
                  }
                }}
                color='default'
                size='small'
              >
                <i className='ri-drag-move-2-line' />
              </IconButton>
            </Tooltip>

            <Tooltip title='Configurações'>
              <IconButton color='default' size='small'>
                <i className='ri-settings-3-line' />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Avatar posicionado no centro da divisão */}
        <div
          className='absolute left-1/2 z-10 transform -translate-x-1/2 -translate-y-1/2'
          style={{
            top: `${centerPosition}px`,
            width: `${avatarSize}px`,
            height: `${avatarSize}px`
          }}
        >
          <Avatar
            src={assistant.img_url || undefined}
            className='w-full h-full shadow-lg border-4 border-white'
            style={{
              fontSize: `${avatarSize * 0.4}px`,
              backgroundColor: statusConfig.dotColor,
              position: 'relative'
            }}
          >
            {assistant.name.charAt(0).toUpperCase()}

            {/* Indicador online */}
            {assistant.isOnline && (
              <div
                className='absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white'
                style={{
                  width: `${avatarSize * 0.15}px`,
                  height: `${avatarSize * 0.15}px`,
                  bottom: `${avatarSize * 0.05}px`,
                  right: `${avatarSize * 0.05}px`
                }}
              />
            )}
          </Avatar>
        </div>
      </div>
    </>
  )
})

AssistantCard.displayName = 'AssistantCard'

export default AssistantCard
