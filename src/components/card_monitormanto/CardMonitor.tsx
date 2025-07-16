import React, { useEffect, useRef } from 'react'

import { Card, CardContent, CardHeader, Chip, Typography, Box, CircularProgress } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import ChatLog from '../chatLog/chatLog'
import CustomIconButton from '@core/components/mui/IconButton'

import type { ChatMonitorProps } from '@/types/newChatypes'

const getStatusProtocol = (status: ChatMonitorProps['statusChat'], callOperator: boolean) => {
  if (callOperator) {
    return <Chip label='Chamada do Operador' color='error' variant='tonal' className='mr-2' />
  }

  const config = {
    active: { label: 'Ativo', color: 'success' },
    inactive: { label: 'Inativo', color: 'warning', sx: { bgcolor: '#353535' } },
    resolved: { label: 'Resolvido', color: 'info' },
    unresolved: { label: 'Não resolvido', color: 'warning' }
  }[status] ?? { label: 'Ativo', color: 'success' }

  return <Chip label={config.label} color={config.color as any} variant='tonal' sx={config.sx} className='mr-2' />
}

const getCardShadowByStatus = (status: ChatMonitorProps['statusChat'], isDragging: boolean) => {
  const defaultShadow = { boxShadow: isDragging ? 8 : 4 }

  const shadows: Record<string, { boxShadow: string }> = {
    unresolved: { boxShadow: '0px 0px 15px var(--mui-palette-warning-main)' },
    resolved: { boxShadow: '0px 0px 15px var(--mui-palette-success-main)' },
    inactive: { boxShadow: '0px 0px 15px #353535' }
  }

  return shadows[status] ?? defaultShadow
}

export default function CardMonitor({
  ChatData,
  clientProtocolName,
  statusChat,
  progressTime,
  attendant,
  dragListeners,
  dragAttributes,
  isDragging = false,
  callOperator = false
}: ChatMonitorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const theme = useTheme()
  const modeTheme = theme.palette.mode

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [ChatData])

  useEffect(() => {
    console.log(modeTheme)
  }, [])

  const cardBoxShadow = callOperator
    ? '0px 0px 15px var(--mui-palette-error-main)'
    : getCardShadowByStatus(statusChat, isDragging).boxShadow

  return (
    <Card
      sx={{
        cursor: isDragging ? 'grabbing' : 'default',
        transform: isDragging ? 'rotate(5deg)' : 'none',
        transition: 'all 0.2s ease',
        boxShadow: cardBoxShadow
      }}
    >
      <CardHeader
        title={clientProtocolName}
        action={
          <Box>
            {getStatusProtocol(statusChat, callOperator)}
            <CustomIconButton
              color='primary'
              variant='outlined'
              {...dragListeners}
              {...dragAttributes}
              sx={{
                cursor: isDragging ? 'grabbing' : 'grab',
                '&:hover': {
                  transform: 'scale(1.05)',
                  transition: 'transform 0.2s ease'
                }
              }}
              title='Clique e arraste para reordenar'
            >
              <i className='ri-drag-move-2-fill' />
            </CustomIconButton>
          </Box>
        }
      />
      <CardContent>
        <Card>
          <CardContent
            ref={scrollContainerRef}
            sx={{
              position: 'relative',
              minHeight: '200px',
              maxHeight: '300px',
              overflowY: 'auto',
              backgroundImage: `${
                modeTheme === 'light'
                  ? 'linear-gradient(rgba(241, 241, 241, 0.95), rgba(255,255,255,0.95))'
                  : 'linear-gradient( rgba(28, 24, 48, 0.95), rgba(40,36,61,0.95))'
              }, url("/images/identidadeVisual/bgChat.png")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              overflowX: 'hidden',
              width: '100%',
              scrollBehavior: 'smooth',
              cursor: 'default',
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.divider,
                borderRadius: '3px',
                '&:hover': {
                  background: theme.palette.text.secondary
                }
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box className='flex flex-row'>
                {ChatData ? (
                  <ChatLog
                    chatStore={ChatData}
                    isBelowLgScreen={false}
                    isBelowMdScreen={false}
                    isBelowSmScreen={false}
                  />
                ) : (
                  <Box className='flex flex-col items-center justify-center w-full h-full'>
                    <CircularProgress color='primary' />
                    <Typography>Carregando Mensagens</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box className='flex flex-row justify-between mt-5'>
          <Typography variant='subtitle2' color='textDisabled'>
            Em andamento há: {progressTime}
          </Typography>
          <Typography variant='subtitle2' color='textDisabled'>
            Sendo atendido por: {attendant}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
