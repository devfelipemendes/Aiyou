'use client'

import React, { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid2'
import type { IconButtonProps } from '@mui/material'
import { Box, CardContent, CardHeader, Chip, CircularProgress, IconButton, Typography } from '@mui/material'

import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'

import ListTable from '@/components/ListTable'

import type { GetProtocolsResponse, Protocol } from '@/api/endpoints/protocols/protocols'
import { useGetProtocolsQuery } from '@/api/endpoints/protocols/protocols'

import HorizontalWithBorderExample from '@/components/HorizontalWithBorderExample'
import ChatLog_2 from '@/components/dialogs/chatComponent/ChatComponent'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'

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

type ResultStatus = {
  active: number
  inactive: number
  resolved: number
  unresolved: number
}

export default function HistoricoInteracoes() {
  // States

  const { data, error, isLoading } = useGetProtocolsQuery({
    sort: '-created_at'
  })

  const [resultStatus, setResultStatus] = useState<ResultStatus | null>(null)
  const columnHelper = createColumnHelper<Protocol>()

  const calculaResultsStatus = (data: GetProtocolsResponse) => {
    let active = 0
    let inactive = 0
    let resolved = 0
    let unresolved = 0

    data.data.forEach(protocol => {
      switch (protocol.status) {
        case 'active':
          active++
          break
        case 'inactive':
          inactive++
          break
        case 'resolved':
          resolved++
          break
        case 'unresolved':
          unresolved++
          break
      }
    })

    setResultStatus({
      active,
      inactive,
      resolved,
      unresolved
    })
  }

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

    columnHelper.accessor(row => row.protocol, {
      id: 'detalhes',
      header: 'Detalhes',
      cell: ({ row }) => {
        const buttonProps: IconButtonProps = {
          color: 'primary',
          children: <i className='ri-eye-line text-info' />
        }

        return (
          <OpenDialogOnElementClick
            element={IconButton}
            elementProps={buttonProps}
            dialog={ChatLog_2}
            dialogProps={{ protocol: row.original.protocol }}
          />
        )
      }
    })
  ]

  useEffect(() => {
    if (!data) return
    if (data.data.length === 0) return
    calculaResultsStatus(data)
  }, [data])

  if (error) {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography>Erro ao carregar projetos. Tentar novamente</Typography>
      </Box>
    )
  }

  return (
    <CardContent>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} className='self-end relative'>
          <HorizontalWithBorderExample
            isLoading={isLoading}
            color='success'
            icon='ri-check-line' // ✔️ Ativos
            value={String(resultStatus?.active) ?? '0'}
            title='Ativos'
            month={''}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }} className='self-end relative'>
          <HorizontalWithBorderExample
            isLoading={isLoading}
            color='error'
            icon='ri-close-circle-line' // ❌ Inativos
            value={String(resultStatus?.inactive) ?? '0'}
            title='Inativos'
            month={''}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }} className='self-end relative'>
          <HorizontalWithBorderExample
            isLoading={isLoading}
            color='primary'
            icon='ri-check-double-line' // ✅ Resolvidos
            value={String(resultStatus?.resolved) ?? '0'}
            title='Resolvidos'
            month={''}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }} className='self-end relative'>
          <HorizontalWithBorderExample
            isLoading={isLoading}
            color='warning'
            icon='ri-alert-line' // ⚠️ Não Resolvidos
            value={String(resultStatus?.unresolved) ?? '0'}
            title='Não Resolvidos'
            month={''}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          {isLoading ? (
            <Box
              sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <ListTable
              exportFileName={``}
              loading={false}
              columns={columns}
              tableData={data?.data || []}
              headerTable={<CardHeader title={`Histórico de interações`} />}
              headerHasDivider
            />
          )}
        </Grid>
      </Grid>
    </CardContent>
  )
}
