// CreditCardCreateModal.tsx
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
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material'

import Grid from '@mui/material/Grid2'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Cards from 'react-credit-cards-2'
import * as v from 'valibot'

import { useCreateCreditCardMutation, type CreditCardListItem } from '@/api/endpoints/creditcard/creditcard'

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
const CreateCreditCardSchema = v.object({
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
    v.check((value: any, context: any) => {
      const cardNumber = (context as any)?.cardNumber || ''
      const brand = getCardBrand(cardNumber.replace(/\D/g, ''))

      return brand === 'amex' ? value.length === 4 : value.length === 3
    }, 'CVV inválido para este tipo de cartão')
  ),
  userId: v.pipe(v.string('ID do usuário é obrigatório'), v.minLength(1, 'ID do usuário não pode estar vazio')),
  active: v.boolean()
})

export type CreateCreditCardFormData = v.InferInput<typeof CreateCreditCardSchema>

// ===== INTERFACES =====
interface CreditCardCreateModalProps {
  open: boolean
  onClose: () => void
  userId: string // ID do usuário logado
  onSuccess?: (newCard: CreditCardListItem) => void
}

// ===== COMPONENTE PRINCIPAL =====
const CreditCardCreateModal: React.FC<CreditCardCreateModalProps> = ({ open, onClose, userId, onSuccess }) => {
  const [focused, setFocused] = useState<'number' | 'name' | 'expiry' | 'cvc' | undefined>(undefined)

  // RTK Query mutation
  const [createCreditCard, { isLoading: isCreating }] = useCreateCreditCardMutation()

  // React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm<CreateCreditCardFormData>({
    resolver: valibotResolver(CreateCreditCardSchema),
    mode: 'onChange',
    defaultValues: {
      cardNumber: '',
      nameOnCard: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      userId: userId,
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

  const getCardBrandName = (brand: string): string => {
    const brandNames: Record<string, string> = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      elo: 'Elo',
      hipercard: 'Hipercard',
      unknown: 'Desconhecida'
    }

    return brandNames[brand] || 'Desconhecida'
  }

  // ===== EFEITOS =====
  useEffect(() => {
    if (open) {
      // Reset form quando modal abre
      reset({
        cardNumber: '',
        nameOnCard: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        userId: userId,
        active: true
      })
    }
  }, [open, userId, reset])

  // ===== HANDLERS =====
  const handleClose = () => {
    if (!isCreating) {
      onClose()
      reset()
    }
  }

  const onSubmit = async (data: CreateCreditCardFormData) => {
    try {
      const cardNumber = data.cardNumber.replace(/\D/g, '')
      const cardBrand = getCardBrand(cardNumber)

      const createData = {
        user_id: data.userId,
        name: data.nameOnCard.trim(),
        card_name: data.cardName.trim(),
        card_number: data.cardNumber.replace(/\D/g, ''),
        date: data.expiryDate,
        security_code: data.cvv,
        credit_card_brand: cardBrand,
        active: data.active ? true : false,
        priority: 0
      }

      console.log('🔄 Enviando dados para criação:', createData)

      const result = await createCreditCard(createData).unwrap()

      console.log('✅ Cartão criado com sucesso:', result)

      // Toast já é disparado automaticamente pelo RTK Query
      onSuccess?.(result.data)
      handleClose()
    } catch (error) {
      console.error('❌ Erro ao criar cartão:', error)

      // Toast de erro já é disparado automaticamente pelo RTK Query
    }
  }

  const currentBrand = getCardBrand(cardValues.cardNumber?.replace(/\D/g, '') || '')
  const currentBrandName = getCardBrandName(currentBrand)

  // ===== RENDER =====
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='lg'
      fullWidth
      PaperProps={{
        sx: { minHeight: '650px' }
      }}
    >
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h5'>
            <i className='ri-bank-card-2-line mr-2' />
            Adicionar Cartão de Crédito
          </Typography>
          <IconButton onClick={handleClose} disabled={isCreating}>
            <i className='ri-close-line' />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={4}>
          {/* Preview do Cartão */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: 'sticky', top: 0 }}>
              <Cards
                number={cardValues.cardNumber || ''}
                name={cardValues.nameOnCard || ''}
                expiry={cardValues.expiryDate || ''}
                cvc={cardValues.cvv || ''}
                focused={focused}
              />

              <Grid size={{ xs: 12 }} className='mt-4'>
                <Alert severity='info' icon={<i className='ri-shield-check-line' />}>
                  <Typography variant='body2'>
                    <strong>Segurança:</strong> Todos os dados do cartão são criptografados e armazenados de forma
                    segura. Seus dados financeiros estão protegidos.
                  </Typography>
                </Alert>
              </Grid>
              {/* Info adicional */}

              {currentBrand !== 'unknown' && (
                <Alert severity='success' sx={{ mt: 2 }}>
                  Cartão {currentBrandName} detectado e aceito!
                </Alert>
              )}
            </Box>
          </Grid>

          {/* Formulário */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box component='form' onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={6}>
                {/* Nome do Cartão */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name='cardName'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Apelido do Cartão'
                        placeholder='Ex: Meu Cartão Principal'
                        error={!!errors.cardName}
                        helperText={errors.cardName?.message || 'Nome personalizado para identificar o cartão'}
                        InputProps={{
                          startAdornment: <i className='ri-bookmark-line mr-2' />
                        }}
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
                          errors.cardNumber?.message || 'Aceitamos Visa, Mastercard, Elo, Hipercard e American Express'
                        }
                        onFocus={() => setFocused('number')}
                        onChange={e => field.onChange(formatCardNumber(e.target.value))}
                        inputProps={{ maxLength: 23 }}
                        InputProps={{
                          startAdornment: <i className='ri-bank-card-line mr-2' />
                        }}
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
                        helperText={errors.nameOnCard?.message || 'Nome exatamente como impresso no cartão'}
                        onFocus={() => setFocused('name')}
                        onChange={e => field.onChange(e.target.value.toUpperCase())}
                        InputProps={{
                          startAdornment: <i className='ri-user-line mr-2' />
                        }}
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
                        helperText={errors.expiryDate?.message || 'Mês/Ano do cartão'}
                        onFocus={() => setFocused('expiry')}
                        onChange={e => field.onChange(formatExpiryDate(e.target.value))}
                        inputProps={{ maxLength: 5 }}
                        InputProps={{
                          startAdornment: <i className='ri-calendar-line mr-2' />
                        }}
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
                        helperText={errors.cvv?.message || `Código de ${currentBrand === 'amex' ? '4' : '3'} dígitos`}
                        onFocus={() => setFocused('cvc')}
                        onChange={e => field.onChange(e.target.value.replace(/\D/g, ''))}
                        inputProps={{ maxLength: 4 }}
                        InputProps={{
                          startAdornment: <i className='ri-shield-line mr-2' />
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Switch para ativar cartão */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name='active'
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={field.onChange} color='primary' />}
                        label={
                          <Box>
                            <Typography variant='body1'>Cartão Ativo</Typography>
                            <Typography variant='body2' color='textSecondary'>
                              {field.value
                                ? 'Este cartão estará disponível para uso'
                                : 'Este cartão ficará inativo até ser ativado'}
                            </Typography>
                          </Box>
                        }
                      />
                    )}
                  />
                </Grid>

                {/* Aviso de Segurança */}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Box className='mt-2'>
          <Button onClick={handleClose} disabled={isCreating} variant='outlined' color='inherit'>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isCreating}
            variant='contained'
            startIcon={isCreating ? <CircularProgress size={16} color='inherit' /> : <i className='ri-add-line' />}
          >
            {isCreating ? 'Adicionando...' : 'Adicionar Cartão'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default CreditCardCreateModal
