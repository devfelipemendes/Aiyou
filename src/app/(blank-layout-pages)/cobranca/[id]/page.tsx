// file: src/views/cobrancas/Preview.tsx
'use client'

import Grid from '@mui/material/Grid2'

import PreviewCard from '../fatura/PreviewInvoice'

const Preview = () => {
  return (
    <Grid container spacing={6} className='flex items-center justify-center py-10'>
      <Grid size={{ xs: 12, md: 9 }}>
        <PreviewCard />
      </Grid>
    </Grid>
  )
}

export default Preview
