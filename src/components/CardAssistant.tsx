import React from 'react'

import { useTheme, Avatar, Typography, Chip, IconButton, Tooltip } from '@mui/material'

import type { ProcessedAssistant } from '@/api/endpoints/assistant/assistant'

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

interface AssistantCardProps {
  assistant: ProcessedAssistant
  onEdit: (assistant: ProcessedAssistant) => void
  onRemove: (id: string) => void
  onChat: (assistant: ProcessedAssistant) => void
  isUpdating?: boolean
  height?: number
  backgroundImage?: string
  backgroundColor?: string
}

export default function AssistantCard({
  assistant,
  onEdit,
  onRemove,
  onChat,
  isUpdating = false,
  height = 400,
  backgroundImage,
  backgroundColor
}: AssistantCardProps) {
  const theme = useTheme()

  const topSectionHeight = height * 0.4
  const bottomSectionHeight = height * 0.6
  const avatarOffsetFromCenter = 0
  const centerPosition = topSectionHeight - avatarOffsetFromCenter

  const avatarSize = Math.max(50, height * 0.2)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />

      <div
        className='relative w-full rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl'
        style={{ height: `${height}px` }}
        onClick={() => onChat(assistant)}
      >
        <div
          className='absolute top-0 left-0 w-full'
          style={{
            height: `${topSectionHeight}px`,
            backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <div
          className='absolute bottom-0 left-0 w-full p-4 flex flex-col'
          style={{
            height: `${bottomSectionHeight}px`,
            backgroundColor: theme.palette.background.paper
          }}
        >
          <div
            className='flex-1 overflow-y-auto pr-2 custom-scrollbar'
            style={{
              marginLeft: `16px`,
              marginTop: `${avatarSize / 1.5}px`,
              scrollbarWidth: 'thin',
              scrollbarColor: `${theme.palette.text.secondary} transparent`
            }}
          >
            <div className='mb-3'>
              <Typography
                variant='h5'
                component='h3'
                className='font-semibold mb-2 line-clamp-1'
                style={{ color: theme.palette.text.primary }}
              >
                Assistente: {assistant.name}
              </Typography>
            </div>

            <Typography
              variant='caption'
              className='mb-2 block'
              style={{
                color: theme.palette.primary.main,
                fontWeight: 500
              }}
            >
              Vinculado ao Projeto: {assistant.project_name}
            </Typography>

            {assistant.phones?.length > 0 && (
              <div className='mb-2'>
                <Typography variant='caption' style={{ color: theme.palette.text.secondary }} className='block mb-1'>
                  Telefones:
                </Typography>
                <div className='flex flex-wrap gap-1'>
                  {assistant.phones.slice(0, 2).map((phone: any, index: number) => (
                    <Chip
                      key={index}
                      size='small'
                      variant='outlined'
                      label={phone.phone || phone.toString()}
                      style={{ fontSize: '0.7rem', height: '20px' }}
                    />
                  ))}
                  {assistant.phones.length > 2 && (
                    <Chip
                      size='small'
                      variant='outlined'
                      label={`+${assistant.phones.length - 2}`}
                      style={{ fontSize: '0.7rem', height: '20px' }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div
            className='flex justify-end gap-2 mt-4 flex-shrink-0 border-t pt-3'
            style={{ borderColor: theme.palette.divider }}
          >
            <Tooltip title='Iniciar chat'>
              <IconButton
                onClick={e => {
                  e.stopPropagation()
                  onChat(assistant)
                }}
                color='primary'
                size='small'
              >
                <i className='ri-chat-3-line' />
              </IconButton>
            </Tooltip>

            <Tooltip title='Editar assistente'>
              <IconButton
                onClick={e => {
                  e.stopPropagation()
                  onEdit(assistant)
                }}
                disabled={isUpdating}
                color='default'
                size='small'
              >
                <i className='ri-edit-line' />
              </IconButton>
            </Tooltip>

            <Tooltip title='Remover assistente'>
              <IconButton
                onClick={e => {
                  e.stopPropagation()
                  onRemove(assistant.id)
                }}
                color='error'
                size='small'
              >
                <i className='ri-delete-bin-line' />
              </IconButton>
            </Tooltip>

            {assistant.img_url && (
              <Tooltip title='Ver imagem'>
                <IconButton
                  onClick={e => {
                    e.stopPropagation()
                    window.open(assistant.img_url!, '_blank')
                  }}
                  color='default'
                  size='small'
                >
                  <i className='ri-external-link-line' />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>

        <div
          className='absolute left-4 z-10 transform -translate-y-1/2'
          style={{
            top: `${centerPosition}px`,
            width: `${avatarSize}px`,
            height: `${avatarSize}px`
          }}
        >
          <Avatar
            src={assistant.img_url || undefined}
            className='w-full h-full shadow-lg border-4 border-white ml-5'
            style={{
              fontSize: `${avatarSize * 0.4}px`,
              backgroundColor: theme.palette.secondary.main
            }}
          >
            {assistant.name.charAt(0).toUpperCase()}
          </Avatar>
        </div>
      </div>
    </>
  )
}
