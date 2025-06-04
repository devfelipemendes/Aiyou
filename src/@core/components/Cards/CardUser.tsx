'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Tipagem das props do componente
interface CardUserProps {
  avatarSrc: string
  name: string
  location: string
  projectName: string
  projectAvatarSrc: string
  onClick: () => void
}

const CardUser = ({ avatarSrc, name, location, projectName, projectAvatarSrc, onClick }: CardUserProps) => {
  // Gera um número aleatório entre 1 e 10 para a imagem do card
  const randomCardNumber = Math.floor(Math.random() * 10) + 1

  return (
    <Card>
      <CardMedia image={`/images/cards/${randomCardNumber}.png`} className='bs-[180px]' />
      <CardContent className='relative'>
        <Avatar
          src={avatarSrc}
          alt={name}
          className='is-[78px] bs-[78px] border-[5px] border-backgroundPaper absolute start-[11px] block-start-[-39px]'
        />
        <div className='flex justify-between items-center flex-wrap gap-x-4 gap-y-2 mbe-5 mbs-[30px]'>
          <div className='flex flex-col items-start'>
            <Typography variant='h5'>{name}</Typography>
            <Typography variant='body2'>{location}</Typography>
          </div>
          <Button variant='contained' onClick={onClick}>
            Visualizar Assistente
          </Button>
        </div>
        <div className='flex justify-between items-center flex-wrap gap-x-4 gap-y-2'>
          <Typography variant='subtitle2' color='text.disabled'>
            Vinculado ao projeto: {projectName}
          </Typography>
          <Avatar src={projectAvatarSrc} alt={projectName} />
        </div>
      </CardContent>
    </Card>
  )
}

export default CardUser
