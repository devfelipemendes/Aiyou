'use client'

import React, { useState, useMemo } from 'react'

import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  Alert,
  IconButton,
  Collapse,
  CircularProgress
} from '@mui/material'

interface StepReviewProjectProps {
  onPrevStep: () => void
  onFinish: () => Promise<void>
  projectData: any
  assistantData: any
  apiData: any
  endpointData: any
}

const StepReviewProject: React.FC<StepReviewProjectProps> = ({
  onPrevStep,
  onFinish,
  projectData,
  assistantData,
  apiData,
  endpointData
}) => {
  const [isFinishing, setIsFinishing] = useState(false)
  const [expandedProject, setExpandedProject] = useState(true)

  // Estatísticas do projeto
  const statistics = useMemo(() => {
    const totalApis = apiData?.length || 0
    const totalEndpoints = endpointData?.length || 0

    const totalParameters =
      endpointData?.reduce((acc: number, endpoint: any) => acc + (endpoint.parameters?.length || 0), 0) || 0

    return {
      totalApis,
      totalEndpoints,
      totalParameters,
      hasAssistant: !!assistantData?.name
    }
  }, [apiData, endpointData, assistantData])

  const handleFinishProject = async () => {
    setIsFinishing(true)

    try {
      await onFinish()
    } catch (error) {
      console.error('Erro ao finalizar:', error)
    } finally {
      setIsFinishing(false)
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box textAlign='center' mb={4}>
        <Typography variant='h4' gutterBottom>
          🎉 Parabéns! Seu projeto está pronto
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Revise as configurações finais antes de criar seu primeiro projeto
        </Typography>
      </Box>

      {/* Estatísticas */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title='📊 Resumo da Configuração' />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Box textAlign='center'>
                <Typography variant='h3' color='primary.main'>
                  1
                </Typography>
                <Typography variant='body2'>Projeto</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign='center'>
                <Typography variant='h3' color='success.main'>
                  {statistics.hasAssistant ? 1 : 0}
                </Typography>
                <Typography variant='body2'>Assistente</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign='center'>
                <Typography variant='h3' color='info.main'>
                  {statistics.totalApis}
                </Typography>
                <Typography variant='body2'>APIs</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign='center'>
                <Typography variant='h3' color='secondary.main'>
                  {statistics.totalEndpoints}
                </Typography>
                <Typography variant='body2'>Endpoints</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Detalhes do Projeto */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title='🏢 Detalhes do Projeto'
          action={
            <IconButton onClick={() => setExpandedProject(!expandedProject)}>
              <i className={expandedProject ? 'ri-eye-off-line' : 'ri-eye-line'} />
            </IconButton>
          }
        />
        <Collapse in={expandedProject}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant='body2' color='text.secondary'>
                  Nome do Projeto
                </Typography>
                <Typography variant='h6' gutterBottom>
                  {projectData?.name || 'Nome não definido'}
                </Typography>

                <Typography variant='body2' color='text.secondary'>
                  Email
                </Typography>
                <Typography variant='body1'>{projectData?.email || 'Email não definido'}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='body2' color='text.secondary'>
                  CNPJ
                </Typography>
                <Typography variant='body1' gutterBottom>
                  {projectData?.cnpj || 'CNPJ não definido'}
                </Typography>

                {projectData?.description && (
                  <>
                    <Typography variant='body2' color='text.secondary'>
                      Descrição
                    </Typography>
                    <Typography variant='body1'>{projectData.description}</Typography>
                  </>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Collapse>
      </Card>

      {/* Assistente */}
      {assistantData && (
        <Card sx={{ mb: 3 }}>
          <CardHeader title='🤖 Assistente Configurado' />
          <CardContent>
            <Box display='flex' alignItems='center' gap={2}>
              <Typography variant='h6'>{assistantData.name}</Typography>
              <Chip label='Configurado' color='success' size='small' />
            </Box>
            {assistantData.description && (
              <Typography variant='body2' color='text.secondary' mt={1}>
                {assistantData.description}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Botões de navegação */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant='outlined' onClick={onPrevStep} startIcon={<i className='ri-arrow-left-line' />}>
          Voltar
        </Button>

        <Button
          variant='contained'
          size='large'
          onClick={handleFinishProject}
          disabled={isFinishing}
          endIcon={isFinishing ? <CircularProgress size={20} color='inherit' /> : <i className='ri-check-line' />}
          sx={{
            minWidth: 200,
            bgcolor: 'success.main',
            '&:hover': {
              bgcolor: 'success.dark'
            }
          }}
        >
          {isFinishing ? 'Finalizando...' : 'Finalizar Projeto'}
        </Button>
      </Box>

      {/* Informação sobre o fechamento do modal */}
      <Alert severity='info' sx={{ mt: 3 }}>
        <Typography variant='body2'>
          💡 <strong>Dica:</strong> Após finalizar, você poderá acessar e gerenciar seus projetos na área principal do
          sistema.
        </Typography>
      </Alert>
    </Box>
  )
}

export default StepReviewProject
