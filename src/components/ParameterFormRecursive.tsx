import { useState } from 'react'

import { Box, Typography, IconButton, Chip, Collapse, Tooltip } from '@mui/material'

import { ChevronDown, ChevronUp } from 'lucide-react'

import type { TempParameter } from '@/views/projects_register/StepCreateEndpoints'

type Props = {
  parameters: TempParameter[]
  onAdd: (parentId?: string, e?: any) => void
  onRemove: (id: string, parentId?: string) => void
  haveChildren?: boolean
}

const ParameterFormRecursive = ({ parameters, onAdd, onRemove, haveChildren }: Props) => {
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({})

  const toggleNode = (id: string) => {
    setOpenNodes(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <Box className='space-y-2 '>
      {parameters.map((param, index) => {
        console.log(`🔄 Renderizando param [${index}] do nível`, param.name, param)

        return (
          <Box key={param.id} className='hover:bg-primaryLight p-2 shadow-sm transition-all '>
            <Box className='flex gap-2 items-center  justify-between'>
              <Box className='flex gap-2 flex-col'>
                {/* Botão de expandir/fechar se tiver filhos */}
                <Box className='gap-2'>
                  <Chip label={param.type} size='small' />
                  {param.required && <Chip label='Obrigatório' size='small' color='warning' />}
                  {param.is_header && <Chip label='Header' size='small' color='secondary' className='text-primary' />}
                </Box>
                <Box className='flex  items-center'>
                  {param.data && param.data.length > 0 && (
                    <IconButton size='small' onClick={() => toggleNode(param.id)}>
                      {openNodes[param.id] ? <ChevronUp /> : <ChevronDown />}
                    </IconButton>
                  )}
                  <Typography variant='body2' fontWeight={500} className='text-primary'>
                    Nome: {param.name}
                  </Typography>
                </Box>
              </Box>

              <Box className='flex gap-1'>
                {haveChildren && (
                  <Tooltip title={`Adicionar um sub-parametro em: ${param.name} `}>
                    <IconButton size='small' onClick={(e: any) => onAdd(param.id, e)} className='bg-primary text-white'>
                      <i className='ri-add-fill' />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={`Remover o parâmetro: ${param.name}`}>
                  <IconButton size='small' className='bg-red-500 text-white' onClick={() => onRemove(param.id)}>
                    <i className='ri-delete-bin-2-line' />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Descrição */}

            <Typography variant='caption' color='text.secondary' className=''>
              Descrição: {param.description}
            </Typography>

            {/* Renderização recursiva dos filhos */}
            {param.data && param.data.length > 0 && (
              <Collapse in={openNodes[param.id]} timeout='auto' unmountOnExit>
                <Box className='ml-6 mt-2 border-l pl-3 space-y-2'>
                  <ParameterFormRecursive
                    parameters={param.data}
                    onAdd={(childParentId?: string, e?: any) => onAdd(childParentId || param.id, e)}
                    onRemove={(childId: string) => onRemove(childId, param.id)}
                    haveChildren={haveChildren}
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
