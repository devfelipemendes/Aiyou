'use client'

// MUI Imports
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import type { CardProps } from '@mui/material/Card'

// Types Imports
import { CircularProgress } from '@mui/material'

import type { ThemeColor } from '@core/types'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

type Props = CardProps & {
  color: ThemeColor
}

const Card = styled(MuiCard)<Props>(({ color }) => ({
  transition: 'border 0.3s ease-in-out, box-shadow 0.3s ease-in-out, margin 0.3s ease-in-out',
  borderBottomWidth: '2px',
  borderBottomColor: `var(--mui-palette-${color}-darkerOpacity)`,
  '[data-skin="bordered"] &:hover': {
    boxShadow: 'none'
  },
  '&:hover': {
    borderBottomWidth: '3px',
    borderBottomColor: `var(--mui-palette-${color}-main) !important`,
    boxShadow: 'var(--mui-customShadows-xl)',
    marginBlockEnd: '-1px'
  }
}))

interface PropsCard {
  color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  icon: string
  value: string
  title: string | number
  month: string
  isLoading: boolean
}

const HorizontalWithBorderExample = ({ color, icon, value, title, month, isLoading }: PropsCard) => {
  // Dados internos de exemplo

  return (
    <Card color={color}>
      <CardContent className='flex flex-col gap-2'>
        <div className='flex items-center gap-4'>
          <CustomAvatar color={color} skin='light' variant='rounded'>
            <i className={icon} />
          </CustomAvatar>
          <Typography variant='h4'>{isLoading ? <CircularProgress size={15} /> : (value ?? '0')}</Typography>
        </div>
        <div className='flex flex-col justify-center'>
          <Typography color='text.primary'>{title}</Typography>
          <div className='flex items-center gap-2'>
            <Typography variant='body2' color='text.disabled'>
              {month}
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default HorizontalWithBorderExample
