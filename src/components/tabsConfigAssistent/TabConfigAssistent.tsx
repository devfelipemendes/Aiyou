// React Imports
import { useState } from 'react'
import type { SyntheticEvent } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { TextField } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

const TabConfigAssistent = () => {
  const [value, setValue] = useState<string>('Empresa')

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  const tabs = ['Empresa', 'Assistente', 'Primeiro contato', 'Funçoes', 'Especiais', 'Etapa', 'Despedida', 'Notas']

  return (
    <Card>
      <CardHeader title={`Instrua e defina o comportamento desse assistente`} />
      <CardContent>
        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label='tabs'>
            {tabs.map(tab => (
              <Tab key={tab} value={tab} label={tab} />
            ))}
          </TabList>

          {tabs.map(tab => (
            <TabPanel key={tab} value={tab}>
              <TextField fullWidth label={'teste'} rows={10} multiline={true} placeholder='teste' />
            </TabPanel>
          ))}
        </TabContext>

        <LoadingButton fullWidth variant='contained' type='submit' className='mt-4'>
          Salvar
        </LoadingButton>
      </CardContent>
    </Card>
  )
}

export default TabConfigAssistent
