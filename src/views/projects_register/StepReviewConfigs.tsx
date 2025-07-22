// React Imports
import { useState, useMemo } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'

// Types (você pode mover para um arquivo separado)
interface Parameter {
  id: string
  name: string
  description?: string
  type: 'String' | 'Number' | 'Boolean' | 'Array' | 'Object'
  required: boolean
  in_api: boolean
  is_header: boolean
  is_subparameter: boolean
  example_value?: string
}

interface ApiFunction {
  name: string
  description?: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  return_message?: string
  method_id: string
  api_id: string
  active: boolean
  working: boolean
  parameters: Parameter[]
  paramReturns: string[]
}

interface Assistant {
  id: string
  name: string
  client_id: string
  status: 'pending' | 'success' | 'error'
  functions?: ApiFunction[]
}

interface Project {
  id: string
  name: string
  cnpj: string
  email: string
  description?: string
  assistants?: Assistant[]
}

type Props = {
  activeStep: number
  handleNext: () => void
  handlePrev: () => void
  steps: { title: string; subtitle: string }[]
}

// Mock data - você substituirá por dados reais do seu store/context
const mockProjectData: Project = {
  id: '1',
  name: 'Sistema de E-commerce',
  cnpj: '12.345.678/0001-90',
  email: 'contato@ecommerce.com',
  description: 'Sistema completo de e-commerce com IA',
  assistants: [
    {
      id: '1',
      name: 'Assistente de Vendas',
      client_id: '1',
      status: 'success',
      functions: [
        {
          name: 'Buscar Produto',
          description: 'Busca produtos no catálogo',
          endpoint: 'https://api.ecommerce.com/produtos',
          method: 'GET',
          return_message: 'Produtos encontrados com sucesso',
          method_id: 'method_1',
          api_id: 'api_1',
          active: true,
          working: true,
          parameters: [
            {
              id: '1',
              name: 'categoria',
              type: 'String',
              required: true,
              in_api: true,
              is_header: false,
              is_subparameter: false,
              example_value: 'eletronicos'
            },
            {
              id: '2',
              name: 'authorization',
              type: 'String',
              required: true,
              in_api: true,
              is_header: true,
              is_subparameter: false,
              example_value: 'Bearer token123'
            }
          ],
          paramReturns: ['id', 'nome', 'preco', 'categoria']
        }
      ]
    },
    {
      id: '2',
      name: 'Assistente de Suporte',
      client_id: '1',
      status: 'success',
      functions: []
    }
  ]
}

const StepReviewProject = ({ handleNext, handlePrev }: Props) => {
  // States para controlar expansão dos cards
  const [expandedProject, setExpandedProject] = useState(true)

  // const [expandedAssistants, setExpandedAssistants] = useState<Record<string, boolean>>({})
  const [expandedFunctions, setExpandedFunctions] = useState<Record<string, boolean>>({})

  // Dados do projeto (substituir por dados reais do seu store)
  const projectData = mockProjectData

  // Estatísticas calculadas
  const statistics = useMemo(() => {
    const totalAssistants = projectData.assistants?.length || 0
    const successfulAssistants = projectData.assistants?.filter(a => a.status === 'success').length || 0

    const totalFunctions =
      projectData.assistants?.reduce((acc, assistant) => acc + (assistant.functions?.length || 0), 0) || 0

    const totalParameters =
      projectData.assistants?.reduce(
        (acc, assistant) =>
          acc + (assistant.functions?.reduce((funcAcc, func) => funcAcc + func.parameters.length, 0) || 0),
        0
      ) || 0

    return {
      totalAssistants,
      successfulAssistants,
      totalFunctions,
      totalParameters,
      hasIssues: totalAssistants !== successfulAssistants
    }
  }, [projectData])

  // Handlers
  // const toggleAssistantExpansion = () => {
  //   // setExpandedAssistants(prev => ({
  //   //   ...prev,
  //   //   [assistantId]: !prev[assistantId]
  //   // }))
  // }

  const toggleFunctionExpansion = (functionId: string) => {
    setExpandedFunctions(prev => ({
      ...prev,
      [functionId]: !prev[functionId]
    }))
  }

  const handleFinalSubmit = () => {
    // Aqui você enviará todos os dados para o backend
    const finalData = {
      project: projectData,
      statistics
    }

    console.log('📦 Dados finais para submissão:', finalData)

    // Simular envio
    alert('Projeto criado com sucesso! 🎉')
    handleNext()
  }

  // Componente de estatísticas
  const StatisticsCard = () => (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        title='📊 Resumo do Projeto'
        action={
          <Chip
            label={statistics.hasIssues ? 'Com Pendências' : 'Tudo OK'}
            color={statistics.hasIssues ? 'warning' : 'success'}
          />
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box textAlign='center'>
              <Typography variant='h4' color='primary.main'>
                {statistics.totalAssistants}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Assistentes
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box textAlign='center'>
              <Typography variant='h4' color='success.main'>
                {statistics.successfulAssistants}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Criados
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box textAlign='center'>
              <Typography variant='h4' color='info.main'>
                {statistics.totalFunctions}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Funções
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box textAlign='center'>
              <Typography variant='h4' color='secondary.main'>
                {statistics.totalParameters}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Parâmetros
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )

  // Componente de detalhes do projeto
  const ProjectDetailsCard = () => (
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                Nome
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                {projectData.name}
              </Typography>

              <Typography variant='body2' color='text.secondary'>
                Email
              </Typography>
              <Typography variant='body1'>{projectData.email}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                CNPJ
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                {projectData.cnpj}
              </Typography>

              {projectData.description && (
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
  )

  // Componente de parâmetros de uma função
  const ParametersTable = ({ parameters }: { parameters: Parameter[] }) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Nome</strong>
            </TableCell>
            <TableCell>
              <strong>Tipo</strong>
            </TableCell>
            <TableCell>
              <strong>Configurações</strong>
            </TableCell>
            <TableCell>
              <strong>Exemplo</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {parameters.map(param => (
            <TableRow key={param.id}>
              <TableCell>
                <Typography variant='body2' fontWeight='medium'>
                  {param.name}
                </Typography>
                {param.description && (
                  <Typography variant='caption' color='text.secondary'>
                    {param.description}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip size='small' label={param.type} variant='outlined' />
              </TableCell>
              <TableCell>
                <Box display='flex' gap={0.5} flexWrap='wrap'>
                  {param.required && <Chip size='small' label='Obrigatório' color='error' />}
                  {param.is_header && <Chip size='small' label='Header' color='info' />}
                  {!param.in_api && <Chip size='small' label='Não incluso' color='warning' />}
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                  {param.example_value || '-'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  return (
    <Box sx={{ mx: 'auto' }}>
      {/* Header */}
      <Box textAlign='center' mb={4}>
        <Typography variant='h4' gutterBottom>
          🎯 Revisão Final do Projeto
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Revise todas as configurações antes de finalizar
        </Typography>
      </Box>

      {/* Estatísticas */}
      <StatisticsCard />

      {/* Alertas */}
      {statistics.hasIssues && (
        <Alert severity='warning' sx={{ mb: 3 }}>
          Existem assistentes com problemas. Verifique os detalhes abaixo.
        </Alert>
      )}

      {/* Detalhes do Projeto */}
      <ProjectDetailsCard />

      {/* Assistentes */}
      <Card>
        <CardHeader title='🤖 Assistentes e Funções' />
        <CardContent>
          {projectData.assistants?.map(assistant => (
            <Accordion key={assistant.id} sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<i className='ri-arrow-down-s-line' />}

                // onClick={() => toggleAssistantExpansion(assistant.id)}
              >
                <Box display='flex' alignItems='center' justifyContent='space-between' width='100%'>
                  <Box display='flex' alignItems='center' gap={2}>
                    <Typography variant='h6'>{assistant.name}</Typography>
                    <Chip
                      size='small'
                      label={assistant.status === 'success' ? 'Criado' : 'Erro'}
                      color={assistant.status === 'success' ? 'success' : 'error'}
                    />
                  </Box>
                  <Badge badgeContent={assistant.functions?.length || 0} color='primary'>
                    <Typography variant='body2' color='text.secondary'>
                      Funções
                    </Typography>
                  </Badge>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {assistant.functions && assistant.functions.length > 0 ? (
                  assistant.functions.map(func => (
                    <Card key={func.method_id} variant='outlined' sx={{ mb: 2 }}>
                      <CardContent>
                        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                          <Typography variant='h6'>{func.name}</Typography>
                          <Box display='flex' gap={1}>
                            <Chip size='small' label={func.method} color='primary' />
                            <Chip
                              size='small'
                              label={func.active ? 'Ativo' : 'Inativo'}
                              color={func.active ? 'success' : 'default'}
                            />
                          </Box>
                        </Box>

                        <Typography variant='body2' color='text.secondary' gutterBottom>
                          {func.endpoint}
                        </Typography>

                        {func.description && (
                          <Typography variant='body2' sx={{ mb: 2 }}>
                            {func.description}
                          </Typography>
                        )}

                        <Box display='flex' justifyContent='space-between' alignItems='center'>
                          <Typography variant='body2' color='text.secondary'>
                            {func.parameters.length} parâmetros configurados
                          </Typography>
                          <Button
                            size='small'
                            onClick={() => toggleFunctionExpansion(func.method_id)}
                            startIcon={<i className='ri-list-check' />}
                          >
                            {expandedFunctions[func.method_id] ? 'Ocultar' : 'Ver'} Parâmetros
                          </Button>
                        </Box>

                        <Collapse in={expandedFunctions[func.method_id]}>
                          <ParametersTable parameters={func.parameters} />
                        </Collapse>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Alert severity='info'>Este assistente não possui funções configuradas</Alert>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* Navegação */}
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Box display='flex' justifyContent='space-between' alignItems='center'>
              <Button
                variant='outlined'
                color='secondary'
                onClick={handlePrev}
                startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
              >
                Voltar
              </Button>

              <Box display='flex' gap={2}>
                <Button variant='outlined' color='info' startIcon={<i className='ri-save-line' />}>
                  Salvar Rascunho
                </Button>

                <Button
                  variant='contained'
                  color='success'
                  onClick={handleFinalSubmit}
                  endIcon={<i className='ri-check-line' />}
                  size='large'
                >
                  Finalizar Projeto
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default StepReviewProject
