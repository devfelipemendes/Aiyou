'use client'

import type { ReactElement } from 'react'

import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

import Grid from '@mui/material/Grid2'

import UserLeftOverview from '@/views/assistenteView/view/user-left-overview'
import UserRight from '@/views/assistenteView/view/user-right'

import { useAppSelector } from '@/redux-store'

// Dinâmicos
const SecurityTab = dynamic(() => import('@views/assistenteView/view/user-right/security'))
const BillingPlans = dynamic(() => import('@views/assistenteView/view/user-right/billing-plans'))
const NotificationsTab = dynamic(() => import('@views/assistenteView/view/user-right/notifications'))
const ConnectionsTab = dynamic(() => import('@views/assistenteView/view/user-right/connections'))
const OverViewTab = dynamic(() => import('@views/assistenteView/view/user-right/overview'))

const AssistentTabView = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''

  // Pegando assistente do Redux
  const assistente = useAppSelector(state => state.assistants.list.find(a => a.id === id))

  // Passando assistente para cada Tab
  // const tabContentList: { [key: string]: ReactElement } = {
  //   security: <SecurityTab assistente={assistente} />,
  //   'billing-plans': <BillingPlans assistente={assistente} />,
  //   notifications: <NotificationsTab assistente={assistente} />,
  //   connections: <ConnectionsTab assistente={assistente} />,
  //   overview: <OverViewTab assistente={assistente} />
  // }

  const tabContentList: { [key: string]: ReactElement } = {
    overview: <OverViewTab />,
    'billing-plans': <BillingPlans />,
    security: <SecurityTab />,
    notifications: <NotificationsTab />,
    connections: <ConnectionsTab />
  }

  console.log('assistente', assistente)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <UserLeftOverview assistente={assistente} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <UserRight tabContentList={tabContentList} />
      </Grid>
    </Grid>
  )
}

export default AssistentTabView
