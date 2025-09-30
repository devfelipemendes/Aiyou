'use client'

import { useState, useMemo } from 'react'

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Pagination,
  Typography,
  CircularProgress
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

import { useGetTasksQuery } from '@/api/endpoints/task/task'
import { useGetMethodsQuery } from '@/api/endpoints/method/method'
import type { GetTaskAssistantResponse, useGetTasksByAssistantQuery } from '@/api/endpoints/taskAssistant/taskAssistant'
import { useCreateTaskAssistantMutation } from '@/api/endpoints/taskAssistant/taskAssistant'

type CreatePhoneProps = {
  open: boolean
  setOpen: (open: boolean) => void
  assistant_id: string
  tasksDataAssistant: GetTaskAssistantResponse | undefined
  refetchTaskAssistant: ReturnType<typeof useGetTasksByAssistantQuery>['refetch']
  name: string
}

const LinkApiToAssistant = ({
  open,
  setOpen,
  assistant_id,
  tasksDataAssistant,
  refetchTaskAssistant,
  name
}: CreatePhoneProps) => {
  const handleClose = () => {
    setOpen(false)
  }

  const { data: tasksResponse } = useGetTasksQuery()
  const { data: methodsResponse } = useGetMethodsQuery()
  const [createTaskAssistant, { isLoading }] = useCreateTaskAssistantMutation()
  const [linkingTaskId, setLinkingTaskId] = useState<string | null>(null)

  const tasks = useMemo(() => {
    return tasksResponse?.data || []
  }, [tasksResponse])

  const methods = methodsResponse?.data || []

  // 📌 IDs das tasks já vinculadas ao assistente
  const linkedTaskIds = useMemo(
    () => (tasksDataAssistant?.data ? tasksDataAssistant.data.map(t => t.task_id) : []),
    [tasksDataAssistant]
  )

  // 📌 Filtrar tasks que ainda não foram vinculadas
  const filteredTasks = useMemo(() => tasks.filter(task => !linkedTaskIds.includes(task.id)), [tasks, linkedTaskIds])

  // Paginação
  const [page, setPage] = useState(1)
  const itemsPerPage = 5
  const pageCount = Math.ceil(filteredTasks.length / itemsPerPage)
  const paginatedTasks = filteredTasks.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  // 🔗 Vincular uma task ao assistant
  const handleLinkTask = async (taskId: string) => {
    try {
      setLinkingTaskId(taskId) // task em loading
      await createTaskAssistant({ assistant_id, task_id: taskId }).unwrap()
      await refetchTaskAssistant() // refetch lista do assistente
    } catch (err) {
      console.error('❌ Erro ao vincular task:', err)
    } finally {
      setLinkingTaskId(null) // reset
    }
  }

  return (
    <Dialog fullWidth maxWidth='lg' open={open} onClose={handleClose}>
      <DialogTitle variant='h4' className='flex flex-col gap-2 text-center mb-4 mt-6'>
        Vincule Apis Ao Assistente - {name}
      </DialogTitle>

      <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
        <i className='ri-close-line' />
      </IconButton>

      <DialogContent className='p-10'>
        <Box className='flex flex-col gap-2'>
          {/* Cabeçalho */}
          <Box className='flex font-bold border-b border-gray-600 pb-2'>
            <Box className='w-2/3'>API</Box>
            <Box className='w-1/6'>Método</Box>
            <Box className='w-1/6 text-center'>Vincular</Box>
          </Box>

          {paginatedTasks.length === 0 ? (
            <Box className='flex w-full h-full justify-center items-center p-20'>
              <Typography className='text-center text-gray-400 py-6 italic'>
                Nenhuma task disponível para atribuir ao assistente.
              </Typography>
            </Box>
          ) : (
            paginatedTasks.map(task => (
              <Box key={task.id} className='flex items-center border-b border-gray-700 py-2'>
                <Box className='w-2/3 flex flex-col'>
                  <Typography variant='body1' className='text-primary'>
                    {task.name}
                  </Typography>
                  <Typography variant='body2'>{task.description}</Typography>
                </Box>
                <Box className='w-1/6'>
                  <Chip label={methods.find(m => m.id === task.method_id)?.name || 'N/A'} size='small' />
                </Box>
                <Box className='w-1/6 flex justify-center'>
                  <Tooltip title='Vincular API'>
                    <IconButton
                      onClick={() => handleLinkTask(task.id)}
                      disabled={linkingTaskId === task.id} // desabilita só essa task
                    >
                      {linkingTaskId === task.id ? (
                        <CircularProgress size={24} />
                      ) : (
                        <i className='ri-plug-line text-primary text-[30px]' />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))
          )}

          {/* Paginação */}
          {pageCount > 1 && (
            <Box className='flex justify-center mt-4'>
              <Pagination count={pageCount} page={page} onChange={handlePageChange} color='primary' />
            </Box>
          )}
        </Box>

        <DialogActions className='justify-center mt-4'>
          <LoadingButton variant='contained' type='submit' loading={isLoading}>
            Salvar
          </LoadingButton>
          <Button variant='outlined' type='button' color='error' onClick={handleClose}>
            Cancelar
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default LinkApiToAssistant
