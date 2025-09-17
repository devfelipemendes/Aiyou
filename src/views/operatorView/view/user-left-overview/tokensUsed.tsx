// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Button from '@mui/material/Button'
import type { ButtonProps } from '@mui/material/Button'

// Component Imports
import UpgradePlan from '@components/dialogs/upgrade-plan'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

const TokensUsed = () => {
  // Vars
  const buttonProps: ButtonProps = {
    variant: 'contained',
    children: 'Adquira mais tokens'
  }

  return (
    <>
      <Card className='border-2 border-primary rounded'>
        <CardContent className='flex flex-col gap-6'>
          <div className='flex justify-between'>
            <Chip label='Uso de tokens deste assistente' size='small' color='primary' variant='tonal' />
            <div className='flex justify-center gap-2'>
              <Typography variant='h5' component='sup' className='self-start' color='primary.main'>
                Total:
              </Typography>
              <Typography component='span' variant='h1' color='primary.main'>
                5 mil
              </Typography>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <i className='ri-circle-fill text-[10px] text-textSecondary' />
              <Typography component='span'>532 atendimentos realizados</Typography>
            </div>
            <div className='flex items-center gap-2'>
              <i className='ri-circle-fill text-[10px] text-textSecondary' />
              <Typography component='span'>Média de tokens: 4 mil tokens por interação</Typography>
            </div>
            <div className='flex items-center gap-2'>
              <i className='ri-circle-fill text-[10px] text-textSecondary' />
              <Typography component='span'>Interações Inside</Typography>
            </div>
          </div>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center justify-between'>
              <Typography className='font-medium' color='text.primary'>
                Tokens
              </Typography>
              <Typography className='font-medium' color='text.primary'>
                Ainda disponiveis: 1750
              </Typography>
            </div>
            <LinearProgress variant='determinate' value={65} />
            <Typography variant='body2'>3250 tokens usados</Typography>
          </div>
          <OpenDialogOnElementClick element={Button} elementProps={buttonProps} dialog={UpgradePlan} />
        </CardContent>
      </Card>
    </>
  )
}

export default TokensUsed
