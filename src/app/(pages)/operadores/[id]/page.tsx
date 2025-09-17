'use client'

import type { ReactElement } from 'react'

import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

import Grid from '@mui/material/Grid2'

import UserLeftOverviewOperator from '@/views/operatorView/view/user-left-overview'
import UserRightOperator from '@/views/operatorView/view/user-right'

// Dinâmicos
const HomeTab = dynamic(() => import('@views/operatorView/view/user-right/home'))

const OperatorTabView = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''

  // Passando assistente para cada Tab
  // const tabContentList: { [key: string]: ReactElement } = {
  //   security: <SecurityTab assistente={assistente} />,
  //   'billing-plans': <BillingPlans assistente={assistente} />,
  //   notifications: <NotificationsTab assistente={assistente} />,
  //   connections: <ConnectionsTab assistente={assistente} />,
  //   overview: <OverViewTab assistente={assistente} />
  // }

  const tabContentList: { [key: string]: ReactElement } = {
    hometab: <HomeTab />
  }

  console.log('operator', id)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <UserLeftOverviewOperator id={id} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <UserRightOperator tabContentList={tabContentList} />
      </Grid>
    </Grid>
  )
}

export default OperatorTabView
