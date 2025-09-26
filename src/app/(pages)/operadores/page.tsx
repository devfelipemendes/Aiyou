'use client'

import React from 'react'

import type { ButtonProps } from '@mui/material'
import { Box, Button, Card, CardActions, CardContent, CardHeader, CircularProgress, Typography } from '@mui/material'

import Grid from '@mui/material/Grid2'

import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'

import CreateOperatorDialog from '@/components/dialogs/create-operator/CreateOperatorDialog'

import { useGetOperatorsQuery } from '@/api/endpoints/operator/operator'
import CardTwo from '@/components/cardTwo/CardTwo'

export default function Operadores() {
  const { data, isLoading, error, refetch } = useGetOperatorsQuery()

  console.log('dataoperadorrrr', data)

  // Assitentes.tsx

  const buttonProps: ButtonProps = {
    variant: 'contained',
    endIcon: <i className='ri-customer-service-2-fill' />,
    children: 'Cadastrar novo operador'
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography>Erro ao carregar projetos. Tentar novamente</Typography>
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
    <Card>
      <CardActions className='flex justify-between px-12'>
        <CardHeader title='Operadores Cadastrados' />
        <OpenDialogOnElementClick element={Button} elementProps={buttonProps} dialog={CreateOperatorDialog} />
      </CardActions>
      <CardContent>
        {/* Grid container com espaçamento e wrap */}
        <Grid container spacing={8}>
          {data?.data.length === 0 ? (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
              <Typography>Nenhum Operador cadastrado</Typography>
            </Box>
          ) : (
            data?.data.map((operator: any) => {
              return (
                <Grid key={operator.identifier} size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                  <CardTwo operator={operator} refetch={refetch} />
                </Grid>
              )
            })
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}
