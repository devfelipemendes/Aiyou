'use client'

import React, { useEffect, useState } from 'react'

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
  Paper
} from '@mui/material'

import { CheckCircle, LucideClipboard, Sliders } from 'lucide-react'

import CustomAvatar from '@core/components/mui/Avatar'
import { useGetTasksByAssistantQuery } from '@/api/endpoints/taskAssistant/taskAssistant'
import type { GetSingleAssistantResponse } from '@/api/endpoints/assistant/assistant'
import { taskApi } from '@/api/endpoints/task/task'

const Apis = ({ data: dataAssistant }: { data: GetSingleAssistantResponse | undefined }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [tasksWithDetails, setTasksWithDetails] = useState<any[]>([])
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const { data: tasksData, error } = useGetTasksByAssistantQuery(dataAssistant?.data?.id || '')
  const [fetchTaskDetails] = taskApi.useLazyGetSingleTaskQuery()

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const toggleExpand = (id: string) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }))

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
          fontSize: 11, // menor fonte
          height: 20, // altura menor
          minWidth: 28, // largura mínima
          px: 0.5 // padding horizontal
        }}
      />
    )
  }

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Avatar</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Ativa</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedTasks.map(task => (
              <React.Fragment key={task.id}>
                <TableRow>
                  <TableCell>
                    <IconButton size='small' onClick={() => toggleExpand(task.id)}>
                      {expandedRows[task.id] ? '-' : '+'}
                    </IconButton>
                  </TableCell>

                  <TableCell>
                    <CustomAvatar size={34} src='/images/avatars/1.png' />
                  </TableCell>

                  <TableCell>{task.details?.name}</TableCell>
                  <TableCell>
                    {task.details?.active ? (
                      <Chip label='Ativa' color='success' size='small' />
                    ) : (
                      <Chip label='Inativa' color='error' size='small' />
                    )}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={expandedRows[task.id]} timeout='auto' unmountOnExit>
                      <Box sx={{ p: 2 }}>
                        {/* Seção Geral */}
                        <Paper sx={{ p: 2, mb: 2, mt: 6 }} elevation={1}>
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
                            <Typography variant='body2'>
                              <strong style={{ fontSize: '0.95rem' }}>Ativa:</strong>{' '}
                              {renderBooleanChip(task.details?.active)}
                            </Typography>
                            <Typography variant='body2'>
                              <strong style={{ fontSize: '0.95rem' }}>Em funcionamento:</strong>{' '}
                              {renderBooleanChip(task.details?.working)}
                            </Typography>
                            <Typography variant='body2'>
                              <strong style={{ fontSize: '0.95rem' }}>Variável:</strong>{' '}
                              {renderBooleanChip(task.details?.variable)}
                            </Typography>
                          </Box>
                        </Paper>

                        {/* Parâmetros */}
                        <Paper sx={{ p: 2, mb: 2, mt: 6 }} elevation={1}>
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
                              <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                                <Typography variant='body2'>
                                  <strong style={{ fontSize: '0.95rem' }}>Nome:</strong> {p.name}
                                </Typography>
                                <Typography variant='body2'>
                                  <strong style={{ fontSize: '0.95rem' }}>Descrição:</strong> {p.description || '-'}
                                </Typography>
                                <Typography variant='body2'>
                                  <strong style={{ fontSize: '0.95rem' }}>Tipo:</strong> {p.type}
                                </Typography>
                                <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <strong style={{ fontSize: '0.95rem' }}>Obrigatório:</strong>{' '}
                                  {renderBooleanChip(p.required)}
                                </Typography>
                              </Box>
                            ))
                          ) : (
                            <Typography variant='body2'>Nenhum parâmetro</Typography>
                          )}
                        </Paper>

                        {/* Retornos */}
                        <Paper sx={{ p: 2 }} elevation={1}>
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
