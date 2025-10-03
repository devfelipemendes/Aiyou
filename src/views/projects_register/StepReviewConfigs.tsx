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
  Chip,
  Alert,
  IconButton,
  Collapse,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'

// API Hooks
import { useGetProjectsQuery } from '@/api/endpoints/Projects/project'
import { useGetAssistantsQuery } from '@/api/endpoints/assistant/assistant'
import { useGetApisQuery } from '@/api/endpoints/fdc/api'
import { useGetTasksQuery } from '@/api/endpoints/task/task'
import { useGetMethodsQuery } from '@/api/endpoints/method/method'
import { useCompleteFirstAccessMutation } from '@/api/endpoints/firstAccess/firstAcess'

import { useAppDispatch } from '@/redux-store'
import { completeFirstAccess as completeFirstAccessAction } from '@/redux-store/slices/firstAccessSlice'

interface StepReviewProjectProps {
  onPrevStep: () => void
}

const StepReviewProject: React.FC<StepReviewProjectProps> = ({ onPrevStep }) => {
  const [isFinishing, setIsFinishing] = useState(false)

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    projects: true,
    assistants: true,
    apis: false,
    endpoints: false
  })

  // Buscar dados diretamente das APIs
  const { data: projectsData, isLoading: loadingProjects } = useGetProjectsQuery()
  const { data: assistantsData, isLoading: loadingAssistants } = useGetAssistantsQuery()
  const { data: apisData, isLoading: loadingApis } = useGetApisQuery()
  const { data: tasksData, isLoading: loadingTasks } = useGetTasksQuery()
  const { data: methodsData } = useGetMethodsQuery()

  const [completeFirstAccess] = useCompleteFirstAccessMutation()
  const dispatch = useAppDispatch()

  // Processar dados
  const reviewData = useMemo(() => {
    const projects = projectsData?.data || []
    const assistants = assistantsData?.data || []
    const apis = apisData?.data || []
    const tasks = tasksData?.data || []
    const methods = methodsData?.data || []

    // Ordenar projetos por data de criação (mais recente primeiro)
    const sortedProjects = [...projects].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Mapear cada projeto com seus assistentes
    const projectsWithAssistants = sortedProjects.map(project => ({
      ...project,
      assistants: assistants.filter(a => a.project_id === project.id)
    }))

    return {
      projects: projectsWithAssistants,
      apis: apis,
      endpoints: tasks,
      methods: methods,
      statistics: {
        totalProjects: projects.length,
        totalAssistants: assistants.length,
        totalApis: apis.length,
        totalEndpoints: tasks.length,
        totalParameters: tasks.reduce((acc, task) => acc + (task.pai_parameters?.length || 0), 0),
        isComplete: projects.length > 0 && assistants.length > 0
      }
    }
  }, [projectsData, assistantsData, apisData, tasksData, methodsData])

  const isLoading = loadingProjects || loadingAssistants || loadingApis || loadingTasks

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleFinishProject = async () => {
    setIsFinishing(true)

    try {
      await completeFirstAccess().unwrap()
      dispatch(completeFirstAccessAction())
      toast.success('Configuração inicial concluída com sucesso!')
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao finalizar configuração')
    } finally {
      setIsFinishing(false)
    }
  }

  const getMethodName = (methodId: string) => {
    const method = reviewData.methods.find(m => m.id === methodId)

    return method?.name || 'N/A'
  }

  const getApiName = (apiId: string) => {
    const api = reviewData.apis.find(a => a.id === apiId)

    return api?.name || 'N/A'
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant='rectangular' height={100} sx={{ mb: 2 }} />
        <Skeleton variant='rectangular' height={200} sx={{ mb: 2 }} />
        <Skeleton variant='rectangular' height={200} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2, maxWidth: '100%' }}>
      {/* Header */}
      <Box textAlign='center' mb={4}>
        <Typography variant='h4' gutterBottom>
          Revisão Final do Projeto
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Confirme todas as configurações antes de finalizar
        </Typography>
      </Box>

      {/* Status Geral */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems='center'>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant='h6' gutterBottom>
              Status da Configuração
            </Typography>
            <Typography variant='body2'>
              {reviewData.statistics.isComplete
                ? 'Todas as configurações obrigatórias foram preenchidas'
                : 'Complete todas as etapas antes de finalizar'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box display='flex' gap={1} flexWrap='wrap' justifyContent='flex-end'>
              <Chip label={`${reviewData.statistics.totalProjects} Projeto(s)`} size='small' />
              <Chip label={`${reviewData.statistics.totalAssistants} Assistente(s)`} size='small' />
              <Chip label={`${reviewData.statistics.totalApis} API(s)`} size='small' />
              <Chip label={`${reviewData.statistics.totalEndpoints} Endpoint(s)`} size='small' />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Seção Projetos */}
      <Card sx={{ mb: 2 }}>
        <CardHeader
          title={`Projetos (${reviewData.projects.length})`}
          action={
            <IconButton onClick={() => toggleSection('projects')}>
              <i className={expandedSections.projects ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
            </IconButton>
          }
        />
        <Collapse in={expandedSections.projects}>
          <CardContent>
            {reviewData.projects.map(project => (
              <Card key={project.id} variant='outlined' sx={{ mb: 2 }}>
                <CardHeader
                  title={project.name}
                  action={
                    <IconButton onClick={() => toggleSection(`project-${project.id}`)}>
                      <i
                        className={
                          expandedSections[`project-${project.id}`] ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'
                        }
                      />
                    </IconButton>
                  }
                />
                <Collapse in={expandedSections[`project-${project.id}`]}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant='caption' color='text.secondary'>
                          Nome
                        </Typography>
                        <Typography variant='body1' fontWeight='medium'>
                          {project.name}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant='caption' color='text.secondary'>
                          Descrição
                        </Typography>
                        <Typography variant='body1'>{project.description || 'Sem descrição'}</Typography>
                      </Grid>
                      {project.img_url && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant='caption' color='text.secondary'>
                            Imagem
                          </Typography>
                          <Box mt={1}>
                            <img src={project.img_url} alt={project.name} style={{ maxHeight: 100, borderRadius: 8 }} />
                          </Box>
                        </Grid>
                      )}
                    </Grid>

                    {/* Assistentes deste projeto */}
                    {project.assistants.length > 0 && (
                      <Box mt={3}>
                        <Typography variant='subtitle2' gutterBottom>
                          🤖 Assistentes ({project.assistants.length})
                        </Typography>
                        <List dense>
                          {project.assistants.map(assistant => (
                            <ListItem key={assistant.id}>
                              <ListItemText
                                primaryTypographyProps={{ component: 'span' }}
                                secondaryTypographyProps={{ component: 'span' }}
                                primary={assistant.name}
                              />
                              <Chip label='Configurado' color='success' size='small' />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </CardContent>
                </Collapse>
              </Card>
            ))}
          </CardContent>
        </Collapse>
      </Card>

      {/* Seção Assistentes (visão geral de todos) */}
      {reviewData.statistics.totalAssistants > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardHeader
            title={`Todos os Assistentes (${reviewData.statistics.totalAssistants})`}
            action={
              <IconButton onClick={() => toggleSection('assistants')}>
                <i className={expandedSections.assistants ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
              </IconButton>
            }
          />
          <Collapse in={expandedSections.assistants}>
            <CardContent>
              <List>
                {reviewData.projects.map(project =>
                  project.assistants.map(assistant => (
                    <ListItem key={assistant.id}>
                      <ListItemText
                        primaryTypographyProps={{ component: 'span' }}
                        secondaryTypographyProps={{ component: 'span' }}
                        primary={assistant.name}
                        secondary={`Projeto: ${project.name}`}
                      />
                      <Chip label='Configurado' color='success' size='small' />
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Collapse>
        </Card>
      )}

      {/* Seção APIs */}
      {reviewData.apis.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardHeader
            title={`APIs Configuradas (${reviewData.apis.length})`}
            action={
              <IconButton onClick={() => toggleSection('apis')}>
                <i className={expandedSections.apis ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
              </IconButton>
            }
          />
          <Collapse in={expandedSections.apis}>
            <CardContent>
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>URL</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reviewData.apis.map(api => (
                      <TableRow key={api.id}>
                        <TableCell>{api.name}</TableCell>
                        <TableCell>
                          <Typography variant='caption' sx={{ fontFamily: 'monospace' }}>
                            {api.url}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label='Ativa' color='success' size='small' />
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

      {/* Seção Endpoints */}
      {reviewData.endpoints.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardHeader
            title={`🔗 Endpoints Configurados (${reviewData.endpoints.length})`}
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
                      <TableCell>Nome</TableCell>
                      <TableCell>Endpoint</TableCell>
                      <TableCell>Método</TableCell>
                      <TableCell>API</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reviewData.endpoints.map(endpoint => (
                      <TableRow key={endpoint.id}>
                        <TableCell>{endpoint.name}</TableCell>
                        <TableCell>
                          <Typography variant='caption' sx={{ fontFamily: 'monospace' }}>
                            {endpoint.endpoint}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={getMethodName(endpoint.method_id)} size='small' color='primary' />
                        </TableCell>
                        <TableCell>{getApiName(endpoint.api_id)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Collapse>
        </Card>
      )}

      {/* Mensagem caso não haja dados */}
      {reviewData.projects.length === 0 && (
        <Alert severity='warning' sx={{ mb: 3 }}>
          Você precisa configurar pelo menos um projeto e um assistente antes de finalizar.
        </Alert>
      )}

      {/* Botões de Ação */}
      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant='outlined' onClick={onPrevStep} startIcon={<i className='ri-arrow-left-line' />}>
          Voltar
        </Button>

        <Button
          variant='contained'
          size='large'
          onClick={handleFinishProject}
          disabled={isFinishing || !reviewData.statistics.isComplete}
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
