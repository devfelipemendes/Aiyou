// CreditCard.tsx - Componente principal com ConfirmDialog
import React, { useState, useCallback } from 'react'

import { Box } from '@mui/material'
import { toast } from 'react-toastify'
import Grid from '@mui/material/Grid2'

import CreditCardForm from './CreditCardForm'
import CreditCardList from './CreditCardList'
import ConfirmDialog, { useConfirmDialog } from './dialogs/confirmation-dialog'
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
  const [cardToDelete, setCardToDelete] = useState<CreditCardListItem | null>(null)

  // RTK Query hooks
  const { data: response } = useGetCreditCardsQuery()
  const [createCreditCard, { isLoading: isCreating }] = useCreateCreditCardMutation()
  const [updateCreditCard] = useUpdateCreditCardMutation()
  const [deleteCreditCard] = useDeleteCreditCardMutation()

  const { data: creditCards } = useGetCreditCardsQuery(undefined, {
    skip: false
  })

  // Hook do ConfirmDialog
  const confirmDialog = useConfirmDialog()

  // ===== HANDLERS =====
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

  // ===== NOVO HANDLE DE DELETE COM CONFIRM DIALOG =====
  const handleDeleteCard = useCallback(
    (cardId: string) => {
      const card = response?.data?.find(c => c.id.toString() === cardId)

      if (!card) {
        toast.error('Cartão não encontrado!')

        return
      }

      // Guardar o cartão que será deletado
      setCardToDelete(card)

      // Abrir dialog de confirmação
      confirmDialog.openDialog()
    },
    [response?.data, confirmDialog]
  )

  // ===== CONFIRMAR DELETE =====
  const handleConfirmDelete = async () => {
    if (!cardToDelete) return

    confirmDialog.setLoading(true)

    try {
      await deleteCreditCard(cardToDelete.id.toString()).unwrap()

      toast.success(`Cartão "${cardToDelete.card_name}" excluído com sucesso!`)

      // Se o cartão excluído estava selecionado, limpar seleção
      if (selectedCardId === cardToDelete.id.toString()) {
        setSelectedCardId('')
      }

      // Fechar dialog e limpar estado
      confirmDialog.closeDialog()
      setCardToDelete(null)
    } catch (error: any) {
      confirmDialog.setLoading(false) // Manter dialog aberto em caso de erro
      handleCancelDelete()
    } finally {
      confirmDialog.setLoading(false)
    }
  }

  // ===== CANCELAR DELETE =====
  const handleCancelDelete = () => {
    setCardToDelete(null)
    confirmDialog.closeDialog()
  }

  return (
    <>
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
