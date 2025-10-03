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
import { TextField, Tooltip } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

import { toast } from 'react-toastify'

import type { useGetSingleAssistantQuery, GetSingleAssistantResponse } from '@/api/endpoints/assistant/assistant'
import { useUpdateInstructionMutation } from '@/api/endpoints/assistantFunctions/assistantFunctions'

// Descrições de cada tab
const tabDescriptions: Record<string, string> = {
  about: 'Descreva o assistente: quem ele é, seu estilo de comunicação e personalidade.',
  company: 'Informações sobre a empresa ou organização relacionada ao assistente.',
  first_contact: 'Como o assistente deve iniciar o primeiro contato com o usuário.',
  about_functions: 'Explique detalhadamente as funções que o assistente pode executar.',
  special_conditions: 'Condições especiais, limitações ou regras que o assistente deve seguir.',
  steps: 'Passos ou procedimentos que o assistente deve seguir em certas situações.',
  output_format: 'Formato desejado para respostas ou saídas do assistente.',
  notes: 'Notas adicionais que podem ajudar a refinar o comportamento do assistente.'
}

const TabConfigAssistent = ({
  data,
  refetch
}: {
  data: GetSingleAssistantResponse | undefined
  refetch: ReturnType<typeof useGetSingleAssistantQuery>['refetch']
}) => {
  const [value, setValue] = useState<string>('about')
  const [updateInstruction, { isLoading }] = useUpdateInstructionMutation()

  const [formValues, setFormValues] = useState({
    assistant_id: data?.data.id ?? '',
    about: data?.data.about ?? '',
    company: data?.data.company ?? '',
    first_contact: data?.data.first_contact ?? '',
    about_functions: data?.data.about_functions ?? '',
    special_conditions: data?.data.special_conditions ?? '',
    steps: data?.data.steps ?? '',
    output_format: data?.data.output_format ?? '',
    notes: data?.data.notes ?? ''
  })

  const handleChange = (event: SyntheticEvent, newValue: string) => setValue(newValue)

  const handleInputChange = (field: keyof typeof formValues, newValue: string) => {
    setFormValues(prev => ({ ...prev, [field]: newValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormEmpty) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const res = await updateInstruction(formValues).unwrap()

      toast.success('Dados atualizados com sucesso!')
      refetch()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message ?? 'Erro ao salvar dados')
    }
  }

  const tabs = [
    { key: 'about', label: 'Sobre Você' },
    { key: 'company', label: 'Empresa' },
    { key: 'first_contact', label: 'Primeiro Contato' },
    { key: 'about_functions', label: 'Sobre as Funções' },
    { key: 'special_conditions', label: 'Condições Especiais' },
    { key: 'steps', label: 'Passos' },
    { key: 'output_format', label: 'Formato de Saída' },
    { key: 'notes', label: 'Notas' }
  ] as const

  const isFormEmpty = Object.entries(formValues)
    .filter(([key]) => key !== 'assistant_id')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .every(([_, value]) => value === '')

  return (
    <Card>
      <CardHeader title='Instrua e defina o comportamento desse assistente' />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <TabContext value={value}>
            <TabList
              onChange={handleChange}
              aria-label='tabs'
              variant='scrollable'
              scrollButtons='auto'
              allowScrollButtonsMobile
            >
              {tabs.map(tab => (
                <Tab
                  key={tab.key}
                  value={tab.key}
                  label={
                    <Tooltip title={tabDescriptions[tab.key]} arrow placement='top'>
                      <span>{tab.label}</span>
                    </Tooltip>
                  }
                />
              ))}
            </TabList>

            {tabs.map(tab => (
              <TabPanel key={tab.key} value={tab.key}>
                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  placeholder={tab.label}
                  value={formValues[tab.key]}
                  onChange={e => handleInputChange(tab.key, e.target.value)}
                />
              </TabPanel>
            ))}
          </TabContext>

          <LoadingButton
            fullWidth
            loading={isLoading}
            variant='contained'
            type='submit'
            className='mt-4'
            disabled={isFormEmpty} // desabilita se estiver vazio
          >
            Salvar
          </LoadingButton>
        </form>
      </CardContent>
    </Card>
  )
}

export default TabConfigAssistent
