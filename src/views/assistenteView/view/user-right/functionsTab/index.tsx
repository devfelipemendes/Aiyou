import { useState, type SyntheticEvent } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { Card, CardContent, Divider } from '@mui/material'

// Component Imports
import CustomTabList from '@/@core/components/mui/TabList'
import Apis from './Apis'
import Comportamento from './Comportamento'
import type { GetSingleAssistantResponse } from '@/api/endpoints/assistant/assistant'

const FunctionsTab = ({ data }: { data: GetSingleAssistantResponse | undefined }) => {
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
            >
              <Tab value='apis' label='Apis' />
              <Tab value='comportamento' label='Comportamento' />
            </CustomTabList>

            {/* Divider vertical */}
            <Divider orientation='vertical' flexItem sx={{ mx: 2 }} />

            <div className='flex-1 p-4'>
              <TabPanel value='apis'>
                <Apis />
              </TabPanel>
              <TabPanel value='comportamento'>
                <Comportamento data={data} />
              </TabPanel>
            </div>
          </div>
        </TabContext>
      </CardContent>
    </Card>
  )
}

export default FunctionsTab
