import { styled } from '@mui/material/styles'
import { Box, Card, CardContent, IconButton, Tooltip, Typography } from '@mui/material'

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: theme.shadows[4]
  }
}))

const OperatorAvatar = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: 16,
  marginRight: '1rem'
}))

const CardTwo = ({ operator }: { operator: any }) => {
  // Dados fictícios

  return (
    <StyledCard variant='outlined'>
      <CardContent sx={{ p: 3 }} className='relative'>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 2 }}>
          {/* Avatar inicial do operador */}

          <OperatorAvatar>{operator.user.name.split(' ')[0][0]}</OperatorAvatar>

          <Box sx={{ flex: 1 }}>
            {/* Nome e status */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, height: '100%' }}>
              <Typography variant='h6' sx={{ fontWeight: 600 }}>
                {operator.user.name}
              </Typography>
              <i className='ri-customer-service-2-fill absolute right-0  mr-8 mt-2 text-[35px] text-primary' />
            </Box>

            <Box className='flex flex-col gap-1 mt-2'>
              <Typography className='flex flex-row gap-2 items-center' variant='body1' color='textSecondary'>
                Email:<Typography variant='body2'> {operator.user.email}</Typography>
              </Typography>
              <Typography className='flex flex-row gap-2 items-center' variant='body1' color='textSecondary'>
                CPF/CNPJ: <Typography variant='body2'>{operator.user.identifier}</Typography>
              </Typography>
              <Typography className='flex flex-row gap-2 items-center' variant='body1' color='textSecondary'>
                Telefone:<Typography variant='body2'>{operator.user.phone_number}</Typography>{' '}
                <Typography variant='body2' className='text-primary'>
                  |
                </Typography>
                WhatsApp:
                <Typography variant='body2'> {operator.user.whatsapp_number}</Typography>
              </Typography>
            </Box>
            {/* Informações de contato */}
          </Box>
          <Box className='absolute right-0 bottom-0 p-2'>
            <Tooltip title='Remover operador'>
              <IconButton color='error' size='small'>
                <i className='ri-delete-bin-line' />
              </IconButton>
            </Tooltip>

            <Tooltip title='Editar operador'>
              <IconButton color='primary' size='small'>
                <i className='ri-edit-line' />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  )
}

export default CardTwo
