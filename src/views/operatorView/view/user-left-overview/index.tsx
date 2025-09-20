// MUI Imports
import Grid from '@mui/material/Grid2'

import OperatorDetails from './OperatorDetails'
import type { GetOperatorByIdResponse } from '@/api/endpoints/operator/operator'

// Component Imports

const UserLeftOverviewOperator = ({ operator }: { operator: GetOperatorByIdResponse | undefined }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <OperatorDetails operator={operator} />
      </Grid>
    </Grid>
  )
}

export default UserLeftOverviewOperator
