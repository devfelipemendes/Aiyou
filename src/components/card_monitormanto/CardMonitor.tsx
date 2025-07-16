import React, { useEffect, useRef } from 'react'

import Image from 'next/image'

import { Card, CardContent, CardHeader, Chip, Typography, Box } from '@mui/material'

import { useTheme } from '@mui/material/styles'

import { motion } from 'framer-motion'

import ChatLog from '../chatLog/chatLog'

import CustomIconButton from '@core/components/mui/IconButton'
import type { ChatDataType } from '@/types/chatTypes'
import LoadingScreen from '../LoadingScreen'

const getStatusProtocol = (status: string) => {
  switch (status) {
    case 'ativo':
      return <Chip label='Ativo' color='success' variant='tonal' className='mr-2' />
    case 'inativo':
      return <Chip label='Inativo' color='warning' variant='tonal' className='mr-2' />
    case 'campanha':
      return <Chip label='Campanha' color='info' variant='tonal' className='mr-2' />
    case 'chamada do operador':
      return <Chip label='Chamada do operador' color='error' variant='tonal' className='mr-2' />
    default:
      return <Chip label='Ativo' color='success' variant='tonal' className='mr-2' />
  }
}

type CardMonitorProps = {
  onClickMove: () => void
  ChatData: ChatDataType
}

export default function CardMonitor({ onClickMove, ChatData }: CardMonitorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const theme = useTheme()

  const modeTheme = theme.palette.mode

  // Faz scroll para o fim sempre que o chatStore mudar
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ChatData])

  useEffect(() => {
    console.log(modeTheme)
  }, [])

  return (
    <Card>
      <CardHeader
        title='ClienteProtocol'
        action={
          <Box>
            {getStatusProtocol('inativo')}

            <CustomIconButton color='primary' variant='outlined' onClick={onClickMove}>
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
              backgroundImage: `${modeTheme === 'light' ? 'linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95))' : 'linear-gradient( rgba(28, 24, 48, 0.95), rgba(40,36,61,0.95))'}, url("/images/identidadeVisual/bgChat.png")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
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
                  <Box className='flex items-center justify-center w-full h-full'></Box>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box className='flex flex-row justify-between mt-5'>
          <Typography variant='subtitle2' color='textDisabled'>
            Em andamento há: xh
          </Typography>
          <Typography variant='subtitle2' color='textDisabled'>
            Sendo atendido por: atendente
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
