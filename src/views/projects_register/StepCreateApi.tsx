'use client'

// React Imports
import { useState, useMemo, useCallback } from 'react'

import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import * as v from 'valibot'

// MUI Imports
import Grid from '@mui/material/Grid2'

import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import Modal from '@mui/material/Modal'
import Divider from '@mui/material/Divider'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'react-toastify'

// Components
import ListTable from '@/components/ListTable'

// API Imports
import {
  useGetApisQuery,
  useCreateApiMutation,
  useUpdateApiMutation,
  useDeleteApiMutation,
  type Api,
  type CreateApiRequest,
  type UpdateApiRequest
} from '@/api/endpoints/fdc/api'

// Validation Schema
const ApiSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Nome da API é obrigatório')),
  description: v.pipe(v.string(), v.minLength(1, 'Descrição é obrigatória')),
  url: v.pipe(v.string(), v.minLength(1, 'URL é obrigatória'), v.url('URL deve ser válida')),
  token: v.pipe(v.string(), v.minLength(1, 'Token é obrigatório'))
})

type ApiFormData = v.InferInput<typeof ApiSchema>

interface StepCreateApiProps {
  onNextStep?: () => void
  onPrevStep?: () => void
  isTela?: boolean
}

// Modal Style
const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: '85vh',
  overflow: 'auto'
}

const StepCreateApi = ({ onNextStep, isTela, onPrevStep }: StepCreateApiProps) => {
  // States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingApi, setEditingApi] = useState<Api | null>(null)
  const [apiToDelete, setApiToDelete] = useState<Api | null>(null)

  // API Hooks
  const { data: apisResponse, isLoading, refetch } = useGetApisQuery()
  const [createApi, { isLoading: isCreating }] = useCreateApiMutation()
  const [updateApi, { isLoading: isUpdating }] = useUpdateApiMutation()
  const [deleteApi, { isLoading: isDeleting }] = useDeleteApiMutation()

  // Form
  const form = useForm<ApiFormData>({
    resolver: valibotResolver(ApiSchema),
    defaultValues: {
      name: '',
      description: '',
      url: '',
      token: ''
    },
    mode: 'onChange'
  })

  // Process APIs data
  const apis = useMemo(() => {
    return apisResponse?.data || []
  }, [apisResponse])

  // Table columns
  const columnHelper = createColumnHelper<Api>()

  const columns = useMemo<ColumnDef<Api, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'Nome',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.name}</Typography>
      }),
      columnHelper.accessor('description', {
        header: 'Descrição',
        cell: ({ row }) => <Typography className='text-sm text-gray-600'>{row.original.description}</Typography>
      }),
      columnHelper.accessor('url', {
        header: 'URL',
        cell: ({ row }) => (
          <Tooltip title={row.original.url}>
            <Typography className='text-sm font-mono truncate max-w-48'>{row.original.url}</Typography>
          </Tooltip>
        )
      }),
      columnHelper.accessor('created_at', {
        header: 'Criado em',
        cell: ({ row }) => (
          <Typography className='text-sm'>{new Date(row.original.created_at).toLocaleDateString('pt-BR')}</Typography>
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => (
          <Box className='flex gap-2'>
            <Tooltip title='Editar API'>
              <IconButton
                size='small'
                onClick={() => handleEditApi(row.original)}
                className='text-blue-600 hover:bg-blue-50'
              >
                <i className='ri-edit-line text-lg' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Deletar API'>
              <IconButton
                size='small'
                onClick={() => setApiToDelete(row.original)}
                className='text-red-600 hover:bg-red-50'
              >
                <i className='ri-delete-bin-line text-lg' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Testar Conexão'>
              <IconButton
                size='small'
                onClick={() => handleTestApi(row.original)}
                className='text-green-600 hover:bg-green-50'
              >
                <i className='ri-pulse-line text-lg' />
              </IconButton>
            </Tooltip>
          </Box>
        )
      })
    ],
    []
  )

  // Handlers
  const handleOpenModal = useCallback(() => {
    setEditingApi(null)
    form.reset({
      name: '',
      description: '',
      url: '',
      token: ''
    })
    setIsModalOpen(true)
  }, [form])

  const handleEditApi = useCallback(
    (api: Api) => {
      setEditingApi(api)
      form.reset({
        name: api.name,
        description: api.description,
        url: api.url,
        token: api.token
      })
      setIsModalOpen(true)
    },
    [form]
  )

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingApi(null)
    form.reset()
  }, [form])

  const handleSubmit = useCallback(
    async (data: ApiFormData) => {
      try {
        if (editingApi) {
          // Update existing API
          const updateData: UpdateApiRequest = {
            id: editingApi.id,
            ...data
          }

          await updateApi(updateData).unwrap()
        } else {
          // Create new API
          const createData: CreateApiRequest = data

          await createApi(createData).unwrap()
        }

        handleCloseModal()
        refetch()
      } catch (error) {
        console.error('Erro ao salvar API:', error)
      }
    },
    [editingApi, updateApi, createApi, handleCloseModal, refetch]
  )

  const handleDeleteApi = useCallback(async () => {
    if (!apiToDelete) return

    try {
      await deleteApi({ id: apiToDelete.id }).unwrap()
      setApiToDelete(null)
      refetch()
    } catch (error) {
      console.error('Erro ao deletar API:', error)
    }
  }, [apiToDelete, deleteApi, refetch])

  const handleTestApi = useCallback(async (api: Api) => {
    try {
      const response = await fetch(api.url, {
        method: 'HEAD',
        headers: {
          Authorization: `Bearer ${api.token}`
        }
      })

      if (response.ok) {
        toast.success('API respondeu com sucesso!')
      } else {
        toast.warning(`API retornou status: ${response.status}`)
      }
    } catch (error) {
      toast.error('❌ Erro ao conectar com a API')
    }
  }, [])

  return (
    <>
      <Box>
        <CardHeader title='Gerenciar APIs' subheader='Cadastre e gerencie suas APIs externas' />
        <CardContent>
          <Grid container spacing={4}>
            {/* Formulário de Cadastro */}

            {/* Tabela de APIs */}
            {apis.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <ListTable
                  columns={columns}
                  tableData={apis}
                  loading={isLoading}
                  exportFileName='apis-cadastradas'
                  searchInputPlaceholder='Buscar API...'
                  headerTable={
                    <CardHeader title={`APIs Cadastradas (${apis.length})`} subheader='Gerencie suas APIs externas' />
                  }
                  headerHasDivider
                  actions={
                    <Box className='flex justify-end'>
                      <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleOpenModal}>
                        Cadastrar API
                      </Button>
                    </Box>
                  }
                />
              </Grid>
            )}

            {/* Empty State */}
            {apis.length === 0 && !isLoading && (
              <Grid size={{ xs: 12 }}>
                <Box className='text-center py-12'>
                  <i className='ri-api-line text-6xl text-gray-300 mb-4 block' />
                  <Typography variant='h6' className='text-gray-500 mb-2'>
                    Nenhuma API cadastrada
                  </Typography>
                  <Typography className='text-gray-400 mb-4'>
                    Cadastre sua primeira API para começar a integrar com serviços externos
                  </Typography>
                  <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleOpenModal}>
                    Cadastrar primeira API
                  </Button>
                </Box>
              </Grid>
            )}

            {/* Next Step Button */}
            {apis.length > 0 && !isTela && (
              <Grid size={{ xs: 12 }}>
                <Box className='flex  justify-between'>
                  <Button variant='outlined' onClick={onPrevStep} startIcon={<i className='ri-arrow-left-line' />}>
                    Voltar
                  </Button>
                  <Button
                    variant='contained'
                    size='small'
                    onClick={onNextStep}
                    endIcon={<i className='ri-arrow-right-line' />}
                  >
                    Finalizar cadastro de APIs
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Box>

      {/* Modal de Cadastro/Edição */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant='h6' className='mb-4'>
            {editingApi ? 'Editar API' : 'Cadastrar Nova API'}
          </Typography>

          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <TextField
              {...form.register('name')}
              label='Nome da API'
              fullWidth
              error={!!form.formState.errors.name}
              helperText={form.formState.errors.name?.message}
            />

            <TextField
              {...form.register('description')}
              label='Descrição'
              fullWidth
              multiline
              rows={3}
              error={!!form.formState.errors.description}
              helperText={form.formState.errors.description?.message}
            />

            <TextField
              {...form.register('url')}
              label='URL da API'
              fullWidth
              placeholder='https://api.exemplo.com'
              error={!!form.formState.errors.url}
              helperText={form.formState.errors.url?.message}
            />

            <TextField
              {...form.register('token')}
              label='Token de Autenticação'
              fullWidth
              type='password'
              error={!!form.formState.errors.token}
              helperText={form.formState.errors.token?.message}
            />

            <Divider />

            <Box className='flex gap-2 justify-end'>
              <Button variant='outlined' onClick={handleCloseModal} disabled={isCreating || isUpdating}>
                Cancelar
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={isCreating || isUpdating || !form.formState.isValid}
                startIcon={
                  isCreating || isUpdating ? (
                    <i className='ri-loader-4-line animate-spin' />
                  ) : (
                    <i className='ri-save-line' />
                  )
                }
              >
                {editingApi ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Modal de Confirmação de Delete */}
      <Modal open={!!apiToDelete} onClose={() => setApiToDelete(null)}>
        <Box sx={modalStyle}>
          <Typography variant='h6' className='mb-4'>
            Confirmar Exclusão
          </Typography>

          <Typography className='mb-4'>
            Tem certeza que deseja excluir a API <strong>{apiToDelete?.name}</strong>? Esta ação não pode ser desfeita.
          </Typography>

          <Box className='flex gap-2 justify-end'>
            <Button variant='outlined' onClick={() => setApiToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={handleDeleteApi}
              disabled={isDeleting}
              startIcon={
                isDeleting ? <i className='ri-loader-4-line animate-spin' /> : <i className='ri-delete-bin-line' />
              }
            >
              Excluir
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  )
}

export default StepCreateApi
