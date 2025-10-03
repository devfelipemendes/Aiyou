//MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'

// Type Imports

// Components Imports
import { CircularProgress } from '@mui/material'

import CustomAvatar from '@core/components/mui/Avatar'

import type { GetStatisticsResponse } from '@/api/endpoints/statistics/statistics'

// Vars

const EstatisticsDash = ({ data, isLoading }: { data: GetStatisticsResponse | undefined; isLoading: boolean }) => {
  return (
    <Card>
      <CardHeader
        title={`Estatísticas`}

        // action={<OptionMenu iconClassName='text-textPrimary' options={['Refresh', 'Share', 'Update']} />}
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <div className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' color={'info'} className='shadow-xs'>
                <i className='ri-robot-3-line' />
              </CustomAvatar>
              <div>
                <Typography>Total Assistentes</Typography>
                <Typography variant='h5'>
                  {isLoading ? <CircularProgress size={15} /> : (data?.data.overall_total.total_assistants ?? '0')}
                </Typography>
              </div>
            </div>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <div className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' color={'success'} className='shadow-xs'>
                <i className='ri-folder-6-line' />
              </CustomAvatar>
              <div>
                <Typography>Total Projetos</Typography>
                <Typography variant='h5'>
                  {isLoading ? <CircularProgress size={15} /> : (data?.data.overall_total.total_projects ?? '0')}
                </Typography>
              </div>
            </div>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <div className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' color={'primary'} className='shadow-xs'>
                <i className='ri-file-list-3-line'></i>
              </CustomAvatar>
              <div>
                <Typography>Total Protocolos</Typography>
                <Typography variant='h5'>
                  {isLoading ? (
                    <CircularProgress size={15} />
                  ) : (
                    (data?.data.overall_total.total_opened_protocols ?? '0')
                  )}
                </Typography>
              </div>
            </div>
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <div className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' color={'warning'} className='shadow-xs'>
                <i className='ri-headphone-line'></i>
              </CustomAvatar>
              <div>
                <Typography>Operadores Chamados</Typography>
                <Typography variant='h5'>
                  {isLoading ? (
                    <CircularProgress size={15} />
                  ) : (
                    (data?.data.overall_total.total_called_operators ?? '0')
                  )}
                </Typography>
              </div>
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default EstatisticsDash
