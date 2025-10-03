'use client'

import { useState, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import { Box, Chip, IconButton, InputAdornment, Tooltip } from '@mui/material'

import { useForm } from 'react-hook-form'

import CustomAvatar from '@/@core/components/mui/Avatar'
import { useUpdateProjectMutation, type GetProjectByIdResponse } from '@/api/endpoints/Projects/project'
import EditProjectDialog from '@/components/dialogs/edit-project/ProjectEditDialog'
import type { UIProject } from '../projects_register/StepCreateProject'

export interface ProjectFormData {
  name: string
  description: string
  img_url?: string
}

const ProjectDetailsHeader = ({ data }: { data: GetProjectByIdResponse | undefined }) => {
  const [expanded, setExpanded] = useState(false)

  /** Estados para o EditProjectDialog */
  const [editingProject, setEditingProject] = useState<UIProject | null>(null)
  const [editImageMode, setEditImageMode] = useState<'file' | 'url'>('file')
  const [editImageFile, setEditImageFile] = useState<File | null>(null)

  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation()

  const editForm = useForm<ProjectFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      img_url: ''
    }
  })

  /** Funções de controle do modal e formulário */
  const handleOpenEditModal = useCallback(() => {
    if (!data?.data) return
    setEditingProject(data.data)
    setEditImageMode('file')
    setEditImageFile(null)
    editForm.reset({
      name: data.data.name,
      description: data.data.description,
      img_url: data.data.img_url || ''
    })
    editForm.trigger() // garante que isValid seja atualizado
  }, [data, editForm])

  const handleCloseEditModal = useCallback(() => setEditingProject(null), [])

  const handleEditImageChange = useCallback((file: File | null) => {
    setEditImageFile(file)
  }, [])

  const handleEditImageModeChange = useCallback((_e: any, mode: 'file' | 'url') => {
    if (mode) setEditImageMode(mode)
  }, [])

  const handleEditSubmit = useCallback(
    async (data: ProjectFormData) => {
      if (!editingProject) return

      const payload: any = {
        id: editingProject.id,
        name: data.name,
        description: data.description
      }

      if (editImageMode === 'url') payload.img_url = data.img_url
      if (editImageMode === 'file') payload.img_file = editImageFile

      const result = await updateProject(payload)

      if ('error' in result) return alert('Erro ao atualizar projeto')
      setEditingProject(null)
    },
    [editingProject, editImageFile, editImageMode, updateProject]
  )

  return (
    <Card className='relative'>
      {/* Banner */}
      <CardMedia image='/images/pages/profile-banner.png' className='h-[250px] mb-4' />

      {/* Conteúdo principal */}
      <CardContent className='flex gap-6 justify-center flex-col md:flex-row md:items-start !pt-0'>
        {/* Avatar */}
        <div className='flex-shrink-0 sticky top-0 rounded-md -mt-[45px] bg-backgroundPaper w-[120px] h-[120px] overflow-hidden border-4 border-borderColor'>
          <img
            src={
              data?.data.img_url ||
              'https://tse1.mm.bing.net/th/id/OIP.1xUFTYynyjkgfmdEd-M7KwHaQB?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
            }
            className='w-full h-full object-cover'
            alt='Profile Background'
          />
        </div>

        {/* Bloco de texto */}
        <div className='flex flex-col w-full gap-4'>
          {/* Linha com título e botão */}
          <div className='flex justify-between items-center'>
            <Typography variant='h4' className='flex items-center gap-2'>
              {data?.data.name}
              <InputAdornment position='end'>
                <Tooltip
                  title={<div style={{ maxWidth: 200 }}>Clique Para Expandir A Descrição do Projeto</div>}
                  arrow
                  placement='top'
                >
                  <IconButton
                    size='small'
                    color='primary'
                    onClick={() => setExpanded(!expanded)}
                    sx={{
                      '&:hover, &:active': { backgroundColor: 'transparent', boxShadow: 'none' },
                      p: 0
                    }}
                  >
                    {expanded ? (
                      <i className='ri-subtract-line text-[20px] text-primary ' />
                    ) : (
                      <i className='ri-add-line text-[20px] text-current' />
                    )}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            </Typography>

            <Button variant='contained' className='flex gap-2 shrink-0' onClick={handleOpenEditModal}>
              <i className='ri-edit-line text-base'></i>
              <span>Editar</span>
            </Button>

            <EditProjectDialog
              editingProject={editingProject}
              editForm={editForm}
              editImageMode={editImageMode}
              editImageFile={editImageFile}
              isUpdating={isUpdating}
              handleEditImageChange={handleEditImageChange}
              handleEditImageModeChange={handleEditImageModeChange}
              handleCloseEditModal={handleCloseEditModal}
              handleEditSubmit={handleEditSubmit}
              isEditFormValid={!isUpdating} // só desabilita quando estiver atualizando
            />
          </div>

          {/* Collapse com descrição */}
          <Collapse in={expanded} timeout='auto' unmountOnExit>
            <Box className='pl-1'>
              <Typography variant='body1' className='leading-relaxed text-justify sm:pr-32'>
                {data?.data.description ?? 'Descrição padrão do projeto...  Descrição padrão do projeto...'}
              </Typography>
            </Box>
          </Collapse>

          {/* Status e Tokens */}
          <div className='flex items-center flex-wrap gap-6'>
            <Chip label='ATIVO' color='success' size='small' variant='tonal' />
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' color='primary' skin='light'>
                <i className='ri-briefcase-line' />
              </CustomAvatar>
              <Typography className='flex items-center justify-center gap-2'>
                Total de tokens <strong className='text-[25px]'>{data?.data.used_tokens ?? '0'}</strong>
              </Typography>
            </div>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' color='primary' skin='light'>
                <i className='ri-calendar-line' />
              </CustomAvatar>
              <Typography className='flex items-center justify-center gap-2'>
                Assistentes <strong className='text-[25px]'>{data?.data.assistants?.length ?? '0'}</strong>
              </Typography>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProjectDetailsHeader
