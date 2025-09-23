// CreditCard.tsx - Componente principal com ConfirmDialog
import React, { useState, useCallback } from 'react'

import { Box, Button } from '@mui/material'
import { toast } from 'react-toastify'
import Grid from '@mui/material/Grid2'

import CreditCardForm from './CreditCardForm'
import CreditCardList, { getCardBrand } from './CreditCardList'
import ConfirmDialog, { useConfirmDialog } from './dialogs/confirmation-dialog'
import {
  useCreateCreditCardMutation,
  useUpdateCreditCardMutation,
  useDeleteCreditCardMutation,
  useGetCreditCardsQuery,
  type CreditCardListItem
} from '@/api/endpoints/creditcard/creditcard'
import type { CreditCardFormData } from '@/hooks/useCreditCardForm'
import { useCreateUserPlanMutation } from '@/api/endpoints/userPlans/userPlans'

const CreditCard: React.FC = () => {
  const [selectedCardId, setSelectedCardId] = useState<string>('1')
  const [cardToDelete, setCardToDelete] = useState<CreditCardListItem | null>(null)

  // RTK Query hooks

  const [createCreditCard, { isLoading: isCreating }] = useCreateCreditCardMutation()
  const [updateCreditCard] = useUpdateCreditCardMutation()
  const [deleteCreditCard] = useDeleteCreditCardMutation()

  const [createUserPlan, { isLoading }] = useCreateUserPlanMutation()

  const { data: creditCards } = useGetCreditCardsQuery(undefined, {
    skip: false
  })

  // Hook do ConfirmDialog
  const confirmDialog = useConfirmDialog()

  // ===== HANDLERS =====
  const handleSubmitCard = useCallback(
    async (data: CreditCardFormData) => {
      try {
        const cardNumber = data.cardNumber.replace(/\D/g, '')
        const cardBrand = getCardBrand(cardNumber) // Detectar bandeira

        await createCreditCard({
          user_id: 'current_user', // Substituir pela lógica de autenticação
          name: data.nameOnCard,
          card_name: `Cartão ${data.plan.toUpperCase()}`,
          security_code: data.cvv,
          card_number: data.cardNumber.replace(/\D/g, ''),
          date: data.expiryDate,
          credit_card_brand: cardBrand,
          priority: 0,
          active: true
        }).unwrap()

        toast.success('Cartão cadastrado com sucesso!')
      } catch (error) {
        console.error('Erro ao cadastrar cartão:', error)
        toast.error('Erro ao cadastrar cartão. Tente novamente.')
      }
    },
    [createCreditCard]
  )

  const handleCreatePlan = async (planId: string) => {
    try {
      await createUserPlan({
        plan_id: planId,
        subscription: true
      }).unwrap()
    } catch (error) {
      console.error('Erro ao criar plano:', error)
      toast.error('Erro ao criar plano. Tente novamente.')
    }
  }

  const handleCardSelect = useCallback((cardId: string) => {
    setSelectedCardId(cardId)
  }, [])

  const handleUpdateCard = useCallback(
    async (card: CreditCardListItem) => {
      try {
        await updateCreditCard({
          id: card.id.toString(),
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
    (cardId: string) => {
      const card = creditCards?.data?.find(c => c.id.toString() === cardId)

      if (!card) {
        toast.error('Cartão não encontrado!')

        return
      }

      setCardToDelete(card)

      confirmDialog.openDialog()
    },
    [creditCards?.data, confirmDialog]
  )

  const handleConfirmDelete = async () => {
    if (!cardToDelete) return

    confirmDialog.setLoading(true)

    try {
      await deleteCreditCard(cardToDelete.id.toString()).unwrap()

      if (selectedCardId === cardToDelete.id.toString()) {
        setSelectedCardId('')
      }

      confirmDialog.closeDialog()
      setCardToDelete(null)
    } catch (error: any) {
      confirmDialog.setLoading(false)
      handleCancelDelete()
    } finally {
      confirmDialog.setLoading(false)
    }
  }

  const handleCancelDelete = () => {
    setCardToDelete(null)
    confirmDialog.closeDialog()
  }

  return (
    <>
      <Box className='w-full flex flex-col gap-6'>
        {creditCards?.data.length === 0 ? (
          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <CreditCardForm onSubmit={handleSubmitCard} isSubmitting={isCreating} />
            </Grid>
          </Grid>
        ) : (
          <Box className='w-full'>
            <CreditCardList
              selectedCardId={selectedCardId}
              onCardSelect={handleCardSelect}
              onCardEdit={handleUpdateCard}
              onCardDelete={handleDeleteCard} // Agora usa o ConfirmDialog
              selectable={true}
              showActions={true}
              className='w-full'
            />
          </Box>
        )}
        <Button
          variant='contained'
          size='medium'
          onClick={() => handleCreatePlan(selectedCardId)}
          disabled={!selectedCardId || isLoading}
        >
          Finalizar Compra
        </Button>
      </Box>

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        open={confirmDialog.open}
        loading={confirmDialog.loading}
        type='error'
        title='Excluir Cartão de Crédito'
        message={
          cardToDelete
            ? `Tem certeza que deseja excluir o cartão "${cardToDelete.card_name}"?`
            : 'Tem certeza que deseja excluir este cartão?'
        }
        subtitle='Esta ação não pode ser desfeita. O cartão será removido permanentemente da sua conta.'
        confirmText='Sim, Excluir'
        cancelText='Cancelar'
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        icon={<i className='ri-bank-card-line' style={{ fontSize: '48px', color: '#d32f2f' }} />}
      />
    </>
  )
}

export default CreditCard
