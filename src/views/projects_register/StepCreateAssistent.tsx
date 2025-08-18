// MUI Imports
import { useState, useCallback, useMemo } from 'react'

import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import * as v from 'valibot'

import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

interface Assistant {
  id: string
  name: string
  client_id: string
  status: 'pending' | 'success' | 'error'
}

interface Project {
  id: string
  name: string
}

const mockProjects: Project[] = [
  { id: '9f0354a0-c009-4693-a227-b98daf6bbb68', name: 'Project Teste 1' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'Project Teste 2' },
  { id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', name: 'Project Teste 3' }
]

type AssistantFormData = v.InferInput<typeof AssistantSchema>

const AssistantSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Nome do assistente é obrigatório')),
  client_id: v.pipe(v.string(), v.minLength(1, 'Projeto é obrigatório'))
})

export default function StepCreateAssistent() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false)
  const [isSubmittingAssistant, setIsSubmittingAssistant] = useState(false)

  const assistantForm = useForm<AssistantFormData>({
    resolver: valibotResolver(AssistantSchema),
    defaultValues: {
      name: '',
      client_id: ''
    },
    mode: 'onChange'
  })

  const projectName = useMemo(() => {
    return (clientId: string) => mockProjects.find(project => project.id === clientId)?.name || 'Projeto desconhecido'
  }, [])

  const assistantStats = useMemo(() => {
    const total = assistants.length
    const success = assistants.filter(a => a.status === 'success').length
    const errors = assistants.filter(a => a.status === 'error').length

    return { total, success, errors }
  }, [assistants])

  const handleToggleAssistantForm = useCallback(() => {
    setIsCreatingAssistant(prev => {
      if (prev) {
        assistantForm.reset()
      }

      return !prev
    })
  }, [assistantForm])

  const handleAssistantSubmit = useCallback(
    async (data: AssistantFormData) => {
      setIsSubmittingAssistant(true)

      try {
        // Simular API call
        const response = await fetch('/api/assistants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name, client_id: data.client_id })
        })

        const newAssistant: Assistant = {
          id: `assistant_${Date.now()}`,
          name: data.name,
          client_id: data.client_id,
          status: response.ok ? 'success' : 'error'
        }

        setAssistants(prev => [...prev, newAssistant])

        if (response.ok) {
          assistantForm.reset()
          setIsCreatingAssistant(false)
        }
      } catch (error) {
        const errorAssistant: Assistant = {
          id: `assistant_${Date.now()}`,
          name: data.name,
          client_id: data.client_id,
          status: 'error'
        }

        setAssistants(prev => [...prev, errorAssistant])
      } finally {
        setIsSubmittingAssistant(false)
      }
    },
    [assistantForm]
  )

  const handleRemoveAssistant = useCallback((id: string) => {
    setAssistants(prev => prev.filter(assistant => assistant.id !== id))
  }, [])

  return (
    <Card>
      <CardContent>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
          <Typography variant='h5'>Assistentes do Projeto</Typography>
          {assistantStats.total > 0 && (
            <Box display='flex' gap={1}>
              <Chip label={`${assistantStats.success} criados`} color='success' size='small' />
              {assistantStats.errors > 0 && (
                <Chip label={`${assistantStats.errors} com erro`} color='error' size='small' />
              )}
            </Box>
          )}
        </Box>

        <Collapse in={assistants.length > 0}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {assistants.map(assistant => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={assistant.id}>
                <Card variant='outlined' sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display='flex' justifyContent='space-between' alignItems='flex-start' mb={1}>
                      <Typography variant='subtitle1' component='div' noWrap>
                        {assistant.name}
                      </Typography>
                      <Chip
                        size='small'
                        label={assistant.status === 'success' ? 'Criado' : 'Erro'}
                        color={assistant.status === 'success' ? 'success' : 'error'}
                        onDelete={() => handleRemoveAssistant(assistant.id)}
                      />
                    </Box>
                    <Typography variant='body2' color='text.secondary' noWrap>
                      {projectName(assistant.client_id)}
                    </Typography>
                    {assistant.status === 'error' && (
                      <Alert severity='error' sx={{ mt: 1 }}>
                        Falha na criação
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Collapse>

        {!isCreatingAssistant && (
          <Button
            variant='outlined'
            color='primary'
            onClick={handleToggleAssistantForm}
            disabled={isSubmittingAssistant}
            startIcon={<i className='ri-add-line' />}
            fullWidth
          >
            Adicionar Assistente
          </Button>
        )}

        <Collapse in={isCreatingAssistant}>
          <Box sx={{ mt: 3, p: 3, borderRadius: 1 }}>
            <Typography variant='h6' gutterBottom>
              Novo Assistente
            </Typography>

            <form onSubmit={assistantForm.handleSubmit(handleAssistantSubmit)}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name='name'
                    control={assistantForm.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Nome do Assistente'
                        required
                        variant='outlined'
                        disabled={isSubmittingAssistant}
                        error={!!assistantForm.formState.errors.name}
                        helperText={assistantForm.formState.errors.name?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name='client_id'
                    control={assistantForm.control}
                    render={({ field }) => (
                      <FormControl fullWidth required error={!!assistantForm.formState.errors.client_id}>
                        <InputLabel>Projeto</InputLabel>
                        <Select {...field} label='Projeto' disabled={isSubmittingAssistant}>
                          {mockProjects.map(project => (
                            <MenuItem key={project.id} value={project.id}>
                              {project.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {assistantForm.formState.errors.client_id && (
                          <FormHelperText>{assistantForm.formState.errors.client_id.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }} />
                  <Box display='flex' justifyContent='space-between' gap={2}>
                    <Button
                      variant='outlined'
                      onClick={handleToggleAssistantForm}
                      disabled={isSubmittingAssistant}
                      fullWidth
                    >
                      Cancelar
                    </Button>

                    <Button
                      type='submit'
                      variant='contained'
                      color='success'
                      disabled={!assistantForm.formState.isValid || isSubmittingAssistant}
                      startIcon={
                        isSubmittingAssistant ? <CircularProgress size={16} /> : <i className='ri-check-line' />
                      }
                      fullWidth
                    >
                      {isSubmittingAssistant ? 'Criando...' : 'Criar Assistente'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  )
}
