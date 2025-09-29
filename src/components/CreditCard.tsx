import React, { useState, useCallback } from 'react'

import Image from 'next/image'

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
import { useCreateUserPlanMutation, useUpdateUserPlanMutation } from '@/api/endpoints/userPlans/userPlans'
import { useUserMe } from '@/hooks/useUserMe'
import { FirstModulePresentation } from './FirstModulePresentation'

interface CreditCardProps {
  selectedPlanId: string
  onPlanSuccess?: () => void
}

const CreditCard: React.FC<CreditCardProps> = ({ selectedPlanId, onPlanSuccess }) => {
  const [selectedCardId, setSelectedCardId] = useState<string>('1')
  const [cardToDelete, setCardToDelete] = useState<CreditCardListItem | null>(null)

  const { user, userPlanId } = useUserMe()
  const [createCreditCard, { isLoading: isCreating }] = useCreateCreditCardMutation()
  const [updateCreditCard] = useUpdateCreditCardMutation()
  const [deleteCreditCard] = useDeleteCreditCardMutation()

  const [createUserPlan, { isLoading }] = useCreateUserPlanMutation()
  const [updateUserPlan, { isLoading: isUpdating }] = useUpdateUserPlanMutation()

  const [showInstructiveModal, setShowInstructiveModal] = useState<boolean>(false)

  const instructiveSteps = [
    {
      title: 'Sua solicitação aquisição de plano está aguardando pagamento',
      description:
        'Tudo certo! Em breve você receberá por e-mail a confirmação da sua assinatura com cobrança recorrente.',
      icon: (
        <Image
          src='/images/illustrations/characters/13.png'
          alt='Email Sent'
          width={100}
          height={300}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%'
          }}
        />
      ),
      information: 'info' as const
    }
  ]

  const { data: creditCards } = useGetCreditCardsQuery(undefined, {
    skip: false
  })

  const confirmDialog = useConfirmDialog()

  const handleSubmitCard = useCallback(
    async (data: CreditCardFormData) => {
      try {
        const cardNumber = data.cardNumber.replace(/\D/g, '')
        const cardBrand = getCardBrand(cardNumber) // Detectar bandeira

        await createCreditCard({
          user_id: 'current_user',
          name: data.nameOnCard,
          card_name: data.nameCard,
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

  const isFreePlan = user?.plan?.id === 'c080995e-cf4f-4384-bfa6-3a6cc6abd800'

  const handleCreatePlan = async () => {
    try {
      if (isFreePlan) {
        await createUserPlan({
          plan_id: selectedPlanId,
          subscription: true
        }).unwrap()
      } else {
        if (!selectedCardId) {
          toast.error('Selecione um cartão de pagamento!')

          return
        }

        await updateUserPlan({
          id: userPlanId || '',
          plan_id: selectedPlanId,
          card_id: selectedCardId,
          subscription: true
        }).unwrap()

        toast.success('Plano atualizado com sucesso!')
      }

      setShowInstructiveModal(true)
    } catch (error) {
      console.error('Erro ao processar plano:', error)
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

  const handleCloseInstructiveModal = () => {
    setShowInstructiveModal(false)
  }

  const handleCompleteInstructions = () => {
    console.log('Tutorial de boas-vindas concluído!')
    setShowInstructiveModal(false)
  }

  const handleFinalizeInstructions = () => {
    console.log('Instruções finalizadas!')
    setShowInstructiveModal(false)

    if (onPlanSuccess) {
      onPlanSuccess()
    }
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
              onCardDelete={handleDeleteCard}
              selectable={true}
              showActions={true}
              className='w-full'
            />
          </Box>
        )}

        <Button
          variant='contained'
          size='medium'
          onClick={handleCreatePlan}
          disabled={
            !selectedPlanId || isLoading || isUpdating || (!isFreePlan && !selectedCardId) || selectedCardId === '1'
          }
        >
          {isLoading || isUpdating ? 'Processando...' : 'Finalizar Compra'}
        </Button>
      </Box>

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
      <FirstModulePresentation
        open={showInstructiveModal}
        steps={instructiveSteps}
        onComplete={handleCompleteInstructions}
        onFinaly={handleFinalizeInstructions}
        onClose={handleCloseInstructiveModal}
        size='large'
        variant='default'
        allowCloseOnlyAtEnd={true}
      />
    </>
  )
}

export default CreditCard
