// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports

// Component Imports

import type { PricingPlanType } from '@/types/pricingTypes'

// Data Imports
import UserLeftOverview from '@/views/assistenteView/view/user-left-overview'
import UserRight from '@/views/assistenteView/view/user-right'

const SecurityTab = dynamic(() => import('@views/assistenteView/view/user-right/security'))
const BillingPlans = dynamic(() => import('@views/assistenteView/view/user-right/billing-plans'))
const NotificationsTab = dynamic(() => import('@views/assistenteView/view/user-right/notifications'))
const ConnectionsTab = dynamic(() => import('@views/assistenteView/view/user-right/connections'))

// Vars
const tabContentList = (data?: PricingPlanType[]): { [key: string]: ReactElement } => ({
  security: <SecurityTab />,
  'billing-plans': <BillingPlans data={data} />,
  notifications: <NotificationsTab />,
  connections: <ConnectionsTab />
})

const assistentTabView = async () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <UserLeftOverview />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <UserRight tabContentList={tabContentList()} />
      </Grid>
    </Grid>
  )
}

export default assistentTabView
