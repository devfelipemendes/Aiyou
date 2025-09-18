// CreditCard.tsx - Componente principal corrigido
import React, { useState, useCallback } from 'react'

import { Box } from '@mui/material'
import { toast } from 'react-toastify'
import Grid from '@mui/material/Grid2'

import CreditCardForm from './CreditCardForm'
import CreditCardList from './CreditCardList'
import {
  useCreateCreditCardMutation,
  useUpdateCreditCardMutation,
  useDeleteCreditCardMutation,
  useGetCreditCardsQuery,
  type CreditCardListItem
} from '@/api/endpoints/creditcard/creditcard'
import type { CreditCardFormData } from '@/hooks/useCreditCardForm'

const CreditCard: React.FC = () => {
  const [selectedCardId, setSelectedCardId] = useState<string>('1')

  // RTK Query hooks
  const { data: response } = useGetCreditCardsQuery()
  const [createCreditCard, { isLoading: isCreating }] = useCreateCreditCardMutation()
  const [updateCreditCard] = useUpdateCreditCardMutation()
  const [deleteCreditCard] = useDeleteCreditCardMutation()

  // Handlers otimizados com useCallback
  const handleSubmitCard = useCallback(
    async (data: CreditCardFormData) => {
      try {
        await createCreditCard({
          user_id: 'current_user', // Substituir pela lógica de autenticação
          name: data.nameOnCard,
          card_name: `Cartão ${data.plan.toUpperCase()}`,
          security_code: data.cvv,
          card_number: data.cardNumber.replace(/\D/g, ''),
          date: data.expiryDate,
          active: 'true'
        }).unwrap()

        toast.success('Cartão cadastrado com sucesso!')
      } catch (error) {
        console.error('Erro ao cadastrar cartão:', error)
        toast.error('Erro ao cadastrar cartão. Tente novamente.')
      }
    },
    [createCreditCard]
  )

  const handleCardSelect = useCallback((cardId: string) => {
    setSelectedCardId(cardId)
  }, [])

  const handleUpdateCard = useCallback(
    async (card: CreditCardListItem) => {
      try {
        await updateCreditCard({
          id: card.id.toString(), // Garantir que seja string
          name: card.name,
          card_name: card.card_name
        }).unwrap()
      } catch (error) {
        console.error('Erro ao atualizar cartão:', error)
      }
    },
    [updateCreditCard]
  )

  const handleDeleteCard = useCallback(
    async (cardId: string) => {
      const card = response?.data?.find(c => c.id.toString() === cardId)

      if (!window.confirm(`Excluir cartão "${card?.card_name || 'este cartão'}"?`)) {
        return
      }

      try {
        await deleteCreditCard(cardId).unwrap()
      } catch (error) {
        console.error('Erro ao excluir cartão:', error)
      }
    },
    [deleteCreditCard, response?.data]
  )

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12 }}>
        <CreditCardForm onSubmit={handleSubmitCard} isSubmitting={isCreating} />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Box className='w-full'>
          <CreditCardList
            selectedCardId={selectedCardId}
            onCardSelect={handleCardSelect}
            onCardEdit={handleUpdateCard}
            onCardDelete={handleDeleteCard}
            selectable={true}
            showActions={true}
          />
        </Box>
      </Grid>
    </Grid>
  )
}

export default CreditCard
