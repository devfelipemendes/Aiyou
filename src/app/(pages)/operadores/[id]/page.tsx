'use client'

import type { ReactElement } from 'react'

import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

import { Box, CircularProgress, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'

import UserLeftOverviewOperator from '@/views/operatorView/view/user-left-overview'
import UserRightOperator from '@/views/operatorView/view/user-right'
import { useGetOperatorsQuery } from '@/api/endpoints/operator/operator'

// Dinâmicos
const HomeTab = dynamic(() => import('@views/operatorView/view/user-right/home'))

const OperatorTabView = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''

  //@ts-ignore
  const { isLoading, error } = useGetOperatorsQuery(id)

  const tabContentList: { [key: string]: ReactElement } = {
    hometab: <HomeTab />
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography>Erro ao carregar operador. Tentar novamente</Typography>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <UserLeftOverviewOperator />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <UserRightOperator tabContentList={tabContentList} />
      </Grid>
    </Grid>
  )
}

export default OperatorTabView
