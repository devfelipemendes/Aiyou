'use client'

import type { ReactElement } from 'react'

import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

import Grid from '@mui/material/Grid2'

import UserLeftOverview from '@/views/assistenteView/view/user-left-overview'
import UserRight from '@/views/assistenteView/view/user-right'

import { useAppSelector } from '@/redux-store'

// Dinâmicos
const HomeTab = dynamic(() => import('@views/assistenteView/view/user-right/home'))
const FunctionsTab = dynamic(() => import('@views/assistenteView/view/user-right/functionsTab'))
const LinkedProject = dynamic(() => import('@/views/assistenteView/view/user-right/linkedProject'))

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
    hometab: <HomeTab />,
    linkedProject: <LinkedProject />,
    functions: <FunctionsTab />
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
