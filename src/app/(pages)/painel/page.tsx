'use client'

// MUI Imports

import Grid from '@mui/material/Grid2'

// Components Imports

import CardStatWithImage from '@components/card-statistics/Character'
import Transactions from '@views/dashboards/crm/Transactions'
import RevenueReport from '@views/dashboards/crm/RevenueReport'
import CardWidgetsSalesOverview from '@views/dashboards/crm/SalesOverview'
import ActivityTimeline from '@views/dashboards/crm/ActivityTimeline'
import UpgradePlan from '@views/dashboards/crm/UpgradePlan'
import MeetingSchedule from '@views/dashboards/crm/MeetingSchedule'
import TotalSales from '@/views/dashboards/crm/TotalSales'

const DashboardCRM = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }} className='self-end'>
        <Transactions />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }} className='self-end'>
        <CardStatWithImage
          stats='126'
          title='Interações em voz'
          trendNumber='15.6%'
          chipColor='primary'
          chipText={`Atendimentos do dia 0${new Date().getDate()}/${new Date().getMonth() + 1}`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }} className='self-end'>
        <CardStatWithImage
          stats='245'
          trend='negative'
          title='Interações em Texto'
          trendNumber='20%'
          chipText={`Atendimentos do dia 0${new Date().getDate()}/${new Date().getMonth() + 1}`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 4 }} className='self-end'>
        <CardStatWithImage
          stats='25'
          trend='negative'
          title='Interações com operador'
          trendNumber='20%'
          chipText={`Atendimentos do dia 0${new Date().getDate()}/${new Date().getMonth() + 1}`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TotalSales />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <RevenueReport />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CardWidgetsSalesOverview />
      </Grid>
      <Grid size={{ xs: 12, md: 12 }}>
        <ActivityTimeline />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
        <MeetingSchedule />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
        <UpgradePlan />
      </Grid>
    </Grid>
  )
}

export default DashboardCRM
