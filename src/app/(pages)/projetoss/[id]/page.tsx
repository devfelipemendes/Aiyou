'use client'

import type { ReactElement } from 'react'

import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

import CircularProgress from '@mui/material/CircularProgress'

import ProjectDetails from '@/views/projectsView'
import { useGetProjectByIdQuery } from '@/api/endpoints/Projects/project'

// Dinâmicos
const HomeProject = dynamic(() => import('@views/projectsView/tabs/HomeProject'))
const InteractionsProject = dynamic(() => import('@views/projectsView/tabs/InteractionsProject'))
const AssistenstProject = dynamic(() => import('@views/projectsView/tabs/AssistenstProject'))
const NotificationsProject = dynamic(() => import('@views/projectsView/tabs/NotificationsProject'))

const ProjectTabView = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''

  // Pegando projeto do backend
  const { data, error, isLoading, refetch } = useGetProjectByIdQuery(id)

  console.log(data)

  const tabContentList: { [key: string]: ReactElement } = {
    home: <HomeProject />,
    interactions: <InteractionsProject />,
    assistents: <AssistenstProject data={data} refetchProject={refetch} />,
    notifications: <NotificationsProject />
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center w-full h-full'>
        <CircularProgress />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex justify-center items-center w-full h-full'>
        <p>Erro ao carregar projeto.</p>
      </div>
    )
  }

  return <ProjectDetails tabContentList={tabContentList} data={data} />
}

export default ProjectTabView
