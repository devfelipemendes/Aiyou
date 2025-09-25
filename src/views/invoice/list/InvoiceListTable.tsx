'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
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

import { parseISO } from 'date-fns'

import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import type { InvoiceType } from '@/types/invoiceTypes'
import { useGetCustomerInvoicesQuery, type CustomerInvoice } from '@/api/endpoints/invoices/invoice'
import { currencyFormatter, currencyMask } from '@/utils/currency'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
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
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

// Column Definitions

const InvoiceListTable = ({ invoiceData }: { invoiceData?: InvoiceType[] }) => {
  // States
  const [status, setStatus] = useState<CustomerInvoice['status']>('')
  const [rowSelection, setRowSelection] = useState({})

  const [globalFilter, setGlobalFilter] = useState('')

  // Hooks
  const {
    data: invoicesResponse,
    isLoading,
    error
  } = useGetCustomerInvoicesQuery({
    limit: 50,
    status: status || undefined
  })

  const invoices = useMemo(() => {
    const apiData = invoicesResponse?.data?.data
    const fallbackData = invoiceData

    // Retorna array vazio como último recurso
    return Array.isArray(apiData) ? apiData : Array.isArray(fallbackData) ? fallbackData : []
  }, [invoicesResponse?.data?.data, invoiceData])

  const columnHelper = createColumnHelper<CustomerInvoice>()

  const columns = useMemo<ColumnDef<CustomerInvoice, any>[]>(
    () => [
      // {
      //   id: 'select',
      //   header: ({ table }) => (
      //     <Checkbox
      //       {...{
      //         checked: table.getIsAllRowsSelected(),
      //         indeterminate: table.getIsSomeRowsSelected(),
      //         onChange: table.getToggleAllRowsSelectedHandler()
      //       }}
      //     />
      //   ),
      //   cell: ({ row }) => (
      //     <Checkbox
      //       {...{
      //         checked: row.getIsSelected(),
      //         disabled: !row.getCanSelect(),
      //         indeterminate: row.getIsSomeSelected(),
      //         onChange: row.getToggleSelectedHandler()
      //       }}
      //     />
      //   )
      // },
      columnHelper.accessor('id', {
        header: 'ID de pagamento',
        cell: ({ row }) => (
          <Typography component={Link} href={''} color='primary.main'>{`${row.original.id}`}</Typography>
        )
      }),

      columnHelper.accessor('dateCreated', {
        header: 'Data Criação',
        cell: ({ row }) => <Typography>{parseISO(row.original.dateCreated).toLocaleDateString('pt-BR')}</Typography>
      }),
      columnHelper.accessor('dueDate', {
        header: 'Vencimento',
        cell: ({ row }) => {
          const dueDate = parseISO(row.original.dueDate)
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
        cell: ({ row }) => (
          <Typography color='text.primary'>{currencyFormatter(row.original.value.toString())}</Typography>
        )
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

          const config =
            statusConfig[
              (row.original.status as keyof typeof statusConfig) in statusConfig
                ? (row.original.status as keyof typeof statusConfig)
                : 'PENDING'
            ]

          return (
            <Tooltip
              title={
                <div>
                  <Typography variant='body2' component='span' className='text-inherit'>
                    {config.label}
                  </Typography>
                  <br />
                  <Typography variant='body2' component='span' className='text-inherit'>
                    Valor:
                  </Typography>{' '}
                  R$ {(row.original.value / 100).toFixed(2)}
                  <br />
                  <Typography variant='body2' component='span' className='text-inherit'>
                    Vencimento:
                  </Typography>{' '}
                  {new Date(row.original.dueDate).toLocaleDateString('pt-BR')}
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
            <Tooltip title='Ver Fatura'>
              <IconButton>
                <Link href={row.original.invoiceUrl} target='_blank' className='flex'>
                  <i className='ri-external-link-line text-textSecondary' />
                </Link>
              </IconButton>
            </Tooltip>

            {row.original.bankSlipUrl && (
              <Tooltip title='Download Boleto'>
                <IconButton>
                  <Link href={row.original.bankSlipUrl} target='_blank' className='flex'>
                    <i className='ri-file-pdf-line text-textSecondary' />
                  </Link>
                </IconButton>
              </Tooltip>
            )}

            {row.original.transactionReceiptUrl && (
              <Tooltip title='Comprovante'>
                <IconButton>
                  <Link href={row.original.transactionReceiptUrl} target='_blank' className='flex'>
                    <i className='ri-receipt-line text-textSecondary' />
                  </Link>
                </IconButton>
              </Tooltip>
            )}

            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Ver Fatura Online',
                  icon: 'ri-eye-line',
                  menuItemProps: {
                    component: 'a',
                    href: row.original.invoiceUrl,
                    target: '_blank',
                    className: 'flex items-center gap-2 text-textSecondary'
                  }
                },
                ...(row.original.bankSlipUrl
                  ? [
                      {
                        text: 'Download Boleto PDF',
                        icon: 'ri-download-line',
                        menuItemProps: {
                          component: 'a',
                          href: row.original.bankSlipUrl,
                          target: '_blank',
                          className: 'flex items-center gap-2 text-textSecondary'
                        }
                      }
                    ]
                  : []),
                ...(row.original.transactionReceiptUrl
                  ? [
                      {
                        text: 'Ver Comprovante',
                        icon: 'ri-receipt-line',
                        menuItemProps: {
                          component: 'a',
                          href: row.original.transactionReceiptUrl,
                          target: '_blank',
                          className: 'flex items-center gap-2 text-textSecondary'
                        }
                      }
                    ]
                  : []),
                {
                  text: 'Copiar Link da Fatura',
                  icon: 'ri-file-copy-line',
                  menuItemProps: {
                    onClick: () => {
                      navigator.clipboard.writeText(row.original.invoiceUrl)
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
    data: invoices, // Garantido como array válido
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
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

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center py-12'>
          <Typography>Carregando faturas...</Typography>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center py-12'>
          <Typography color='error'>Erro ao carregar faturas. Tente novamente.</Typography>
        </CardContent>
      </Card>
    )
  }

  // Empty state
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
    <Card>
      <CardContent className='flex justify-between gap-4 flex-wrap flex-col sm:flex-row items-center'>
        <Button
          variant='contained'
          component={Link}
          startIcon={<i className='ri-add-line' />}
          href={'apps/invoice/add'}
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
          <FormControl fullWidth size='small' className='min-is-[175px]'>
            <InputLabel id='status-select'>Filtro por mês</InputLabel>
            <Select
              fullWidth
              id='select-status'
              value={status}
              onChange={(e: any) => setStatus(e.target.value)}
              label='Invoice Status'
              labelId='status-select'
            >
              <MenuItem value=''>none</MenuItem>
            </Select>
          </FormControl>
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
  )
}

export default InvoiceListTable
