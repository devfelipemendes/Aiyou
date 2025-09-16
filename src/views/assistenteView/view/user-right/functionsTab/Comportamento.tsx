'use client'

import React from 'react'

import { Typography, Grid, TextField, MenuItem, FormControlLabel, Switch, Divider, Box } from '@mui/material'

const Comportamento = () => {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Seção: Comportamento de Inatividade */}
      <Typography fontWeight='bold' gutterBottom>
        Comportamento de inatividade
      </Typography>
      <Typography variant='body2' color='text.secondary' gutterBottom>
        Defina o comportamento do assistente quando o cliente ficar inativo
      </Typography>

      <Grid container spacing={4} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label='Tempo de inatividade'
            defaultValue='2 horas'
            helperText='Defina o tempo limite para detectar inatividade do cliente'
          >
            <MenuItem value='30 min'>30 minutos</MenuItem>
            <MenuItem value='1 hora'>1 hora</MenuItem>
            <MenuItem value='2 horas'>2 horas</MenuItem>
          </TextField>
          <FormControlLabel
            control={<Switch />}
            label='Habilitar notificação de inatividade para o operador'
            sx={{ mt: 1 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label='Tentativas de Reconexão'
            defaultValue='5 tentativas'
            helperText='Defina a quantidade de tentativas de comunicação que o assistente irá realizar'
          >
            <MenuItem value='3 tentativas'>3 tentativas</MenuItem>
            <MenuItem value='5 tentativas'>5 tentativas</MenuItem>
            <MenuItem value='10 tentativas'>10 tentativas</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Divider sx={{ my: 10 }} />

      {/* Seções lado a lado: Duração da Interação e Ações Pós Encerramento */}
      <Grid container spacing={4} sx={{ mb: 3 }}>
        {/* Duração da Interação */}
        <Grid item xs={12} md={6}>
          <Typography fontWeight='bold' gutterBottom>
            Duração da interação
          </Typography>
          <Typography variant='body2' color='text.secondary' gutterBottom>
            Defina quanto tempo uma interação irá durar
          </Typography>
          <TextField
            select
            fullWidth
            label='Tempo de duração'
            defaultValue='2 horas'
            helperText='Defina o tempo limite para que uma interação fique ativa'
          >
            <MenuItem value='30 min'>30 minutos</MenuItem>
            <MenuItem value='1 hora'>1 hora</MenuItem>
            <MenuItem value='2 horas'>2 horas</MenuItem>
          </TextField>
          <FormControlLabel
            control={<Switch />}
            label='Habilitar notificação de inatividade para o operador'
            sx={{ mt: 1 }}
          />
        </Grid>

        {/* Ações Pós Encerramento */}
        <Grid item xs={12} md={6}>
          <Typography fontWeight='bold' gutterBottom>
            Ações pós encerramento
          </Typography>
          <Typography variant='body2' color='text.secondary' gutterBottom>
            Habilite ou desabilite as opções que desejar
          </Typography>
          <FormControlLabel control={<Switch />} label='Habilitar notificação de inatividade' />
          <FormControlLabel control={<Switch />} label='Habilitar notificação de finalização' />
          <FormControlLabel control={<Switch />} label='Habilitar notificação de falha de contato' />
        </Grid>
      </Grid>
    </Box>
  )
}

export default Comportamento
