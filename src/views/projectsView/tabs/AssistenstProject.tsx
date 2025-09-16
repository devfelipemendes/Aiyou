// MUI Imports

import Grid from '@mui/material/Grid2'

import type { QueryActionCreatorResult } from '@reduxjs/toolkit/query'

import CardStatWithImage from '@/components/card-statistics/Character'

import type { GetProjectByIdResponse } from '@/api/endpoints/Projects/project'

import SimpleTableAssistents from '../components/SimpleTableAssistents'

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

const AssistenstProject = ({
  data,
  refetchProject
}: {
  data: GetProjectByIdResponse | undefined
  refetchProject: () => QueryActionCreatorResult<any>
}) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CardStatWithImage
          stats={data?.data.assistants ? data?.data.assistants.length : '0'}
          title='Total Assistentes'
          chipColor='primary'
          src='/images/illustrations/characters/9.png'
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <SimpleTableAssistents data={data} refetchProject={refetchProject} />
      </Grid>
    </Grid>
  )
}

export default AssistenstProject
