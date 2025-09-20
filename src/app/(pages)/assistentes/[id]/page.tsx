'use client'

import type { ReactElement } from 'react'

import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

import Grid from '@mui/material/Grid2'

import { Box, CircularProgress, Typography } from '@mui/material'

import UserLeftOverview from '@/views/assistenteView/view/user-left-overview'
import UserRight from '@/views/assistenteView/view/user-right'

import { useGetSingleAssistantQuery } from '@/api/endpoints/assistant/assistant'

// Dinâmicos
const HomeTab = dynamic(() => import('@views/assistenteView/view/user-right/home'))
const FunctionsTab = dynamic(() => import('@views/assistenteView/view/user-right/functionsTab'))
const LinkedProject = dynamic(() => import('@/views/assistenteView/view/user-right/linkedProject'))

const AssistentTabView = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''

  // Pegando assistente do Redux

  const { data, error, isLoading, refetch } = useGetSingleAssistantQuery(id)

  const tabContentList: { [key: string]: ReactElement } = {
    hometab: <HomeTab data={data} refetch={refetch} />,
    linkedProject: <LinkedProject />,

    functions: <FunctionsTab data={data} />
  }

  console.log('datadatadatad', data)

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
        <UserLeftOverview data={data} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <UserRight tabContentList={tabContentList} />
      </Grid>
    </Grid>
  )
}

export default AssistentTabView
