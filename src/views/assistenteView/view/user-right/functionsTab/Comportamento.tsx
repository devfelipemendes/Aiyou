'use client'

import React, { useEffect, useState } from 'react'

import {
  Typography,
  Grid2 as Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Box,
  CircularProgress
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

import LoadingButton from '@mui/lab/LoadingButton'

import { toast } from 'react-toastify'

import {
  useGetConfigurationsQuery,
  useUpdateConfigurationMutation
} from '@/api/endpoints/assistantBehavior/assistantBehavior'
import type { Assistant, GetSingleAssistantResponse } from '@/api/endpoints/assistant/assistant'

const Comportamento = ({ data: dataAssistent }: { data: GetSingleAssistantResponse | undefined }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [assistente, setAssistente] = useState<Assistant | undefined>(dataAssistent?.data)

  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      tempo_inatividade: 'não definido',
      tentativas_reconexao: 'não definido',
      notificacao_inatividade: false,
      duracao_interacao: 'não definido',
      notificacao_finalizacao: false,
      notificacao_falha: false
    }
  })

  const values = watch()

  // Monta o objeto filtrando selects e checkboxes
  const mappedData = Object.entries(values)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([key, value]) => {
      if (typeof value === 'boolean') {
        return value // só entra se for true
      }

      return value !== 'não definido' // só entra se não for "não definido"
    })
    .map(([key, value]) => ({
      assistant_id: assistente?.id,
      type: typeof value === 'boolean' ? 'checkbox' : 'options',
      name: key,
      value: typeof value === 'boolean' ? 0 : value
    }))

  console.log('mappedDatamappedDatamappedData', mappedData)
  const [updateConfiguration, { isLoading }] = useUpdateConfigurationMutation()

  const {
    data,
    error,
    isLoading: isLoadingGet,
    isFetching
  } = useGetConfigurationsQuery(
    assistente?.id ?? '',
    { skip: !assistente?.id } // só executa quando assistente.id existe
  )

  console.log('dadosvindos', data)

  const onSubmit = async () => {
    console.log('opaaaaaaaaaaaaaaaaaaaa', {
      data: JSON.stringify(mappedData)
    })

    try {
      const result = await updateConfiguration({
        id: assistente?.id ?? '',
        body: { data: mappedData }
      }).unwrap() // unwrap retorna a resposta ou lança erro

      toast.success('Dados atualizados com sucesso!')
    } catch (err) {
      console.error('❌ Erro ao atualizar:', err)
      toast.error('Erro ao atualizar dados!')
    }
  }

  useEffect(() => {
    console.log('Executando use effect')
    console.log('data no use', data)

    if (data?.data && Array.isArray(data.data)) {
      const mappedDefaults: any = {
        tempo_inatividade: 'não definido',
        tentativas_reconexao: 'não definido',
        notificacao_inatividade: false,
        duracao_interacao: 'não definido',
        notificacao_finalizacao: false,
        notificacao_falha: false
      }

      data.data.forEach((item: any) => {
        console.log('item dentro do lop', item)

        if (item.type === 'options') {
          mappedDefaults[item.name] = item.value || 'não definido'
        }

        if (item.type === 'checkbox') {
          mappedDefaults[item.name] = item.value === '0' ? true : false
        }
      })
      console.log('mappedDefaults depois do forEach', mappedDefaults)
      reset(mappedDefaults) // aplica no form
    }
  }, [data, reset])

  return (
    <>
      {isLoadingGet ? (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: '100%', p: 2 }} component='form' onSubmit={handleSubmit(onSubmit)}>
          <Typography fontWeight='bold' gutterBottom>
            Comportamento de inatividade
          </Typography>

          <Grid container spacing={4} sx={{ mb: 3 }}>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Defina o comportamento do assistente quando o cliente ficar inativo
            </Typography>

            <Grid size={{ xs: 6, md: 6 }}>
              <Controller
                name='tempo_inatividade'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label='Tempo de inatividade'
                    helperText='Defina o tempo limite para detectar inatividade do cliente'
                  >
                    <MenuItem value='não definido'>Não definido</MenuItem>
                    <MenuItem value='30 min'>30 minutos</MenuItem>
                    <MenuItem value='1 hora'>1 hora</MenuItem>
                    <MenuItem value='2 horas'>2 horas</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name='tentativas_reconexao'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label='Tentativas de Reconexão'
                    helperText='Defina a quantidade de tentativas de comunicação que o assistente irá realizar'
                  >
                    <MenuItem value='não definido'>Não definido</MenuItem>
                    <MenuItem value='3 tentativas'>3 tentativas</MenuItem>
                    <MenuItem value='5 tentativas'>5 tentativas</MenuItem>
                    <MenuItem value='10 tentativas'>10 tentativas</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 12 }}>
              <Controller
                name='notificacao_inatividade'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label='Habilitar notificação de inatividade para o operador'
                    sx={{ mt: 1 }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 5 }} orientation='horizontal' />

          <Grid container spacing={4} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12 }}>
              <Typography fontWeight='bold' gutterBottom>
                Duração da interação
              </Typography>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Defina quanto tempo uma interação irá durar
              </Typography>
              <Controller
                name='duracao_interacao'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label='Tempo de duração'
                    helperText='Defina o tempo limite para que uma interação fique ativa'
                  >
                    <MenuItem value='não definido'>Não definido</MenuItem>
                    <MenuItem value='30 min'>30 minutos</MenuItem>
                    <MenuItem value='1 hora'>1 hora</MenuItem>
                    <MenuItem value='2 horas'>2 horas</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 5 }} orientation='horizontal' />

          {/* Ações Pós Encerramento */}
          <Grid container spacing={4} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12 }}>
              <Typography fontWeight='bold' gutterBottom>
                Ações pós encerramento
              </Typography>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Habilite ou desabilite as opções que desejar
              </Typography>

              <Controller
                name='notificacao_finalizacao'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label='Habilitar notificação de finalização'
                  />
                )}
              />

              <Controller
                name='notificacao_falha'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label='Habilitar notificação de falha de contato'
                  />
                )}
              />
            </Grid>
          </Grid>

          <LoadingButton
            loading={isLoading}
            disabled={mappedData.length === 0}
            type='submit'
            variant='contained'
            color='primary'
          >
            Salvar Configurações
          </LoadingButton>
        </Box>
      )}
    </>
  )
}

export default Comportamento
