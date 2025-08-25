'use client'

// React Imports
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

// MUI Imports

import { usePathname } from 'next/navigation'

import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField'

import * as XLSX from 'xlsx'

// Third-party Imports
import classnames from 'classnames'

import { rankItem } from '@tanstack/match-sorter-utils'
import {
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

// Style Imports
import { Box, Pagination, Skeleton, Typography } from '@mui/material'

import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

// Styled Components
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

interface ListTableProps {
  columns: ColumnDef<any, any>[]
  tableData?: any[]
  headerTable?: ReactNode
  headerHasDivider?: boolean
  hasExport?: boolean
  searchInputPlaceholder?: string
  actions?: ReactNode
  secondaryActions?: ReactNode
  onRowClick?: (row: any) => void
  isExpandable?: boolean
  pageSize?: number
  selectedRowsLength?: number
  loading?: boolean
  exportFileName?: string
  bordered?: boolean
}

const ListTable = ({
  headerTable,
  searchInputPlaceholder,
  actions,
  secondaryActions,
  tableData,
  columns,
  onRowClick,
  selectedRowsLength,
  loading,
  exportFileName,
  bordered = false,
  isExpandable = false,
  hasExport = true,
  headerHasDivider = false,
  pageSize = 25
}: ListTableProps) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [globalFilter, setGlobalFilter] = useState('')
  const [data, setData] = useState<any[] | undefined>(tableData || [])

  // Hooks
  const pathname = usePathname()

  const table = useReactTable({
    data: data as any[],
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
        pageSize: pageSize
      }
    },
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
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

  useEffect(() => {
    setData(tableData)
  }, [tableData])

  // Funcs
  const renderSkeletons = () => {
    const colSpan = table.getVisibleFlatColumns().length

    return (
      <tbody>
        {Array.from({ length: 8 }).map((_, index) => (
          <tr key={index} style={{ backgroundColor: 'transparent' }}>
            <td colSpan={colSpan} style={{ padding: 0, border: 'none', backgroundColor: 'transparent' }}>
              <Skeleton variant='rectangular' width='100%' height={50} className='rounded-md' />
            </td>
          </tr>
        ))}
      </tbody>
    )
  }

  const exportToExcel = () => {
    const nameFile = pathname.slice(1).replace('/', '.')

    const allRows = table.getCoreRowModel().rows

    const mappedData = allRows.map(row => {
      const newRow: any = {}

      table.getVisibleFlatColumns().forEach(column => {
        if (column.id === 'action') return

        if (column.id === 'select') return (newRow['SELEÇÃO'] = row.getIsSelected() ? 'Sim' : 'Não')

        const header = column.columnDef.header?.toString().toUpperCase()

        if (header !== undefined) return (newRow[header] = row.getValue(column.id))
      })

      return newRow
    })

    const worksheet = XLSX.utils.json_to_sheet(mappedData)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados')

    XLSX.writeFile(workbook, `${exportFileName ?? nameFile}.xlsx`)
  }

  return (
    <Card className={`${bordered && 'border rounded shadow-none'}`}>
      {headerTable}
      {headerHasDivider && <Divider />}
      <div className='flex justify-between p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
        <div className='w-full flex flex-col gap-4 xs:flex-row sm:w-auto items-center'>
          {hasExport && (
            <Button
              color='inherit'
              variant='outlined'
              startIcon={<i className='ri-upload-2-line text-xl' />}
              className='is-full sm:is-auto'
              onClick={exportToExcel}
              disabled={loading}
            >
              Exportar
            </Button>
          )}
          {secondaryActions}
        </div>
        <div className='flex items-center gap-x-4 is-full gap-4 flex-col sm:is-auto sm:flex-row'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder={searchInputPlaceholder ?? 'Buscar Linha'}
            className='is-full sm:is-auto'
          />
          {actions}
        </div>
      </div>
      <div className='overflow-x-auto overflow-y-auto max-h-[600px]'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'select-none': header.column.getCanSort(),
                            'cursor-pointer': !!onRowClick
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='ri-arrow-up-s-line text-xl' />,
                            desc: <i className='ri-arrow-down-s-line text-xl' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {loading ? (
            renderSkeletons()
          ) : table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  Nenhuma linha encontrada
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => {
                  return (
                    <Box
                      component='tr'
                      key={row.id}
                      className={classnames({ selected: row.getIsSelected(), 'cursor-pointer': !!onRowClick })}
                      onClick={() => onRowClick && onRowClick(row)}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td className={`${isExpandable && 'min-w-96'}`} key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </Box>
                  )
                })}
            </tbody>
          )}
        </table>
      </div>
      <div className={`flex ${!!selectedRowsLength ? 'justify-between' : 'justify-end'} items-center border-bs p-4`}>
        {!!selectedRowsLength && (
          <Typography>{`${selectedRowsLength} linha${selectedRowsLength > 1 ? 's' : ''} selecionada${
            selectedRowsLength > 1 ? 's' : ''
          }`}</Typography>
        )}

        <div className='flex gap-4 items-center'>
          {!!table.getFilteredRowModel().rows.length && (
            <Typography>
              {`${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-${Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
      de ${table.getFilteredRowModel().rows.length}`}
            </Typography>
          )}
          <Pagination
            variant='outlined'
            shape='rounded'
            color='primary'
            count={Math.ceil(table.getFilteredRowModel().rows.length / table.getState().pagination.pageSize)}
            page={table.getState().pagination.pageIndex + 1}
            onChange={(event, page) => {
              table.setPageIndex(page - 1)
            }}
          />
        </div>
      </div>
    </Card>
  )
}

export default ListTable
