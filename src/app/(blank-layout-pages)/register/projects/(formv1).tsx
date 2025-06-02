'use client'
import React, { useState } from 'react'

import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import * as v from 'valibot'

import {
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Modal,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Switch,
  Divider,
  FormHelperText
} from '@mui/material'

import ImageDropzone from '@/components/dropDonwLogo'

// Schemas de validação com Valibot
const ProjectSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Nome é obrigatório')),
  cnpj: v.pipe(
    v.string(),
    v.minLength(1, 'CNPJ é obrigatório'),
    v.regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, 'CNPJ deve ter formato válido')
  ),
  email: v.pipe(v.string(), v.minLength(1, 'Email é obrigatório'), v.email('Email deve ter formato válido')),
  description: v.optional(v.string()),
  image: v.optional(v.any()),
  imageUrl: v.optional(v.string())
})

const ParameterSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Nome do parâmetro é obrigatório')),
  description: v.optional(v.string()),
  type: v.picklist(['String', 'Number', 'Boolean', 'Array', 'Object']),
  required: v.boolean(),
  in_api: v.boolean(),
  is_header: v.boolean(),
  is_subparameter: v.boolean(),
  paip_id: v.optional(v.string()),
  data: v.optional(v.array(v.any()))
})

const FunctionSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Nome da função é obrigatório')),
  description: v.optional(v.string()),
  endpoint: v.pipe(v.string(), v.minLength(1, 'Endpoint é obrigatório'), v.url('Endpoint deve ser uma URL válida')),
  return_message: v.optional(v.string()),
  active: v.boolean(),
  working: v.boolean(),
  parameters: v.array(ParameterSchema),
  paramReturns: v.array(v.string())
})

// Interfaces TypeScript
interface Project {
  id: string
  name: string
  cnpj: string
  email: string
  description?: string
  image?: File
  imageUrl?: string
}

interface Parameter {
  name: string
  description?: string
  type: 'String' | 'Number' | 'Boolean' | 'Array' | 'Object'
  required: boolean
  in_api: boolean
  is_header: boolean
  is_subparameter: boolean
  paip_id?: string
  data?: Parameter[]
}

interface ApiFunction {
  name: string
  description?: string
  endpoint: string
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
  projectId: string
  functions: ApiFunction[]
}

// Style para o modal
const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 800,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflow: 'auto'
}

// Componente principal
const ProjectsRegister: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [assistants, setAssistants] = useState<Assistant[]>([])

  const [projectModalOpen, setProjectModalOpen] = useState<boolean>(false)
  const [assistantModalOpen, setAssistantModalOpen] = useState<boolean>(false)
  const [assistantStep, setAssistantStep] = useState<number>(0)
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({})

  // React Hook Form para Projeto
  const {
    control: projectControl,
    handleSubmit: handleProjectSubmit,
    reset: resetProject,
    formState: { errors: projectErrors }
  } = useForm({
    resolver: valibotResolver(ProjectSchema),
    defaultValues: {
      name: '',
      cnpj: '',
      email: '',
      description: '',
      image: undefined,
      imageUrl: undefined
    }
  })

  // React Hook Form para Assistente (passo 0)
  const {
    control: assistantControl,
    reset: resetAssistant,
    watch: watchAssistant,
    formState: { errors: assistantErrors, isValid: assistantBasicValid }
  } = useForm({
    resolver: valibotResolver(
      v.object({
        name: v.pipe(v.string(), v.minLength(1, 'Nome do assistente é obrigatório')),
        projectId: v.pipe(v.string(), v.minLength(1, 'Projeto é obrigatório'))
      })
    ),
    defaultValues: {
      name: '',
      projectId: ''
    },
    mode: 'onChange'
  })

  // React Hook Form para Função
  const {
    control: functionControl,
    handleSubmit: handleFunctionSubmit,
    reset: resetFunction,
    setValue: setFunctionValue,
    watch: watchFunction,
    formState: { errors: functionErrors }
  } = useForm({
    resolver: valibotResolver(FunctionSchema),
    defaultValues: {
      name: '',
      description: '',
      endpoint: '',
      return_message: '',
      active: true,
      working: true,
      parameters: [],
      paramReturns: []
    }
  })

  // React Hook Form para Parâmetro
  const {
    control: parameterControl,
    handleSubmit: handleParameterSubmit,
    reset: resetParameter,
    formState: { errors: parameterErrors }
  } = useForm({
    resolver: valibotResolver(ParameterSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'String' as const,
      required: false,
      in_api: true,
      is_header: false,
      is_subparameter: false,
      paip_id: undefined,
      data: []
    }
  })

  const {
    fields: functionList,
    append: appendFunction,
    remove: removeFunction
  } = useFieldArray({
    control: assistantControl,
    name: 'functions' as never
  })

  // Funções para projetos
  const onProjectSubmit = (data: any) => {
    const newProject: Project = {
      id: Date.now().toString(),
      ...data
    }

    setProjects([...projects, newProject])
    resetProject()
    setProjectModalOpen(false)
  }

  const handleImageChange = (file: File | null, imageUrl: string | null): void => {
    console.log('Image uploaded:', { file, imageUrl })

    // Implementar lógica de upload de imagem se necessário
  }

  // Funções para assistentes
  const handleAssistantNext = () => {
    setAssistantStep(1)
  }

  const handleAssistantBack = () => {
    if (assistantStep === 2) {
      setAssistantStep(1)
    } else if (assistantStep === 1) {
      setAssistantStep(0)
    }
  }

  const handleAssistantWithFunctions = () => {
    setAssistantStep(2)
  }

  const handleAssistantWithoutFunctions = () => {
    const assistantData = watchAssistant()

    const newAssistant: Assistant = {
      id: Date.now().toString(),
      name: assistantData.name,
      projectId: assistantData.projectId,
      functions: []
    }

    setAssistants([...assistants, newAssistant])
    resetAssistant()
    setAssistantStep(0)
    setAssistantModalOpen(false)
  }

  // Função para adicionar parâmetro
  const onParameterSubmit = (data: any) => {
    const currentParameters = watchFunction('parameters') || []

    const newParameter: Parameter = {
      name: data.name,
      description: data.description || '',
      type: data.type,
      required: data.required,
      in_api: data.in_api,
      is_header: data.is_header,
      is_subparameter: data.is_subparameter,
      paip_id: data.paip_id,
      data: data.data || []
    }

    setFunctionValue('parameters', [...currentParameters, newParameter])
    resetParameter()
  }

  // Função para remover parâmetro
  const removeParameterFromFunction = (index: number) => {
    const currentParameters = watchFunction('parameters') || []

    setFunctionValue(
      'parameters',
      currentParameters.filter((_, i) => i !== index)
    )
  }

  // Função para adicionar função
  const onFunctionSubmit = (data: any) => {
    const newFunction: ApiFunction = {
      ...data,
      method_id: Date.now().toString(),
      api_id: Date.now().toString()
    }

    appendFunction(newFunction)
    resetFunction()
  }

  // Finalizar cadastro do assistente
  const handleAssistantFinalSubmit = () => {
    const assistantData = watchAssistant()

    const functions = functionList.map((func: any) => ({
      ...func,
      method_id: func.method_id || Date.now().toString(),
      api_id: func.api_id || Date.now().toString()
    })) as ApiFunction[]

    const newAssistant: Assistant = {
      id: Date.now().toString(),
      name: assistantData.name,
      projectId: assistantData.projectId,
      functions: functions
    }

    setAssistants([...assistants, newAssistant])
    resetAssistant()
    resetFunction()
    setAssistantStep(0)
    setAssistantModalOpen(false)
  }

  const getAssistantsByProject = (projectId: string): Assistant[] => {
    return assistants.filter(assistant => assistant.projectId === projectId)
  }

  const toggleProjectExpansion = (projectId: string): void => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }))
  }

  const closeAssistantModal = (): void => {
    setAssistantModalOpen(false)
    setAssistantStep(0)
    resetAssistant()
    resetFunction()
    resetParameter()
  }

  const currentParameters: any[] = watchFunction('parameters') || []
  const currentFunctions: any[] = functionList || []

  return (
    <div className='flex flex-col items-center justify-center min-h-screen w-full p-4 bg-gray-50'>
      <div className='w-full max-w-6xl'>
        <div className='items-center justify-center flex-col flex mb-8'>
          <ImageDropzone onImageChange={() => {}} placeholder='Sua logo' size='lg' />
          <Typography variant='h3' component='h1' className='text-gray-800 font-bold'>
            Projetos AiYou
          </Typography>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Card>
            <CardHeader title='Projetos' />
            <Divider />
            <CardContent>
              <Button variant='contained' fullWidth onClick={() => setProjectModalOpen(true)} sx={{ mb: 2 }}>
                Criar novo Projeto
              </Button>
              <Typography variant='body2' color='textSecondary'>
                Total: {projects.length} projeto(s)
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ opacity: projects.length === 0 ? 0.5 : 1 }}>
            <CardHeader title='Assistentes' />
            <Divider />
            <CardContent>
              <Button
                variant='contained'
                fullWidth
                disabled={projects.length === 0}
                onClick={() => setAssistantModalOpen(true)}
                sx={{ mb: 2 }}
              >
                Criar novo Assistente
              </Button>
              <Typography variant='body2' color='textSecondary'>
                {projects.length === 0 ? 'Cadastre um projeto primeiro' : `Total: ${assistants.length} assistente(s)`}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title='Ordem de projetos' />
            <Divider />
            <CardContent>
              {projects.length === 0 ? (
                <Typography variant='body2' color='textSecondary'>
                  Nenhum projeto cadastrado
                </Typography>
              ) : (
                <div className='space-y-2'>
                  {projects.map(project => {
                    const projectAssistants = getAssistantsByProject(project.id)
                    const isExpanded = expandedProjects[project.id]

                    return (
                      <div key={project.id} className='border rounded-lg'>
                        <div
                          className='p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center'
                          onClick={() => toggleProjectExpansion(project.id)}
                        >
                          <Typography variant='body1'>
                            {project.name} ({projectAssistants.length} assistente(s))
                          </Typography>
                          <Typography variant='h6' color='textSecondary'>
                            {isExpanded ? '−' : '+'}
                          </Typography>
                        </div>
                        {isExpanded && (
                          <div className='px-3 pb-3 border-t bg-gray-50'>
                            {projectAssistants.length === 0 ? (
                              <Typography variant='body2' color='textSecondary' sx={{ py: 1 }}>
                                Nenhum assistente cadastrado
                              </Typography>
                            ) : (
                              projectAssistants.map(assistant => (
                                <div key={assistant.id} className='py-1'>
                                  <Typography variant='body2'>
                                    <strong>{assistant.name}</strong>
                                    <span className='text-gray-500 ml-2'>
                                      ({assistant.functions.length} função(ões))
                                    </span>
                                  </Typography>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Projeto */}
      <Modal open={projectModalOpen} onClose={() => setProjectModalOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant='h5' component='h2' gutterBottom>
            Cadastrar Novo Projeto
          </Typography>

          <ImageDropzone onImageChange={handleImageChange} placeholder='Logo do projeto' />

          <form onSubmit={handleProjectSubmit(onProjectSubmit)}>
            <Controller
              name='name'
              control={projectControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Nome do Projeto'
                  margin='normal'
                  required
                  variant='outlined'
                  error={!!projectErrors.name}
                  helperText={projectErrors.name?.message}
                />
              )}
            />

            <Controller
              name='cnpj'
              control={projectControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='CNPJ'
                  margin='normal'
                  required
                  variant='outlined'
                  error={!!projectErrors.cnpj}
                  helperText={projectErrors.cnpj?.message}
                />
              )}
            />

            <Controller
              name='email'
              control={projectControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Email da Unidade'
                  type='email'
                  margin='normal'
                  required
                  variant='outlined'
                  error={!!projectErrors.email}
                  helperText={projectErrors.email?.message}
                />
              )}
            />

            <Controller
              name='description'
              control={projectControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Descrição'
                  multiline
                  rows={3}
                  margin='normal'
                  variant='outlined'
                  error={!!projectErrors.description}
                  helperText={projectErrors.description?.message}
                />
              )}
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
              <Button variant='outlined' onClick={() => setProjectModalOpen(false)} color='error'>
                Cancelar
              </Button>
              <Button type='submit' variant='contained'>
                Cadastrar Projeto
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Modal de Assistente */}
      <Modal open={assistantModalOpen} onClose={closeAssistantModal}>
        <Box sx={modalStyle}>
          <Typography variant='h5' component='h2' gutterBottom>
            Cadastrar Novo Assistente
          </Typography>

          {/* Passo 0: Informações Básicas */}
          {assistantStep === 0 && (
            <Box>
              <Controller
                name='name'
                control={assistantControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Nome do Assistente'
                    margin='normal'
                    required
                    variant='outlined'
                    error={!!assistantErrors.name}
                    helperText={assistantErrors.name?.message}
                  />
                )}
              />

              <Controller
                name='projectId'
                control={assistantControl}
                render={({ field }) => (
                  <FormControl fullWidth margin='normal' required error={!!assistantErrors.projectId}>
                    <InputLabel>Projeto</InputLabel>
                    <Select {...field} label='Projeto'>
                      {projects.map(project => (
                        <MenuItem key={project.id} value={project.id}>
                          {project.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {assistantErrors.projectId && <FormHelperText>{assistantErrors.projectId.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                <Button variant='outlined' onClick={closeAssistantModal}>
                  Cancelar
                </Button>
                <Button variant='contained' onClick={handleAssistantNext} disabled={!assistantBasicValid}>
                  Próximo
                </Button>
              </Box>
            </Box>
          )}

          {/* Passo 1: Escolha se quer cadastrar funções */}
          {assistantStep === 1 && (
            <Box>
              <Box className='text-center'>
                <Typography variant='h4' gutterBottom>
                  Cadastrar Funções?
                </Typography>
                <Typography variant='h6' color='textSecondary' gutterBottom>
                  Você deseja cadastrar as funções que este assistente irá executar?
                </Typography>
                <Typography variant='body1' color='textSecondary' sx={{ mt: 2 }}>
                  Você poderá cadastrar ou editar essas informações futuramente se for necessário
                </Typography>
              </Box>
              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                <Button variant='outlined' onClick={handleAssistantBack}>
                  Voltar
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant='outlined' onClick={handleAssistantWithoutFunctions} color='info' size='large'>
                    Cadastrar apenas o assistente
                  </Button>
                  <Button variant='contained' onClick={handleAssistantWithFunctions} color='info' size='large'>
                    Cadastrar funções
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {/* Passo 2: Cadastro de Funções */}
          {assistantStep === 2 && (
            <Box>
              <Typography variant='h6' gutterBottom>
                Cadastro de Funções
              </Typography>

              <form onSubmit={handleFunctionSubmit(onFunctionSubmit)}>
                <Controller
                  name='name'
                  control={functionControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Nome da Função'
                      margin='normal'
                      required
                      variant='outlined'
                      error={!!functionErrors.name}
                      helperText={functionErrors.name?.message}
                    />
                  )}
                />

                <Controller
                  name='description'
                  control={functionControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Descrição da Função'
                      multiline
                      rows={2}
                      margin='normal'
                      variant='outlined'
                      error={!!functionErrors.description}
                      helperText={functionErrors.description?.message}
                    />
                  )}
                />

                <Controller
                  name='endpoint'
                  control={functionControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Endpoint URL'
                      margin='normal'
                      required
                      variant='outlined'
                      error={!!functionErrors.endpoint}
                      helperText={functionErrors.endpoint?.message}
                    />
                  )}
                />

                <Controller
                  name='return_message'
                  control={functionControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Mensagem de Erro'
                      margin='normal'
                      variant='outlined'
                      error={!!functionErrors.return_message}
                      helperText={functionErrors.return_message?.message}
                    />
                  )}
                />

                <Box sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, p: 2, my: 2 }}>
                  <Typography variant='subtitle1' gutterBottom>
                    Adicionar Parâmetro
                  </Typography>

                  <Box component='form' onSubmit={handleParameterSubmit(onParameterSubmit)}>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <Controller
                        name='name'
                        control={parameterControl}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label='Nome do Parâmetro'
                            size='small'
                            variant='outlined'
                            error={!!parameterErrors.name}
                            helperText={parameterErrors.name?.message}
                          />
                        )}
                      />

                      <Controller
                        name='type'
                        control={parameterControl}
                        render={({ field }) => (
                          <FormControl fullWidth size='small' error={!!parameterErrors.type}>
                            <InputLabel>Tipo</InputLabel>
                            <Select {...field} label='Tipo'>
                              <MenuItem value='String'>String</MenuItem>
                              <MenuItem value='Number'>Number</MenuItem>
                              <MenuItem value='Boolean'>Boolean</MenuItem>
                              <MenuItem value='Array'>Array</MenuItem>
                              <MenuItem value='Object'>Object</MenuItem>
                            </Select>
                            {parameterErrors.type && <FormHelperText>{parameterErrors.type.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </div>

                    <Controller
                      name='description'
                      control={parameterControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Descrição'
                          size='small'
                          margin='normal'
                          variant='outlined'
                          error={!!parameterErrors.description}
                          helperText={parameterErrors.description?.message}
                        />
                      )}
                    />

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 my-4'>
                      <Controller
                        name='required'
                        control={parameterControl}
                        render={({ field }) => (
                          <FormControlLabel control={<Switch {...field} checked={field.value} />} label='Obrigatório' />
                        )}
                      />
                      <Controller
                        name='is_header'
                        control={parameterControl}
                        render={({ field }) => (
                          <FormControlLabel control={<Switch {...field} checked={field.value} />} label='É Header' />
                        )}
                      />
                      <Controller
                        name='in_api'
                        control={parameterControl}
                        render={({ field }) => (
                          <FormControlLabel control={<Switch {...field} checked={field.value} />} label='Na API' />
                        )}
                      />
                    </div>

                    <Button type='submit' variant='outlined' fullWidth>
                      Adicionar Parâmetro
                    </Button>
                  </Box>
                </Box>

                {currentParameters.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant='subtitle2' gutterBottom>
                      Parâmetros Cadastrados:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {currentParameters.map((param: any, index: number) => (
                        <Chip
                          key={index}
                          label={`${param.name} (${param.type})`}
                          onDelete={() => removeParameterFromFunction(index)}
                          color='primary'
                          variant='outlined'
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Controller
                  name='paramReturns'
                  control={functionControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value?.join(', ') || ''}
                      onChange={e =>
                        field.onChange(
                          e.target.value
                            .split(',')
                            .map(item => item.trim())
                            .filter(item => item)
                        )
                      }
                      fullWidth
                      label='Parâmetros de Retorno (separados por vírgula)'
                      margin='normal'
                      variant='outlined'
                      helperText='Digite os nomes dos parâmetros que deseja extrair da resposta'
                      error={!!functionErrors.paramReturns}
                    />
                  )}
                />

                <Button type='submit' variant='contained' color='secondary' sx={{ mt: 2, mb: 2 }} fullWidth>
                  Adicionar Função
                </Button>
              </form>

              {currentFunctions.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant='subtitle1' gutterBottom>
                    Funções Cadastradas:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {currentFunctions.map((func: any, index: number) => (
                      <Chip
                        key={index}
                        label={func.name}
                        color='success'
                        variant='filled'
                        onDelete={() => removeFunction(index)}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                <Button variant='outlined' onClick={handleAssistantBack}>
                  Voltar
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant='outlined' onClick={closeAssistantModal}>
                    Cancelar
                  </Button>
                  <Button
                    variant='contained'
                    onClick={handleAssistantFinalSubmit}
                    disabled={currentFunctions.length === 0}
                  >
                    Finalizar Cadastro
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </div>
  )
}

export default ProjectsRegister
