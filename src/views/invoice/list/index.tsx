// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports

// Component Imports
import InvoiceListTable from './InvoiceListTable'

const InvoiceList = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <InvoiceListTable />
      </Grid>
    </Grid>
  )
}

export default InvoiceList
