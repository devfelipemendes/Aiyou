'use client'

// MUI Imports

import { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid2'

// Components Imports
import { parseISO, differenceInCalendarDays } from 'date-fns'

import RevenueReport from '@views/dashboards/crm/RevenueReport'
import CardWidgetsSalesOverview from '@views/dashboards/crm/SalesOverview'
import ActivityTimeline from '@views/dashboards/crm/ActivityTimeline'
import UpgradePlan from '@views/dashboards/crm/UpgradePlan'
import MeetingSchedule from '@views/dashboards/crm/MeetingSchedule'
import TotalSales from '@/views/dashboards/crm/TotalSales'
import type { ThemeColor } from '@/@core/types'

import HorizontalWithBorderExample from '@/components/HorizontalWithBorderExample'
import AvailableSoon from '@/components/AvailableSoon'

import { useGetActivitiesQuery } from '@/api/endpoints/activity/activity'
import FirstAccessModal from '@/components/dialogs/firstAccess'
import { useUserMe } from '@/hooks/useUserMe'
import { useAppDispatch, useAppSelector } from '@/redux-store'
import { selectFirstAccess } from '@/api/endpoints/authUser/me'
import { openModal, setFirstAccess } from '@/redux-store/slices/firstAccessSlice'
import EstatisticsDash from './EstatisticsDash'
import { useGetStatisticsQuery } from '@/api/endpoints/statistics/statistics'

import type { Protocol, ProtocolMessage } from '@/api/endpoints/protocols/protocols'
import { useGetProtocolsQuery, useLazyGetProtocolHistoryQuery } from '@/api/endpoints/protocols/protocols'

export type DataTypeEstatisticsDash = {
  icon: string
  stats: string
  title: string
  color: ThemeColor
}
type ResoluctionsArray = {
  operator: number[]
  ia: number[]
}

const DashboardCRM = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, error, isLoading: isLoadingStatistics, isFetching } = useGetStatisticsQuery({})
  const [totalText, setTotalText] = useState<string>('0')
  const [totalAudio, setTotalAudio] = useState<string>('0')
  const [totalOperator, setTotalOperator] = useState<string>('0')
  const [isLoadingAudioAndText, setIsLoadingAudioAndText] = useState<boolean>(true)
  const [fetchProtocolHistory] = useLazyGetProtocolHistoryQuery()

  const [resoluctions, setResoluctions] = useState<ResoluctionsArray>({
    operator: Array(9).fill(0),
    ia: Array(9).fill(0)
  })

  const { data: dataActivity, isLoading } = useGetActivitiesQuery({
    sort: '-created_at'
  })

  const {
    data: dataInteractions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error: errorInteractions,
    isLoading: isLoadingInteractions
  } = useGetProtocolsQuery({
    sort: '-created_at'
  })

  const calculaAudioAndText_2 = async (arrayConversas: ProtocolMessage[]) => {
    if (!arrayConversas) return

    let text = 0
    let audio = 0
    let operator = 0

    arrayConversas.forEach((conversa: ProtocolMessage) => {
      if (conversa.message_type === 'text') {
        text++
      }

      if (conversa.message_type === 'audio') {
        audio++
      }

      if (conversa.operator) {
        operator++
      }
    })

    setTotalText(String(text))
    setTotalAudio(String(audio))
    setTotalOperator(String(operator))
    setIsLoadingAudioAndText(false)
  }

  const calculaAudioAndText = async () => {
    if (!dataInteractions?.data) return

    setIsLoadingAudioAndText(true)

    calculaOperadorVsIa(dataInteractions?.data)

    const promises = dataInteractions.data.map(interaction =>
      fetchProtocolHistory({ protocol: interaction.protocol }).unwrap()
    )

    try {
      const resultados = await Promise.all(promises)
      const arrayConversas = resultados.flatMap(res => res.data)

      console.log('arrayConversas', arrayConversas)

      calculaAudioAndText_2(arrayConversas)
    } catch (err) {
      console.error(err)
    }
  }

  const calculaOperadorVsIa = (data: Protocol[]) => {
    const operadorArr = Array(9).fill(0)
    const iaArr = Array(9).fill(0)
    const today = new Date()

    data.forEach(protocolo => {
      if (protocolo.status === 'resolved' && protocolo.updated_at) {
        const updatedDate = parseISO(protocolo.updated_at)
        const diff = differenceInCalendarDays(today, updatedDate)

        if (diff >= 0 && diff < 9) {
          // diff = 0 => hoje, diff = 1 => ontem, etc
          if (protocolo.operator) {
            operadorArr[8 - diff]++ // invertendo para o gráfico ficar do mais antigo à esquerda
          } else {
            iaArr[8 - diff]++
          }
        }
      }
    })

    setResoluctions({ operator: operadorArr, ia: iaArr })
  }

  useEffect(() => {
    if (!dataInteractions) return
    calculaAudioAndText()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataInteractions])

  const { firstAccess } = useUserMe()
  const dispatch = useAppDispatch()

  console.log('First Access: do hook', firstAccess)

  const apiFirstAccess = useAppSelector(selectFirstAccess)

  useEffect(() => {
    if (apiFirstAccess === true) {
      dispatch(setFirstAccess(true))
      dispatch(openModal())
    }

    if (apiFirstAccess === false) {
      dispatch(setFirstAccess(false))
    }
  }, [apiFirstAccess, dispatch])

  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }} className='self-end'>
          <EstatisticsDash data={data} isLoading={isFetching} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }} className='self-end relative'>
          {/* <AvailableSoon /> */}
          <HorizontalWithBorderExample
            isLoading={isLoadingAudioAndText}
            color='primary'
            icon='ri-mic-fill'
            value={totalAudio}
            title='Interações em voz'
            month={''}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }} className='self-end'>
          <HorizontalWithBorderExample
            isLoading={isLoadingAudioAndText}
            color='info'
            icon='ri-chat-3-line'
            value={totalText}
            title='Interações em Texto'
            month={''}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 4 }} className='self-end relative'>
          {/* <AvailableSoon /> */}
          <HorizontalWithBorderExample
            isLoading={isLoadingAudioAndText}
            color='success'
            icon='ri-user-3-line'
            value={totalOperator}
            title='Interações com operador'
            month={''}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TotalSales protocols={dataInteractions?.data} isLoadingInteractions={isLoadingInteractions} />
        </Grid>
        <Grid className='relative' size={{ xs: 12, sm: 6, md: 3 }}>
          <RevenueReport
            series={[
              { name: 'IA', data: resoluctions.ia },
              { name: 'Operador', data: resoluctions.operator }
            ]}
          />
        </Grid>
        <Grid className='relative' size={{ xs: 12, md: 6 }}>
          <AvailableSoon />
          <CardWidgetsSalesOverview />
        </Grid>
        <Grid className='relative' size={{ xs: 12, md: 12 }}>
          <ActivityTimeline isLoading={isLoading} dataFiltered_3={dataActivity?.data ?? []} />
        </Grid>
        <Grid className='relative' size={{ xs: 12, sm: 6, lg: 6 }}>
          <AvailableSoon />
          <MeetingSchedule />
        </Grid>
        <Grid className='relative' size={{ xs: 12, sm: 6, lg: 6 }}>
          <UpgradePlan />
        </Grid>
      </Grid>
      <FirstAccessModal />
    </>
  )
}

export default DashboardCRM
