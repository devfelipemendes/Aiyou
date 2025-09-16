'use client'

import React from 'react'

import { Card, CardContent, Typography, Divider, Box, Avatar, CardHeader } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { green, yellow, teal } from '@mui/material/colors'

import ChartInteracoes from './ChartInteracoes'

const ProjectCard = () => {
  const interactions = { total: 580, concluded: 420, pending: 40, open: 120 }
  const tokensUsed = 86400
  const chats = 862

  return (
    <Card className='w-full'>
      <CardContent>
        <Grid container spacing={2} alignItems='flex-start'>
          {/* Espaço para imagem */}
          <Box className='w-full flex flex-row justify-between items-center'>
            <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              <Avatar sx={{ width: 125, height: 125 }}>PS</Avatar>
            </Grid>
            <Grid
              size={{ xs: 12, md: 10 }}
              sx={{ display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'start' }}
            >
              <CardHeader title='Projeto Vinculado' sx={{ p: 0, '& .MuiCardHeader-title': { lineHeight: 1.2 } }} />

              <Typography variant='body1' color='text.secondary'>
                Projeto: #332211
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Assistente virtual dedicado ao suporte e acompanhamento de pacientes da plataforma NovaVida...
              </Typography>
            </Grid>
          </Box>

          {/* Conteúdo do projeto */}
          <Grid marginTop={8} size={{ xs: 12, md: 12 }}>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              {/* Interações */}
              <Grid size={{ xs: 12, sm: 5 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='caption'>Interações Feitas</Typography>
                <Typography variant='h4'>{interactions.total} Interações</Typography>
                <Box sx={{ mt: 8, px: 4 }}>
                  <ChartInteracoes />
                </Box>

                <Box sx={{ mt: 1 }}>
                  <Typography
                    variant='h6'
                    sx={{
                      color: green[500],
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between'
                    }}
                  >
                    Concluídas:
                    <Typography
                      variant='h6'
                      sx={{
                        color: green[500]
                      }}
                    >
                      {interactions.concluded}
                    </Typography>
                  </Typography>
                  <Divider sx={{ mt: 0, mb: 2 }} />
                  <Typography
                    variant='h6'
                    sx={{
                      color: teal[500],
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between'
                    }}
                  >
                    Pendentes:
                    <Typography
                      variant='h6'
                      sx={{
                        color: teal[500]
                      }}
                    >
                      {interactions.pending}
                    </Typography>
                  </Typography>
                  <Divider sx={{ mt: 0, mb: 2 }} />
                  <Typography
                    variant='h6'
                    sx={{
                      color: yellow[700],
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between'
                    }}
                  >
                    Abertos:
                    <Typography
                      variant='h6'
                      sx={{
                        color: yellow[700]
                      }}
                    >
                      {interactions.open}
                    </Typography>
                  </Typography>
                  <Divider sx={{ mt: 0, mb: 2 }} />
                </Box>
              </Grid>

              {/* Tokens */}
              <Grid size={{ xs: 12, sm: 5 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='caption'>Total de tokens usado pelo assistente</Typography>
                <Typography variant='h4'>{tokensUsed.toLocaleString()} tokens</Typography>
                <Box sx={{ mt: 8 }}>
                  <ChartInteracoes />
                </Box>
              </Grid>

              {/* Chats */}
              <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='caption'>Chats</Typography>
                <Typography variant='h4'>{chats} </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ProjectCard
