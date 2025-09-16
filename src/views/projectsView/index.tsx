'use client'

// React Imports
import { useState } from 'react'
import type { ReactElement, SyntheticEvent } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'
import ProjectDetailsHeader from './ProjectDetailsHeader'
import type { GetProjectByIdResponse } from '@/api/endpoints/Projects/project'

const ProjectDetails = ({
  tabContentList,
  data
}: {
  tabContentList: { [key: string]: ReactElement }
  data: GetProjectByIdResponse | undefined
}) => {
  // States
  const [activeTab, setActiveTab] = useState('home')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ProjectDetailsHeader data={data} />
      </Grid>
      {activeTab === undefined ? null : (
        <Grid size={{ xs: 12 }} className='flex flex-col gap-6'>
          <TabContext value={activeTab}>
            <CustomTabList
              scrollButtons='auto'
              allowScrollButtonsMobile
              onChange={handleChange}
              variant='scrollable'
              pill='true'
            >
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='ri-home-line' />
                    Home
                  </div>
                }
                value='home'
              />
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='ri-robot-3-line' />
                    Assistentes
                  </div>
                }
                value='assistents'
              />
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='ri-chat-3-line text-lg' />
                    Interações
                  </div>
                }
                value='interactions'
              />
              {/* <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='ri-notification-3-line text-lg' />
                    Notificações
                  </div>
                }
                value='notifications'
              /> */}
            </CustomTabList>
            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]}
            </TabPanel>
          </TabContext>
        </Grid>
      )}
    </Grid>
  )
}

export default ProjectDetails
