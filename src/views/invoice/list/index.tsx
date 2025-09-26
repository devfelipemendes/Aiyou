// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports

// Component Imports
import InvoiceListTable from './InvoiceListTable'

import type { InvoiceType } from '@/types/invoiceTypes'

const InvoiceList = ({ invoiceData }: { invoiceData?: InvoiceType[] }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <InvoiceListTable invoiceData={invoiceData} />
      </Grid>
    </Grid>
  )
}

export default InvoiceList
