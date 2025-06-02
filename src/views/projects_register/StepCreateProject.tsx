// MUI Imports
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

import * as v from 'valibot'

// Type Imports
import { Controller, useForm } from 'react-hook-form'

import { valibotResolver } from '@hookform/resolvers/valibot'

import { FormLabel } from '@mui/material'

import DirectionalIcon from '@components/DirectionalIcon'

type Props = {
  activeStep: number
  handleNext: () => void
  handlePrev: () => void
  steps: { title: string; subtitle: string }[]
}

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

type ProjectSchemaType = v.InferInput<typeof ProjectSchema>

// Vars

const StepPersonalDetails = ({ activeStep, handleNext, steps }: Props) => {
  const {
    control: projectControl,
    handleSubmit: handleProjectSubmit,
    formState: { errors: projectErrors, isValid }
  } = useForm<ProjectSchemaType>({
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

  return (
    <form onSubmit={handleProjectSubmit(() => console.log('projeto submitado'))}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <FormLabel component='legend'>Informações para o projeto:</FormLabel>
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
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormLabel component='legend'>Informe caso seja um CNPJ diferente da conta de usuário:</FormLabel>
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
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormLabel component='legend'>Informe caso seja um e-mail diferente da conta de usuário:</FormLabel>
          <Controller
            name='email'
            control={projectControl}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Email do projeto'
                type='email'
                margin='normal'
                required
                variant='outlined'
                error={!!projectErrors.email}
                helperText={projectErrors.email?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormLabel component='legend'>Faça uma breve descrição para este projeto:</FormLabel>
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
        </Grid>

        <Grid size={{ xs: 12 }}>
          <div className='flex items-center justify-end'>
            <Button
              variant='contained'
              color={activeStep === steps.length - 1 ? 'success' : 'primary'}
              onClick={handleNext}
              type='submit'
              disabled={!isValid}
              endIcon={
                activeStep === steps.length - 1 ? (
                  <i className='ri-check-line' />
                ) : (
                  <DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />
                )
              }
            >
              {activeStep === steps.length - 1 ? 'Submit' : 'Cadastrar Projeto'}
            </Button>
          </div>
        </Grid>
      </Grid>
    </form>
  )
}

export default StepPersonalDetails
