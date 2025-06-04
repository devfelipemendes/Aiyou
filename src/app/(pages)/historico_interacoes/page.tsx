'use client'

import React, { useState, type ChangeEvent } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import { Card, CardContent, CardHeader, TextField } from '@mui/material'

import { ptBR } from 'date-fns/locale/pt-BR'

import type { CustomInputVerticalData } from '@/@core/components/custom-inputs/types'
import CustomInputVertical from '@/@core/components/custom-inputs/Vertical'
import ListTable from '@/components/ListTable'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

export default function HistoricoInteracoes() {
  const data: CustomInputVerticalData[] = [
    {
      value: 'texto',
      title: 'Interações via texto',
      isSelected: true,
      content: 'Todas as interações feitas via texto pela IA.',
      asset: 'ri-wechat-line'
    },
    {
      value: 'voz',
      title: 'Interações via voz',
      content: 'Todas as intarações feitas via ligação pela IA',
      asset: 'ri-user-voice-line'
    },
    {
      value: 'operador',
      title: 'Interações do Operador',
      content: 'Todas as interações via texto feitas por um operador',
      asset: 'ri-account-pin-circle-line'
    }
  ]

  const initialSelected: string = data.filter(item => item.isSelected)[data.filter(item => item.isSelected).length - 1]
    .value

  // States
  const [selected, setSelected] = useState<string>(initialSelected)
  const [dateFilter, setDateFilter] = useState<Date>(new Date())

  const handleChange = (prop: string | ChangeEvent<HTMLInputElement>) => {
    if (typeof prop === 'string') {
      setSelected(prop)
    } else {
      setSelected((prop.target as HTMLInputElement).value)
    }
  }

  //* exemplo de uso das colunas
  // const columnHelper = createColumnHelper<NuageConsumoResultadosType>()

  //   const columns = useMemo<ColumnDef<NuageConsumoResultadosType, any>[]>(
  //   () => [
  //     columnHelper.accessor('dtConsumo', {
  //       header: 'Data do Consumo',
  //       cell: ({ row }) => (
  //         <Typography>{row.original.dtConsumo ? format(row.original.dtConsumo, 'dd/MM/yyyy') : '-'}</Typography>
  //       )
  //     }),
  //     columnHelper.accessor('qtUsado', {
  //       header: 'Minutos',
  //       cell: ({ row }) => <Typography>{row.original.qtUsado ? secondsToTime(row.original.qtUsado) : '-'}</Typography>
  //     })
  //   ],
  //   []
  // )

  return (
    <Card>
      <CardHeader title={''} subheader={''} />
      <CardContent>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={4}>
              {data.map((item, index) => {
                let asset

                if (item.asset && typeof item.asset === 'string') {
                  asset = <i className={item.asset + ' text-[40px]'} />
                }

                return (
                  <CustomInputVertical
                    type='radio'
                    key={index}
                    data={{ ...item, asset }}
                    selected={selected}
                    name='custom-radios-icons'
                    handleChange={handleChange}
                    gridProps={{ size: { xs: 12, sm: 4 } }}
                  />
                )
              })}
            </Grid>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ListTable
              exportFileName={``}
              loading={false}
              columns={[]}
              tableData={[]}
              headerTable={
                <CardHeader
                  title={`Histórico de interações ${'via' + ' ' + selected}`}
                  action={
                    <AppReactDatepicker
                      boxProps={{ className: 'is-full sm:is-auto' }}
                      selected={dateFilter}
                      id='payment-date'
                      onChange={(date: Date | null) => {
                        if (date) setDateFilter(date)
                      }}
                      customInput={<TextField fullWidth size='small' className='is-full sm:is-auto' label='Data' />}
                      locale={ptBR}
                      placeholderText='dd/mm/yyyy'
                      dateFormat='MM/yyyy'
                      showMonthYearPicker
                      maxDate={new Date()}
                    />
                  }
                />
              }
              headerHasDivider
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
