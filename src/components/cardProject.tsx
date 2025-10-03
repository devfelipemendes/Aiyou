import React from 'react'

import { useRouter } from 'next/navigation'

import { useTheme, Avatar, Typography, Chip, Alert, IconButton, Tooltip } from '@mui/material'

import type { UIProject } from '@/views/projects_register/StepCreateProject'

// CSS para scrollbar customizado
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
  
  [data-mui-color-scheme="dark"] .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  [data-mui-color-scheme="dark"] .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`

interface ProjectCardProps {
  project: UIProject
  onEdit: (project: UIProject) => void
  onRemove: (id: string) => void
  isUpdating?: boolean
  height?: number
  backgroundImage?: string
  backgroundColor?: string
  showEye?: boolean
}

export default function ProjectCard({
  project,
  onEdit,
  onRemove,
  isUpdating = false,
  height = 400,
  backgroundImage,
  backgroundColor = '#028175',
  showEye = false
}: ProjectCardProps) {
  const theme = useTheme()

  // Calcular posições e tamanhos
  const topSectionHeight = height * 0.4 // 40%
  const bottomSectionHeight = height * 0.6 // 60%
  const avatarOffsetFromCenter = 10 // 10px abaixo do centro
  const centerPosition = topSectionHeight - avatarOffsetFromCenter

  // Avatar responsivo
  const avatarSize = Math.max(120, height * 0.2)
  const navigate = useRouter()

  const redirectViewProject = (idProject: string) => {
    navigate.push(`/projetoss/detalhes_projeto?id=${idProject}`)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />

      <div
        className='relative w-full rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl'
        style={{ height: `${height}px` }}
      >
        {/* Seção superior - 40% */}
        <div
          className='absolute top-0 left-0 w-full'
          style={{
            height: `${topSectionHeight}px`,
            backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Seção inferior - 60% */}
        <div
          className='absolute bottom-0 left-0 w-full p-4 flex flex-col'
          style={{
            height: `${bottomSectionHeight}px`,
            backgroundColor: theme.palette.background.paper
          }}
        >
          <div
            className='mt-12 flex-1 overflow-y-auto flex flex-col justify-center pr-2 custom-scrollbar'
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: `${theme.palette.text.secondary} transparent`
            }}
          >
            {/* Título e Status */}
            <div className='text-center mb-3'>
              <Typography
                variant='h6'
                component='h3'
                className='font-semibold mb-2 line-clamp-1'
                style={{ color: theme.palette.text.primary }}
              >
                {project.name}
              </Typography>

              <Chip
                size='small'
                label={project.status === 'success' ? 'Ativo' : 'Erro'}
                color={project.status === 'success' ? 'success' : 'error'}
              />
            </div>

            {/* Descrição */}
            <Typography
              variant='body2'
              className='text-center mb-3'
              style={{
                color: theme.palette.text.secondary,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {project.description || 'Sem descrição'}
            </Typography>

            {/* Data de atualização */}
            {project.updated_at && (
              <Typography variant='caption' className='text-center' style={{ color: theme.palette.text.secondary }}>
                Atualizado: {new Date(project.updated_at).toLocaleDateString('pt-BR')}
              </Typography>
            )}

            {/* Alert de erro */}
            {project.status === 'error' && (
              <Alert severity='error' className='mt-2'>
                Falha na criação/atualização
              </Alert>
            )}
          </div>

          {/* Actions */}
          <div
            className='flex justify-center gap-2 mt-4 flex-shrink-0 border-t pt-3'
            style={{ borderColor: theme.palette.divider }}
          >
            <Tooltip title='Editar projeto'>
              <IconButton
                onClick={e => {
                  e.stopPropagation()
                  onEdit(project)
                }}
                disabled={isUpdating}
                color='primary'
                size='small'
              >
                <i className='ri-edit-line' />
              </IconButton>
            </Tooltip>

            {/* <OpenDialogOnElementClick
                element={IconButton}
                elementProps={{
                  color: 'primary',
                  size: 'small',
                  children: <i className='ri-edit-line' />
                }}
                dialog={EditProjectDialog}
                dialogProps={{ project: project }}
              /> */}

            <Tooltip title='Remover projeto'>
              <IconButton
                onClick={e => {
                  e.stopPropagation()
                  onRemove(project.id)
                }}
                color='error'
                size='small'
              >
                <i className='ri-delete-bin-line' />
              </IconButton>
            </Tooltip>

            {showEye && (
              <Tooltip title='Visualizar Projeto'>
                <IconButton onClick={() => redirectViewProject(project.id)} color='info' size='small'>
                  <i className='ri-eye-line' />
                </IconButton>
              </Tooltip>
            )}

            {project.img_url && (
              <Tooltip title='Ver imagem'>
                <IconButton
                  onClick={e => {
                    e.stopPropagation()
                    window.open(project.img_url!, '_blank')
                  }}
                  color='default'
                  size='small'
                >
                  <i className='ri-external-link-line' />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Avatar */}
        <div
          className='absolute left-1/2 z-10 transform -translate-x-1/2 -translate-y-1/2'
          style={{
            top: `${centerPosition}px`,
            width: `${avatarSize}px`,
            height: `${avatarSize}px`
          }}
        >
          <Avatar
            src={project.img_url || (project.imageFile ? URL.createObjectURL(project.imageFile) : undefined)}
            className='w-full h-full shadow-lg border-4 border-white'
            style={{
              fontSize: `${avatarSize * 0.4}px`,
              backgroundColor: theme.palette.primary.main
            }}
          >
            {project.name.charAt(0).toUpperCase()}
          </Avatar>
        </div>
      </div>
    </>
  )
}
