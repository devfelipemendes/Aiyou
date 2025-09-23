'use client'

import { useState } from 'react'

import {
  Box,
  Card,
  CardHeader,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  IconButton
} from '@mui/material'
import Typography from '@mui/material/Typography'

import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'
import CreateAssistant from '@/components/dialogs/create-assistant'
import { useGetTasksByAssistantQuery } from '@/api/endpoints/taskAssistant/taskAssistant'

type DataType = {
  name: string
  profession: string
  totalCourses: number
  avatar: string
}

const data: DataType[] = [
  { name: 'Jordan Stevenson', profession: 'Business Intelligence', totalCourses: 33, avatar: '/images/avatars/1.png' },
  { name: 'Bentlee Emblin', profession: 'Digital Marketing', totalCourses: 52, avatar: '/images/avatars/2.png' },
  { name: 'Benedetto Rossiter', profession: 'UI/UX Design', totalCourses: 12, avatar: '/images/avatars/3.png' },
  { name: 'Beverlie Krabbe', profession: 'Vue', totalCourses: 8, avatar: '/images/avatars/4.png' }
]

// 🔥 Botão customizado
const iconButtonProps = {
  color: 'primary' as const,
  children: <i className='ri-key-2-line text-[20px]' />,
  sx: {
    backgroundColor: 'primary.main',
    color: 'white',
    '&:hover': {
      backgroundColor: 'primary.dark'
    },
    width: 40,
    height: 40,
    borderRadius: '8px'
  }
}

const Apis = () => {
  // Estado de paginação
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(2) // 🔥 qtd de linhas por página

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Paginação real: fatia do array
  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const {
    data: dataTaskAssistant,
    isLoading,
    error
  } = useGetTasksByAssistantQuery('d77ed7e3-e9f0-4886-bbb1-9fad8cfd15b2')

  console.log('datataskassistant', dataTaskAssistant)

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>id</TableCell>
              <TableCell>criação</TableCell>
              <TableCell>Expandir</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((item, i) => (
              <TableRow key={i}>
                <TableCell>
                  <CustomAvatar size={34} src={item.avatar} />
                </TableCell>
                <TableCell>
                  <Typography className='font-medium' color='text.primary'>
                    {item.name}
                  </Typography>
                </TableCell>
                <TableCell>{item.profession}</TableCell>
                <TableCell>{item.totalCourses}</TableCell>
                <TableCell align='right'>
                  <OpenDialogOnElementClick
                    element={IconButton}
                    elementProps={iconButtonProps}
                    dialog={CreateAssistant}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Componente de paginação */}
      <TablePagination
        className='mt-2'
        component='div'
        count={data.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[]} // 🔥 tira o seletor de "linhas por página"
        labelRowsPerPage='' // 🔥 esconde o label
        labelDisplayedRows={({ page, count }) => `Página ${page + 1} de ${Math.ceil(count / rowsPerPage)}`}
      />
    </>
  )
}

export default Apis
