'use client'

// React Imports
import { useState, useCallback, useMemo, useEffect } from 'react'

// MUI Imports
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Typography,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  CircularProgress,
  FormControlLabel,
  Switch,
  Paper,
  Tooltip,
  Popover,
  IconButton
} from '@mui/material'
import Grid from '@mui/material/Grid2'

// Third-party Imports
import * as v from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'react-toastify'

// Component Imports
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'

import ListTable from '@/components/ListTable'

// API Imports
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  type Task
} from '@/api/endpoints/task/task'
import { useGetApisQuery } from '@/api/endpoints/fdc/api'
import { useGetMethodsQuery } from '@/api/endpoints/method/method'
import ParameterFormRecursive from '@/components/ParameterFormRecursive'
import CustomInputVertical from '@/@core/components/custom-inputs/Vertical'

// Schemas
const TaskSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Nome é obrigatório')),
  description: v.pipe(v.string(), v.minLength(1, 'Descrição é obrigatória')),
  endpoint: v.pipe(v.string(), v.minLength(1, 'Endpoint é obrigatório')),
  method_id: v.pipe(v.string(), v.minLength(1, 'Método é obrigatório')),
  api_id: v.pipe(v.string(), v.minLength(1, 'API é obrigatória')),
  instruction: v.pipe(v.string(), v.minLength(1, 'Instrução é obrigatória')),
  variable: v.boolean()
})

const ParameterSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Nome é obrigatório')),
  description: v.pipe(v.string(), v.minLength(1, 'Descrição é obrigatória')),
  type: v.picklist(['String', 'Number', 'Boolean', 'Array', 'Object']),
  required: v.boolean(),
  in_api: v.boolean(),
  is_header: v.boolean(),
  is_subparameter: v.boolean(),
  default_value: v.optional(v.string())
})

type TaskFormData = v.InferInput<typeof TaskSchema>
type ParameterFormData = v.InferInput<typeof ParameterSchema>

export interface TempParameter {
  id: string
  name: string
  description: string
  type: 'String' | 'Number' | 'Boolean' | 'Array' | 'Object'
  required: boolean
  in_api: boolean
  is_header: boolean
  is_subparameter: boolean
  default_value?: string | null
  data?: TempParameter[]
}

interface UrlVariable {
  id: string
  placeholder: string
  name: string
  type: 'String' | 'Number' | 'Boolean' | 'Array' | 'Object'
  position: number
}

type Props = {
  onNextStep?: () => void
}

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 12,
  maxHeight: '98vh',
  overflow: 'auto'
}

const StepCreateEndpoints = ({ onNextStep }: Props) => {
  // RTK Queries
  const { data: tasksResponse, isLoading: loadingTasks, refetch } = useGetTasksQuery()
  const { data: apisResponse, isLoading: loadingApis } = useGetApisQuery()
  const { data: methodsResponse, isLoading: loadingMethods } = useGetMethodsQuery()
  const [createTask] = useCreateTaskMutation()
  const [updateTask] = useUpdateTaskMutation()
  const [deleteTask] = useDeleteTaskMutation()

  // Estados
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [tempParameters, setTempParameters] = useState<TempParameter[]>([])
  const [tempParamReturns, setTempParamReturns] = useState<string[]>([])
  const [isAddingParameter, setIsAddingParameter] = useState(false)
  const [newParamReturn, setNewParamReturn] = useState('')
  const [urlVariables, setUrlVariables] = useState<UrlVariable[]>([])
  const [urlError, setUrlError] = useState<string>('')
  const [currentEndpoint, setCurrentEndpoint] = useState<string>('')

  const [subParamParentId, setSubParamParentId] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Dados
  const tasks = tasksResponse?.data || []
  const apis = useMemo(() => apisResponse?.data || [], [apisResponse?.data])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const methods = methodsResponse?.data || []
  const isLoading = loadingTasks || loadingApis || loadingMethods

  const allowed = ['get', 'post', 'put', 'patch', 'delete']
  const filteredMethods = methods.filter(item => allowed.includes(item.name.toLowerCase()))

  //Icons

  const ICONS: Record<string, JSX.Element> = {
    GET: <i className='ri-search-line' />,
    POST: <i className='ri-upload-2-fill' />,
    PUT: <i className='ri-edit-2-fill' />,
    PATCH: <i className='ri-settings-fill' />,
    DELETE: <i className='ri-close-circle-line' />
  }

  const IconRender = (name: string) => {
    return ICONS[name ?? <i className='ri-box-3-fill' />]
  }

  // Formulários
  const taskForm = useForm<TaskFormData>({
    resolver: valibotResolver(TaskSchema),
    defaultValues: {
      name: '',
      description: '',
      endpoint: '',
      method_id: '',
      api_id: '',
      instruction: '',
      variable: false
    }
  })

  const parameterForm = useForm<ParameterFormData>({
    resolver: valibotResolver(ParameterSchema),

    defaultValues: {
      name: '',
      description: '',
      type: 'String',
      required: false,
      in_api: false,
      is_header: false,
      is_subparameter: false,
      default_value: ''
    }
  })

  const subParamForm = useForm<ParameterFormData>({
    resolver: valibotResolver(ParameterSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'String',
      required: false,
      in_api: false,
      is_header: false,
      is_subparameter: false,
      default_value: ''
    }
  })

  const watchChildrenValue = parameterForm.watch('is_subparameter')

  const handleOpenSubParam = (event: React.MouseEvent<HTMLElement>, parentId: string) => {
    setAnchorEl(event.currentTarget) // botão clicado
    setSubParamParentId(parentId)
  }

  const handleCloseSubParam = () => {
    setAnchorEl(null)
    setSubParamParentId(null)
  }

  const open = Boolean(anchorEl)

  // Funções para URLs variáveis
  const parseUrlVariables = useCallback((url: string): UrlVariable[] => {
    const regex = /\{\{([^}]+)\}\}/g
    const variables: UrlVariable[] = []
    let match

    while ((match = regex.exec(url)) !== null) {
      const fullMatch = match[0]
      const content = match[1]

      if (content !== 'var') {
        setUrlError(`Erro: "${fullMatch}" não é válido. Use apenas "{{var}}" como placeholder.`)

        return []
      }

      variables.push({
        id: `url_var_${Date.now()}_${match.index}`,
        placeholder: fullMatch,
        name: '',
        type: 'String',
        position: match.index
      })
    }

    setUrlError('')

    return variables
  }, [])

  const handleEndpointChange = useCallback(
    (newEndpoint: string) => {
      setCurrentEndpoint(newEndpoint)
      const variables = parseUrlVariables(newEndpoint)

      setUrlVariables(prev => {
        return variables.map(v => {
          const existing = prev.find(p => p.placeholder === v.placeholder && p.position === v.position)

          return existing ? { ...v, name: existing.name, type: existing.type } : v
        })
      })
      taskForm.setValue('endpoint', newEndpoint)
    },
    [parseUrlVariables, taskForm]
  )

  const handleAddVariable = useCallback(() => {
    const newValue = currentEndpoint + '{{var}}'

    handleEndpointChange(newValue)
  }, [currentEndpoint, handleEndpointChange])

  const handleVariableNameChange = useCallback((variableId: string, newName: string) => {
    setUrlVariables(prev =>
      prev.map(variable => (variable.id === variableId ? { ...variable, name: newName } : variable))
    )
  }, [])

  const handleVariableTypeChange = useCallback(
    (variableId: string, newType: 'String' | 'Number' | 'Boolean' | 'Array' | 'Object') => {
      setUrlVariables(prev =>
        prev.map(variable => (variable.id === variableId ? { ...variable, type: newType } : variable))
      )
    },
    []
  )

  const generateUrlPreview = useCallback(() => {
    if (!currentEndpoint) return ''

    let preview = currentEndpoint

    urlVariables.forEach(variable => {
      if (variable.name.trim()) {
        preview = preview.replace('{{var}}', `{{${variable.name}}}`)
      }
    })

    const selectedApiId = taskForm.getValues('api_id')
    const selectedApi = apis.find(api => api.id === selectedApiId)
    const baseUrl = selectedApi ? selectedApi.url : 'https://api.exemplo.com'

    return `${baseUrl}${preview}`
  }, [currentEndpoint, urlVariables, taskForm, apis])

  // Handlers Modal
  const handleOpenModal = useCallback(() => {
    setEditingTask(null)
    setTempParameters([])
    setTempParamReturns([])
    setUrlVariables([])
    setUrlError('')
    setCurrentEndpoint('')
    taskForm.reset()
    setIsModalOpen(true)
  }, [taskForm])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingTask(null)
    setTempParameters([])
    setTempParamReturns([])
    setUrlVariables([])
    setUrlError('')
    setCurrentEndpoint('')
    setIsAddingParameter(false)
    taskForm.reset()
    parameterForm.reset()
  }, [taskForm, parameterForm])

  const handleShowPreviewJson = () => {
    setShowPreview(prev => !prev)
  }

  // Handlers Parâmetros
  // Raiz
  const handleAddParameter = useCallback(
    (data: ParameterFormData) => {
      const newParam: TempParameter = {
        id: `temp_${Date.now()}`,
        ...data,
        default_value: data.default_value || null,
        data: []
      }

      setTempParameters(prev => [...prev, newParam])
      parameterForm.reset()
      setIsAddingParameter(false)
      toast.success('Parâmetro adicionado')
    },
    [parameterForm]
  )

  // Subparam
  const handleAddSubParameter = useCallback(
    (data: ParameterFormData) => {
      const newParam: TempParameter = {
        id: `temp_${Date.now()}`,
        ...data,
        default_value: data.default_value || null,
        data: []
      }

      if (subParamParentId) {
        setTempParameters(prev => addParamRecursive(prev, subParamParentId, newParam))
      }

      subParamForm.reset()
      handleCloseSubParam()
      toast.success('Subparâmetro adicionado')
    },
    [subParamParentId, subParamForm]
  )

  // const handleRemoveParameter = useCallback((id: string) => {
  //   setTempParameters(prev => prev.filter(p => p.id !== id))
  // }, [])

  const handleAddParamReturn = useCallback(() => {
    const trimmed = newParamReturn.trim()

    if (trimmed && !tempParamReturns.includes(trimmed)) {
      setTempParamReturns(prev => [...prev, trimmed])
      setNewParamReturn('')
    }
  }, [newParamReturn, tempParamReturns])

  const handleRemoveParamReturn = useCallback((name: string) => {
    setTempParamReturns(prev => prev.filter(r => r !== name))
  }, [])

  const mapParams = useCallback(
    (params: TempParameter[]): any[] =>
      params.map(p => ({
        name: p.name,
        description: p.description,
        type: p.type,
        required: p.required,
        in_api: p.in_api,
        is_header: p.is_header,
        is_subparameter: p.is_subparameter,
        paip_id: null,
        default_value: p.default_value,
        data: p.data && p.data.length > 0 ? mapParams(p.data) : undefined
      })),
    []
  )

  // Handler Submit
  const handleSubmit = useCallback(
    async (data: TaskFormData) => {
      try {
        const unnamedVariables = urlVariables.filter(v => !v.name.trim())

        if (unnamedVariables.length > 0) {
          toast.error('Defina nomes para todas as variáveis da URL')

          return
        }

        let finalEndpoint = currentEndpoint

        urlVariables.forEach(variable => {
          if (variable.name.trim()) {
            finalEndpoint = finalEndpoint.replace('{{var}}', `{{${variable.name}}}`)
          }
        })

        const urlParameters = urlVariables.map(variable => ({
          name: variable.name,
          description: `Valor da variável ${variable.name}`,
          type: variable.type,
          required: true,
          in_api: false,
          is_header: false,
          is_subparameter: false,
          paip_id: null,
          default_value: null
        }))

        const allParameters = [...urlParameters, ...mapParams(tempParameters)]

        const payload = {
          ...data,
          endpoint: finalEndpoint,
          active: true,
          working: true,
          Parameters: allParameters,
          ParamReturns: tempParamReturns
        }

        if (editingTask) {
          await updateTask({ id: editingTask.id, ...payload }).unwrap()
        } else {
          await createTask(payload).unwrap()
        }

        handleCloseModal()
        refetch()
      } catch (error) {
        console.error('Erro:', error)
      }
    },
    [
      editingTask,
      urlVariables,
      currentEndpoint,
      tempParameters,
      tempParamReturns,
      mapParams,
      createTask,
      updateTask,
      handleCloseModal,
      refetch
    ]
  )

  // Pega todos os valores do form em tempo real
  const watchedTask = taskForm.watch()

  const requestPreview = useMemo(() => {
    let finalEndpoint = currentEndpoint

    urlVariables.forEach(variable => {
      if (variable.name.trim()) {
        finalEndpoint = finalEndpoint.replace('{{var}}', `{{${variable.name}}}`)
      }
    })

    const urlParameters = urlVariables.map(variable => ({
      name: variable.name,
      description: `Valor da variável ${variable.name}`,
      type: variable.type,
      required: true,
      in_api: false,
      is_header: false,
      is_subparameter: false,
      paip_id: null,
      default_value: null
    }))

    return {
      ...watchedTask,
      endpoint: finalEndpoint,
      Parameters: [...urlParameters, ...mapParams(tempParameters)],
      ParamReturns: tempParamReturns
    }
  }, [watchedTask, currentEndpoint, urlVariables, tempParameters, tempParamReturns, mapParams])

  const addParamRecursive = (params: TempParameter[], parentId: string, newParam: TempParameter): TempParameter[] => {
    return params.map(p => {
      if (p.id === parentId) {
        return { ...p, data: [...(p.data || []), newParam] }
      }

      if (p.data && p.data.length > 0) {
        return { ...p, data: addParamRecursive(p.data, parentId, newParam) }
      }

      return p
    })
  }

  const handleDeleteTask = useCallback(
    async (id: string) => {
      try {
        await deleteTask({ id }).unwrap()
        refetch()
      } catch (error) {
        console.error('Erro:', error)
      }
    },
    [deleteTask, refetch]
  )

  const handleEditTask = useCallback(
    (task: Task) => {
      setEditingTask(task)
      setCurrentEndpoint(task.endpoint)

      const existingVariables = parseUrlVariables(task.endpoint)

      setUrlVariables(existingVariables)

      taskForm.reset({
        name: task.name,
        description: task.description,
        endpoint: task.endpoint,
        method_id: task.method_id,
        api_id: task.api_id,
        instruction: task.instruction,
        variable: task.variable
      })

      setTempParameters([])
      setTempParamReturns([])
      setIsModalOpen(true)
    },
    [taskForm, parseUrlVariables]
  )

  // Effects
  useEffect(() => {
    const hasUrlVariables = urlVariables.length > 0

    taskForm.setValue('variable', hasUrlVariables)
  }, [urlVariables.length, taskForm])

  useEffect(() => {
    const currentFormEndpoint = taskForm.getValues('endpoint')

    if (currentFormEndpoint && currentFormEndpoint !== currentEndpoint) {
      setCurrentEndpoint(currentFormEndpoint)
      const variables = parseUrlVariables(currentFormEndpoint)

      setUrlVariables(variables)
    }
  }, [taskForm, currentEndpoint, parseUrlVariables])

  useEffect(() => {
    const selectedApiId = taskForm.watch('api_id')
    const selectedApi = apis.find(api => api.id === selectedApiId)

    if (selectedApi) {
      // apenas força rerender do preview
      setCurrentEndpoint(prev => prev || '')
    }
  }, [taskForm.watch('api_id'), apis])

  return (
    <Box sx={{ mx: 'auto', width: '100%' }}>
      <CardHeader title='Gerenciar Endpoints' subheader='Cadastre e configure os endpoints das suas APIs' />
      <CardContent sx={{ width: '100%' }}>
        <Grid container spacing={4}>
          {/* Header com botão */}
          <Grid size={{ xs: 12 }}>
            <Box className='flex justify-between items-center'>
              <Typography variant='body2' color='text.secondary'>
                {tasks.length} endpoint{tasks.length !== 1 ? 's' : ''} cadastrado{tasks.length !== 1 ? 's' : ''}
              </Typography>
              <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleOpenModal}>
                Cadastrar Endpoint
              </Button>
            </Box>
          </Grid>

          {/* Loading */}
          {isLoading && (
            <Grid size={{ xs: 12 }}>
              <Box className='text-center py-12'>
                <CircularProgress />
                <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                  Carregando...
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Empty State */}
          {tasks.length === 0 && !isLoading && (
            <Grid size={{ xs: 12 }}>
              <Box className='text-center py-12'>
                <i className='ri-links-line text-6xl text-gray-300 mb-4 block' />
                <Typography variant='h6' className='text-gray-500 mb-2'>
                  Nenhum endpoint cadastrado
                </Typography>
                <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleOpenModal}>
                  Cadastrar primeiro endpoint
                </Button>
              </Box>
            </Grid>
          )}

          {/* Botão próximo */}
        </Grid>
        {tasks.length > 0 && (
          <Box className='flex items-end '>
            <Button
              variant='contained'
              size='small'
              onClick={onNextStep}
              endIcon={<i className='ri-arrow-right-line' />}
            >
              Finalizar cadatro de endpoints
            </Button>
          </Box>
        )}
      </CardContent>

      {/* Modal */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Box className='flex items-center flex-col'>
            <i className='ri-box-3-line text-primary' />
            <Typography variant='h4' className='text-primary'>
              {editingTask ? 'Editar Endpoint' : 'Cadastrar Endpoint'}
            </Typography>
            <Typography variant='subtitle2' className='mb-4'>
              {editingTask ? 'Edição dos dados do endpoint' : 'Cadastrar dados de Endpoint'}
            </Typography>
          </Box>

          <form onSubmit={taskForm.handleSubmit(handleSubmit)}>
            <Grid container spacing={4}>
              {/* Dados básicos */}

              <Grid size={{ xs: 12 }}>
                <Box className='flex gap-2 items-center'>
                  <Typography variant='h5' className='text-primary'>
                    {'Dados da Basicos'}
                  </Typography>
                  <Tooltip title='Esses dados serão usados para identificação das suas funções de consulta extena (FDC), irão facilitar o encontro e usabilidade das suas funções dentro do sistema Aiyou '>
                    <i className='ri-information-line w-5 cursor-help text-primary' />
                  </Tooltip>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name='name'
                  control={taskForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Nome'
                      autoComplete='off'
                      required
                      placeholder='Ex: Buscar Cliente'
                      error={!!taskForm.formState.errors.name}
                      helperText={taskForm.formState.errors.name?.message}
                    />
                  )}
                />
                <Typography variant='subtitle1' className='mt-1'>
                  O nome que será cadastrado será usado para identificar o endpoint nas funcionalidades do sistema
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name='api_id'
                  control={taskForm.control}
                  render={({ field }) => (
                    <FormControl fullWidth required>
                      <InputLabel>API</InputLabel>
                      <Select {...field} label='API'>
                        {apis.map(api => (
                          <MenuItem key={api.id} value={api.id}>
                            {api.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
                <Typography variant='subtitle1' className='mt-1'>
                  Selecione a API que deseja utilizar
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name='description'
                  control={taskForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Descrição'
                      placeholder='Digite aqui a descrição na qual você poderá identificar e entender a funcionalidade destinada a este endpoint'
                      required
                      multiline
                      rows={4}
                      error={!!taskForm.formState.errors.description}
                      helperText={taskForm.formState.errors.description?.message}
                    />
                  )}
                />
                <Typography variant='subtitle1' className='mt-1'>
                  Determine como a será descrição de identificação para este endpoint
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box className='flex gap-2 items-center'>
                  <Typography variant='h5' className='text-primary'>
                    {'Dados de Funcionalidade'}
                  </Typography>
                  <Tooltip title='Aqui, você deverá cadastrar os dados exatamente como está na documentação do endpoint no qual deseja usar. Com esses dados, a AiYou fará requisições diretamente para API e usará as respostas dessas requisições para interagir com seu publico'>
                    <i className='ri-information-line w-5 cursor-help text-primary' />
                  </Tooltip>
                </Box>
              </Grid>

              {/* Sistema de URL com variáveis */}
              <Grid size={{ xs: 12 }}>
                <Box className='mb-2 '>
                  <Box className='flex flex-col w-full justify-between'>
                    <Box className='flex gap-2'>
                      <TextField
                        value={currentEndpoint}
                        onChange={e => handleEndpointChange(e.target.value)}
                        label='URL do Endpoint'
                        fullWidth
                        autoComplete='off'
                        placeholder='/api/endpoint/path'
                        error={!!urlError}
                        helperText={urlError}
                      />
                      <Button
                        variant='contained'
                        size='medium'
                        onClick={handleAddVariable}
                        endIcon={<i className='ri-add-line' />}
                      >
                        Variável
                      </Button>
                    </Box>
                    <Typography variant='subtitle1' className='mt-1'>
                      Cadastre penas a parte do endpoint da URL de requisição
                    </Typography>
                  </Box>
                  {urlVariables.length > 0 && (
                    <Typography variant='caption' color='text.secondary'>
                      {urlVariables.length} variável{urlVariables.length !== 1 ? 'eis' : ''} encontrada
                      {urlVariables.length !== 1 ? 's' : ''}
                    </Typography>
                  )}
                </Box>

                {/* Configuração das variáveis */}
                {urlVariables.length > 0 && (
                  <Paper className='p-3 mb-2'>
                    <Typography variant='subtitle2' className='mb-2'>
                      Adicione um nome a variavel da URL
                    </Typography>
                    <Box className='space-y-2'>
                      {urlVariables.map((variable, index) => (
                        <Box key={variable.id} className='flex gap-2 items-center'>
                          <Typography variant='h5' className='min-w-16 '>
                            #{index + 1}:
                          </Typography>
                          <TextField
                            value={variable.name}
                            onChange={e => handleVariableNameChange(variable.id, e.target.value)}
                            placeholder='Nome da variável'
                            size='small'
                            required
                            className='flex-1'
                          />
                          <FormControl size='small' className='min-w-24'>
                            <Select
                              value={variable.type}
                              onChange={e => handleVariableTypeChange(variable.id, e.target.value as any)}
                            >
                              <MenuItem value='String'>String</MenuItem>
                              <MenuItem value='Number'>Number</MenuItem>
                              <MenuItem value='Boolean'>Boolean</MenuItem>
                              <MenuItem value='Array'>Array</MenuItem>
                              <MenuItem value='Object'>Object</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                )}

                {/* Preview da URL */}
                {(currentEndpoint || urlVariables.length > 0 || taskForm.watch('endpoint') !== '') && (
                  <Paper className='p-2 bg-black'>
                    <Typography variant='caption' className='block mb-1 text-gray-400'>
                      Preview da URL Final:
                    </Typography>
                    <Typography variant='body2' fontFamily='monospace' className='break-all text-yellow-400'>
                      {generateUrlPreview()}
                    </Typography>
                  </Paper>
                )}
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name='method_id'
                  control={taskForm.control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Grid container spacing={2} className='flex justify-center'>
                      {filteredMethods.map((item, index) => {
                        return (
                          <Grid size={{ xs: 12, sm: 6, md: 6, xl: 3, lg: 4 }} key={index}>
                            <CustomInputVertical
                              type='radio'
                              name={item.name}
                              selected={field.value} // valor vindo do react-hook-form
                              handleChange={(value: any) => field.onChange(value)} // atualiza o form
                              data={{
                                value: item.id,
                                title: item.name,
                                content: IconRender(item.name)
                              }}
                            />
                          </Grid>
                        )
                      })}
                    </Grid>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>

              {/* Seção Parâmetros */}
              <Grid size={{ xs: 12 }}>
                <Box className='flex justify-between items-center mb-3'>
                  <Typography variant='subtitle1'>Parâmetros ({tempParameters.length})</Typography>
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={() => {
                      setIsAddingParameter(!isAddingParameter)
                    }}
                  >
                    {isAddingParameter ? 'Cancelar' : 'Adicionar Parâmetro'}
                  </Button>
                </Box>
              </Grid>

              {/* Form adicionar parâmetro */}
              {isAddingParameter && (
                <Grid size={{ xs: 12 }}>
                  <Paper className='p-3 mb-3'>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Controller
                          name='name'
                          control={parameterForm.control}
                          render={({ field }) => (
                            <TextField {...field} fullWidth label='Nome do parâmetro' size='small' required />
                          )}
                        />
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <Controller
                          name='type'
                          control={parameterForm.control}
                          render={({ field }) => (
                            <FormControl fullWidth size='small'>
                              <InputLabel>Tipo</InputLabel>
                              <Select {...field} label='Tipo'>
                                <MenuItem value='String'>String</MenuItem>
                                <MenuItem value='Number'>Number</MenuItem>
                                <MenuItem value='Boolean'>Boolean</MenuItem>
                                <MenuItem value='Array'>Array</MenuItem>
                                <MenuItem value='Object'>Object</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Controller
                          name='description'
                          control={parameterForm.control}
                          render={({ field }) => (
                            <TextField {...field} fullWidth label='Descrição' size='small' required />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Box className='flex gap-4'>
                          <Controller
                            name='required'
                            control={parameterForm.control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={<Switch checked={field.value} onChange={field.onChange} size='small' />}
                                label='Obrigatório'
                              />
                            )}
                          />

                          <Controller
                            name='is_header'
                            control={parameterForm.control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={<Switch checked={field.value} onChange={field.onChange} size='small' />}
                                label='Header'
                              />
                            )}
                          />
                          <Controller
                            name='in_api'
                            control={parameterForm.control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={<Switch checked={field.value} onChange={field.onChange} size='small' />}
                                label='Enviar na API'
                              />
                            )}
                          />
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Box className='flex gap-2'>
                          <Button
                            variant='contained'
                            size='small'
                            onClick={parameterForm.handleSubmit(handleAddParameter)}
                          >
                            Adicionar
                          </Button>
                          <Button variant='outlined' size='small' onClick={() => setIsAddingParameter(false)}>
                            Cancelar
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
              <Controller
                name='is_subparameter'
                control={parameterForm.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} size='small' />}
                    label='Habilitar parâmetros com subparâmetros (filhos)'
                  />
                )}
              />
              {/* Lista parâmetros */}
              {tempParameters.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <ParameterFormRecursive
                    parameters={tempParameters}
                    haveChildren={watchChildrenValue}
                    onAdd={(parentId?: string, event?: React.MouseEvent<HTMLElement>) => {
                      if (parentId && event) {
                        handleOpenSubParam(event, parentId)
                      } else {
                        setIsAddingParameter(true)
                      }
                    }}
                    onRemove={(id: string, parentId?: string) => {
                      if (parentId) {
                        setTempParameters(prev =>
                          prev.map(p =>
                            p.id === parentId ? { ...p, data: (p.data || []).filter(c => c.id !== id) } : p
                          )
                        )
                      } else {
                        setTempParameters(prev => prev.filter(p => p.id !== id))
                      }
                    }}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box className='flex gap-2 items-center'>
                  <Typography variant='h5' className='text-primary'>
                    {'Dados de Retorno da requisição'}
                  </Typography>
                  <Tooltip title='Configure como os dados serão usados pela AiYou e quais são os parametros que deseja utilizar da resposta da requisição. Caso queira usar todos, deixe em branco'>
                    <i className='ri-information-line w-5 cursor-help text-primary' />
                  </Tooltip>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='instruction'
                  control={taskForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Instrução de Retorno'
                      required
                      multiline
                      rows={2}
                      placeholder='Ex: Use o os dados deste endpoint para responde perguntas sobre faturas'
                      error={!!taskForm.formState.errors.instruction}
                      helperText={taskForm.formState.errors.instruction?.message}
                    />
                  )}
                />
                <Typography variant='subtitle1' className='mt-1'>
                  Instrua como o seu assistente deverá utilizar as respostas deste endpoint
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>

              {/* Campos de retorno */}
              <Grid size={{ xs: 12 }}>
                <Box className='flex justify-between'>
                  <Box>
                    <Typography variant='subtitle1' className='mb-2'>
                      Campos de Retorno ({tempParamReturns.length})
                    </Typography>
                    <Box className='flex gap-2 mb-2'>
                      <TextField
                        value={newParamReturn}
                        onChange={e => setNewParamReturn(e.target.value)}
                        placeholder='Campo da resposta'
                        autoComplete='off'
                        size='small'
                        onKeyPress={e => e.key === 'Enter' && handleAddParamReturn()}
                      />
                      <Box>
                        <Tooltip
                          title={`Adicione os parâmetros de retorno que o assistente poderá usar (opcional). Se nenhum parâmetro for adicionado, o assistente usará todos os parâmetros da resposta.`}
                        >
                          <IconButton size='small' onClick={handleAddParamReturn} className='bg-primary text-white'>
                            <i className='ri-add-fill' />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    {tempParamReturns.length > 0 && (
                      <Box className='flex flex-wrap gap-1'>
                        {tempParamReturns.map(name => (
                          <Chip
                            key={name}
                            label={name}
                            size='small'
                            onDelete={() => handleRemoveParamReturn(name)}
                            color='primary'
                          />
                        ))}
                      </Box>
                    )}
                  </Box>

                  <Box className='flex items-end justify-end'>
                    <Button variant='outlined' onClick={handleShowPreviewJson}>
                      {`{} JSON`}
                    </Button>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>

              {showPreview && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant='h6' gutterBottom>
                    Preview da Requisição
                  </Typography>
                  <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto', bgcolor: '#1e1e1e' }}>
                    <pre style={{ color: 'greenyellow', margin: 0, fontFamily: 'monospace', fontSize: 13 }}>
                      {JSON.stringify(requestPreview, null, 2)}
                    </pre>
                  </Paper>
                </Grid>
              )}
            </Grid>

            <Divider className='my-4' />

            {/* Botões */}
            <Box className='flex justify-end gap-2'>
              <Button type='button' onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={!taskForm.formState.isValid || !!urlError || urlVariables.some(v => !v.name.trim())}
              >
                {editingTask ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </Box>
          </form>
          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleCloseSubParam}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <Box p={2} width={400}>
              <Typography variant='subtitle2'>Novo Subparâmetro</Typography>
              <form onSubmit={subParamForm.handleSubmit(handleAddSubParameter)}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Controller
                      name='name'
                      control={subParamForm.control}
                      render={({ field }) => <TextField {...field} fullWidth size='small' label='Nome' required />}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Controller
                      name='type'
                      control={subParamForm.control}
                      render={({ field }) => (
                        <FormControl fullWidth size='small'>
                          <InputLabel>Tipo</InputLabel>
                          <Select {...field} label='Tipo'>
                            <MenuItem value='String'>String</MenuItem>
                            <MenuItem value='Number'>Number</MenuItem>
                            <MenuItem value='Boolean'>Boolean</MenuItem>
                            <MenuItem value='Array'>Array</MenuItem>
                            <MenuItem value='Object'>Object</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name='description'
                      control={subParamForm.control}
                      render={({ field }) => <TextField {...field} fullWidth size='small' label='Descrição' required />}
                    />
                  </Grid>
                  {/* switches igual ao form raiz */}
                  <Grid size={{ xs: 12 }}>
                    <Box display='flex' gap={2}>
                      <Controller
                        name='required'
                        control={subParamForm.control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch checked={field.value} onChange={field.onChange} size='small' />}
                            label='Obrigatório'
                          />
                        )}
                      />
                      <Controller
                        name='is_header'
                        control={subParamForm.control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch checked={field.value} onChange={field.onChange} size='small' />}
                            label='Header'
                          />
                        )}
                      />
                      <Controller
                        name='in_api'
                        control={subParamForm.control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch checked={field.value} onChange={field.onChange} size='small' />}
                            label='Enviar na API'
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box display='flex' justifyContent='flex-end' gap={1}>
                      <Button onClick={handleCloseSubParam}>Cancelar</Button>
                      <Button type='submit' variant='contained'>
                        Adicionar
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </Popover>
        </Box>
      </Modal>
    </Box>
  )
}

export default StepCreateEndpoints
