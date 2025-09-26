'use client'

import { useState } from 'react'

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
  Button,
  Box
} from '@mui/material'

import { Phone } from 'lucide-react'

import type { GetSingleAssistantResponse, useGetSingleAssistantQuery } from '@/api/endpoints/assistant/assistant'
import { maskTelefone } from '@/utils/masks'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'

import CreatePhone from '@/components/dialogs/create-phone'

interface TelefonesProps {
  data: GetSingleAssistantResponse | undefined
  refetch: ReturnType<typeof useGetSingleAssistantQuery>['refetch']
}

const Telefones = ({ data: dataAssistant, refetch }: TelefonesProps) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const phones = dataAssistant?.data?.phones || []

  const buttonProps: ButtonProps = {
    variant: 'contained',
    endIcon: <Phone size={15} />,
    children: 'Cadastrar novo whatsapp',
    size: 'small'
  }

  return (
    <>
      <TableContainer>
        <Box className='flex items-center justify-end'>
          <OpenDialogOnElementClick
            element={Button}
            elementProps={buttonProps}
            dialog={CreatePhone}
            dialogProps={{ assistant_id: dataAssistant?.data.id, refetch: refetch }}
          />
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Telefone</TableCell>
              <TableCell align='right'>Ações</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {phones.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(phone => (
              <TableRow key={phone.id}>
                <TableCell>{maskTelefone(phone.phone)}</TableCell>
                <TableCell align='right'>
                  <IconButton size='small' color='primary' onClick={() => console.log('Editar', phone.id)}>
                    <i className='ri-edit-line' />
                  </IconButton>
                  <IconButton size='small' color='error' onClick={() => console.log('Excluir', phone.id)}>
                    <i className='ri-delete-bin-line' />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        className='mt-2'
        component='div'
        count={phones.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage='Linhas por página:'
        labelDisplayedRows={({ page, count }) => `Página ${page + 1} de ${Math.ceil(count / rowsPerPage)}`}
      />
    </>
  )
}

export default Telefones
