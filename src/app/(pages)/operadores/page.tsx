'use client'

import React from 'react'

import { useRouter } from 'next/navigation'

import type { ButtonProps } from '@mui/material'
import { Box, Button, Card, CardActions, CardContent, CardHeader, CircularProgress, Typography } from '@mui/material'

import Grid from '@mui/material/Grid2'

import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'

import CardOperator from '@/components/CardOperator/CardOperator'
import CreateOperatorDialog from '@/components/dialogs/create-operator/CreateOperatorDialog'

import { useGetOperatorsQuery } from '@/api/endpoints/operator/operator'

export default function Operadores() {
  const navigate = useRouter()

  const { data, isLoading, error } = useGetOperatorsQuery()

  console.log('dataoperadorrrr', data)

  // Assitentes.tsx

  const handleUserClick = (operator: any) => {
    navigate.push(`/operadores/detalhes_operador?id=${operator.id}`)
  }

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
      <CardHeader title='Operadores Cadastrados' />
      <CardActions>
        <OpenDialogOnElementClick element={Button} elementProps={buttonProps} dialog={CreateOperatorDialog} />
      </CardActions>
      <CardContent>
        {/* Grid container com espaçamento e wrap */}
        <Grid container spacing={3}>
          {data?.data.map((operator: any) => {
            return (
              <Grid key={operator.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <CardOperator onClick={() => handleUserClick(operator)} operator={operator} />
              </Grid>
            )
          })}
        </Grid>
      </CardContent>
    </Card>
  )
}
