'use client'

import React, { useEffect, useState } from 'react'

import type { ButtonProps } from '@mui/material'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  IconButton,
  Collapse,
  Box,
  Typography,
  Chip,
  Paper,
  Divider,
  Button,
  CircularProgress
} from '@mui/material'

import { CheckCircle, LucideClipboard, Network, Sliders, Trash2 } from 'lucide-react'

import {
  useGetTasksByAssistantQuery,
  useDeleteTaskAssistantMutation
} from '@/api/endpoints/taskAssistant/taskAssistant'
import type { GetSingleAssistantResponse } from '@/api/endpoints/assistant/assistant'
import { taskApi } from '@/api/endpoints/task/task'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'
import LinkApiToAssistant from '@/components/dialogs/create-api-to-assistant'

const Apis = ({ data: dataAssistant }: { data: GetSingleAssistantResponse | undefined }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [tasksWithDetails, setTasksWithDetails] = useState<any[]>([])
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const { data: tasksData, error, refetch } = useGetTasksByAssistantQuery(dataAssistant?.data?.id || '')
  const [fetchTaskDetails] = taskApi.useLazyGetSingleTaskQuery()
  const [deleteTaskAssistant] = useDeleteTaskAssistantMutation()
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null) // <-- estado para task sendo deletada
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const toggleExpand = (id: string) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }))

  const handleUnlink = async (id: string) => {
    try {
      setDeletingTaskId(id) // indica que essa task está em processo de exclusão
      await deleteTaskAssistant(id).unwrap()
      refetch()
    } catch (err) {
      console.error('Erro ao desvincular API:', err)
    } finally {
      setDeletingTaskId(null) // reseta após terminar
    }
  }

  useEffect(() => {
    if (!tasksData?.data) return

    const fetchAllDetails = async () => {
      try {
        const promises = tasksData.data.map(task => fetchTaskDetails(task.task_id).unwrap())
        const results = await Promise.all(promises)
        const detailedTasks = tasksData.data.map((task, index) => ({ ...task, details: results[index].data }))

        setTasksWithDetails(detailedTasks)
        setIsLoading(false)
      } catch (err) {
        console.error('Erro ao carregar detalhes das tasks:', err)
      }
    }

    fetchAllDetails()
  }, [tasksData, fetchTaskDetails])

  if (isLoading) return <p>Carregando apis...</p>
  if (error) return <p>Erro ao carregar tasks</p>

  const paginatedTasks = tasksWithDetails.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const renderBooleanChip = (value: boolean | string) => {
    const isTrue = value === true || value === 'Sim'

    return (
      <Chip
        label={isTrue ? 'Sim' : 'Não'}
        color={isTrue ? 'success' : 'error'}
        size='small'
        sx={{
          fontSize: 11,
          height: 20,
          minWidth: 28,
          px: 0.5
        }}
      />
    )
  }

  const buttonProps: ButtonProps = {
    variant: 'contained',
    endIcon: <Network size={15} />,
    children: 'Vincular Api Ao Assistetnte',
    size: 'small'
  }

  return (
    <>
      <TableContainer sx={{ width: '100%' }}>
        <Box className='flex items-center justify-end mb-2'>
          <OpenDialogOnElementClick
            element={Button}
            elementProps={buttonProps}
            dialog={LinkApiToAssistant}
            dialogProps={{
              assistant_id: dataAssistant?.data.id,
              tasksDataAssistant: tasksData,
              refetchTaskAssistant: refetch,
              name: dataAssistant?.data.name
            }}
          />
        </Box>
        <Table sx={{ minWidth: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Nome</TableCell>
              <TableCell>Ativa</TableCell>
              <TableCell className='flex justify-end'>Desvincular API</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedTasks.map(task => (
              <React.Fragment key={task.id}>
                <TableRow>
                  <TableCell>
                    <IconButton size='small' onClick={() => toggleExpand(task.id)}>
                      {expandedRows[task.id] ? (
                        <i className='ri-subtract-line text-[18px] text-primary' />
                      ) : (
                        <i className='ri-add-line text-[18px] text-primary' />
                      )}
                    </IconButton>
                  </TableCell>

                  <TableCell>{task.details?.name}</TableCell>
                  <TableCell>
                    {task.details?.active ? (
                      <Chip label='Ativa' color='success' size='small' />
                    ) : (
                      <Chip label='Inativa' color='error' size='small' />
                    )}
                  </TableCell>
                  <TableCell className='flex justify-end'>
                    <IconButton
                      color='error'
                      onClick={() => handleUnlink(task.id)}
                      disabled={deletingTaskId === task.id} // evita múltiplos cliques
                    >
                      {deletingTaskId === task.id ? <CircularProgress size={18} /> : <Trash2 size={18} />}
                    </IconButton>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={expandedRows[task.id]} timeout='auto' unmountOnExit>
                      <Box sx={{ p: 2 }}>
                        {/* Seção Geral */}
                        <Paper
                          sx={{
                            p: 8,
                            mb: 2,
                            mt: 6,
                            border: '1px solid',
                            borderColor: 'primary.main'
                          }}
                          elevation={1}
                        >
                          <Typography
                            className='flex flex-row gap-2 items-center justify-start mb-4'
                            variant='subtitle1'
                            fontSize={20}
                            gutterBottom
                          >
                            <LucideClipboard className='text-primary' /> Informações Gerais
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant='body2'>
                              <strong style={{ fontSize: '0.95rem' }}>Descrição:</strong>{' '}
                              {task.details?.description || '-'}
                            </Typography>

                            <Typography variant='body2'>
                              <strong style={{ fontSize: '0.95rem' }}>Endpoint:</strong> {task.details?.endpoint || '-'}
                            </Typography>

                            <Typography variant='body2'>
                              <strong style={{ fontSize: '0.95rem' }}>Instrução:</strong>{' '}
                              {task.details?.instruction || '-'}
                            </Typography>

                            {/* Ativa */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant='body2' component='span'>
                                <strong style={{ fontSize: '0.95rem' }}>Ativa:</strong>
                              </Typography>
                              {renderBooleanChip(task.details?.active)}
                            </Box>

                            {/* Em funcionamento */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant='body2' component='span'>
                                <strong style={{ fontSize: '0.95rem' }}>Em funcionamento:</strong>
                              </Typography>
                              {renderBooleanChip(task.details?.working)}
                            </Box>

                            {/* Variável */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant='body2' component='span'>
                                <strong style={{ fontSize: '0.95rem' }}>Variável:</strong>
                              </Typography>
                              {renderBooleanChip(task.details?.variable)}
                            </Box>
                          </Box>
                        </Paper>

                        {/* Parâmetros */}
                        <Paper
                          sx={{
                            p: 8,
                            mb: 2,
                            mt: 6,
                            border: '1px solid',
                            borderColor: 'primary.main'
                          }}
                          elevation={1}
                        >
                          <Typography
                            className='flex flex-row gap-2 items-center justify-start mb-4'
                            variant='subtitle1'
                            fontSize={20}
                            gutterBottom
                          >
                            <Sliders className='text-primary' /> Parâmetros
                          </Typography>
                          {task.details?.pai_parameters?.length ? (
                            task.details.pai_parameters.map((p: any, idx: any) => (
                              <React.Fragment key={idx}>
                                <Divider orientation='horizontal' className='mt-4 mb-4' />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                                  <Typography variant='body2'>
                                    <strong style={{ fontSize: '0.95rem' }}>Nome:</strong> {p.name}
                                  </Typography>
                                  <Typography variant='body2'>
                                    <strong style={{ fontSize: '0.95rem' }}>Descrição:</strong> {p.description || '-'}
                                  </Typography>
                                  <Typography variant='body2'>
                                    <strong style={{ fontSize: '0.95rem' }}>Tipo:</strong> {p.type}
                                  </Typography>

                                  {/* Obrigatório com Chip → evitar p dentro de p */}
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant='body2' component='span'>
                                      <strong style={{ fontSize: '0.95rem' }}>Obrigatório:</strong>
                                    </Typography>
                                    {renderBooleanChip(p.required)}
                                  </Box>
                                </Box>
                              </React.Fragment>
                            ))
                          ) : (
                            <Typography variant='body2'>Nenhum parâmetro</Typography>
                          )}
                        </Paper>

                        {/* Retornos */}
                        <Paper
                          sx={{
                            p: 8,
                            mb: 2,
                            mt: 6,
                            border: '1px solid',
                            borderColor: 'primary.main'
                          }}
                          elevation={1}
                        >
                          <Typography
                            className='flex flex-row gap-2 items-center justify-start mb-4'
                            variant='subtitle1'
                            fontSize={20}
                            gutterBottom
                          >
                            <CheckCircle className='text-primary' /> Retornos
                          </Typography>
                          {task.details?.returns?.length ? (
                            task.details.returns.map((r: any, idx: any) => (
                              <Typography key={idx} variant='body2' sx={{ mb: 0.5 }}>
                                • {r.name}
                              </Typography>
                            ))
                          ) : (
                            <Typography variant='body2'>Nenhum retorno</Typography>
                          )}
                        </Paper>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        className='mt-2'
        component='div'
        count={tasksWithDetails.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[]}
        labelRowsPerPage=''
        labelDisplayedRows={({ page, count }) => `Página ${page + 1} de ${Math.ceil(count / rowsPerPage)}`}
      />
    </>
  )
}

export default Apis
