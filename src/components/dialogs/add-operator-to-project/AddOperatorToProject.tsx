'use client'

import { useMemo } from 'react'

import { useForm, Controller } from 'react-hook-form'

// MUI
import {
  Box,
  CardContent,
  Dialog,
  DialogContent,
  IconButton,
  Button,
  DialogTitle,
  Typography,
  DialogActions
} from '@mui/material'

// API
import LoadingButton from '@mui/lab/LoadingButton'

import type { Project } from '@/api/endpoints/Projects/project'
import { useGetProjectsQuery } from '@/api/endpoints/Projects/project'
import SelectMultipleChip from '@/components/select_2/SelectMultiple'
import { useAddUserToProjectMutation } from '@/api/endpoints/operator/operator'

// Component

type AddOperatorToProjectProps = {
  open: boolean
  setOpen: (open: boolean) => void
  refetch: () => Promise<any>
  projectsOperator: any
  user_id: string
}

type FormValues = {
  projectIds: string[]
}

const AddOperatorToProject = ({ open, setOpen, projectsOperator, user_id }: AddOperatorToProjectProps) => {
  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const { data: projectsResponse } = useGetProjectsQuery()
  const [addUserToProject, { isLoading }] = useAddUserToProjectMutation()

  const projects: Project[] = useMemo(() => {
    if (!projectsResponse?.data) return []

    return projectsResponse.data.filter(project => {
      // Retorna true se o usuário NÃO estiver nesse projeto
      return !projectsOperator.some((op: any) => op.id === project.id)
    })
  }, [projectsResponse, projectsOperator])

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      projectIds: []
    }
  })

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await addUserToProject({
        project_ids: data.projectIds, // array de IDs dos projetos
        user_id: user_id // ID do usuário
      }).unwrap() // unwrap retorna diretamente o response ou lança o erro

      handleClose()
      console.log('Usuário adicionado com sucesso:', response)
    } catch (err: any) {
      console.error('Erro ao adicionar usuário:', err)
      alert(err.message || 'Erro desconhecido')
    }
  }

  return (
    <Dialog open={open} maxWidth='md' fullWidth>
      <Box className='absolute top-[1%] right-[5%] z-[999999999]'>
        <IconButton onClick={handleClose} className='fixed'>
          <i className='ri-close-line' />
        </IconButton>
      </Box>
      <DialogTitle variant='h4' className='flex flex-col gap-2 text-center'>
        Vincular Operador Ao Projeto
      </DialogTitle>
      <Typography component='span' className='flex flex-col text-center'>
        Selecione quais projetos deseja vincular o operador
      </Typography>
      <DialogContent className='overflow-visible relative'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          <CardContent>
            <Controller
              name='projectIds'
              control={control}
              render={({ field }) => (
                <SelectMultipleChip
                  label='Projetos'
                  options={projects.map(p => ({ id: String(p.id), name: p.name }))}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </CardContent>
          <DialogActions className='justify-center'>
            <LoadingButton variant='contained' type='submit' loading={isLoading}>
              Salvar
            </LoadingButton>
            <Button variant='outlined' type='button' color='error' onClick={handleClose}>
              Cancelar
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddOperatorToProject
