// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Types Imports
import type { CardStatsCharacterProps } from '@/types/pages/widgetTypes'

const CardStatWithImage = (props: CardStatsCharacterProps) => {
  // Props
  const { title, stats, trendNumber, trend, chipText, chipColor } = props

  return (
    <Card>
      <CardContent>
        {/* Título */}
        {title && (
          <Typography color='text.primary' className='font-medium'>
            {title}
          </Typography>
        )}

        {/* Stats e Trend */}
        <div className='flex items-center gap-2 pbs-4 pbe-1.5 is-1/2 flex-wrap'>
          {stats !== undefined && <Typography variant='h4'>{stats}</Typography>}

          {trendNumber !== undefined && (
            <Typography color={trend === 'negative' ? 'error.main' : 'success.main'}>
              {`${trend === 'negative' ? '-' : '+'}${trendNumber}`}
            </Typography>
          )}
        </div>

        {/* Chip */}
        {chipText && chipColor && <Chip label={chipText} color={chipColor} variant='tonal' size='small' />}
      </CardContent>
    </Card>
  )
}

export default CardStatWithImage
