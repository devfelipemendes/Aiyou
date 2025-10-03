'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'

import Tooltip from '@mui/material/Tooltip'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'

import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'
import tableStyles from '@core/styles/table.module.css'

import { useGetCustomerInvoicesQuery, type CustomerInvoice } from '@/api/endpoints/invoices/invoice'
import { InvoiceViewModal } from '@/components/dialogs/invoiceViewInSistem'
import { currencyFormatter } from '@/utils/currency'
import PricingPlansModal from '@/components/dialogs/plans'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const InvoiceListTable = () => {
  const [status, setStatus] = useState<CustomerInvoice['status']>('')
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  // Modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)

  const router = useRouter()

  const {
    data: invoicesResponse,
    isLoading,
    error
  } = useGetCustomerInvoicesQuery({
    limit: 50,
    status: status || undefined
  })

  // Correção: usar dados diretos da nova estrutura da API
  const invoices = useMemo(() => {
    const apiData = invoicesResponse?.data // Removido .data extra

    return Array.isArray(apiData) ? apiData : []
  }, [invoicesResponse?.data])

  const columnHelper = createColumnHelper<CustomerInvoice>()

  const handleViewInvoice = (paymentId: string) => {
    setSelectedPaymentId(paymentId)
    setShowInvoiceModal(true)
  }

  const handleViewInvoiceOnline = useCallback((paymantId: string) => {
    router.push(`/cobranca/${paymantId}`)
  }, [])

  const handleOpenModal = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  const columns = useMemo<ColumnDef<CustomerInvoice, any>[]>(
    () => [
      columnHelper.accessor('invoiceNumber', {
        header: 'Nº Fatura',
        cell: ({ row }) => (
          <Typography
            component='button'
            onClick={() => handleViewInvoice(row.original.id)}
            color='primary.main'
            sx={{ textDecoration: 'underline', cursor: 'pointer', border: 'none', background: 'none' }}
          >
            #{row.original.invoiceNumber}
          </Typography>
        )
      }),

      columnHelper.accessor('dateCreated', {
        header: 'Data Criação',
        cell: ({ row }) => <Typography>{new Date(row.original.dateCreated).toLocaleDateString('pt-BR')}</Typography>
      }),

      columnHelper.accessor('dueDate', {
        header: 'Vencimento',
        cell: ({ row }) => {
          const dueDate = new Date(row.original.dueDate)
          const today = new Date()
          const isOverdue = row.original.status === 'PENDING' && dueDate < today

          return (
            <Typography color={isOverdue ? 'error' : 'text.primary'}>{dueDate.toLocaleDateString('pt-BR')}</Typography>
          )
        }
      }),

      columnHelper.accessor('billingType', {
        header: 'Tipo',
        cell: ({ row }) => {
          const typeConfig = {
            BOLETO: { color: 'info' as const, label: 'Boleto' },
            PIX: { color: 'success' as const, label: 'PIX' },
            CREDIT_CARD: { color: 'primary' as const, label: 'Cartão Crédito' },
            DEBIT_CARD: { color: 'secondary' as const, label: 'Cartão Débito' },
            UNDEFINED: { color: 'default' as const, label: 'Indefinido' }
          }

          const config = typeConfig[row.original.billingType] || typeConfig['UNDEFINED']

          return <Chip variant='tonal' label={config.label} color={config.color} size='small' />
        }
      }),

      columnHelper.accessor('value', {
        header: 'Valor',
        cell: ({ row }) => <Typography color='text.primary'>{currencyFormatter(row.original.value)}</Typography>
      }),

      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const statusConfig = {
            PENDING: { color: 'warning' as const, icon: 'ri-time-line', label: 'Pendente' },
            RECEIVED: { color: 'success' as const, icon: 'ri-check-line', label: 'Pago' },
            OVERDUE: { color: 'error' as const, icon: 'ri-alert-line', label: 'Vencido' },
            CONFIRMED: { color: 'info' as const, icon: 'ri-check-double-line', label: 'Confirmado' },
            REFUNDED: { color: 'secondary' as const, icon: 'ri-refund-line', label: 'Reembolsado' },
            RECEIVED_IN_CASH: {
              color: 'success' as const,
              icon: 'ri-money-dollar-circle-line',
              label: 'Pago Dinheiro'
            },
            REFUND_REQUESTED: { color: 'warning' as const, icon: 'ri-question-line', label: 'Reembolso Solicitado' },
            CHARGEBACK_REQUESTED: { color: 'error' as const, icon: 'ri-spam-line', label: 'Chargeback' },
            AWAITING_RISK_ANALYSIS: { color: 'info' as const, icon: 'ri-shield-check-line', label: 'Análise Risco' }
          }

          const config = statusConfig[row.original.status as keyof typeof statusConfig] || statusConfig['PENDING']

          return (
            <Tooltip
              title={
                <div>
                  <Typography variant='body2' component='span' className='text-inherit'>
                    {config.label}
                  </Typography>
                  <br />
                  <Typography variant='body2' component='span' className='text-inherit'>
                    Valor: {currencyFormatter(row.original.value)}
                  </Typography>
                  <br />
                  <Typography variant='body2' component='span' className='text-inherit'>
                    Vencimento: {new Date(row.original.dueDate).toLocaleDateString('pt-BR')}
                  </Typography>
                </div>
              }
            >
              <CustomAvatar skin='light' color={config.color} size={28}>
                <i className={classnames('bs-4 is-4', config.icon)} />
              </CustomAvatar>
            </Tooltip>
          )
        }
      }),

      columnHelper.accessor('id', {
        id: 'action',
        header: 'Ações',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <Tooltip title='Ver Fatura Detalhada'>
              <IconButton onClick={() => handleViewInvoice(row.original.id)}>
                <i className='ri-eye-line text-textSecondary' />
              </IconButton>
            </Tooltip>

            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Ver Fatura Completa',
                  icon: 'ri-file-text-line',
                  menuItemProps: {
                    onClick: () => handleViewInvoice(row.original.id),
                    className: 'flex items-center gap-2 text-textSecondary'
                  }
                },
                {
                  text: 'Ver Fatura Online',
                  icon: 'ri-external-link-line',
                  menuItemProps: {
                    onClick: () => handleViewInvoiceOnline(row.original.id),
                    className: 'flex items-center gap-2 text-textSecondary'
                  }
                },
                {
                  text: 'Copiar ID da Fatura',
                  icon: 'ri-file-copy-line',
                  menuItemProps: {
                    onClick: () => {
                      navigator.clipboard.writeText(row.original.id)
                    },
                    className: 'flex items-center gap-2 text-textSecondary'
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    []
  )

  const table = useReactTable({
    data: invoices,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center py-12'>
          <Typography>Carregando faturas...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center py-12'>
          <Typography color='error'>Erro ao carregar faturas. Tente novamente.</Typography>
        </CardContent>
      </Card>
    )
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center py-12'>
          <Typography>Nenhuma fatura encontrada.</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className='flex justify-between gap-4 flex-wrap flex-col sm:flex-row items-center'>
          <Button
            variant='contained'
            startIcon={<i className='ri-add-line' />}
            onClick={handleOpenModal}
            className='max-sm:is-full'
          >
            Quero mudar de plano
          </Button>
          <div className='flex flex-col sm:flex-row max-sm:is-full items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Procurar faturas...'
              className='max-sm:is-full min-is-[200px]'
            />
            {/* <FormControl fullWidth size='small' className='min-is-[175px]'>
              <InputLabel id='status-select'>Status da Fatura</InputLabel>
              <Select
                fullWidth
                id='select-status'
                value={status}
                onChange={e => setStatus(e.target.value as CustomerInvoice['status'])}
                label='Status da Fatura'
                labelId='status-select'
              >
                <MenuItem value=''>Todos</MenuItem>
                <MenuItem value='PENDING'>Pendentes</MenuItem>
                <MenuItem value='RECEIVED'>Pagas</MenuItem>
                <MenuItem value='OVERDUE'>Vencidas</MenuItem>
              </Select>
            </FormControl> */}
          </div>
        </CardContent>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='ri-arrow-up-s-line text-xl' />,
                            desc: <i className='ri-arrow-down-s-line text-xl' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                    Nenhum dado disponível
                  </td>
                </tr>
              ) : (
                table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component='div'
          className='border-bs'
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
          onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        />
      </Card>

      <InvoiceViewModal
        open={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false)
          setSelectedPaymentId(null)
        }}
        paymentId={selectedPaymentId}
        title='Detalhes da Fatura'
      />

      <PricingPlansModal open={modalOpen} onClose={handleCloseModal} />
    </>
  )
}

export default InvoiceListTable
