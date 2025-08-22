// MUI Imports
import { useState, useCallback, useMemo } from 'react'

import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Skeleton from '@mui/material/Skeleton'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useTheme } from '@mui/material'
import * as v from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import {
  useGetAssistantsQuery,
  useCreateAssistantMutation,
  useUpdateAssistantMutation,
  useDeleteAssistantMutation,
  type ProcessedAssistant,
  type CreateAssistantRequest,
  type UpdateAssistantRequest
} from '@/api/endpoints/assistant/assistant'

import { useGetProjectsQuery, type Project } from '@/api/endpoints/Projects/project'

import ConfirmDialog, { useConfirmDialog } from '@/components/dialogs/confirmation-dialog'
import AssistantCard from '@/components/CardAssistant'

export interface UIAssistant extends ProcessedAssistant {}

interface AssistantManagerProps {
  onNextStep?: () => void
  showFinishButton?: boolean
  finishButtonText?: string
}

const AssistantSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Nome do assistente é obrigatório')),
  project_id: v.pipe(v.string(), v.minLength(1, 'Projeto é obrigatório'))
})

type AssistantFormData = v.InferInput<typeof AssistantSchema>

export default function StepCreateApi({
  onNextStep,
  showFinishButton = true,
  finishButtonText = 'Finalizar Criação de APIs'
}: AssistantManagerProps = {}) {
  const theme = useTheme()

  return (
    <Box sx={{ mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
          <Typography variant='h4' component='h1'>
            Cadastre suas APIs
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
