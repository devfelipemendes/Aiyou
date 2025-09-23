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

const EstatisticsDash = ({
  data,
  isLoading,
  month
}: {
  data: GetStatisticsResponse | undefined
  isLoading: boolean
  month: string
}) => {
  return (
    <Card>
      <CardHeader
        title={`Atendimentos de ${month}`}

        // action={<OptionMenu iconClassName='text-textPrimary' options={['Refresh', 'Share', 'Update']} />}
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <div className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' color={'primary'} className='shadow-xs'>
                <i className='ri-file-list-3-line'></i>
              </CustomAvatar>
              <div>
                <Typography>Total Protocolos</Typography>
                <Typography variant='h5'>
                  {isLoading ? <CircularProgress size={15} /> : (data?.data.overall_total. ?? '0')}
                </Typography>
              </div>
            </div>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <div className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' color={'success'} className='shadow-xs'>
                <i className='ri-group-line'></i>
              </CustomAvatar>
              <div>
                <Typography>Total Clientes</Typography>
                <Typography variant='h5'>
                  {isLoading ? <CircularProgress size={15} /> : (data?.data.total_clients ?? '0')}
                </Typography>
              </div>
            </div>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <div className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' color={'warning'} className='shadow-xs'>
                <i className='ri-macbook-line'></i>
              </CustomAvatar>
              <div>
                <Typography>Operadores Chamados</Typography>
                <Typography variant='h5'>
                  {isLoading ? <CircularProgress size={15} /> : (data?.data.total_operators_called ?? '0')}
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
