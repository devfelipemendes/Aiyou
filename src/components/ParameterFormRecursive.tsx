import { useState } from 'react'

import { Box, Typography, IconButton, Button, Chip, Collapse, Tooltip } from '@mui/material'

import { ChevronDown, ChevronUp } from 'lucide-react'

import type { TempParameter } from '@/views/projects_register/StepCreateEndpoints'

type Props = {
  parameters: TempParameter[]
  onAdd: (parentId?: string) => void
  onRemove: (id: string, parentId?: string) => void
}

const ParameterFormRecursive = ({ parameters, onAdd, onRemove }: Props) => {
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({})

  const toggleNode = (id: string) => {
    setOpenNodes(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <Box className='space-y-2'>
      {parameters.map((param, index) => {
        console.log(`🔄 Renderizando param [${index}] do nível`, param.name, param)

        return (
          <Box key={param.id} className='p-2'>
            <Box className='flex gap-2 items-center'>
              <Box className='flex gap-2 items-center'>
                {/* Botão de expandir/fechar se tiver filhos */}
                {param.data && param.data.length > 0 && (
                  <IconButton size='small' onClick={() => toggleNode(param.id)}>
                    {openNodes[param.id] ? <ChevronUp /> : <ChevronDown />}
                  </IconButton>
                )}

                <Typography variant='body2' fontWeight={500}>
                  {param.name}
                </Typography>

                <Chip label={param.type} size='small' />
                {param.required && <Chip label='Obrigatório' size='small' color='warning' />}
                {param.is_header && <Chip label='Header' size='small' color='secondary' />}
              </Box>

              <Box className='flex gap-1'>
                <Tooltip title={`Adicionar um sub-parametro em: ${param.name} `}>
                  <Button size='small' variant='contained' onClick={() => onAdd(param.id)}>
                    <i className='ri-add-fill' />
                  </Button>
                </Tooltip>
                <IconButton size='small' color='error' onClick={() => onRemove(param.id)}>
                  <i className='ri-delete-line' />
                </IconButton>
              </Box>
            </Box>

            {/* Descrição */}

            <Typography variant='caption' color='text.secondary' className='ml-8'>
              Descrição: {param.description}
            </Typography>

            {/* Renderização recursiva dos filhos */}
            {param.data && param.data.length > 0 && (
              <Collapse in={openNodes[param.id]} timeout='auto' unmountOnExit>
                <Box className='ml-6 mt-2 border-l pl-3 space-y-2'>
                  <ParameterFormRecursive
                    parameters={param.data}
                    onAdd={(childParentId?: string) => onAdd(childParentId || param.id)}
                    onRemove={(childId: string) => onRemove(childId, param.id)}
                  />
                </Box>
              </Collapse>
            )}
          </Box>
        )
      })}
    </Box>
  )
}

export default ParameterFormRecursive
