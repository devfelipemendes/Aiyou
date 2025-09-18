// CreditCardEditModal.tsx
import React, { useState, useEffect } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material'

import Grid from '@mui/material/Grid2'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Cards from 'react-credit-cards-2'
import * as v from 'valibot'
import { toast } from 'react-toastify'

import {
  useUpdateCreditCardMutation,
  useGetSingleCreditCardQuery,
  type CreditCardListItem
} from '@/api/endpoints/creditcard/creditcard'

// ===== UTILITÁRIOS DE VALIDAÇÃO =====
const validateLuhn = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '').split('').map(Number)
  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i]

    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

const getCardBrand = (cardNumber: string): string => {
  const number = cardNumber.replace(/\D/g, '')

  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]|^2[2-7]/,
    amex: /^3[47]/,
    elo: /^(4011|4312|4389|4514|4573|4576|5041|5066|5067|6277|6362|6363|6504|6505|6516|6550)/,
    hipercard: /^(6062|384100|384140|384160|606282)/
  }

  for (const [brand, pattern] of Object.entries(patterns)) {
    if (pattern.test(number)) return brand
  }

  return 'unknown'
}

const validateBrazilianCard = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\D/g, '')

  if (cleanNumber.length < 13) return false
  if (!validateLuhn(cleanNumber)) return false

  const brand = getCardBrand(cleanNumber)

  return ['visa', 'mastercard', 'amex', 'elo', 'hipercard'].includes(brand)
}

const validateExpiryDate = (date: string): boolean => {
  const match = date.match(/^(0[1-9]|1[0-2])\/(\d{2})$/)

  if (!match) return false

  const month = parseInt(match[1])
  const year = parseInt(`20${match[2]}`)
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  if (year < currentYear) return false
  if (year === currentYear && month < currentMonth) return false
  if (year > currentYear + 10) return false

  return true
}

// ===== SCHEMA DE VALIDAÇÃO =====
const EditCreditCardSchema = v.object({
  cardNumber: v.pipe(
    v.string('Número do cartão é obrigatório'),
    v.minLength(13, 'Mínimo 13 dígitos'),
    v.maxLength(19, 'Máximo 19 dígitos'),
    v.regex(/^[\d\s]+$/, 'Apenas números e espaços'),
    v.check(value => validateBrazilianCard(value.replace(/\D/g, '')), 'Cartão inválido ou não aceito no Brasil')
  ),
  nameOnCard: v.pipe(
    v.string('Nome é obrigatório'),
    v.minLength(2, 'Mínimo 2 caracteres'),
    v.maxLength(50, 'Máximo 50 caracteres'),
    v.regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Apenas letras e espaços')
  ),
  cardName: v.pipe(
    v.string('Nome do cartão é obrigatório'),
    v.minLength(2, 'Mínimo 2 caracteres'),
    v.maxLength(30, 'Máximo 30 caracteres')
  ),
  expiryDate: v.pipe(
    v.string('Data de expiração é obrigatória'),
    v.regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Formato MM/AA'),
    v.check(validateExpiryDate, 'Data inválida ou cartão expirado')
  ),
  cvv: v.pipe(
    v.string('CVV é obrigatório'),
    v.regex(/^\d{3,4}$/, 'CVV deve ter 3 ou 4 dígitos'),

    // @ts-ignore - Valibot context type issue
    v.check((value, context) => {
      const cardNumber = (context as any)?.cardNumber || ''
      const brand = getCardBrand(cardNumber)

      return brand === 'amex' ? value.length === 4 : value.length === 3
    }, 'CVV inválido para este tipo de cartão')
  ),
  active: v.boolean()
})

export type EditCreditCardFormData = v.InferInput<typeof EditCreditCardSchema>

// ===== INTERFACES =====
interface CreditCardEditModalProps {
  open: boolean
  onClose: () => void
  card: CreditCardListItem | null
  onSuccess?: (updatedCard: CreditCardListItem) => void
}

// ===== COMPONENTE PRINCIPAL =====
const CreditCardEditModal: React.FC<CreditCardEditModalProps> = ({ open, onClose, card, onSuccess }) => {
  const [focused, setFocused] = useState<'number' | 'name' | 'expiry' | 'cvc' | undefined>(undefined)

  // RTK Query hooks
  const [updateCreditCard, { isLoading: isUpdating }] = useUpdateCreditCardMutation()

  const { data: fullCardData, isLoading: isLoadingCard } = useGetSingleCreditCardQuery(card?.id?.toString() || '', {
    skip: !card?.id
  })

  // React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    reset,

    formState: { errors, isValid, isDirty }
  } = useForm<EditCreditCardFormData>({
    resolver: valibotResolver(EditCreditCardSchema),
    mode: 'onChange',
    defaultValues: {
      cardNumber: '',
      nameOnCard: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      active: true
    }
  })

  const cardValues = watch()

  // ===== FUNÇÕES DE FORMATAÇÃO =====
  const formatCardNumber = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '')
    const brand = getCardBrand(cleanValue)

    if (brand === 'amex') {
      return cleanValue.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
    }

    return cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiryDate = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '')

    return cleanValue.length >= 2 ? cleanValue.replace(/(\d{2})(\d{0,2})/, '$1/$2') : cleanValue
  }

  // ===== EFEITOS =====
  useEffect(() => {
    if (open && card) {
      // Preencher com dados básicos do card (lista)
      reset({
        cardNumber: card.card_number || '',
        nameOnCard: card.name || '',
        cardName: card.card_name || '',
        expiryDate: '',
        cvv: '',
        active: true
      })
    }
  }, [open, card, reset])

  useEffect(() => {
    if (fullCardData?.data && open) {
      // Quando os dados completos chegarem, atualizar o form
      const fullCard = fullCardData.data

      reset({
        cardNumber: formatCardNumber(fullCard.card_number || ''),
        nameOnCard: fullCard.name || '',
        cardName: fullCard.card_name || '',
        expiryDate: fullCard.date || '', // Assumindo que vem no formato MM/AA
        cvv: '', // Por segurança, não preenchemos o CVV
        active: fullCard.active || true
      })
    }
  }, [fullCardData, open, reset])

  // ===== HANDLERS =====
  const handleClose = () => {
    if (!isUpdating) {
      onClose()
      reset()
    }
  }

  const onSubmit = async (data: EditCreditCardFormData) => {
    if (!card) return

    try {
      const updateData = {
        id: card.id.toString(),
        name: data.nameOnCard,
        card_name: data.cardName,
        card_number: data.cardNumber.replace(/\D/g, ''),
        date: data.expiryDate,
        security_code: data.cvv,
        active: data.active ? 'true' : 'false'
      }

      await updateCreditCard(updateData).unwrap()

      toast.success('Cartão atualizado com sucesso!')
      onSuccess?.(card) // Callback para atualizar a lista
      handleClose()
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error)
      toast.error('Erro ao atualizar cartão. Tente novamente.')
    }
  }

  // ===== RENDER =====
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h5'>Editar Cartão de Crédito</Typography>
          <IconButton onClick={handleClose} disabled={isUpdating}>
            <i className='ri-close-line' />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {isLoadingCard ? (
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
            <CircularProgress />
            <Typography variant='body2' sx={{ ml: 2 }}>
              Carregando dados do cartão...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {/* Preview do Cartão */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ position: 'sticky', top: 0 }}>
                <Typography variant='h6' gutterBottom>
                  Preview do Cartão
                </Typography>
                <Cards
                  number={cardValues.cardNumber}
                  name={cardValues.nameOnCard}
                  expiry={cardValues.expiryDate}
                  cvc={cardValues.cvv}
                  focused={focused}
                />

                {/* Info adicional */}
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant='body2' color='text.secondary'>
                    <strong>Nome do Cartão:</strong> {cardValues.cardName || 'Não informado'}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    <strong>Status:</strong> {cardValues.active ? 'Ativo' : 'Inativo'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Formulário */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box component='form' onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  {/* Nome do Cartão */}
                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name='cardName'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Nome do Cartão'
                          placeholder='Meu Cartão Principal'
                          error={!!errors.cardName}
                          helperText={errors.cardName?.message || 'Nome personalizado para identificar o cartão'}
                        />
                      )}
                    />
                  </Grid>

                  {/* Número do Cartão */}
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
                            errors.cardNumber?.message ||
                            'Aceitamos Visa, Mastercard, Elo, Hipercard e American Express'
                          }
                          onFocus={() => setFocused('number')}
                          onChange={e => field.onChange(formatCardNumber(e.target.value))}
                          inputProps={{ maxLength: 23 }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Nome no Cartão */}
                  <Grid size={{ xs: 12 }}>
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

                  {/* Data de Expiração e CVV */}
                  <Grid size={{ xs: 12, sm: 6 }}>
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

                  <Grid size={{ xs: 12, sm: 6 }}>
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

                  {/* Status do Cartão */}
                  <Grid size={{ xs: 12 }}>
                    <Alert severity='info'>
                      <Typography variant='body2'>
                        <strong>Atenção:</strong> Por motivos de segurança, alguns dados podem não ser exibidos.
                        Preencha todos os campos para atualizar as informações do cartão.
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={isUpdating} variant='outlined'>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || !isDirty || isUpdating || isLoadingCard}
          variant='contained'
          startIcon={isUpdating ? <CircularProgress size={16} color='inherit' /> : <i className='ri-save-line' />}
        >
          {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreditCardEditModal
