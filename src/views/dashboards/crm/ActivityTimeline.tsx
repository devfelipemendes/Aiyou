'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import Typography from '@mui/material/Typography'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import type { TimelineProps } from '@mui/lab/Timeline'

// Styled Timeline component
const Timeline = styled(MuiTimeline)<TimelineProps>({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    }
  }
})

const ActivityTimeline = () => {
  return (
    <Card>
      <CardHeader title='Linha do tempo de atividades' />
      <CardContent>
        <Timeline>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color='primary' />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                <Typography className='font-medium' color='text.primary'>
                  Ajuste no Assistente Testinildo
                </Typography>
                <Typography variant='caption' color='text.disabled'>
                  12 min atrás
                </Typography>
              </div>
              <Typography className='mbe-2.5'>O operador testerson ajustou:</Typography>
              <div className='flex items-center gap-2.5 is-fit plb-[5px] pli-2.5 rounded bg-actionHover'>
                <Typography className='font-medium'>ajuste no prompt</Typography>
              </div>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color='success' />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                <Typography className='font-medium' color='text.primary'>
                  Operador Testerson realizou 50 atendimentos bem sucedidos
                </Typography>
                <Typography variant='caption' color='text.disabled'>
                  45 min atrás
                </Typography>
              </div>
              <Typography className='mbe-2.5'>Testeson cumpriu 50 atividades @10:15am</Typography>
              <div className='flex items-center gap-2.5'>
                <Avatar src='/images/avatars/1.png' className='bs-8 is-8' />
                <div className='flex flex-col flex-wrap gap-0.5'>
                  <Typography variant='body2' className='font-medium'>
                    Testerson Alves (Operador)
                  </Typography>
                  <Typography variant='body2'>Operador da TESTE LTDA</Typography>
                </div>
              </div>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color='info' />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                <Typography className='font-medium' color='text.primary'>
                  Cadastro de nova Campanha de voz
                </Typography>
                <Typography variant='caption' color='text.disabled'>
                  2 Dias atrás
                </Typography>
              </div>
              <Typography>Realizada o cadastro de uma campanha de voz para o dia 00/00/0000</Typography>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </CardContent>
    </Card>
  )
}

export default ActivityTimeline
