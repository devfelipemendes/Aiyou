// file: src/components/EndpointsList.tsx
'use client'

import { useState } from 'react'

import { Box, Paper, Typography, Chip, IconButton, Tooltip, Collapse } from '@mui/material'

import type { Task } from '@/api/endpoints/task/task'

interface EndpointsListProps {
  tasks: Task[]
  apis: Array<{ id: string; name: string; url: string }>
  methods: Array<{ id: string; name: string }>
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const EndpointsList = ({ tasks, apis, methods, onEdit, onDelete }: EndpointsListProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)

      next.has(id) ? next.delete(id) : next.add(id)

      return next
    })
  }

  const getMethodColor = (methodName: string) => {
    const colors: Record<string, string> = {
      GET: 'info',
      POST: 'success',
      PUT: 'warning',
      PATCH: 'secondary',
      DELETE: 'error'
    }

    return colors[methodName.toUpperCase()] || 'default'
  }

  return (
    <Box className='space-y-3'>
      {tasks.map(task => {
        const api = apis.find(a => a.id === task.api_id)
        const method = methods.find(m => m.id === task.method_id)
        const isExpanded = expandedIds.has(task.id)
        const paramCount = task.pai_parameters?.length || 0
        const returnCount = task.returns?.length || 0

        return (
          <Paper key={task.id} className='p-4 hover:shadow-md transition-shadow'>
            <Box className='flex justify-between items-start mb-2'>
              <Box className='flex-1'>
                <Box className='flex items-center gap-2 mb-1'>
                  <Chip
                    label={method?.name.toUpperCase() || 'N/A'}
                    size='small'
                    color={getMethodColor(method?.name || '')}
                  />
                  <Typography variant='h6'>{task.name}</Typography>
                  {!task.active && <Chip label='Inativo' size='small' color='error' variant='outlined' />}
                </Box>
                <Typography variant='body2' color='text.secondary' className='mb-2'>
                  {task.description}
                </Typography>
                <Typography variant='caption' color='text.secondary' fontFamily='monospace' className='block'>
                  {task.endpoint}
                </Typography>
              </Box>

              <Box className='flex gap-1'>
                <Tooltip title={isExpanded ? 'Recolher' : 'Expandir detalhes'}>
                  <IconButton size='small' onClick={() => toggleExpand(task.id)}>
                    <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line`} />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Editar'>
                  <IconButton size='small' onClick={() => onEdit(task)}>
                    <i className='ri-edit-line' />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Excluir'>
                  <IconButton size='small' color='error' onClick={() => onDelete(task.id)}>
                    <i className='ri-delete-bin-line' />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Collapse in={isExpanded}>
              <Box className='mt-3 pt-3 border-t space-y-2'>
                <Box>
                  <Typography variant='subtitle2' className='mb-1'>
                    Instrução:
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {task.instruction}
                  </Typography>
                </Box>

                <Box className='flex gap-4'>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Parâmetros: <strong>{paramCount}</strong>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Retornos: <strong>{returnCount}</strong>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      API: <strong>{api?.name || 'N/A'}</strong>
                    </Typography>
                  </Box>
                </Box>

                {task.returns && task.returns.length > 0 && (
                  <Box>
                    <Typography variant='caption' className='block mb-1'>
                      Campos de retorno:
                    </Typography>
                    <Box className='flex flex-wrap gap-1'>
                      {task.returns.map(ret => (
                        <Chip key={ret.id} label={ret.name} size='small' variant='outlined' />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>
        )
      })}
    </Box>
  )
}

export default EndpointsList
