// hooks/useChatModal.ts
import { useState, useCallback } from 'react'

import type { ChatData, ModalState } from '@/types/chatTypes'

/**
 * Hook customizado para gerenciar o estado do modal de chat
 *
 * Responsabilidades:
 * - Controlar abertura/fechamento do modal
 * - Gerenciar dados do chat selecionado
 * - Controlar estados de loading
 * - Preparar dados para exibição no modal
 */
export const useChatModal = () => {
  // Estados principais
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    selectedChat: null,
    isLoading: false
  })

  /**
   * Abre o modal com um chat específico
   * Simula carregamento de dados adicionais (preparado para API/WebSocket)
   */
  const openModal = useCallback(async (chat: ChatData) => {
    // Primeiro, abre o modal e mostra loading
    setModalState({
      isOpen: true,
      selectedChat: chat,
      isLoading: true
    })

    try {
      // Aqui você faria uma chamada para buscar dados completos do chat
      // Por enquanto, simula um delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 800))

      // Simula carregamento de mensagens (quando não houver WebSocket ainda)
      const chatWithMessages: ChatData = {
        ...chat,
        messages: chat.messages || generateMockMessages(chat.id, chat.customerName)
      }

      // Atualiza com dados completos
      setModalState((prev: any) => ({
        ...prev,
        selectedChat: chatWithMessages,
        isLoading: false
      }))
    } catch (error) {
      console.error('Erro ao carregar dados do chat:', error)

      // Em caso de erro, ainda abre o modal mas sem loading
      setModalState((prev: any) => ({
        ...prev,
        isLoading: false
      }))
    }
  }, [])

  /**
   * Fecha o modal e limpa dados
   */
  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      selectedChat: null,
      isLoading: false
    })
  }, [])

  /**
   * Atualiza dados do chat selecionado
   * Útil para atualizações vindas do WebSocket
   */
  const updateSelectedChat = useCallback((updates: Partial<ChatData>) => {
    setModalState((prev: any) => ({
      ...prev,
      selectedChat: prev.selectedChat ? { ...prev.selectedChat, ...updates } : null
    }))
  }, [])

  /**
   * Adiciona uma nova mensagem ao chat atual
   */
  const addMessageToCurrentChat = useCallback((message: any) => {
    setModalState((prev: any) => {
      if (!prev.selectedChat) return prev

      const newMessage = {
        id: `msg_${Date.now()}`,
        content: message.content || message,
        sender: message.sender || 'operator',
        timestamp: new Date(),
        isRead: true
      }

      return {
        ...prev,
        selectedChat: {
          ...prev.selectedChat,
          messages: [...(prev.selectedChat.messages || []), newMessage],
          lastMessage: newMessage.content,
          timestamp: newMessage.timestamp
        }
      }
    })
  }, [])

  return {
    // Estados
    isOpen: modalState.isOpen,
    selectedChat: modalState.selectedChat,
    isLoading: modalState.isLoading,

    // Actions
    openModal,
    closeModal,
    updateSelectedChat,
    addMessageToCurrentChat
  }
}

/**
 * Função para gerar mensagens mock (remover quando integrar WebSocket)
 */
function generateMockMessages(chatId: string, customerName: string) {
  const messages = [
    {
      id: `${chatId}_1`,
      content: `Olá, eu sou ${customerName}. Preciso de ajuda com um problema.`,
      sender: 'customer' as const,
      timestamp: new Date(Date.now() - 600000), // 10 min atrás
      isRead: true
    },
    {
      id: `${chatId}_2`,
      content: 'Olá! Claro, vou te ajudar. Pode me contar qual é o problema?',
      sender: 'bot' as const,
      timestamp: new Date(Date.now() - 550000), // 9 min atrás
      isRead: true
    },
    {
      id: `${chatId}_3`,
      content: 'Estou tentando fazer um pedido mas o site não está funcionando direito.',
      sender: 'customer' as const,
      timestamp: new Date(Date.now() - 300000), // 5 min atrás
      isRead: true
    }
  ]

  return messages
}
