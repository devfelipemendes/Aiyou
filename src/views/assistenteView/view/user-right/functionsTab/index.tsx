'use client'

import { useState, type SyntheticEvent } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { Card, CardContent, Divider, Box } from '@mui/material'

// Icones

// Component Imports
import { Brain, Cable, Phone } from 'lucide-react'

import CustomTabList from '@/@core/components/mui/TabList'
import Apis from './Apis'
import Comportamento from './Comportamento'
import Telefones from './Telefones'
import type { GetSingleAssistantResponse, useGetSingleAssistantQuery } from '@/api/endpoints/assistant/assistant'

const FunctionsTab = ({
  data,
  refetch
}: {
  data: GetSingleAssistantResponse | undefined
  refetch: ReturnType<typeof useGetSingleAssistantQuery>['refetch']
}) => {
  const [value, setValue] = useState<string>('apis')

  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  return (
    <Card className='w-full'>
      <CardContent>
        <TabContext value={value}>
          <div className='flex'>
            <CustomTabList
              pill='true'
              orientation='vertical'
              onChange={handleChange}
              aria-label='vertical tabs example'
              sx={{ alignItems: 'flex-start' }} // alinhamento das tabs à esquerda
            >
              <Tab value='apis' icon={<Cable />} iconPosition='start' label='Apis' />
              <Tab value='comportamento' icon={<Brain />} iconPosition='start' label='Comportamento' />
              <Tab value='telefones' icon={<Phone />} iconPosition='start' label='Telefones' />
            </CustomTabList>

            {/* Divider vertical */}
            <Divider orientation='vertical' flexItem sx={{ mx: 2 }} />

            <Box className='flex-1 p-4'>
              <TabPanel value='apis'>
                <Apis data={data} />
              </TabPanel>
              <TabPanel value='comportamento'>
                <Comportamento data={data} />
              </TabPanel>
              <TabPanel value='telefones'>
                <Telefones data={data} refetch={refetch} />
              </TabPanel>
            </Box>
          </div>
        </TabContext>
      </CardContent>
    </Card>
  )
}

export default FunctionsTab
