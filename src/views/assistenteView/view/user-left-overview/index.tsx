// MUI Imports
import Grid from '@mui/material/Grid2'

import AssistenteDetails from '@/views/assistenteView/view/user-left-overview/AssistenteDetails'
import TokensUsed from '@/views/assistenteView/view/user-left-overview/tokensUsed'

// Component Imports

const UserLeftOverview = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AssistenteDetails />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TokensUsed />
      </Grid>
    </Grid>
  )
}

export default UserLeftOverview
