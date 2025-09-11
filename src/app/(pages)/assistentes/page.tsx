'use client'

import React from 'react'

import { useRouter } from 'next/navigation'

import type { ButtonProps } from '@mui/material'
import { Button, Card, CardActions, CardContent, CardHeader } from '@mui/material'

import Grid from '@mui/material/Grid2'

import CardUser from '@/@core/components/Cards/CardUser'
import { useAssistantsSync } from '@/hooks/useAssistantsSync'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'
import CreateAssistant from '@/components/dialogs/create-assistant'

export default function Assitentes() {
  const navigate = useRouter()
  const assistants = useAssistantsSync()

  // Assitentes.tsx
  const handleUserClick = (user: any) => {
    navigate.push(`/assistentes/detalhes_assistente?id=${user.id}`)
  }

  const buttonProps: ButtonProps = {
    variant: 'contained',
    endIcon: <i className='ri-robot-3-line' />,
    children: 'Cadastrar novo assistente'
  }

  console.log(assistants)

  return (
    <Card>
      <CardHeader title='Assistentes cadastrados' />
      <CardActions>
        <OpenDialogOnElementClick element={Button} elementProps={buttonProps} dialog={CreateAssistant} />
      </CardActions>
      <CardContent>
        <Grid container spacing={3}>
          {assistants.map((user: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={user.id}>
              <CardUser
                avatarSrc={user.avatarSrc}
                name={user.name}
                location={user.location}
                projectName={user.project_name}
                projectAvatarSrc={user.project_id}
                onClick={() => handleUserClick(user)}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}
