// file: src/app/(dashboard)/integrations/page.tsx
'use client'

import { useState } from 'react'

import { Box, Container, Tab, Tabs, Paper } from '@mui/material'

import StepCreateApi from '@/views/projects_register/StepCreateApi'
import StepCreateEndpoints from '@/views/projects_register/StepCreateEndpoints'
import StepCreateFunctions from '@/views/projects_register/StepCreateFunctions'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role='tabpanel' hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export default function IntegrationsPage() {
  const [currentTab, setCurrentTab] = useState(0)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label='integration tabs' sx={{ px: 2 }}>
            <Tab label='Cadastro de API' id='tab-0' />
            <Tab label='Cadastro de Endpoints' id='tab-1' />
            <Tab label='Cadastro de Funções' id='tab-2' />
          </Tabs>
        </Box>

        <Box sx={{ px: 3 }}>
          <TabPanel value={currentTab} index={0}>
            <StepCreateApi />
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <StepCreateEndpoints />
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <StepCreateFunctions
              activeStep={0}
              handleNext={function (): void {
                throw new Error('Function not implemented.')
              }}
              handlePrev={function (): void {
                throw new Error('Function not implemented.')
              }}
              steps={[]}
            />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  )
}
