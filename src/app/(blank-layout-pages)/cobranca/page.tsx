'use client'

import Grid from '@mui/material/Grid2'

import { Container } from 'postcss'

import type { InvoiceType } from '@/types/invoiceTypes'

// MUI Imports
import PreviewCard from './fatura/PreviewInvoice'
import PreviewActions from './fatura/PreviewActions'

// Type Imports

const Preview = ({ invoiceData, id }: { invoiceData?: InvoiceType; id: string }) => {
  // Handle Print Button Click
  const handleButtonClick = () => {
    window.print()
  }

  return (
    <Grid container spacing={6} className='flex items-center justify-center py-10'>
      <Grid size={{ xs: 12, md: 9 }}>
        <PreviewCard invoiceData={invoiceData} id={id} />
      </Grid>
    </Grid>
  )
}

export default Preview
