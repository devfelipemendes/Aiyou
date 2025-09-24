import React, { useState } from 'react'

import { Controller } from 'react-hook-form'
import { TextField, Button, Typography, Box } from '@mui/material'
import Cards from 'react-credit-cards-2'

import Grid from '@mui/material/Grid2'

import { useCreditCardForm, type CreditCardFormData } from '@/hooks/useCreditCardForm'

interface CreditCardFormProps {
  onSubmit: (data: CreditCardFormData) => void
  isSubmitting?: boolean
}

type FocusedField = 'number' | 'name' | 'expiry' | 'cvc' | undefined

const CreditCardForm: React.FC<CreditCardFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const { form, formatCardNumber, formatExpiryDate } = useCreditCardForm()

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = form

  const [focused, setFocused] = useState<FocusedField>(undefined)
  const cardValues = watch()

  return (
    <Grid container spacing={4}>
      {/* Preview do cartão */}
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4 }}>
        <Box className='mbs-12 mbe-5'>
          <Cards
            number={cardValues.cardNumber}
            name={cardValues.nameOnCard}
            expiry={cardValues.expiryDate}
            cvc={cardValues.cvv}
            focused={focused}
          />
        </Box>
      </Grid>

      {/* Formulário */}
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 8 }}>
        <Box className='mt-10'>
          <Typography variant='h5'>Informações de Pagamento</Typography>
          <Typography variant='subtitle1'>Digite as informações do seu cartão</Typography>
        </Box>

        <Box component='form' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5} className='mt-5'>
            {/* Número do cartão */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name='cardNumber'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Número do Cartão'
                    placeholder='1234 1234 1234 1234'
                    error={!!errors.cardNumber}
                    helperText={
                      errors.cardNumber?.message || 'Aceitamos Visa, Mastercard, Elo, Hipercard e American Express'
                    }
                    onFocus={() => setFocused('number')}
                    onChange={e => field.onChange(formatCardNumber(e.target.value))}
                    inputProps={{ maxLength: 23 }}
                  />
                )}
              />
            </Grid>

            {/* Nome no cartão */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name='nameOnCard'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Nome no Cartão'
                    placeholder='João Silva'
                    error={!!errors.nameOnCard}
                    helperText={errors.nameOnCard?.message}
                    onFocus={() => setFocused('name')}
                    onChange={e => field.onChange(e.target.value.toUpperCase())}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name='nameCard'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Nome do Cartão'
                    placeholder='João Silva'
                    error={!!errors.nameOnCard}
                    helperText={errors.nameOnCard?.message}
                    onFocus={() => setFocused('name')}
                    onChange={e => field.onChange(e.target.value.toUpperCase())}
                  />
                )}
              />
            </Grid>

            {/* Data de expiração */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name='expiryDate'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Data de Expiração'
                    placeholder='MM/AA'
                    error={!!errors.expiryDate}
                    helperText={errors.expiryDate?.message}
                    onFocus={() => setFocused('expiry')}
                    onChange={e => field.onChange(formatExpiryDate(e.target.value))}
                    inputProps={{ maxLength: 5 }}
                  />
                )}
              />
            </Grid>

            {/* CVV */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name='cvv'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='CVV'
                    placeholder='123'
                    error={!!errors.cvv}
                    helperText={errors.cvv?.message || 'Código de 3 ou 4 dígitos'}
                    onFocus={() => setFocused('cvc')}
                    onChange={e => field.onChange(e.target.value.replace(/\D/g, ''))}
                    inputProps={{ maxLength: 4 }}
                  />
                )}
              />
            </Grid>

            {/* Botão de submit */}
            <Grid size={{ xs: 12 }} className='flex justify-end'>
              <Button
                variant='contained'
                color='success'
                type='submit'
                disabled={!isValid || isSubmitting}
                endIcon={<i className='ri-check-line' />}
              >
                {isSubmitting ? 'Salvando...' : 'Cadastrar cartão'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  )
}

export default CreditCardForm
