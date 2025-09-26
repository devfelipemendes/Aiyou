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

import { Phone, Trash2, Edit2 } from 'lucide-react'

import type { GetSingleAssistantResponse, useGetSingleAssistantQuery } from '@/api/endpoints/assistant/assistant'
import { maskTelefone } from '@/utils/masks'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'

import CreatePhone from '@/components/dialogs/create-phone'
import ConfirmDialog from '@/components/dialogs/confirmation-dialog'

import { useDeleteAssistantPhoneMutation } from '@/api/endpoints/assistantPhone/assistantPhone'
import EditPhone from '@/components/dialogs/edit-phone-assistant/EditPhoneAssistant'

interface TelefonesProps {
  data: GetSingleAssistantResponse | undefined
  refetch: ReturnType<typeof useGetSingleAssistantQuery>['refetch']
}

const Telefones = ({ data: dataAssistant, refetch }: TelefonesProps) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const [confirmDialog, setConfirmDialog] = useState({ open: false, loading: false })
  const [phoneToDelete, setPhoneToDelete] = useState<{ id: string; phone: string } | null>(null)

  // Estados para editar
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [phoneToEdit, setPhoneToEdit] = useState<{ id: string } | null>(null)

  const [deletePhone] = useDeleteAssistantPhoneMutation()

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleOpenDeleteDialog = (phone: { id: string; phone: string }) => {
    setPhoneToDelete(phone)
    setConfirmDialog({ ...confirmDialog, open: true })
  }

  const handleCancelDelete = () => {
    setPhoneToDelete(null)
    setConfirmDialog({ ...confirmDialog, open: false })
  }

  const handleConfirmDelete = async () => {
    if (!phoneToDelete) return
    setConfirmDialog({ open: true, loading: true })

    try {
      await deletePhone(phoneToDelete.id).unwrap()
      refetch()
      setConfirmDialog({ open: false, loading: false })
      setPhoneToDelete(null)
    } catch {
      setConfirmDialog({ open: false, loading: false })
    }
  }

  const handleOpenEditDialog = (phone_id: string) => {
    setPhoneToEdit({ id: phone_id })
    setEditDialogOpen(true)
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
        <Box className='flex items-center justify-end mb-2'>
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
                  <IconButton size='small' color='primary' onClick={() => handleOpenEditDialog(phone.id)}>
                    <Edit2 size={16} />
                  </IconButton>
                  <IconButton
                    size='small'
                    color='error'
                    onClick={() => handleOpenDeleteDialog({ id: phone.id, phone: phone.phone })}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={confirmDialog.open}
        loading={confirmDialog.loading}
        type='error'
        title='Deletar telefone'
        message={
          phoneToDelete ? `Tem certeza que deseja deletar o telefone "${maskTelefone(phoneToDelete.phone)}"?` : ''
        }
        subtitle='Esta ação não pode ser desfeita.'
        confirmText='Deletar'
        cancelText='Cancelar'
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Modal de edição */}
      {phoneToEdit && (
        <EditPhone
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          phone_id={phoneToEdit.id}
          assistant_id={dataAssistant?.data.id ?? ''}
          refetch={refetch}
        />
      )}

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
