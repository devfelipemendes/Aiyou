// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import type { ButtonProps } from '@mui/material/Button'

// Type Imports

// Component Imports
import EditUserInfo from '@components/dialogs/edit-user-info'
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

import type { ThemeColor } from '@core/types'
import CustomAvatar from '@core/components/mui/Avatar'
import type { ProcessedAssistant } from '@/api/endpoints/assistant/assistant'

// Vars
const userData = {
  firstName: 'Assistente Bruno',
  campanha: 'SDR Brasilia',
  status: 'ATIVO',
  tipo: 'VOZ',
  numeroRegistrado: '+55 (61) 9 9999-9999',
  language: ['English'],
  useAsBillingAddress: true
}

const AssistenteDetails = ({ assistente }: { assistente: ProcessedAssistant | undefined }) => {
  console.log('assistenteuserleft', assistente)

  const buttonProps = (children: string, color: ThemeColor, variant: ButtonProps['variant']): ButtonProps => ({
    children,
    color,
    variant
  })

  return (
    <>
      <Card>
        <CardContent className='flex flex-col pbs-12 gap-6'>
          <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-center flex-col gap-4'>
              <div className='flex flex-col items-center gap-4'>
                <CustomAvatar alt='user-profile' src='/images/avatars/1.png' variant='rounded' size={120} />
                <Typography variant='h5'>{`${userData.firstName}`}</Typography>
              </div>
              <Chip label='ATIVO' color='success' size='small' variant='tonal' />
            </div>
            <div className='flex items-center justify-around flex-wrap gap-4'>
              <div className='flex items-center gap-4'>
                <CustomAvatar variant='rounded' color='primary' skin='light'>
                  <i className='ri-briefcase-line' />
                </CustomAvatar>
                <div>
                  <Typography>Projeto teste #3333333</Typography>
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <CustomAvatar variant='rounded' color='primary' skin='light'>
                  <i className='ri-calendar-line' />
                </CustomAvatar>
                <div>
                  <Typography>Criado em 22-22-2222</Typography>
                </div>
              </div>
            </div>
          </div>
          {/* <div>
            <Typography variant='h5'>Detalhes</Typography>
            <Divider className='mlb-4' />
            <div className='flex flex-col gap-2'>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  Tipo:
                </Typography>
                <Typography color='text.primary'>{userData.tipo}</Typography>
              </div>

              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  Numero:
                </Typography>
                <Typography color='text.primary'>{userData.numeroRegistrado}</Typography>
              </div>
            </div>
          </div> */}
          <div className='flex gap-4 justify-center'>
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
    </>
  )
}

export default AssistenteDetails
