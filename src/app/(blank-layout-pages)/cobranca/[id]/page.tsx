// file: src/app/(blank-layout-pages)/cobranca/[id]/page.tsx
'use client'

import { use } from 'react'

import Grid from '@mui/material/Grid2'

import PreviewCard from '../fatura/PreviewInvoice'

interface PreviewProps {
  params: Promise<{ id: string }>
}

export default function Preview({ params }: PreviewProps) {
  // Desempacota a Promise usando React.use()
  const { id } = use(params)

  return (
    <Grid container spacing={6} className='flex items-center justify-center py-10'>
      <Grid size={{ xs: 12, md: 9 }}>
        <PreviewCard invoiceId={id} />
      </Grid>
    </Grid>
  )
}
