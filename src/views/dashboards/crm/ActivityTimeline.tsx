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

import { type Activity } from '@/api/endpoints/activity/activity'

// Styled Timeline component
const Timeline = styled(MuiTimeline)<TimelineProps>({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': { display: 'none' }
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

const getColorDot = (event: string) => {
  switch (event) {
    case 'created':
      return 'success'
    case 'updated':
      return 'info'
    case 'deleted':
      return 'error'
    default:
      return 'grey'
  }
}

const getNameAction = (action: string) => {
  switch (action) {
    case 'created':
      return 'criou'
    case 'updated':
      return 'atualizou'
    case 'deleted':
      return 'deletou'
    default:
      return 'grey'
  }
}

const getNameModel = (subject_type: string) => {
  const nameArray = subject_type.split('\\')
  const name = nameArray[nameArray.length - 1]

  switch (name) {
    case 'Api':
      return 'api'
    case 'Assistant':
      return 'assistente'
    case 'AssistantConfigs':
      return 'configurações do assistente'
    case 'AssistantFlows':
      return 'fluxos do assistente'
    case 'AssistantPhones':
      return 'telefones do assistente'
    case 'Configs':
      return 'configurações'
    case 'CreditCards':
      return 'cartões de crédito'
    case 'Flow':
      return 'fluxo'
    case 'Parameter':
      return 'parâmetro'
    case 'ParameterReturn':
      return 'retorno de parâmetro'
    case 'Permissions':
      return 'permissões'
    case 'PersonalAccessTokens':
      return 'tokens de acesso pessoal'
    case 'Plan':
      return 'plano'
    case 'Project':
      return 'projeto'
    case 'ProjectOperator':
      return 'operador de projeto'
    case 'Step':
      return 'etapa'
    case 'Task':
      return 'tarefa'
    case 'TaskAssistant':
      return 'assistente de tarefa'
    case 'Protocol':
      return 'protocolo'
    default:
      return name.toLowerCase()
  }
}

const getSentenceActivity = (activity: Activity) => {
  return `O usuário ${activity.causer_name ?? '-'} ${getNameAction(activity.event) ?? '-'} um ${getNameModel(activity.subject_type)}`
}

const renderAttributes = (properties: any) => {
  if (!properties) return null
  const attrs = properties.attributes ?? {}
  const oldAttrs = properties.old ?? {}

  return (
    <>
      {/* Imagem */}
      {attrs.img_url && <Avatar src={attrs.img_url} className='bs-8 is-8 mb-2' />}
      {/* Atributos atuais */}
      {Object.entries(attrs).map(([key, value]) => {
        if (!value || key === 'img_url') return null
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

        return (
          <Typography key={key} className='flex flex-row text-wrap items-center gap-2'>
            <Typography variant='body1'>{label}:</Typography>
            {String(value)}
          </Typography>
        )
      })}
      {/* Atributos antigos */}
      {Object.entries(oldAttrs).map(([key, value]) => {
        if (!value) return null
        const label = `Antigo ${key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`

        return (
          <Typography key={`old-${key}`} className='flex flex-row text-wrap items-center gap-2'>
            <Typography variant='body1'>{label}:</Typography>
            {String(value)}
          </Typography>
        )
      })}
      {/* Outras propriedades diretas */}
      {['status', 'protocol'].map(
        prop =>
          properties[prop] && (
            <Typography key={prop} className='flex flex-row text-wrap items-center gap-2'>
              <Typography variant='body1'>{prop.charAt(0).toUpperCase() + prop.slice(1)}:</Typography>
              {properties[prop]}
            </Typography>
          )
      )}
    </>
  )
}

const ActivityTimeline = ({
  dataFiltered_3,
  isLoading
}: {
  dataFiltered_3: Activity[] | undefined
  isLoading: boolean
}) => {
  const filteredNoUser = dataFiltered_3?.filter(activity => activity.causer_id !== null)

  return (
    <Card className='max-h-[350px] overflow-y-auto'>
      {isLoading ? (
        <Box className='w-full h-full justify-center items-center flex'>
          <CircularProgress />
        </Box>
      ) : dataFiltered_3 && dataFiltered_3.length === 0 ? (
        <Box className='w-full h-full justify-center items-center flex p-4'>
          <Typography>Sem atividades</Typography>
        </Box>
      ) : (
        <>
          <CardHeader title='Linha do tempo de atividades' />
          <CardContent>
            {filteredNoUser && filteredNoUser.length === 0 ? (
              <Typography>Sem dados</Typography>
            ) : (
              <Timeline>
                {filteredNoUser?.map((activity: Activity) => (
                  <TimelineItem key={activity.id}>
                    <TimelineSeparator>
                      <TimelineDot color={getColorDot(activity.event)} />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                        <Typography className='font-medium' color='text.primary'>
                          {getSentenceActivity(activity)}
                        </Typography>
                        <Typography className='flex flex-row text-wrap items-center gap-2'>
                          <Typography variant='body1'>Atividade realizada em:</Typography>
                          {formatDateTime(activity.created_at)}
                        </Typography>
                      </div>
                      <div className='flex flex-col flex-wrap gap-0.5'>{renderAttributes(activity.properties)}</div>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            )}
          </CardContent>
        </>
      )}
    </Card>
  )
}

export default ActivityTimeline
