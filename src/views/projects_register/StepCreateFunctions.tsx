// React Imports
import { useState, useCallback, useMemo } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Collapse from '@mui/material/Collapse'
import Alert from '@mui/material/Alert'
import Modal from '@mui/material/Modal'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Badge from '@mui/material/Badge'
import * as v from 'valibot'

// Form Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'

// Types & Interfaces
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

type Props = {
  activeStep: number
  handleNext: () => void
  handlePrev: () => void
  steps: { title: string; subtitle: string }[]
}

// Validation Schemas
const ParameterSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Nome do parâmetro é obrigatório')),
  description: v.optional(v.string()),
  type: v.picklist(['String', 'Number', 'Boolean', 'Array', 'Object']),
  required: v.boolean(),
  in_api: v.boolean(),
  is_header: v.boolean(),
  is_subparameter: v.boolean(),
  example_value: v.optional(v.string())
})

const FunctionSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Nome da função é obrigatório')),
  description: v.optional(v.string()),
  endpoint: v.pipe(v.string(), v.minLength(1, 'Endpoint é obrigatório'), v.url('Endpoint deve ser uma URL válida')),
  method: v.picklist(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  return_message: v.optional(v.string()),
  active: v.boolean(),
  working: v.boolean(),
  paramReturns: v.array(v.string())
})

type ParameterFormData = v.InferInput<typeof ParameterSchema>
type FunctionFormData = v.InferInput<typeof FunctionSchema>

// Modal Style
const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 900,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: '85vh',
  overflow: 'auto'
}

const StepCreateFunction = ({ activeStep, handleNext, handlePrev, steps }: Props) => {
  // State
  const [functions, setFunctions] = useState<ApiFunction[]>([])
  const [tempParameters, setTempParameters] = useState<Parameter[]>([])
  const [isAddingParameter, setIsAddingParameter] = useState(false)
  const [jsonPreviewOpen, setJsonPreviewOpen] = useState(false)
  const [previewFunctionIndex, setPreviewFunctionIndex] = useState<number | null>(null)

  // Function Form
  const functionForm = useForm<FunctionFormData>({
    resolver: valibotResolver(FunctionSchema),
    defaultValues: {
      name: '',
      description: '',
      endpoint: '',
      method: 'POST',
      return_message: '',
      active: true,
      working: true,
      paramReturns: []
    },
    mode: 'onChange'
  })

  // Parameter Form
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
      example_value: ''
    },
    mode: 'onChange'
  })

  // Watch current form values for preview
  const watchedFunction = functionForm.watch()

  // Generate JSON Body Preview
  const generateJsonBody = useCallback((func: Partial<FunctionFormData> | ApiFunction, parameters?: Parameter[]) => {
    const params = parameters || (func as ApiFunction).parameters || []
    const bodyParams = params.filter(param => param.in_api && !param.is_header)
    const headerParams = params.filter(param => param.is_header)

    const body: any = {}
    const headers: any = {}

    // Build body object
    bodyParams.forEach(param => {
      let value: any

      if (param.example_value) {
        switch (param.type) {
          case 'Number':
            value = isNaN(Number(param.example_value)) ? 0 : Number(param.example_value)
            break
          case 'Boolean':
            value = param.example_value.toLowerCase() === 'true'
            break
          case 'Array':
            try {
              value = JSON.parse(param.example_value)
            } catch {
              value = [param.example_value]
            }

            break
          case 'Object':
            try {
              value = JSON.parse(param.example_value)
            } catch {
              value = { value: param.example_value }
            }

            break
          default:
            value = param.example_value
        }
      } else {
        switch (param.type) {
          case 'Number':
            value = 0
            break
          case 'Boolean':
            value = true
            break
          case 'Array':
            value = []
            break
          case 'Object':
            value = {}
            break
          default:
            value = `exemplo_${param.name}`
        }
      }

      body[param.name] = value
    })

    // Build headers object
    headerParams.forEach(param => {
      headers[param.name] = param.example_value || 'valor_exemplo'
    })

    return {
      endpoint: func.endpoint || '',
      method: func.method || 'POST',
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      body: Object.keys(body).length > 0 ? body : undefined,
      paramReturns: func.paramReturns || []
    }
  }, [])

  // Current form JSON preview with temp parameters
  const currentJsonPreview = useMemo(() => {
    return generateJsonBody(watchedFunction, tempParameters)
  }, [watchedFunction, tempParameters, generateJsonBody])

  // Statistics
  const stats = useMemo(() => {
    const totalFunctions = functions.length
    const totalSavedParams = functions.reduce((acc, f) => acc + f.parameters.length, 0)
    const tempBodyParams = tempParameters.filter(p => p.in_api && !p.is_header).length
    const tempHeaderParams = tempParameters.filter(p => p.is_header).length

    return {
      totalFunctions,
      totalSavedParams,
      tempParameters: tempParameters.length,
      tempBodyParams,
      tempHeaderParams
    }
  }, [functions, tempParameters])

  // Handlers
  const handleAddParameter = useCallback(
    (data: ParameterFormData) => {
      const newParameter: Parameter = {
        id: `param_${Date.now()}_${Math.random()}`,
        name: data.name,
        description: data.description || '',
        type: data.type,
        required: data.required,
        in_api: data.in_api,
        is_header: data.is_header,
        is_subparameter: data.is_subparameter,
        example_value: data.example_value || ''
      }

      setTempParameters(prev => [...prev, newParameter])
      parameterForm.reset()
    },
    [parameterForm]
  )

  const handleRemoveTempParameter = useCallback((id: string) => {
    setTempParameters(prev => prev.filter(param => param.id !== id))
  }, [])

  const handleClearAllParameters = useCallback(() => {
    setTempParameters([])
    setIsAddingParameter(false)
  }, [])

  const handleAddFunction = useCallback(
    (data: FunctionFormData) => {
      if (tempParameters.length === 0) {
        alert('Adicione pelo menos um parâmetro antes de salvar a API')

        return
      }

      const newFunction: ApiFunction = {
        ...data,
        method_id: `method_${Date.now()}`,
        api_id: `api_${Date.now()}`,
        parameters: tempParameters,
        paramReturns: data.paramReturns || []
      }

      setFunctions(prev => [...prev, newFunction])
      functionForm.reset()
      setTempParameters([])
      setIsAddingParameter(false)
    },
    [functionForm, tempParameters]
  )

  const handleRemoveFunction = useCallback((index: number) => {
    setFunctions(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handlePreviewJson = useCallback((index?: number) => {
    setPreviewFunctionIndex(index ?? null)
    setJsonPreviewOpen(true)
  }, [])

  const handleFinalSubmit = useCallback(() => {
    const finalData = {
      functions: functions,
      totalFunctions: functions.length,
      totalParameters: functions.reduce((acc, f) => acc + f.parameters.length, 0)
    }

    console.log('Dados finais para envio:', finalData)
    handleNext()
  }, [functions, handleNext])

  const JsonPreview = ({ jsonData }: { jsonData: any }) => (
    <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
      <pre
        style={{
          margin: 0,
          fontSize: '14px',
          lineHeight: '1.4',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {JSON.stringify(jsonData, null, 2)}
      </pre>
    </Paper>
  )

  return (
    <Box sx={{ mx: 'auto' }}>
      {/* Statistics */}
      <Alert severity='info' sx={{ mb: 3 }}>
        <Typography variant='body2'>
          <strong>{stats.totalFunctions}</strong> API(s) configurada(s) •<strong> {stats.totalSavedParams}</strong>{' '}
          parâmetros salvos •<strong> {stats.tempParameters}</strong> parâmetros temporários
          {stats.tempParameters > 0 && (
            <>
              {' '}
              • <strong>{stats.tempBodyParams}</strong> no body • <strong>{stats.tempHeaderParams}</strong> headers
            </>
          )}
        </Typography>
      </Alert>

      {/* Functions List */}
      <Collapse in={functions.length > 0}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography variant='h6'>APIs Configuradas ({functions.length})</Typography>
              <Button
                variant='outlined'
                size='small'
                onClick={() => handlePreviewJson()}
                startIcon={<i className='ri-eye-line' />}
                disabled={functions.length === 0}
              >
                Ver Todas as APIs
              </Button>
            </Box>

            <Grid container spacing={2}>
              {functions.map((func, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={func.method_id}>
                  <Card variant='outlined'>
                    <CardContent>
                      <Box display='flex' justifyContent='space-between' alignItems='flex-start' mb={1}>
                        <Typography variant='subtitle1' component='div'>
                          {func.name}
                        </Typography>
                        <Box display='flex' gap={1}>
                          <Chip size='small' label={func.method} color='primary' />
                          <IconButton size='small' onClick={() => handlePreviewJson(index)}>
                            <i className='ri-eye-line' />
                          </IconButton>
                          <IconButton size='small' onClick={() => handleRemoveFunction(index)}>
                            <i className='ri-delete-bin-line' />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant='body2' color='text.secondary' noWrap>
                        {func.endpoint}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {func.parameters.length} parâmetros • {func.parameters.filter(p => p.is_header).length} headers
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Collapse>

      {/* Function Form */}
      <Card>
        <CardContent>
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
            <Typography variant='h5'>Configurar Nova API</Typography>
            <Box display='flex' gap={2}>
              <Badge badgeContent={tempParameters.length} color='primary'>
                <Button
                  variant='outlined'
                  onClick={() => handlePreviewJson()}
                  startIcon={<i className='ri-code-line' />}
                  disabled={!watchedFunction.name || !watchedFunction.endpoint}
                >
                  Preview JSON
                </Button>
              </Badge>
              {tempParameters.length > 0 && (
                <Button
                  variant='outlined'
                  color='error'
                  onClick={handleClearAllParameters}
                  startIcon={<i className='ri-delete-bin-line' />}
                >
                  Limpar Parâmetros
                </Button>
              )}
            </Box>
          </Box>

          <form onSubmit={functionForm.handleSubmit(handleAddFunction)}>
            <Grid container spacing={3}>
              {/* Basic API Info */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Controller
                  name='name'
                  control={functionForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Nome da API'
                      required
                      variant='outlined'
                      placeholder='Ex: Buscar Cliente, Criar Pedido, Consultar Status'
                      error={!!functionForm.formState.errors.name}
                      helperText={functionForm.formState.errors.name?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name='method'
                  control={functionForm.control}
                  render={({ field }) => (
                    <FormControl fullWidth required>
                      <InputLabel>Método HTTP</InputLabel>
                      <Select {...field} label='Método HTTP'>
                        <MenuItem value='GET'>GET</MenuItem>
                        <MenuItem value='POST'>POST</MenuItem>
                        <MenuItem value='PUT'>PUT</MenuItem>
                        <MenuItem value='DELETE'>DELETE</MenuItem>
                        <MenuItem value='PATCH'>PATCH</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name='endpoint'
                  control={functionForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='URL do Endpoint'
                      required
                      variant='outlined'
                      placeholder='https://api.minhaempresa.com/v1/clientes'
                      error={!!functionForm.formState.errors.endpoint}
                      helperText={functionForm.formState.errors.endpoint?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name='description'
                  control={functionForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Descrição da API'
                      multiline
                      rows={2}
                      variant='outlined'
                      placeholder='Descreva o que esta API faz e quando deve ser usada...'
                    />
                  )}
                />
              </Grid>

              {/* Parameters Section */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                  <Typography variant='h6'>Parâmetros da API ({tempParameters.length})</Typography>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => setIsAddingParameter(!isAddingParameter)}
                    startIcon={<i className={isAddingParameter ? 'ri-close-line' : 'ri-add-line'} />}
                  >
                    {isAddingParameter ? 'Cancelar' : 'Adicionar Parâmetro'}
                  </Button>
                </Box>

                {/* Add Parameter Form */}
                <Collapse in={isAddingParameter}>
                  <Card variant='outlined' sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
                    <Typography variant='h6' gutterBottom>
                      Novo Parâmetro
                    </Typography>

                    <Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Controller
                            name='name'
                            control={parameterForm.control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label='Nome do Parâmetro'
                                required
                                placeholder='Ex: cliente_id, email'
                                error={!!parameterForm.formState.errors.name}
                                helperText={parameterForm.formState.errors.name?.message}
                              />
                            )}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                          <Controller
                            name='type'
                            control={parameterForm.control}
                            render={({ field }) => (
                              <FormControl fullWidth required>
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

                        <Grid size={{ xs: 12, md: 5 }}>
                          <Controller
                            name='example_value'
                            control={parameterForm.control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label='Valor de Exemplo'
                                placeholder='Ex: 12345, exemplo@email.com'
                              />
                            )}
                          />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <Controller
                            name='description'
                            control={parameterForm.control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label='Descrição do Parâmetro'
                                placeholder='Para que serve este parâmetro?'
                              />
                            )}
                          />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <Box display='flex' flexWrap='wrap' gap={3}>
                            <Controller
                              name='required'
                              control={parameterForm.control}
                              render={({ field }) => (
                                <FormControlLabel
                                  control={<Switch {...field} checked={field.value} />}
                                  label='Obrigatório'
                                />
                              )}
                            />
                            <Controller
                              name='is_header'
                              control={parameterForm.control}
                              render={({ field }) => (
                                <FormControlLabel
                                  control={<Switch {...field} checked={field.value} />}
                                  label='Header'
                                />
                              )}
                            />
                            <Controller
                              name='in_api'
                              control={parameterForm.control}
                              render={({ field }) => (
                                <FormControlLabel control={<Switch {...field} checked={field.value} />} label='Body' />
                              )}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <Button
                            onClick={parameterForm.handleSubmit(handleAddParameter)}
                            variant='contained'
                            disabled={!parameterForm.formState.isValid}
                            startIcon={<i className='ri-add-circle-line' />}
                            fullWidth
                            size='large'
                          >
                            Adicionar Parâmetro à Lista
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </Card>
                </Collapse>

                {/* Parameters Table */}
                {tempParameters.length > 0 && (
                  <TableContainer component={Paper} sx={{ mb: 3 }}>
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
                            <strong>Valor Exemplo</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Configurações</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Ações</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tempParameters.map(param => (
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
                              <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                                {param.example_value || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box display='flex' gap={0.5} flexWrap='wrap'>
                                {param.required && <Chip size='small' label='Obrigatório' color='error' />}
                                {param.is_header && <Chip size='small' label='Header' color='info' />}
                                {!param.in_api && <Chip size='small' label='Não incluso' color='warning' />}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size='small'
                                onClick={() => handleRemoveTempParameter(param.id)}
                                color='error'
                              >
                                <i className='ri-delete-bin-line' />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Grid>

              {/* Advanced Settings */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant='h6' gutterBottom>
                  Configurações Avançadas
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name='return_message'
                      control={functionForm.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Mensagem de Retorno Personalizada'
                          placeholder='Operação realizada com sucesso'
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name='paramReturns'
                      control={functionForm.control}
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
                          label='Parâmetros de Retorno'
                          placeholder='id, status, message'
                          helperText='Separados por vírgula'
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Box display='flex' gap={3} sx={{ mt: 2 }}>
                  <Controller
                    name='active'
                    control={functionForm.control}
                    render={({ field }) => (
                      <FormControlLabel control={<Switch {...field} checked={field.value} />} label='API Ativa' />
                    )}
                  />
                  <Controller
                    name='working'
                    control={functionForm.control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label='Em Funcionamento'
                      />
                    )}
                  />
                </Box>
              </Grid>

              {/* Form Actions */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
                  disabled={!functionForm.formState.isValid || tempParameters.length === 0}
                  startIcon={<i className='ri-save-line' />}
                  fullWidth
                  size='large'
                >
                  Salvar API com {tempParameters.length} Parâmetro(s)
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* JSON Preview Modal */}
      <Modal open={jsonPreviewOpen} onClose={() => setJsonPreviewOpen(false)}>
        <Box sx={modalStyle}>
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
            <Typography variant='h5'>
              {previewFunctionIndex !== null
                ? `Preview - ${functions[previewFunctionIndex]?.name}`
                : 'Preview JSON da API'}
            </Typography>
            <IconButton onClick={() => setJsonPreviewOpen(false)}>
              <i className='ri-close-line' />
            </IconButton>
          </Box>

          {previewFunctionIndex !== null ? (
            <JsonPreview jsonData={generateJsonBody(functions[previewFunctionIndex])} />
          ) : functions.length > 0 ? (
            <Box>
              {functions.map(func => (
                <Box key={func.method_id} sx={{ mb: 3 }}>
                  <Typography variant='h6' gutterBottom>
                    {func.name} ({func.method})
                  </Typography>
                  <JsonPreview jsonData={generateJsonBody(func)} />
                </Box>
              ))}
            </Box>
          ) : (
            <Box>
              <Typography variant='h6' gutterBottom>
                Preview da API Atual ({tempParameters.length} parâmetros)
              </Typography>
              <JsonPreview jsonData={currentJsonPreview} />

              {tempParameters.length === 0 && (
                <Alert severity='warning' sx={{ mt: 2 }}>
                  Adicione parâmetros para ver o JSON completo
                </Alert>
              )}
            </Box>
          )}

          <Box display='flex' justifyContent='flex-end' sx={{ mt: 3 }}>
            <Button variant='outlined' onClick={() => setJsonPreviewOpen(false)}>
              Fechar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Navigation */}
      <Box sx={{ mt: 4 }}>
        <Grid container>
          <Grid size={{ xs: 12 }}>
            <Box display='flex' justifyContent='space-between' alignItems='center'>
              <Button
                variant='outlined'
                color='secondary'
                disabled={activeStep === 0}
                onClick={handlePrev}
                startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
              >
                Anterior
              </Button>
              <Button
                variant='contained'
                color={activeStep === steps.length - 1 ? 'success' : 'primary'}
                onClick={handleFinalSubmit}
                disabled={functions.length === 0}
                endIcon={
                  activeStep === steps.length - 1 ? (
                    <i className='ri-check-line' />
                  ) : (
                    <DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />
                  )
                }
              >
                {activeStep === steps.length - 1 ? 'Finalizar Cadastro' : 'Próxima Etapa'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default StepCreateFunction
