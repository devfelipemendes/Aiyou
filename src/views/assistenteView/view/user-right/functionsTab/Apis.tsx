import CardHeader from '@mui/material/CardHeader'

import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import type { IconButtonProps } from '@mui/material'
import { Box, IconButton } from '@mui/material'

import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'
import CreateAssistant from '@/components/dialogs/create-assistant'

type DataType = {
  name: string
  profession: string
  totalCourses: number
  avatar: string
}

const data: DataType[] = [
  { name: 'Jordan Stevenson', profession: 'Business Intelligence', totalCourses: 33, avatar: '/images/avatars/1.png' },
  { name: 'Bentlee Emblin', profession: 'Digital Marketing', totalCourses: 52, avatar: '/images/avatars/2.png' },
  { name: 'Benedetto Rossiter', profession: 'UI/UX Design', totalCourses: 12, avatar: '/images/avatars/3.png' },
  { name: 'Beverlie Krabbe', profession: 'Vue', totalCourses: 8, avatar: '/images/avatars/4.png' }
]

// 🔥 Botão com fundo (estilo contained)
const iconButtonProps: IconButtonProps = {
  color: 'primary',
  children: <i className='ri-key-2-line text-[28px]' />,
  sx: {
    backgroundColor: 'primary.main',
    color: 'white',
    '&:hover': {
      backgroundColor: 'primary.dark'
    },
    width: 50,
    height: 50,
    borderRadius: '8px'
  }
}

const Apis = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <CardHeader
        title='Popular Instructors'
        action={<OptionMenu iconClassName='text-textPrimary' options={['Refresh', 'Update', 'Share']} />}
      />
      <Divider />
      <div className='flex justify-between plb-4 pli-5'>
        <Typography variant='overline'>Apis</Typography>
        <Typography variant='overline'>Ações</Typography>
      </div>
      <Divider />

      {data.map((item, i) => (
        <div key={i} className='flex items-center gap-4'>
          <CustomAvatar size={34} src={item.avatar} />
          <div className='flex justify-between items-center is-full'>
            <div className='flex flex-col gap-1 mt-5'>
              <Typography className='font-medium' color='text.primary'>
                {item.name}
              </Typography>
              <Typography>{item.profession}</Typography>
            </div>
            <OpenDialogOnElementClick element={IconButton} elementProps={iconButtonProps} dialog={CreateAssistant} />
          </div>
        </div>
      ))}
    </Box>
  )
}

export default Apis
