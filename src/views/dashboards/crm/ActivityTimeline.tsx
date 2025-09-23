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

import { Box, CircularProgress } from '@mui/material'

import type { Activity } from '@/api/endpoints/activity/activity'

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

function formatDateTime(isoString: string) {
  const date = new Date(isoString)

  const data = date.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  const hora = date.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  return `${data} às ${hora}`
}

const getColorDot = (
  event: string
): 'inherit' | 'primary' | 'grey' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (event) {
    case 'created':
      return 'success' // verde
    case 'updated':
      return 'info' // azul
    case 'deleted':
      return 'error' // vermelho
    default:
      return 'grey' // cinza para outros
  }
}

const getNameAction = (action: string): 'criou' | 'atualizou' | 'deletou' | 'grey' => {
  switch (action) {
    case 'created':
      return 'criou' // verde
    case 'updated':
      return 'atualizou' // azul
    case 'deleted':
      return 'deletou' // vermelho
    default:
      return 'grey' // cinza para outros
  }
}

const getNameModel = (subject_type: string) => {
  const nameArray = subject_type.split('\\')
  const name = nameArray[nameArray.length - 1]

  switch (name) {
    case 'Project':
      return 'projeto' // verde
    case 'Assistant':
      return 'assistente' // azul
  }
}

const getSentenceActivity = (activity: Activity) => {
  const sentence = `O usuário ${activity.causer_name ?? '-'} ${getNameAction(activity.event) ?? '-'} um ${getNameModel(activity.subject_type)}`

  return sentence
}

const ActivityTimeline = ({
  dataFiltered_3,
  isLoading
}: {
  dataFiltered_3: Activity[] | undefined
  isLoading: boolean
}) => {
  return (
    <Card className='max-h-[350px] overflow-y-auto'>
      {isLoading ? (
        <Box className='w-full h-full justify-center items-center flex'>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <CardHeader title='Linha do tempo de atividades' />
          <CardContent>
            {dataFiltered_3 && dataFiltered_3.length === 0 ? (
              <Typography>Sem dados</Typography>
            ) : (
              <>
                <Timeline>
                  {dataFiltered_3?.map((activty: Activity) => {
                    return (
                      <TimelineItem key={activty.id}>
                        <TimelineSeparator>
                          <TimelineDot color={getColorDot(activty.event)} />
                          <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                          <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                            <Typography className='font-medium' color='text.primary'>
                              {getSentenceActivity(activty)}
                            </Typography>

                            <Typography className=' flex flex-row text-wrap items-center gap-2'>
                              <Typography variant='body1'>Atividade realizada em:</Typography>
                              {formatDateTime(activty.created_at)}
                            </Typography>
                          </div>
                          <Typography className=' flex flex-row text-wrap items-center gap-2'>
                            <Typography variant='body1'>Nome:</Typography>
                            {activty.properties.attributes.name ?? '-'}
                          </Typography>
                          <div className='flex items-center gap-2.5'>
                            {activty.properties.attributes.img_url && (
                              <Avatar
                                src={activty.properties.attributes.img_url ?? '/images/avatars/1.png'}
                                className='bs-8 is-8'
                              />
                            )}

                            {activty.properties.attributes.description && (
                              <div className='flex flex-col flex-wrap gap-0.5'>
                                <Typography className=' flex flex-row text-wrap items-center gap-2'>
                                  <Typography variant='body1'>Descrição:</Typography>
                                  {activty.properties.attributes.description ?? ''}
                                </Typography>
                              </div>
                            )}
                          </div>
                        </TimelineContent>
                      </TimelineItem>
                    )
                  })}
                </Timeline>
              </>
            )}
          </CardContent>
        </>
      )}
    </Card>
  )
}

export default ActivityTimeline
