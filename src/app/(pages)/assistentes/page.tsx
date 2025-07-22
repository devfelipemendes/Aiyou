'use client'

import React from 'react'

import { useRouter } from 'next/navigation'

import { Button, Card, CardActions, CardContent, CardHeader } from '@mui/material'

import Grid from '@mui/material/Grid2'

import CardUser from '@/@core/components/Cards/CardUser'

const usersData: any[] = [
  {
    id: 1,
    avatarSrc: '/images/avatars/1.png',
    name: 'Ana Silva',
    location: 'São Paulo, BR',
    projectName: 'E-commerce Platform',
    projectAvatarSrc: '/images/projects/ecommerce.png'
  },
  {
    id: 2,
    avatarSrc: '/images/avatars/2.png',
    name: 'Carlos Santos',
    location: 'Rio de Janeiro, BR',
    projectName: 'Mobile Banking App',
    projectAvatarSrc: '/images/projects/banking.png'
  },
  {
    id: 3,
    avatarSrc: '/images/avatars/3.png',
    name: 'Marina Costa',
    location: 'Brasília, BR',
    projectName: 'Healthcare System',
    projectAvatarSrc: '/images/projects/healthcare.png'
  },
  {
    id: 4,
    avatarSrc: '/images/avatars/4.png',
    name: 'João Oliveira',
    location: 'Belo Horizonte, BR',
    projectName: 'Education Portal',
    projectAvatarSrc: '/images/projects/education.png'
  },
  {
    id: 5,
    avatarSrc: '/images/avatars/5.png',
    name: 'Fernanda Lima',
    location: 'Salvador, BR',
    projectName: 'Food Delivery',
    projectAvatarSrc: '/images/projects/food.png'
  },
  {
    id: 6,
    avatarSrc: '/images/avatars/6.png',
    name: 'Roberto Alves',
    location: 'Fortaleza, BR',
    projectName: 'IoT Dashboard',
    projectAvatarSrc: '/images/projects/iot.png'
  },
  {
    id: 7,
    avatarSrc: '/images/avatars/7.png',
    name: 'Juliana Rocha',
    location: 'Curitiba, BR',
    projectName: 'Social Network',
    projectAvatarSrc: '/images/projects/social.png'
  },
  {
    id: 8,
    avatarSrc: '/images/avatars/8.png',
    name: 'Pedro Mendes',
    location: 'Porto Alegre, BR',
    projectName: 'CRM System',
    projectAvatarSrc: '/images/projects/crm.png'
  },
  {
    id: 9,
    avatarSrc: '/images/avatars/9.png',
    name: 'Camila Ferreira',
    location: 'Recife, BR',
    projectName: 'Travel Planner',
    projectAvatarSrc: '/images/projects/travel.png'
  },
  {
    id: 10,
    avatarSrc: '/images/avatars/10.png',
    name: 'Lucas Barbosa',
    location: 'Goiânia, BR',
    projectName: 'Fitness Tracker',
    projectAvatarSrc: '/images/projects/fitness.png'
  },
  {
    id: 11,
    avatarSrc: '/images/avatars/11.png',
    name: 'Beatriz Cardoso',
    location: 'Manaus, BR',
    projectName: 'Inventory Management',
    projectAvatarSrc: '/images/projects/inventory.png'
  },
  {
    id: 12,
    avatarSrc: '/images/avatars/12.png',
    name: 'Gabriel Torres',
    location: 'Vitória, BR',
    projectName: 'Real Estate Platform',
    projectAvatarSrc: '/images/projects/realestate.png'
  }
]

export default function Assitentes() {
  const navigate = useRouter()

  const handleUserClick = (user: any) => {
    console.log('Usuário clicado:', user.name)
    navigate.push('/assistentes/detalhes_assistente')
  }

  return (
    <Card>
      <CardHeader title='Assistentes cadastrados' />
      <CardActions>
        <Button variant='contained' endIcon={<i className={'ri-robot-3-line'} />}>
          Cadastrar novo assistente
        </Button>
      </CardActions>
      <CardContent>
        <Grid container spacing={3}>
          {usersData.map((user: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={user.id}>
              <CardUser
                avatarSrc={user.avatarSrc}
                name={user.name}
                location={user.location}
                projectName={user.projectName}
                projectAvatarSrc={user.projectAvatarSrc}
                onClick={() => handleUserClick(user.name)}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}
