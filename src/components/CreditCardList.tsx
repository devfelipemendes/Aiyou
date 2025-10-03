// CreditCardList.tsx - Integrado com Modal de Edição
import React, { useState, useCallback, useMemo, type FC } from 'react'

import { Card, CardContent, Typography, Box, Radio, CircularProgress, Alert, Button } from '@mui/material'
import { styled } from '@mui/material/styles'

import {
  useGetCreditCardsQuery,
  useDeleteCreditCardMutation,
  type CreditCardListItem
} from '@/api/endpoints/creditcard/creditcard'

import CreditCardCreateModal from './dialogs/credit-card-create'
import { useUserMe } from '@/hooks/useUserMe'

// ===== UTILITÁRIOS (mantidos do código anterior) =====
export const getCardBrand = (cardNumber?: string): string => {
  if (!cardNumber) return 'unknown'

  const number = cardNumber.replace(/\D/g, '')

  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]|^2[2-7]/,
    amex: /^3[47]/,
    elo: /^(4011|4312|4389|4514|4573|4576|5041|5066|5067|6277|6362|6363|6504|6505|6516|6550)/,
    hipercard: /^(6062|384100|384140|384160|606282)/,
    diners: /^3(?:0[0-5]|[68])/,
    discover: /^6(?:011|5)/,
    jcb: /^(?:2131|1800|35\d{3})/,
    aura: /^50/,
    unionpay: /^62/
  }

  for (const [brand, pattern] of Object.entries(patterns)) {
    if (pattern.test(number)) return brand
  }

  return 'unknown'
}

export const getCardBrandIcon = (brand: string): string => {
  const icons: Record<string, string> = {
    visa: 'ri-visa-line',
    mastercard: 'ri-mastercard-line',
    amex: 'ri-bank-card-2-line',
    elo: 'ri-bank-card-line',
    hipercard: 'ri-bank-card-line',
    diners: 'ri-bank-card-line',
    discover: 'ri-bank-card-line',
    jcb: 'ri-bank-card-line',
    aura: 'ri-bank-card-line',
    unionpay: 'ri-bank-card-line',
    unknown: 'ri-bank-card-line'
  }

  return icons[brand] || icons.unknown
}

export const getCardBrandColor = (brand: string): string => {
  const colors: Record<string, string> = {
    visa: '#1a1f71',
    mastercard: '#eb001b',
    amex: '#006fcf',
    elo: '#ffcc00',
    hipercard: '#da020e',
    diners: '#006272',
    discover: '#ff6000',
    jcb: '#1b9431',
    aura: '#2d3277',
    unionpay: '#d81e06',
    unknown: '#666666'
  }

  return colors[brand] || colors.unknown
}

export const formatCardNumber = (lastFourDigits?: string): string => {
  if (!lastFourDigits) return '**** **** **** ****'

  const digits = lastFourDigits.replace(/\D/g, '').slice(-4)

  return `**** **** **** ${digits.padStart(4, '*')}`
}

// ===== INTERFACES =====
interface AdaptedCreditCard {
  id: string
  cardNumber: string
  nameOnCard: string
  cardName: string
  brand: string
  isDefault?: boolean
}

export interface CreditCardListProps {
  selectedCardId?: string | null
  onCardSelect?: (cardId: string) => void
  onCardEdit?: (card: CreditCardListItem) => void
  onCardDelete?: (cardId: string) => void
  showActions?: boolean
  selectable?: boolean
  className?: string
}

const StyledCard = styled(Card, {
  shouldForwardProp: prop => prop !== 'isSelected' && prop !== 'isSelectable'
})<{ isSelected?: boolean; isSelectable?: boolean }>(({ theme, isSelected, isSelectable }) => ({
  position: 'relative',
  cursor: isSelectable ? 'pointer' : 'default',
  width: '100%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
  border: `2px solid ${isSelected ? theme.palette.primary.main : 'transparent'}`,
  backgroundColor: isSelected ? `${theme.palette.primary.main}08` : theme.palette.background.paper,

  '&:hover': {
    ...(isSelectable && {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
      borderColor: isSelected ? theme.palette.primary.main : theme.palette.action.hover,
      '& .card-actions': {
        opacity: 1,
        visibility: 'visible'
      }
    })
  },

  '& .card-actions': {
    opacity: 0,
    visibility: 'hidden',
    transition: 'all 0.2s ease-in-out'
  },

  ...(isSelected && {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, ${theme.palette.primary.main}20, transparent)`,
      borderRadius: 'inherit',
      pointerEvents: 'none'
    }
  })
}))

const CardBrandIcon = styled(Box, {
  shouldForwardProp: prop => prop !== 'brandColor'
})<{ brandColor: string }>(({ brandColor }) => ({
  width: 48,
  height: 48,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: `${brandColor}15`,
  color: brandColor,
  fontSize: '24px',
  fontWeight: 'bold'
}))

const CreditCardItem: FC<{
  card: AdaptedCreditCard
  isSelected: boolean
  isSelectable: boolean
  showActions: boolean
  onSelect?: (cardId: string) => void
  onEdit?: (card: CreditCardListItem) => void
  onDelete?: (cardId: string) => void
  originalCard: CreditCardListItem
}> = ({ card, isSelected, isSelectable, showActions, onSelect, onDelete }) => {
  const brandIcon = getCardBrandIcon(card.brand)
  const brandColor = getCardBrandColor(card.brand)

  const handleClick = useCallback(() => {
    if (isSelectable && onSelect) {
      onSelect(card.id)
    }
  }, [isSelectable, onSelect, card.id])

  const handleDelete = useCallback(() => {
    onDelete?.(card.id)
  }, [onDelete, card.id])

  return (
    <StyledCard isSelected={isSelected} isSelectable={isSelectable} onClick={handleClick} variant='outlined'>
      {isSelectable && (
        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
          <Radio
            checked={isSelected}
            onChange={() => onSelect?.(card.id)}
            onClick={e => e.stopPropagation()}
            color='primary'
            size='medium'
          />
        </Box>
      )}

      {showActions && (
        <Box
          className='card-actions'
          sx={{ position: 'absolute', top: 12, right: isSelectable ? 56 : 12, zIndex: 2 }}
          onClick={handleDelete}
        >
          <i className='ri-delete-bin-line mr-2 text-error' />
        </Box>
      )}

      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          {/* Informações do cartão */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ mb: 1 }}>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 0.5 }}>
                {card.nameOnCard}
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                {card.cardName}
              </Typography>
              {card.isDefault && (
                <Typography
                  variant='caption'
                  color='primary'
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    display: 'inline-block',
                    mt: 0.5
                  }}
                >
                  PADRÃO
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant='body1' sx={{ fontFamily: 'monospace', letterSpacing: 1 }}>
                {card.cardNumber}
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                Cartão {card.brand.toUpperCase()}
              </Typography>
            </Box>
          </Box>

          <CardBrandIcon brandColor={brandColor}>
            {card.brand === 'visa' && <Box sx={{ fontSize: '16px', fontWeight: 'bold', color: brandColor }}>VISA</Box>}
            {card.brand === 'mastercard' && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#eb001b' }} />
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#f79e1b', marginLeft: '-8px' }} />
              </Box>
            )}
            {!['visa', 'mastercard'].includes(card.brand) && <i className={brandIcon} style={{ fontSize: '24px' }} />}
          </CardBrandIcon>
        </Box>
      </CardContent>
    </StyledCard>
  )
}

const useAdaptCards = (apiCards?: CreditCardListItem[] | null): AdaptedCreditCard[] => {
  return useMemo(() => {
    if (!apiCards || !Array.isArray(apiCards)) {
      return []
    }

    return apiCards
      .filter(card => card && typeof card === 'object')
      .map((card, index) => {
        const safeId = card.id !== null && card.id !== undefined ? String(card.id) : `card-${index}-${Date.now()}`

        const safeName = card.name || 'Nome não informado'
        const safeCardName = card.card_name || 'Cartão'
        const safeCardNumber = card.card_number || ''

        const brand = card.credit_card_brand || getCardBrand(safeCardNumber)

        return {
          id: safeId,
          cardNumber: formatCardNumber(safeCardNumber),
          nameOnCard: safeName,
          cardName: safeCardName,
          brand,
          isDefault: false
        }
      })
  }, [apiCards])
}

const CreditCardList: FC<CreditCardListProps> = ({
  selectedCardId,
  onCardSelect,
  onCardDelete,
  showActions = true,
  selectable = true
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false)

  // RTK Query
  const { data: response, isLoading, error, refetch } = useGetCreditCardsQuery()
  const [deleteCreditCard] = useDeleteCreditCardMutation()

  const { user } = useUserMe()

  const isFreePlan = user?.plan?.id === 'c080995e-cf4f-4384-bfa6-3a6cc6abd800'
  const creditCardsCount = response?.data?.length || 0
  const shouldDisableNewCard = isFreePlan && creditCardsCount >= 1

  console.log('🔍 DEBUG - User:', user)
  console.log('🔍 DEBUG - Plan ID:', user?.plan?.id)
  console.log('🔍 DEBUG - Is Free Plan:', isFreePlan)
  console.log('🔍 DEBUG - Credit Cards Count:', creditCardsCount)
  console.log('🔍 DEBUG - Should Disable:', shouldDisableNewCard)
  console.log('🔍 DEBUG - Response Data:', response?.data)

  // Adaptar dados de forma segura
  const adaptedCards = useAdaptCards(response?.data)

  // ===== HANDLERS =====
  const handleDeleteCard = useCallback(
    async (cardId: string) => {
      const card = response?.data?.find(c => String(c.id) === cardId)
      const cardName = card?.card_name || 'este cartão'

      const confirmed = window.confirm(`Tem certeza que deseja excluir ${cardName}?`)

      if (confirmed) {
        try {
          await deleteCreditCard(cardId).unwrap()
          console.log('✅ Cartão excluído com sucesso!')
        } catch (error) {
          console.error('❌ Erro ao excluir cartão:', error)
        }
      }
    },
    [deleteCreditCard, response?.data]
  )

  const handleOpenCreateModal = () => {
    setShowCreateModal(true)
    console.log('🔄 Abrindo modal de criação de cartão')
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
    console.log('🔄 Fechando modal de criação de cartão')
  }

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
        <CircularProgress />
        <Typography variant='body2' sx={{ ml: 2 }}>
          Carregando cartões de crédito...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert
        severity='error'
        action={
          <Button color='inherit' size='small' onClick={() => refetch()}>
            Tentar Novamente
          </Button>
        }
      >
        Erro ao carregar cartões de crédito. Verifique sua conexão e tente novamente.
      </Alert>
    )
  }

  if (adaptedCards.length === 0) {
    return (
      <Box
        sx={{
          p: 6,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'action.hover'
        }}
      >
        <i className='ri-bank-card-line' style={{ fontSize: '48px', color: '#666' }} />
        <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
          Nenhum cartão cadastrado
        </Typography>
        <Typography variant='body2' color='textSecondary'>
          Adicione um cartão de crédito para continuar
        </Typography>
      </Box>
    )
  }

  return (
    <>
      <Box className={'width-full'}>
        <Box className='flex justify-between items-center mb-4 w-full'>
          <Typography variant='h5' className='mb-4'>
            Selecione o cartão que deseja usar na recorrencia
          </Typography>
          <Button
            variant='contained'
            color='success'
            type='submit'
            onClick={handleOpenCreateModal}
            disabled={shouldDisableNewCard}
            endIcon={<i className='ri-check-line' />}
          >
            {shouldDisableNewCard ? 'Limite atingido (Plano Free)' : 'Cadastrar novo cartão'}
          </Button>
        </Box>
        {adaptedCards.map((card, index) => (
          <Box key={card.id} sx={{ mb: 2, width: '100%' }}>
            <CreditCardItem
              card={card}
              isSelected={selectedCardId === card.id}
              isSelectable={selectable}
              showActions={showActions}
              onSelect={onCardSelect}
              onEdit={handleOpenCreateModal}
              onDelete={onCardDelete || handleDeleteCard}
              originalCard={response!.data[index]}
            />
          </Box>
        ))}
      </Box>
      <CreditCardCreateModal
        open={showCreateModal}
        onClose={handleCloseCreateModal}
        userId={user?.id ?? ''}
        onSuccess={() => {
          setShowCreateModal(false)
        }}
      />
    </>
  )
}

export default CreditCardList
