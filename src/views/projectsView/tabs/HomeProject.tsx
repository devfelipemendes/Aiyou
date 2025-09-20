// MUI Imports
import { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid2'

// import ProjectListTable from '../../assistenteView/view/user-right/home/ProjectListTable'
import ActivityTimeline from '@/views/dashboards/crm/ActivityTimeline'
import type { Activity } from '@/api/endpoints/activity/activity'
import { useGetActivitiesQuery } from '@/api/endpoints/activity/activity'

// Component Imports

// Data Imports

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/apps/invoice` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getInvoiceData = async () => {
  const res = await fetch(`${process.env.API_URL}/apps/invoice`)

  if (!res.ok) {
    throw new Error('Failed to fetch invoice data')
  }

  return res.json()
} */

const HomeProject = ({ id }: { id: string }) => {
  // Vars
  const [dataFiltered_3, setDataFiltered_3] = useState<Activity[] | undefined>()

  const { data: dataActivity, isLoading } = useGetActivitiesQuery({
    subject_id: id,
    subject_type: 'App\Models\Project',
    sort: '-created_at'
  })

  useEffect(() => {
    if (dataActivity?.data) {
      setDataFiltered_3(dataActivity.data.slice(0, 3))
    }
  }, [dataActivity])

  return (
    <Grid container spacing={6}>
      {/* <Grid size={{ xs: 12 }}>
        <ProjectListTable />
      </Grid> */}
      <Grid size={{ xs: 12 }}>
        <ActivityTimeline isLoading={isLoading} dataFiltered_3={dataFiltered_3 ?? []} />
      </Grid>
    </Grid>
  )
}

export default HomeProject
