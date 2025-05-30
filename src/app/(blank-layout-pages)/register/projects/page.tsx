'use client'
import React, { useState } from 'react'

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
  Stepper,
  Step,
  StepLabel,
  Chip,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material'

// Interfaces TypeScript
interface Project {
  id: string
  name: string
  cnpj: string
  email: string
  description: string
  image: File | null
  imageUrl: string | null
}

interface Parameter {
  name: string
  description: string
  type: 'String' | 'Number' | 'Boolean' | 'Array' | 'Object'
  required: boolean
  in_api: boolean
  is_header: boolean
  is_subparameter: boolean
  paip_id: string | null
  data?: Parameter[]
}

interface ApiFunction {
  name: string
  description: string
  endpoint: string
  return_message: string
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

interface ImageDropzoneProps {
  onImageChange: (file: File | null, imageUrl: string | null) => void
  placeholder?: string
}

interface ProjectFormState {
  name: string
  cnpj: string
  email: string
  description: string
  image: File | null
  imageUrl: string | null
}

interface AssistantFormState {
  name: string
  projectId: string
  functions: ApiFunction[]
}

// Componente ImageDropzone
const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageChange,
  placeholder = 'Clique para adicionar imagem'
}) => {
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null

    if (file) {
      const imageUrl = URL.createObjectURL(file)

      setPreview(imageUrl)
      onImageChange(file, imageUrl)
    }
  }

  return (
    <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 hover:border-gray-400 transition-colors'>
      <input type='file' accept='image/*' onChange={handleFileChange} className='hidden' id='image-upload' />
      <label htmlFor='image-upload' className='cursor-pointer block'>
        {preview ? (
          <img src={preview} alt='Preview' className='max-w-32 max-h-32 mx-auto rounded' />
        ) : (
          <div className='text-gray-500'>
            <svg className='mx-auto h-12 w-12 mb-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
            </svg>
            <Typography variant='body2' color='textSecondary'>
              {placeholder}
            </Typography>
          </div>
        )}
      </label>
    </div>
  )
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

  // Estados dos modais
  const [projectModalOpen, setProjectModalOpen] = useState<boolean>(false)
  const [assistantModalOpen, setAssistantModalOpen] = useState<boolean>(false)

  // Estados do formulário de projeto
  const [projectForm, setProjectForm] = useState<ProjectFormState>({
    name: '',
    cnpj: '',
    email: '',
    description: '',
    image: null,
    imageUrl: null
  })

  // Estados do formulário de assistente
  const [assistantForm, setAssistantForm] = useState<AssistantFormState>({
    name: '',
    projectId: '',
    functions: []
  })

  const [assistantStep, setAssistantStep] = useState<number>(0)

  const [currentFunction, setCurrentFunction] = useState<ApiFunction>({
    name: '',
    description: '',
    endpoint: '',
    return_message: '',
    method_id: '',
    api_id: '',
    active: true,
    working: true,
    parameters: [],
    paramReturns: []
  })

  const [currentParameter, setCurrentParameter] = useState<Parameter>({
    name: '',
    description: '',
    type: 'String',
    required: false,
    in_api: true,
    is_header: false,
    is_subparameter: false,
    paip_id: null,
    data: []
  })

  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({})

  // Funções para projetos
  const handleProjectSubmit = (): void => {
    const newProject: Project = {
      id: Date.now().toString(),
      ...projectForm
    }

    setProjects([...projects, newProject])
    setProjectForm({
      name: '',
      cnpj: '',
      email: '',
      description: '',
      image: null,
      imageUrl: null
    })
    setProjectModalOpen(false)
  }

  const handleImageChange = (file: File | null, imageUrl: string | null): void => {
    setProjectForm(prev => ({
      ...prev,
      image: file,
      imageUrl: imageUrl
    }))
  }

  // Funções para assistentes
  const handleAssistantNext = (): void => {
    if (assistantStep === 0) {
      setAssistantStep(1)
    }
  }

  const handleAssistantBack = (): void => {
    setAssistantStep(0)
  }

  const addParameter = (): void => {
    setCurrentFunction(prev => ({
      ...prev,
      parameters: [...prev.parameters, { ...currentParameter }]
    }))
    setCurrentParameter({
      name: '',
      description: '',
      type: 'String',
      required: false,
      in_api: true,
      is_header: false,
      is_subparameter: false,
      paip_id: null,
      data: []
    })
  }

  const removeParameter = (index: number): void => {
    setCurrentFunction(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index)
    }))
  }

  const addFunction = (): void => {
    const newFunction: ApiFunction = {
      ...currentFunction,
      method_id: Date.now().toString(),
      api_id: Date.now().toString()
    }

    setAssistantForm(prev => ({
      ...prev,
      functions: [...prev.functions, newFunction]
    }))

    setCurrentFunction({
      name: '',
      description: '',
      endpoint: '',
      return_message: '',
      method_id: '',
      api_id: '',
      active: true,
      working: true,
      parameters: [],
      paramReturns: []
    })
  }

  const handleAssistantSubmit = (): void => {
    const newAssistant: Assistant = {
      id: Date.now().toString(),
      ...assistantForm
    }

    setAssistants([...assistants, newAssistant])
    setAssistantForm({
      name: '',
      projectId: '',
      functions: []
    })
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

  return (
    <div className='flex flex-col items-center justify-center min-h-screen w-full p-4 bg-gray-50'>
      <div className='w-full max-w-6xl'>
        {/* Header */}
        <div className='items-center justify-center flex-col flex mb-8'>
          <ImageDropzone onImageChange={() => {}} placeholder='Sua logo' />
          <Typography variant='h3' component='h1' className='text-gray-800 font-bold'>
            Projetos AiYou
          </Typography>
        </div>

        {/* Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Card de Projetos */}
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

          {/* Card de Assistentes */}
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

          {/* Card de Ordem de projetos */}
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

          <TextField
            fullWidth
            label='Nome do Projeto'
            value={projectForm.name}
            onChange={e => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
            margin='normal'
            required
            variant='outlined'
          />

          <TextField
            fullWidth
            label='CNPJ'
            value={projectForm.cnpj}
            onChange={e => setProjectForm(prev => ({ ...prev, cnpj: e.target.value }))}
            margin='normal'
            required
            variant='outlined'
          />

          <TextField
            fullWidth
            label='Email da Unidade'
            type='email'
            value={projectForm.email}
            onChange={e => setProjectForm(prev => ({ ...prev, email: e.target.value }))}
            margin='normal'
            required
            variant='outlined'
          />

          <TextField
            fullWidth
            label='Descrição'
            multiline
            rows={3}
            value={projectForm.description}
            onChange={e => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
            margin='normal'
            variant='outlined'
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button variant='outlined' onClick={() => setProjectModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant='contained'
              onClick={handleProjectSubmit}
              disabled={!projectForm.name || !projectForm.cnpj || !projectForm.email}
            >
              Cadastrar Projeto
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal de Assistente */}
      <Modal open={assistantModalOpen} onClose={() => setAssistantModalOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant='h5' component='h2' gutterBottom>
            Cadastrar Novo Assistente
          </Typography>

          <Stepper activeStep={assistantStep} sx={{ mb: 3 }}>
            <Step>
              <StepLabel>Informações Básicas</StepLabel>
            </Step>
            <Step>
              <StepLabel>Cadastro de Funções</StepLabel>
            </Step>
          </Stepper>

          {assistantStep === 0 && (
            <Box>
              <TextField
                fullWidth
                label='Nome do Assistente'
                value={assistantForm.name}
                onChange={e => setAssistantForm(prev => ({ ...prev, name: e.target.value }))}
                margin='normal'
                required
                variant='outlined'
              />

              <FormControl fullWidth margin='normal' required>
                <InputLabel>Projeto</InputLabel>
                <Select
                  value={assistantForm.projectId}
                  onChange={e => setAssistantForm(prev => ({ ...prev, projectId: e.target.value }))}
                  label='Projeto'
                >
                  {projects.map(project => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant='outlined' onClick={() => setAssistantModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant='contained'
                  onClick={handleAssistantNext}
                  disabled={!assistantForm.name || !assistantForm.projectId}
                >
                  Próximo
                </Button>
              </Box>
            </Box>
          )}

          {assistantStep === 1 && (
            <Box>
              <Typography variant='h6' gutterBottom>
                Cadastro de Funções
              </Typography>

              <TextField
                fullWidth
                label='Nome da Função'
                value={currentFunction.name}
                onChange={e => setCurrentFunction(prev => ({ ...prev, name: e.target.value }))}
                margin='normal'
                required
                variant='outlined'
              />

              <TextField
                fullWidth
                label='Descrição da Função'
                multiline
                rows={2}
                value={currentFunction.description}
                onChange={e => setCurrentFunction(prev => ({ ...prev, description: e.target.value }))}
                margin='normal'
                variant='outlined'
              />

              <TextField
                fullWidth
                label='Endpoint URL'
                value={currentFunction.endpoint}
                onChange={e => setCurrentFunction(prev => ({ ...prev, endpoint: e.target.value }))}
                margin='normal'
                required
                variant='outlined'
              />

              <TextField
                fullWidth
                label='Mensagem de Erro'
                value={currentFunction.return_message}
                onChange={e => setCurrentFunction(prev => ({ ...prev, return_message: e.target.value }))}
                margin='normal'
                variant='outlined'
              />

              {/* Seção de Parâmetros */}
              <Box sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, p: 2, my: 2 }}>
                <Typography variant='subtitle1' gutterBottom>
                  Adicionar Parâmetro
                </Typography>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <TextField
                    fullWidth
                    label='Nome do Parâmetro'
                    value={currentParameter.name}
                    onChange={e => setCurrentParameter(prev => ({ ...prev, name: e.target.value }))}
                    size='small'
                    variant='outlined'
                  />

                  <FormControl fullWidth size='small'>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={currentParameter.type}
                      onChange={e =>
                        setCurrentParameter(prev => ({ ...prev, type: e.target.value as Parameter['type'] }))
                      }
                      label='Tipo'
                    >
                      <MenuItem value='String'>String</MenuItem>
                      <MenuItem value='Number'>Number</MenuItem>
                      <MenuItem value='Boolean'>Boolean</MenuItem>
                      <MenuItem value='Array'>Array</MenuItem>
                      <MenuItem value='Object'>Object</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                <TextField
                  fullWidth
                  label='Descrição'
                  value={currentParameter.description}
                  onChange={e => setCurrentParameter(prev => ({ ...prev, description: e.target.value }))}
                  size='small'
                  margin='normal'
                  variant='outlined'
                />

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 my-4'>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentParameter.required}
                        onChange={e => setCurrentParameter(prev => ({ ...prev, required: e.target.checked }))}
                      />
                    }
                    label='Obrigatório'
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentParameter.is_header}
                        onChange={e => setCurrentParameter(prev => ({ ...prev, is_header: e.target.checked }))}
                      />
                    }
                    label='É Header'
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentParameter.in_api}
                        onChange={e => setCurrentParameter(prev => ({ ...prev, in_api: e.target.checked }))}
                      />
                    }
                    label='Na API'
                  />
                </div>

                <Button variant='outlined' onClick={addParameter} disabled={!currentParameter.name} fullWidth>
                  Adicionar Parâmetro
                </Button>
              </Box>

              {/* Lista de Parâmetros Adicionados */}
              {currentFunction.parameters.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant='subtitle2' gutterBottom>
                    Parâmetros Cadastrados:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {currentFunction.parameters.map((param, index) => (
                      <Chip
                        key={index}
                        label={`${param.name} (${param.type})`}
                        onDelete={() => removeParameter(index)}
                        color='primary'
                        variant='outlined'
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Parâmetros de Retorno */}
              <TextField
                fullWidth
                label='Parâmetros de Retorno (separados por vírgula)'
                value={currentFunction.paramReturns.join(', ')}
                onChange={e =>
                  setCurrentFunction(prev => ({
                    ...prev,
                    paramReturns: e.target.value
                      .split(',')
                      .map(item => item.trim())
                      .filter(item => item)
                  }))
                }
                margin='normal'
                variant='outlined'
                helperText='Digite os nomes dos parâmetros que deseja extrair da resposta'
              />

              <Button
                variant='contained'
                color='secondary'
                onClick={addFunction}
                disabled={!currentFunction.name || !currentFunction.endpoint}
                sx={{ mt: 2, mb: 2 }}
                fullWidth
              >
                Adicionar Função
              </Button>

              {/* Funções Cadastradas */}
              {assistantForm.functions.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant='subtitle1' gutterBottom>
                    Funções Cadastradas:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {assistantForm.functions.map((func, index) => (
                      <Chip key={index} label={func.name} color='success' variant='filled' />
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant='outlined' onClick={handleAssistantBack}>
                  Voltar
                </Button>
                <Button variant='outlined' onClick={() => setAssistantModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant='contained'
                  onClick={handleAssistantSubmit}
                  disabled={assistantForm.functions.length === 0}
                >
                  Finalizar Cadastro
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </div>
  )
}

export default ProjectsRegister
