// types/chat.types.ts

/**
 * Status possíveis de um chat
 * Estes status definem as cores visuais dos cards
 */
export type ChatStatus =
  | 'operator_call' // Vermelho piscando - chamada do operador
  | 'unsolved_closed' // Amarelo - fechado sem resolução
  | 'operator_control' // Azul claro - operador assumiu controle
  | 'no_response' // Laranja - sem resposta do cliente
  | 'active' // Verde - ativo normal

/**
 * Quem enviou a mensagem
 */
export type MessageSender = 'customer' | 'operator' | 'bot'

/**
 * Estrutura de uma mensagem individual
 */
export interface ChatMessage {
  id: string
  content: string
  sender: MessageSender
  timestamp: Date

  // Campos opcionais para futuras funcionalidades
  isRead?: boolean
  attachments?: MessageAttachment[]
  replyTo?: string // ID da mensagem que está respondendo
}

/**
 * Anexos de mensagem (preparado para futuro)
 */
export interface MessageAttachment {
  id: string
  type: 'image' | 'file' | 'audio'
  url: string
  name: string
  size?: number
}

/**
 * Dados principais de um chat
 */
export interface ChatData {
  id: string
  customerName: string
  customerAvatar?: string
  customerEmail?: string
  status: ChatStatus
  lastMessage: string
  timestamp: Date

  // Informações do operador (quando aplicável)
  operatorId?: string
  operatorName?: string
  operatorAvatar?: string

  // Mensagens completas (carregadas quando modal é aberto)
  messages?: ChatMessage[]

  // Metadados úteis
  unreadCount?: number
  priority?: 'low' | 'medium' | 'high'
  department?: string
  tags?: string[]

  // Informações de sessão
  sessionStarted?: Date
  lastActivity?: Date
  isTyping?: boolean
}

/**
 * Configurações visuais do card baseadas no status
 */
export interface CardVisualConfig {
  backgroundColor: string
  borderColor: string
  animation?: string
  chipColor: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  statusText: string
}

/**
 * Props para componentes que precisam gerenciar estado do modal
 */
export interface ModalState {
  isOpen: boolean
  selectedChat: ChatData | null
  isLoading: boolean
}

/**
 * Actions que podem ser executadas em um chat
 */
export interface ChatActions {
  onOpenChat: (chat: ChatData) => void
  onSendMessage: (chatId: string, message: string) => void
  onTakeControl: (chatId: string) => void
  onReleaseControl: (chatId: string) => void
  onMarkAsRead: (chatId: string) => void
  onClose: () => void
}

/**
 * Dados mock para desenvolvimento (remover quando integrar WebSocket)
 */
export interface MockDataConfig {
  enableMockData: boolean
  updateInterval?: number // ms
  autoGenerateMessages?: boolean
}
