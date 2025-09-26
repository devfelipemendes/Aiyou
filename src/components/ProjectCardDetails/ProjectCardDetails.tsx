'use client'

import React, { useEffect, useState } from 'react'

import { Card, CardContent, Typography, Divider, Box, Avatar, CardHeader, CircularProgress } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { green, yellow, teal } from '@mui/material/colors'

import ChartInteracoes from './ChartInteracoes'
import type { GetProtocolsResponse, ProtocolMessage } from '@/api/endpoints/protocols/protocols'
import { useGetProtocolsQuery, useLazyGetProtocolHistoryQuery } from '@/api/endpoints/protocols/protocols'
import type { GetSingleAssistantResponse } from '@/api/endpoints/assistant/assistant'
import TotalSales from '@/views/dashboards/crm/TotalSales'

type ResultStatus = {
  active: number
  inactive: number
  resolved: number
  unresolved: number
  chats: number
}

const ProjectCard = ({ data }: { data: GetSingleAssistantResponse | undefined }) => {
  const [isLoadingAudioAndText, setIsLoadingAudioAndText] = useState<boolean>(true)
  const [fetchProtocolHistory] = useLazyGetProtocolHistoryQuery()
  const [resultStatus, setResultStatus] = useState<ResultStatus | null>(null)
  const [interactions, setInteractions] = useState<number | null>(null)
  const [arrayConversas, setArrayConversas] = useState<any[]>([])

  const {
    data: dataInteractions,

    error: errorInteractions
  } = useGetProtocolsQuery({
    sort: '-created_at',
    assistant_id: data?.data.id
  })

  const calculaAudioAndText = async () => {
    if (!dataInteractions?.data) return
    setIsLoadingAudioAndText(true)

    const promises = dataInteractions.data.map(interaction =>
      fetchProtocolHistory({ protocol: interaction.protocol }).unwrap()
    )

    try {
      const resultados = await Promise.all(promises)
      const arrayConversas = resultados.flatMap(res => res.data)

      // console.log('arrayConversasPORRA', arrayConversas)

      const interactions = arrayConversas.length

      setArrayConversas(arrayConversas)
      setInteractions(interactions)
      setIsLoadingAudioAndText(false)
    } catch (err) {
      console.error(err)
    }
  }

  const calculaResultsStatus = (data: GetProtocolsResponse) => {
    let active = 0
    let inactive = 0
    let resolved = 0
    let unresolved = 0
    let chats = 0

    data.data.forEach(protocol => {
      chats++

      switch (protocol.status) {
        case 'active':
          active++
          break
        case 'inactive':
          inactive++
          break
        case 'resolved':
          resolved++
          break
        case 'unresolved':
          unresolved++
          break
      }
    })

    setResultStatus({
      active,
      inactive,
      resolved,
      unresolved,
      chats
    })
  }

  useEffect(() => {
    if (!dataInteractions) return
    calculaAudioAndText()
    calculaResultsStatus(dataInteractions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataInteractions])

  return (
    <Card className='w-full'>
      <CardContent>
        <Grid container spacing={2} alignItems='flex-start'>
          {/* Espaço para imagem */}
          {/* <Box className='w-full flex flex-row justify-between items-center'>
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
          </Box> */}

          {/* Conteúdo do projeto */}
          <Grid marginTop={8} size={{ xs: 12, md: 12 }}>
            {/* <Divider sx={{ my: 2 }} /> */}

            <Grid container spacing={2}>
              {/* Interações */}
              <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box className='w-full px-10 flex flex-row justify-between'>
                  <Box>
                    <Typography variant='caption'>Interações Feitas</Typography>
                    <Typography variant='h4'>
                      {isLoadingAudioAndText ? <CircularProgress size={20} /> : (interactions ?? 0)}
                      {` `}Interações
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption'>Chats</Typography>
                    <Typography variant='h4'>
                      {isLoadingAudioAndText ? <CircularProgress size={20} /> : (resultStatus?.chats ?? 0)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 8, px: 4 }}>
                  <ChartInteracoes arrayConversas={arrayConversas} />
                  {/* <TotalSales protocols={dataInteractions?.data} isLoadingInteractions={isLoadingInteractions} /> */}
                </Box>

                <Box sx={{ mt: 1 }}>
                  {/* Ativas */}
                  <Typography
                    variant='h6'
                    sx={{
                      color: '#4caf50', // verde
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between'
                    }}
                  >
                    Ativas:
                    <Typography variant='h6' sx={{ color: '#4caf50' }}>
                      {isLoadingAudioAndText ? <CircularProgress size={20} /> : (resultStatus?.active ?? 0)}
                    </Typography>
                  </Typography>
                  <Divider sx={{ mt: 0, mb: 2 }} />

                  {/* Inativas */}
                  <Typography
                    variant='h6'
                    sx={{
                      color: '#9e9e9e', // cinza
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between'
                    }}
                  >
                    Inativas:
                    <Typography variant='h6' sx={{ color: '#9e9e9e' }}>
                      {isLoadingAudioAndText ? <CircularProgress size={20} /> : (resultStatus?.inactive ?? 0)}
                    </Typography>
                  </Typography>
                  <Divider sx={{ mt: 0, mb: 2 }} />

                  {/* Resolvidas */}
                  <Typography
                    variant='h6'
                    sx={{
                      color: '#1565c0', // azul escuro
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between'
                    }}
                  >
                    Resolvidas:
                    <Typography variant='h6' sx={{ color: '#1565c0' }}>
                      {isLoadingAudioAndText ? <CircularProgress size={20} /> : (resultStatus?.resolved ?? 0)}
                    </Typography>
                  </Typography>
                  <Divider sx={{ mt: 0, mb: 2 }} />

                  {/* Não resolvidas */}
                  <Typography
                    variant='h6'
                    sx={{
                      color: '#f44336', // vermelho
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between'
                    }}
                  >
                    Não resolvidas:
                    <Typography variant='h6' sx={{ color: '#f44336' }}>
                      {isLoadingAudioAndText ? <CircularProgress size={20} /> : (resultStatus?.unresolved ?? 0)}
                    </Typography>
                  </Typography>
                  <Divider sx={{ mt: 0, mb: 2 }} />
                </Box>
              </Grid>

              {/* Tokens */}

              {/* Chats */}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ProjectCard
