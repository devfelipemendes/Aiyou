// MUI Imports
import Grid from '@mui/material/Grid2'

import { Card, CardContent, CardHeader, Typography } from '@mui/material'

import AssistenteDetails from '@/views/assistenteView/view/user-left-overview/AssistenteDetails'

import type { ProcessedAssistant } from '@/api/endpoints/assistant/assistant'

// Component Imports

const UserLeftOverview = ({ assistente }: { assistente: ProcessedAssistant | undefined }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AssistenteDetails assistente={assistente} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card className='min-h-500'>
          <CardHeader>
            <Typography>chat</Typography>
          </CardHeader>
          <CardContent className='flex flex-col pbs-12 gap-6'>chat</CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default UserLeftOverview
