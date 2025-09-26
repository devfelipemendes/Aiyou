'use client'

// MUI Imports

import { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid2'

// Components Imports

import type { SelectChangeEvent } from '@mui/material'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'

import RevenueReport from '@views/dashboards/crm/RevenueReport'
import CardWidgetsSalesOverview from '@views/dashboards/crm/SalesOverview'
import ActivityTimeline from '@views/dashboards/crm/ActivityTimeline'
import UpgradePlan from '@views/dashboards/crm/UpgradePlan'
import MeetingSchedule from '@views/dashboards/crm/MeetingSchedule'
import TotalSales from '@/views/dashboards/crm/TotalSales'
import type { ThemeColor } from '@/@core/types'

import { useGetDashboardQuery } from '@/api/endpoints/dashboard/dashboard'
import { getCurrentMonth, getCurrentYear, getNameMonth, months } from '@/utils/utilDates'
import EstatisticsDash from './EstatisticsDash'
import HorizontalWithBorderExample from '@/components/HorizontalWithBorderExample'
import AvailableSoon from '@/components/AvailableSoon'

import { useGetActivitiesQuery } from '@/api/endpoints/activity/activity'
import FirstAccessModal from '@/components/dialogs/firstAccess'
import { useUserMe } from '@/hooks/useUserMe'
import { useAppDispatch, useAppSelector } from '@/redux-store'
import { selectFirstAccess } from '@/api/endpoints/authUser/me'
import { openModal, setFirstAccess } from '@/redux-store/slices/firstAccessSlice'

export type DataTypeEstatisticsDash = {
  icon: string
  stats: string
  title: string
  color: ThemeColor
}

const DashboardCRM = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filters, setFilters] = useState({ year: getCurrentYear(), month: getCurrentMonth() })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [month, setMonth] = useState<string>(getNameMonth(getCurrentMonth()))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, isFetching, error, refetch } = useGetDashboardQuery(filters)

  const { data: dataActivity, isLoading } = useGetActivitiesQuery({
    sort: '-created_at'
  })

  const handleChangeMonth = (event: SelectChangeEvent) => {
    const selectedMonth = event.target.value

    setMonth(months.find(m => m.value === selectedMonth)?.label || '')
    setFilters(prev => ({ ...prev, month: selectedMonth }))
  }

  const { firstAccess } = useUserMe()
  const dispatch = useAppDispatch()

  console.log('First Access: do hook', firstAccess)

  const apiFirstAccess = useAppSelector(selectFirstAccess)

  useEffect(() => {
    if (apiFirstAccess === true) {
      dispatch(setFirstAccess(true))
      dispatch(openModal())
    }

    if (apiFirstAccess === false) {
      dispatch(setFirstAccess(false))
    }
  }, [apiFirstAccess, dispatch])

  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 12 }}>
          <FormControl fullWidth>
            <InputLabel>Mês</InputLabel>
            <Select value={filters.month} label='Mês' onChange={handleChangeMonth}>
              {months.map(m => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12 }} className='self-end'>
          <EstatisticsDash month={month} data={data} isLoading={isFetching} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }} className='self-end relative'>
          <AvailableSoon />
          <HorizontalWithBorderExample
            isLoading={false}
            color='primary'
            icon='ri-mic-fill'
            value='Em Desenvolvimento'
            title='Interações em voz'
            month={month}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }} className='self-end'>
          <HorizontalWithBorderExample
            isLoading={isFetching}
            color='info'
            icon='ri-chat-3-line'
            value={String(data?.data.total_protocols)}
            title='Interações em Texto'
            month={month}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 4 }} className='self-end relative'>
          <AvailableSoon />
          <HorizontalWithBorderExample
            isLoading={isFetching}
            color='success'
            icon='ri-user-3-line'
            value='Em Desenvolvimento'
            title='Interações com operador'
            month={month}
          />
        </Grid>
        <Grid className='relative' size={{ xs: 12, sm: 6, md: 3 }}>
          <AvailableSoon />
          <TotalSales />
        </Grid>
        <Grid className='relative' size={{ xs: 12, sm: 6, md: 3 }}>
          <AvailableSoon />
          <RevenueReport />
        </Grid>
        <Grid className='relative' size={{ xs: 12, md: 6 }}>
          <AvailableSoon />
          <CardWidgetsSalesOverview />
        </Grid>
        <Grid className='relative' size={{ xs: 12, md: 12 }}>
          <ActivityTimeline isLoading={isLoading} dataFiltered_3={dataActivity?.data ?? []} />
        </Grid>
        <Grid className='relative' size={{ xs: 12, sm: 6, lg: 6 }}>
          <AvailableSoon />
          <MeetingSchedule />
        </Grid>
        <Grid className='relative' size={{ xs: 12, sm: 6, lg: 6 }}>
          <UpgradePlan />
        </Grid>
      </Grid>
      <FirstAccessModal />
    </>
  )
}

export default DashboardCRM
