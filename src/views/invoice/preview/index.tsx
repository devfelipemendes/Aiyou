'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports

// Component Imports
import PreviewActions from './PreviewActions'
import type { InvoiceType } from '@/types/invoiceTypes'
import PreviewCard from '@/app/(blank-layout-pages)/cobranca/fatura/PreviewInvoice'

const Preview = ({ id }: { invoiceData?: InvoiceType; id: string }) => {
  // Handle Print Button Click
  const handleButtonClick = () => {
    window.print()
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 9 }}>
        <PreviewCard invoiceId={id} />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <PreviewActions id={id} onButtonClick={handleButtonClick} />
      </Grid>
    </Grid>
  )
}

export default Preview
