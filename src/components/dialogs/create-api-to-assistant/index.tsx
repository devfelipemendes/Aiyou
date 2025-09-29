'use client'

import { useForm, Controller } from 'react-hook-form'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

import { Info } from 'lucide-react'

import { useCreateAssistantPhoneMutation } from '@/api/endpoints/assistantPhone/assistantPhone'
import type { useGetSingleAssistantQuery } from '@/api/endpoints/assistant/assistant'

type CreatePhoneProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

const LinkApiToAssistant = ({ open, setOpen }: CreatePhoneProps) => {
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Dialog fullWidth maxWidth='lg' open={open} onClose={handleClose}>
      <DialogTitle variant='h4' className='flex flex-col gap-2 text-center'>
        Vincule Uma Api Ao Assistente
      </DialogTitle>
      <Typography component='span' className='flex flex-col text-center mb-4'>
        Cadastre um novo número
      </Typography>

      <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
        <i className='ri-close-line' />
      </IconButton>

      <DialogContent className='overflow-visible'>
        <DialogActions className='justify-center mt-2'>
          <LoadingButton variant='contained' type='submit'>
            Salvar
          </LoadingButton>
          <Button variant='outlined' type='button' color='error' onClick={handleClose}>
            Cancelar
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default LinkApiToAssistant
