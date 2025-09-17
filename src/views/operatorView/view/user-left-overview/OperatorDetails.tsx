// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import type { ButtonProps } from '@mui/material/Button'
import Grid from '@mui/material/Grid'

// Component Imports

import { Building2, Mail, MapPinHouse, Phone } from 'lucide-react'

import type { Theme as MuiTheme } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'

import { CardHeader, LinearProgress } from '@mui/material'

import EditUserInfo from '@components/dialogs/edit-user-info'
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import CustomAvatar from '@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'

// Types
import type { ThemeColor } from '@core/types'

// Mock user data
const userData = {
  name: 'Giovanni Almeida',
  address: 'Quadra 49, 3, casa - Setor Leste (Gama), Brasília/DF - CEP: 72455-490',
  age: 0,
  cep: '72455-490',
  city: 'Brasília',
  email: 'giovani.silva@email.com',
  phone_number: '(61) 98361-2376',
  input_cached_tokens: 0,
  input_tokens: 101807,
  output_reasoning_tokens: 14080,
  output_tokens: 18177,
  total_tokens: 134064,
  status: 'ATIVO'
}

// type DataType = {
//   rating: number
//   value: number
//   title: string
// }

// Vars
// const totalReviewsData: DataType[] = [
//   { rating: 5, value: 109, title: 'Max Assistentes' },
//   { rating: 4, value: 40, title: 'Max Tokens' }
// ]

const OperatorDetails = ({ id }: { id?: any }) => {
  const buttonProps = (children: string, color: ThemeColor, variant: ButtonProps['variant']): ButtonProps => ({
    children,
    color,
    variant
  })

  const theme: MuiTheme = useTheme()

  console.log('tema', theme)

  return (
    <>
      <Card>
        <CardContent className='flex flex-col gap-6 p-6'>
          {/* Header */}
          <div className='flex flex-col items-center gap-4'>
            <CustomAvatar alt={userData.name} variant='rounded' className='text-[30px]' size={120}>
              {getInitials(userData.name).toUpperCase()}
            </CustomAvatar>
            <Typography variant='h5'>{userData.name}</Typography>
            <Chip label={userData.status} color='success' size='small' variant='tonal' />
          </div>

          {/* User Info Grid */}
          <Grid container spacing={3} className='mt-4'>
            <div className='flex flex-col gap-4 px-6'>
              {/* E-mail */}
              <div className='flex items-start gap-2'>
                <Mail color={theme.palette.primary.main} size={20} />
                <div className='flex-1'>
                  <Typography className='font-medium inline' color='text.primary'>
                    E-mail:{' '}
                  </Typography>
                  <Typography className='inline break-words'>{userData.email}</Typography>
                </div>
              </div>

              {/* Telefone */}
              <div className='flex items-start gap-2'>
                <Phone color={theme.palette.primary.main} size={20} />
                <div className='flex-1'>
                  <Typography className='font-medium inline' color='text.primary'>
                    Telefone:{' '}
                  </Typography>
                  <Typography className='inline break-words'>{userData.phone_number}</Typography>
                </div>
              </div>

              {/* Cidade */}
              <div className='flex items-start gap-2'>
                <Building2 color={theme.palette.primary.main} size={20} />
                <div className='flex-1'>
                  <Typography className='font-medium inline' color='text.primary'>
                    Cidade:{' '}
                  </Typography>
                  <Typography className='inline break-words'>{userData.city}</Typography>
                </div>
              </div>

              {/* Endereço */}
              <div className='flex items-start gap-2'>
                <MapPinHouse color={theme.palette.primary.main} size={20} />
                <div className='flex-1'>
                  <Typography className='font-medium inline' color='text.primary'>
                    Endereço:{' '}
                  </Typography>
                  <Typography className='inline break-words'>{userData.address}</Typography>
                </div>
              </div>
            </div>

            {/* <div className='mt-8 flex flex-row w-full justify-between px-5'>
              <h5>1</h5>
              <h5>1</h5>
              <h5>1</h5>
            </div> */}
          </Grid>

          {/* Actions */}
          <div className='flex gap-4 justify-center mt-6'>
            <OpenDialogOnElementClick
              element={Button}
              elementProps={buttonProps('Editar', 'primary', 'contained')}
              dialog={EditUserInfo}
              dialogProps={{ data: userData }}
            />

            <OpenDialogOnElementClick
              element={Button}
              elementProps={buttonProps('Excluir', 'error', 'outlined')}
              dialog={ConfirmationDialog}
              dialogProps={{ type: 'suspend-account' }}
            />
          </div>
        </CardContent>
      </Card>
      {/* <Card className='mt-2'>
        <CardHeader title='Plano:' />
        <CardContent className='flex flex-col gap-6 p-6'>
          <div className='flex flex-col gap-3 is-full '>
            {totalReviewsData.map((item, index) => (
              <div key={index} className='flex items-center gap-2'>
                <Typography variant='body2' className='text-nowrap'>
                  {item.rating} Star
                </Typography>
                <LinearProgress
                  color='primary'
                  value={Math.floor((item.value / 185) * 100)}
                  variant='determinate'
                  className='bs-2 is-full'
                />
                <Typography variant='body2'>{item.value}</Typography>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </>
  )
}

export default OperatorDetails
