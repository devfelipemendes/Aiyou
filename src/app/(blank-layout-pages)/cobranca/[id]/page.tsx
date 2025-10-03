// file: src/views/cobrancas/Preview.tsx
'use client'

import Grid from '@mui/material/Grid2'

import PreviewCard from '../fatura/PreviewInvoice'

const Preview = ({ IdInvonice }: { IdInvonice?: string }) => {
  return (
    <Grid container spacing={6} className='flex items-center justify-center py-10'>
      <Grid size={{ xs: 12, md: 9 }}>
        <PreviewCard IdInvonice={IdInvonice} />
      </Grid>
    </Grid>
  )
}

export default Preview
