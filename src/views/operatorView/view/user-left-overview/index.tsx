// MUI Imports
import Grid from '@mui/material/Grid2'

import OperatorDetails from './OperatorDetails'

// Component Imports

const UserLeftOverviewOperator = ({ id }: { id: any }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <OperatorDetails id={id} />
      </Grid>
    </Grid>
  )
}

export default UserLeftOverviewOperator
