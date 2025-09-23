// MUI Imports
import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid2'

import type { ColumnDef } from '@tanstack/react-table'

import { createColumnHelper } from '@tanstack/react-table'

import { Box, CardHeader, Chip, CircularProgress, IconButton, Typography } from '@mui/material'

import ListTable from '@/components/ListTable'
import type { Protocol } from '@/api/endpoints/protocols/protocols'
import { useGetProtocolsQuery } from '@/api/endpoints/protocols/protocols'
import type { GetProjectByIdResponse } from '@/api/endpoints/Projects/project'

const getStatus = (status: string) => {
  switch (status) {
    case 'active':
      return <Chip label='Ativo' color='success' size='small' />
    case 'inactive':
      return <Chip label='Inativo' color='error' size='small' />
    case 'resolved':
      return <Chip label='Resolvido' color='primary' size='small' />
    case 'unresolved':
      return <Chip label='Não Resolvido' color='warning' size='small' />
    default:
      return <Chip label='Desconhecido' variant='outlined' size='small' />
  }
}

const InteractionsProject = ({ data }: { data: GetProjectByIdResponse | undefined }) => {
  const {
    data: dataProtocol,

    isLoading
  } = useGetProtocolsQuery({
    sort: '-created_at',
    project_id: data?.data.id
  })

  const router = useRouter()

  const columnHelper = createColumnHelper<Protocol>()

  const columns: ColumnDef<Protocol, any>[] = [
    columnHelper.accessor('protocol', {
      header: 'Número do Protocolo',
      cell: ({ row }) => <Typography>{row.original.protocol}</Typography>
    }),
    columnHelper.accessor(row => row.assistant?.name, {
      id: 'assistant',
      header: 'Nome do Assistente',
      cell: ({ row }) => <Typography>{row.original.assistant?.name || '-'}</Typography>
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => getStatus(row.original.status)
    }),
    columnHelper.accessor('updated_at', {
      header: 'Atualizado em',
      cell: ({ row }) => (
        <Typography>
          {row.original.updated_at ? new Date(row.original.updated_at).toLocaleString('pt-BR') : '-'}
        </Typography>
      )
    }),

    // Nova coluna "Detalhes"
    columnHelper.accessor(
      row => row.protocol, // qualquer campo existente, só para não quebrar o tipo
      {
        id: 'detalhes', // nome da coluna
        header: 'Detalhes',
        cell: ({ row }) => (
          <IconButton size='small' onClick={() => router.push(`/historico-interacoes/${row.original.protocol}`)}>
            <i className='ri-eye-line text-textSecondary' />
          </IconButton>
        )
      }
    )
  ]

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        {isLoading ? (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <ListTable
            exportFileName={``}
            loading={false}
            columns={columns}
            tableData={dataProtocol?.data || []}
            headerTable={<CardHeader title={`Histórico de interações`} />}
            headerHasDivider
            pageSize={5}
          />
        )}
      </Grid>
    </Grid>
  )
}

export default InteractionsProject
