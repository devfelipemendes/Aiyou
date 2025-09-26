'use client'

import React from 'react'

import { useRouter } from 'next/navigation'

import type { ButtonProps } from '@mui/material'
import { Box, Button, Card, CardActions, CardContent, CardHeader, CircularProgress, Typography } from '@mui/material'

import Grid from '@mui/material/Grid2'

import CardUser from '@/@core/components/Cards/CardUser'

import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'
import CreateAssistant from '@/components/dialogs/create-assistant'
import { useGetAssistantsQuery } from '@/api/endpoints/assistant/assistant'

export default function Assitentes() {
  const navigate = useRouter()

  // Assitentes.tsx
  const handleUserClick = (user: any) => {
    navigate.push(`/assistentes/detalhes_assistente?id=${user.id}`)
  }

  const buttonProps: ButtonProps = {
    variant: 'contained',
    endIcon: <i className='ri-robot-3-line' />,
    children: 'Cadastrar novo assistente'
  }

  const { data, error, isLoading } = useGetAssistantsQuery()

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

  const assistants = data?.data || []

  return (
    <Card>
      <CardHeader title='Assistentes cadastrados' />
      <CardActions>
        <OpenDialogOnElementClick element={Button} elementProps={buttonProps} dialog={CreateAssistant} />
      </CardActions>
      <CardContent>
        <Grid container spacing={3}>
          {assistants.length === 0 ? (
            <Box
              sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <Typography>Nenhum assistente encontrado</Typography>
            </Box>
          ) : (
            assistants.map((user: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={user.id}>
                <CardUser
                  avatarSrc={user.avatarSrc}
                  name={user.name}
                  location={user.location}
                  projectName={user.project_name}
                  projectAvatarSrc={user.project_id}
                  onClick={() => handleUserClick(user)}
                  assistant={user}
                />
              </Grid>
            ))
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}
