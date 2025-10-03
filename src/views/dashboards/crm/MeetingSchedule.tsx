// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'

import Typography from '@mui/material/Typography'

// Type Imports
import type { ThemeColor } from '@core/types'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

type DataType = {
  avatarSrc: string
  title: string
  subtitle: string
  chipLabel: string
  chipColor?: ThemeColor
}

// Vars
const data: DataType[] = [
  {
    avatarSrc: '/images/avatars/4.png',
    title: 'Contato feito contato1',
    subtitle: '21 Jul | 08:20-10:30',
    chipLabel: 'SDR',
    chipColor: 'primary'
  },
  {
    avatarSrc: '/images/avatars/8.png',
    title: 'Contato feito contato2',
    subtitle: '21 Jul | 11:30-12:00',
    chipLabel: 'SDR',
    chipColor: 'success'
  },
  {
    avatarSrc: '/images/avatars/5.png',
    title: 'Contato feito contato3',
    subtitle: '28 Jul | 05:00-6:45',
    chipLabel: 'SDR',
    chipColor: 'warning'
  },
  {
    avatarSrc: '/images/avatars/3.png',
    title: 'Contato feito contato4',
    subtitle: '03 Aug | 07:00-8:30',
    chipLabel: 'SDR',
    chipColor: 'secondary'
  },
  {
    avatarSrc: '/images/avatars/2.png',
    title: 'Contato feito contato5',
    subtitle: '14 Aug | 04:15-05:30',
    chipLabel: 'SDR',
    chipColor: 'error'
  },
  {
    avatarSrc: '/images/avatars/1.png',
    title: 'Contato feito contato6',
    subtitle: '05 Oct | 10:00-12:45',
    chipLabel: 'SDR',
    chipColor: 'primary'
  },
  {
    avatarSrc: '/images/avatars/1.png',
    title: 'Contato feito contato6',
    subtitle: '05 Oct | 10:00-12:45',
    chipLabel: 'SDR',
    chipColor: 'primary'
  },
  {
    avatarSrc: '/images/avatars/1.png',
    title: 'Contato feito contato6',
    subtitle: '05 Oct | 10:00-12:45',
    chipLabel: 'SDR',
    chipColor: 'primary'
  },
  {
    avatarSrc: '/images/avatars/1.png',
    title: 'Contato feito contato6',
    subtitle: '05 Oct | 10:00-12:45',
    chipLabel: 'SDR',
    chipColor: 'primary'
  }
]

const MeetingSchedule = () => {
  return (
    <Card>
      <CardHeader
        title='Historico de contatos por campanha'
        action={<OptionMenu iconClassName='text-textPrimary' options={['Campanha x', 'campanha y', 'campanha z']} />}
      />
      <CardContent className='flex flex-col gap-[1.71rem]'>
        {data.map((item, index) => (
          <div key={index} className='flex items-center gap-3'>
            <CustomAvatar src={item.avatarSrc} size={38} />

            <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
              <div className='flex flex-col gap-0.5'>
                <Typography color='text.primary' className='font-medium'>
                  {item.title}
                </Typography>
                <div className='flex items-center gap-2'>
                  <i className='ri-calendar-line text-base text-textSecondary' />
                  <Typography variant='body2'>{item.subtitle}</Typography>
                </div>
              </div>
              <Chip label={item.chipLabel} color={item.chipColor} size='small' variant='tonal' />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default MeetingSchedule
