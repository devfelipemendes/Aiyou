// file: src/views/projects_register/StepReviewConfigs.tsx
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
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { toast } from 'react-toastify'

import { useCompleteFirstAccessMutation } from '@/api/endpoints/firstAccess/firstAcess'
import { useAppDispatch } from '@/redux-store'
import { completeFirstAccess as completeFirstAccessAction } from '@/redux-store/slices/firstAccessSlice'

interface StepReviewProjectProps {
  onPrevStep: () => void
  onFinish?: () => Promise<void>
  projectData: any
  assistantData: any
  apiData: any[]
  endpointData: any[]
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

  const [expandedSections, setExpandedSections] = useState({
    project: true,
    assistant: true,
    apis: false,
    endpoints: false
  })

  const [completeFirstAccess] = useCompleteFirstAccessMutation()
  const dispatch = useAppDispatch()

  // Estatísticas do projeto
  const statistics = useMemo(
    () => ({
      totalApis: apiData?.length || 0,
      totalEndpoints: endpointData?.length || 0,
      totalParameters: endpointData?.reduce((acc, endpoint) => acc + (endpoint.parameters?.length || 0), 0) || 0,
      hasAssistant: !!assistantData?.name,
      isComplete: !!(projectData && assistantData)
    }),
    [apiData, endpointData, assistantData, projectData]
  )

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleFinishProject = async () => {
    setIsFinishing(true)

    try {
      const response = await completeFirstAccess().unwrap()

      dispatch(completeFirstAccessAction())
      toast.success('Configuração inicial concluída com sucesso!')

      if (onFinish) {
        await onFinish()
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao finalizar configuração')
    } finally {
      setIsFinishing(false)
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box textAlign='center' mb={4}>
        <Typography variant='h4' gutterBottom>
          🎉 Revisão Final do Projeto
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Confirme todas as configurações antes de finalizar
        </Typography>
      </Box>

      {/* Status Geral */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: statistics.isComplete ? 'success.light' : 'warning.light' }}>
        <Grid container spacing={3} alignItems='center'>
          <Grid item xs={12} md={8}>
            <Typography variant='h6' gutterBottom>
              Status da Configuração
            </Typography>
            <Typography variant='body2'>
              {statistics.isComplete
                ? '✅ Todas as configurações obrigatórias foram preenchidas'
                : '⚠️ Complete todas as etapas antes de finalizar'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display='flex' gap={1} flexWrap='wrap' justifyContent='flex-end'>
              <Chip label={`${statistics.totalApis} APIs`} size='small' />
              <Chip label={`${statistics.totalEndpoints} Endpoints`} size='small' />
              <Chip label={`${statistics.totalParameters} Parâmetros`} size='small' />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Seção Projeto */}
      <Card sx={{ mb: 2 }}>
        <CardHeader
          title='📁 Dados do Projeto'
          action={
            <IconButton onClick={() => toggleSection('project')}>
              <i className={expandedSections.project ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
            </IconButton>
          }
        />
        <Collapse in={expandedSections.project}>
          <CardContent>
            {projectData ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant='caption' color='text.secondary'>
                    Nome
                  </Typography>
                  <Typography variant='body1'>{projectData.name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant='caption' color='text.secondary'>
                    CNPJ
                  </Typography>
                  <Typography variant='body1'>{projectData.cnpj}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant='caption' color='text.secondary'>
                    Email
                  </Typography>
                  <Typography variant='body1'>{projectData.email}</Typography>
                </Grid>
                {projectData.description && (
                  <Grid item xs={12}>
                    <Typography variant='caption' color='text.secondary'>
                      Descrição
                    </Typography>
                    <Typography variant='body1'>{projectData.description}</Typography>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Alert severity='warning'>Dados do projeto não configurados</Alert>
            )}
          </CardContent>
        </Collapse>
      </Card>

      {/* Seção Assistente */}
      <Card sx={{ mb: 2 }}>
        <CardHeader
          title='🤖 Assistente IA'
          action={
            <IconButton onClick={() => toggleSection('assistant')}>
              <i className={expandedSections.assistant ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
            </IconButton>
          }
        />
        <Collapse in={expandedSections.assistant}>
          <CardContent>
            {assistantData ? (
              <Box>
                <Typography variant='h6'>{assistantData.name}</Typography>
                {assistantData.description && (
                  <Typography variant='body2' color='text.secondary' mt={1}>
                    {assistantData.description}
                  </Typography>
                )}
                <Box mt={2}>
                  <Chip label={assistantData.status || 'Configurado'} color='success' size='small' />
                </Box>
              </Box>
            ) : (
              <Alert severity='warning'>Assistente não configurado</Alert>
            )}
          </CardContent>
        </Collapse>
      </Card>

      {/* Seção APIs */}
      {apiData && apiData.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardHeader
            title={`🔌 APIs Configuradas (${apiData.length})`}
            action={
              <IconButton onClick={() => toggleSection('apis')}>
                <i className={expandedSections.apis ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
              </IconButton>
            }
          />
          <Collapse in={expandedSections.apis}>
            <CardContent>
              <List>
                {apiData.map((api, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <i className='ri-api-line' />
                    </ListItemIcon>
                    <ListItemText primary={api.name} secondary={api.base_url || api.description} />
                    {api.active && <Chip label='Ativa' color='success' size='small' />}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Collapse>
        </Card>
      )}

      {/* Seção Endpoints */}
      {endpointData && endpointData.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardHeader
            title={`🔗 Endpoints Configurados (${endpointData.length})`}
            action={
              <IconButton onClick={() => toggleSection('endpoints')}>
                <i className={expandedSections.endpoints ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
              </IconButton>
            }
          />
          <Collapse in={expandedSections.endpoints}>
            <CardContent>
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Endpoint</TableCell>
                      <TableCell>Método</TableCell>
                      <TableCell>Parâmetros</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {endpointData.map((endpoint, index) => (
                      <TableRow key={index}>
                        <TableCell>{endpoint.name || endpoint.endpoint}</TableCell>
                        <TableCell>
                          <Chip
                            label={endpoint.method}
                            size='small'
                            color={endpoint.method === 'GET' ? 'info' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>{endpoint.parameters?.length || 0}</TableCell>
                        <TableCell>
                          <Chip
                            label={endpoint.active ? 'Ativo' : 'Inativo'}
                            size='small'
                            color={endpoint.active ? 'success' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Collapse>
        </Card>
      )}

      {/* Botões de Ação */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant='outlined' onClick={onPrevStep} startIcon={<i className='ri-arrow-left-line' />}>
          Voltar
        </Button>

        <Button
          variant='contained'
          size='large'
          onClick={handleFinishProject}
          // disabled={isFinishing || !statistics.isComplete}
          disabled={false}
          endIcon={isFinishing ? <CircularProgress size={20} color='inherit' /> : <i className='ri-check-line' />}
          sx={{
            minWidth: 200,
            bgcolor: 'success.main',
            '&:hover': { bgcolor: 'success.dark' }
          }}
        >
          {isFinishing ? 'Finalizando...' : 'Concluir Configuração'}
        </Button>
      </Box>
    </Box>
  )
}

export default StepReviewProject
