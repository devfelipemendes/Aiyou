'use client'

// React Imports
import { useState, useCallback, useMemo } from 'react'

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
  IconButton,
  Paper
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

interface TempParameter {
  id: string
  name: string
  description: string
  type: 'String' | 'Number' | 'Boolean' | 'Array' | 'Object'
  required: boolean
  in_api: boolean
  is_header: boolean
  is_subparameter: boolean
  default_value?: string | null
}

type Props = {
  onNextStep?: () => void
}

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '95%',
  maxWidth: 1000,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
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

  // Dados
  const tasks = tasksResponse?.data || []
  const apis = apisResponse?.data || []
  const methods = methodsResponse?.data || []
  const isLoading = loadingTasks || loadingApis || loadingMethods

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
      in_api: true,
      is_header: false,
      is_subparameter: false,
      default_value: ''
    }
  })

  // Handlers Modal
  const handleOpenModal = useCallback(() => {
    setEditingTask(null)
    setTempParameters([])
    setTempParamReturns([])
    taskForm.reset()
    setIsModalOpen(true)
  }, [taskForm])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingTask(null)
    setTempParameters([])
    setTempParamReturns([])
    setIsAddingParameter(false)
    taskForm.reset()
    parameterForm.reset()
  }, [taskForm, parameterForm])

  const handleEditTask = useCallback(
    (task: Task) => {
      setEditingTask(task)
      taskForm.reset({
        name: task.name,
        description: task.description,
        endpoint: task.endpoint,
        method_id: task.method_id,
        api_id: task.api_id,
        instruction: task.instruction,
        variable: task.variable
      })

      // TODO: Carregar parâmetros existentes
      setTempParameters([])
      setTempParamReturns([])
      setIsModalOpen(true)
    },
    [taskForm]
  )

  // Handlers Parâmetros
  const handleAddParameter = useCallback(
    (data: ParameterFormData) => {
      const newParam: TempParameter = {
        id: `temp_${Date.now()}`,
        ...data,
        default_value: data.default_value || null
      }

      setTempParameters(prev => [...prev, newParam])
      parameterForm.reset()
      setIsAddingParameter(false)
      toast.success('Parâmetro adicionado')
    },
    [parameterForm]
  )

  const handleRemoveParameter = useCallback((id: string) => {
    setTempParameters(prev => prev.filter(p => p.id !== id))
  }, [])

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

  // Handler Submit
  const handleSubmit = useCallback(
    async (data: TaskFormData) => {
      try {
        const payload = {
          ...data,
          active: false,
          working: false,
          Parameters: tempParameters.map(p => ({
            name: p.name,
            description: p.description,
            type: p.type,
            required: p.required,
            in_api: p.in_api,
            is_header: p.is_header,
            is_subparameter: p.is_subparameter,
            paip_id: null,
            default_value: p.default_value
          })),
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
    [editingTask, tempParameters, tempParamReturns, createTask, updateTask, handleCloseModal, refetch]
  )

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

  // Colunas da tabela (sua estrutura original)
  const columnHelper = createColumnHelper<Task>()

  const columns = useMemo<ColumnDef<Task, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'Nome',
        cell: (info: any) => <Typography variant='body2'>{info.getValue()}</Typography>,
        size: 200
      }),
      columnHelper.accessor('description', {
        header: 'Descrição',
        cell: (info: any) => <Typography variant='body2'>{info.getValue()}</Typography>,
        size: 250
      }),
      columnHelper.accessor('endpoint', {
        header: 'Endpoint',
        cell: (info: any) => (
          <Typography variant='body2' fontFamily='monospace' noWrap>
            {info.getValue()}
          </Typography>
        ),
        size: 300
      }),
      columnHelper.accessor('method_id', {
        header: 'Método',
        cell: (info: any) => {
          const method = methods.find(m => m.id === info.getValue())

          return (
            <Chip
              label={method?.name || 'N/A'}
              size='small'
              color={
                method?.name === 'GET'
                  ? 'success'
                  : method?.name === 'POST'
                    ? 'primary'
                    : method?.name === 'PUT'
                      ? 'warning'
                      : method?.name === 'DELETE'
                        ? 'error'
                        : 'default'
              }
            />
          )
        },
        size: 100
      }),
      columnHelper.accessor('variable', {
        header: 'Variável',
        cell: (info: any) => (
          <Chip
            label={info.getValue() ? 'Sim' : 'Não'}
            size='small'
            color={info.getValue() ? 'secondary' : 'default'}
          />
        ),
        size: 100
      }),
      columnHelper.accessor('active', {
        header: 'Ativo',
        cell: (info: any) => (
          <Chip label={info.getValue() ? 'Sim' : 'Não'} size='small' color={info.getValue() ? 'success' : 'error'} />
        ),
        size: 80
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Ações',
        size: 150,
        cell: (params: any) => (
          <Box className='flex gap-2'>
            <Button size='small' variant='outlined' color='primary' onClick={() => handleEditTask(params.row.original)}>
              <i className='ri-edit-line' />
            </Button>
            <Button
              size='small'
              variant='outlined'
              color='error'
              onClick={() => handleDeleteTask(params.row.original.id)}
            >
              <i className='ri-delete-line' />
            </Button>
          </Box>
        )
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [methods, handleEditTask, handleDeleteTask]
  )

  return (
    <Box>
      <CardHeader title='Gerenciar Endpoints' subheader='Cadastre e configure os endpoints das suas APIs' />
      <CardContent>
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

          {/* Tabela */}
          {tasks.length > 0 && !isLoading && (
            <Grid size={{ xs: 12 }}>
              <ListTable
                columns={columns}
                tableData={tasks}
                loading={false}
                exportFileName='endpoints-cadastrados'
                searchInputPlaceholder='Buscar endpoint...'
                headerTable={<CardHeader title={`Endpoints (${tasks.length})`} />}
                headerHasDivider
              />
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
          {tasks.length > 0 && onNextStep && (
            <Grid size={{ xs: 12 }}>
              <Box className='flex justify-end'>
                <Button
                  variant='contained'
                  size='large'
                  onClick={onNextStep}
                  endIcon={<i className='ri-arrow-right-line' />}
                >
                  Próximo Passo
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>

      {/* Modal */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant='h6' className='mb-4'>
            {editingTask ? 'Editar Endpoint' : 'Cadastrar Endpoint'}
          </Typography>

          <form onSubmit={taskForm.handleSubmit(handleSubmit)}>
            {/* Dados básicos */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant='subtitle1' className='mb-2'>
                  Dados do Endpoint
                </Typography>
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
                      required
                      placeholder='Ex: Buscar Cliente'
                      error={!!taskForm.formState.errors.name}
                      helperText={taskForm.formState.errors.name?.message}
                    />
                  )}
                />
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
                      required
                      multiline
                      rows={2}
                      error={!!taskForm.formState.errors.description}
                      helperText={taskForm.formState.errors.description?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Controller
                  name='endpoint'
                  control={taskForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='URL do Endpoint'
                      required
                      placeholder='https://api.exemplo.com/endpoint'
                      error={!!taskForm.formState.errors.endpoint}
                      helperText={taskForm.formState.errors.endpoint?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name='method_id'
                  control={taskForm.control}
                  render={({ field }) => (
                    <FormControl fullWidth required>
                      <InputLabel>Método</InputLabel>
                      <Select {...field} label='Método'>
                        {methods.map(method => (
                          <MenuItem key={method.id} value={method.id}>
                            {method.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
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
                      placeholder='Como a IA deve tratar a resposta...'
                      error={!!taskForm.formState.errors.instruction}
                      helperText={taskForm.formState.errors.instruction?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name='variable'
                  control={taskForm.control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={field.onChange} />}
                      label='Possui parâmetros variáveis na URL'
                    />
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
                  <Button variant='outlined' size='small' onClick={() => setIsAddingParameter(!isAddingParameter)}>
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
                          render={({ field }) => <TextField {...field} fullWidth label='Nome' size='small' required />}
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

              {/* Lista parâmetros */}
              {tempParameters.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Box className='space-y-2 max-h-40 overflow-y-auto'>
                    {tempParameters.map(param => (
                      <Paper key={param.id} className='p-2'>
                        <Box className='flex justify-between items-center'>
                          <Box>
                            <Box className='flex gap-2 items-center mb-1'>
                              <Typography variant='body2' fontWeight={500}>
                                {param.name}
                              </Typography>
                              <Chip label={param.type} size='small' />
                              {param.required && <Chip label='Obrigatório' size='small' color='warning' />}
                              {param.is_header && <Chip label='Header' size='small' color='secondary' />}
                            </Box>
                            <Typography variant='caption' color='text.secondary'>
                              {param.description}
                            </Typography>
                          </Box>
                          <IconButton size='small' color='error' onClick={() => handleRemoveParameter(param.id)}>
                            <i className='ri-delete-line' />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>

              {/* Campos de retorno */}
              <Grid size={{ xs: 12 }}>
                <Typography variant='subtitle1' className='mb-2'>
                  Campos de Retorno ({tempParamReturns.length})
                </Typography>
                <Box className='flex gap-2 mb-2'>
                  <TextField
                    value={newParamReturn}
                    onChange={e => setNewParamReturn(e.target.value)}
                    placeholder='Campo da resposta'
                    size='small'
                    onKeyPress={e => e.key === 'Enter' && handleAddParamReturn()}
                  />
                  <Button size='small' onClick={handleAddParamReturn} disabled={!newParamReturn.trim()}>
                    Adicionar
                  </Button>
                </Box>
                {tempParamReturns.length > 0 && (
                  <Box className='flex flex-wrap gap-1'>
                    {tempParamReturns.map(name => (
                      <Chip key={name} label={name} size='small' onDelete={() => handleRemoveParamReturn(name)} />
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>

            <Divider className='my-4' />

            {/* Botões */}
            <Box className='flex justify-end gap-2'>
              <Button type='button' onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type='submit' variant='contained' disabled={!taskForm.formState.isValid}>
                {editingTask ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Box>
  )
}

export default StepCreateEndpoints
