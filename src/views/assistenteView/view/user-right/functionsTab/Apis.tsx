'use client'

import { useEffect, useState } from 'react'

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
  Chip
} from '@mui/material'

import Grid from '@mui/material/Grid2'

import { Dot } from 'lucide-react'

import CustomAvatar from '@core/components/mui/Avatar'
import { useGetTasksByAssistantQuery } from '@/api/endpoints/taskAssistant/taskAssistant'
import type { GetSingleAssistantResponse } from '@/api/endpoints/assistant/assistant'
import { taskApi } from '@/api/endpoints/task/task'

const Apis = ({ data: dataAssistant }: { data: GetSingleAssistantResponse | undefined }) => {
  // Paginação
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Tasks do assistant
  const { data: tasksData, error } = useGetTasksByAssistantQuery(dataAssistant?.data?.id || '')

  // Estado para detalhes das tasks
  const [tasksWithDetails, setTasksWithDetails] = useState<any[]>([])
  const [fetchTaskDetails] = taskApi.useLazyGetSingleTaskQuery()

  // Estado de expansão por linha
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => {
    if (!tasksData?.data) return

    const fetchAllDetails = async () => {
      try {
        const promises = tasksData.data.map(task => fetchTaskDetails(task.task_id).unwrap())
        const results = await Promise.all(promises)

        const detailedTasks = tasksData.data.map((task, index) => ({
          ...task,
          details: results[index].data
        }))

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
              <>
                <TableRow key={task.id}>
                  {/* Botão de expandir */}
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

                {/* Linha expandida */}
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={expandedRows[task.id]} timeout='auto' unmountOnExit>
                      <Box padding={2}>
                        <Typography variant='h6' gutterBottom color='primary'>
                          Detalhes:
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Dot size={50} className='text-primary' />
                              <Typography variant='body2'>
                                <strong>Descrição:</strong> {task.details?.description || '-'}
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                              <Dot size={50} className='text-primary' />
                              <Typography variant='body2'>
                                <strong>Endpoint:</strong> {task.details?.endpoint || '-'}
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Dot size={50} className='text-primary' />
                              <Typography variant='body2'>
                                <strong>Método ID:</strong> {task.details?.method_id || '-'}
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Dot size={50} className='text-primary' />
                              <Typography variant='body2'>
                                <strong>Parâmetros:</strong> {task.details?.pai_parameters?.length || 0}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </>
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
