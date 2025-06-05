// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

// Components Imports
import Link from '@components/Link'
import OptionMenu from '@core/components/option-menu'

type DataType = {
  avatarSrc: string
  title: string
  cardNumber: string
  alt: string
}

// Vars
const data: DataType[] = [
  {
    avatarSrc: '/images/logos/mastercard.png',
    title: 'Cartão de crédito',
    cardNumber: '2566 xxxx xxxx 8908',
    alt: 'master-card'
  },
  {
    avatarSrc: '/images/logos/dinners-club.png',
    title: 'Cartão de crédito',
    cardNumber: '8990 xxxx xxxx 6852',
    alt: 'credit-card'
  }
]

const UpgradePlan = () => {
  return (
    <Card>
      <CardHeader
        title='Melhore seu Plano'
        action={<OptionMenu iconClassName='text-textPrimary' options={['Last 28 Days', 'Last Month', 'Last Year']} />}
      />
      <CardContent className='flex flex-col gap-3'>
        <Typography variant='body2'>Melhore seu plano e tenha mais acessos a beneficios.</Typography>
        <div className='p-4 flex gap-4 rounded bg-primaryLight'>
          <div className='is-10 bs-10 p-2 rounded border border-primary'>
            <img src='/images/cards/briefcase.png' alt='briefcase' width={23} />
          </div>
          <div className='flex items-center justify-between is-full flex-wrap gap-x-4 gap-y-2'>
            <div className='flex flex-col gap-0.5'>
              <Typography color='text.primary' className='font-medium'>
                Platinum
              </Typography>
              <Typography variant='body2' component={Link} color='primary.main'>
                Melhore seu plano
              </Typography>
            </div>
            <div className='flex justify-center'>
              <Typography variant='body2' component='sup' color='text.primary' className='self-start mbs-[5px]'>
                R$
              </Typography>
              <Typography variant='h4' component='span'>
                15.500,00
              </Typography>
              <Typography variant='body2' component='sub' color='text.primary' className='self-end mbe-[5px]'>
                /mês
              </Typography>
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <Typography color='text.primary' className='font-medium'>
            Deatalhes de pagamento
          </Typography>
          {data.map((item, index) => (
            <div key={index} className='flex items-center gap-3'>
              <Avatar variant='rounded' className='bg-actionHover is-[42px] bs-[30px]'>
                <img src={item.avatarSrc} alt={item.alt} width={30} />
              </Avatar>

              <div className='flex items-center justify-between is-full flex-wrap gap-x-4 gap-y-2'>
                <div className='flex flex-col gap-1'>
                  <Typography color='text.primary' className='font-medium'>
                    {item.title}
                  </Typography>
                  <Typography variant='body2'>{item.cardNumber}</Typography>
                </div>
                <TextField name='cvv' label='CVV' size='small' className='is-20' />
              </div>
            </div>
          ))}
          <div>
            <Typography variant='body2' component={Link} color='primary.main'>
              Adicionar metodo de pagamento
            </Typography>
          </div>
        </div>
        <TextField fullWidth name='email' placeholder='Endereço de e-mail' size='small' />
        <Button variant='contained' color='primary' fullWidth>
          Contrate Agora
        </Button>
      </CardContent>
    </Card>
  )
}

export default UpgradePlan
