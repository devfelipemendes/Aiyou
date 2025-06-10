// src/types/monitoring.ts - ADAPTADO à sua estrutura

// 🔥 REUTILIZAR: Seus tipos existentes
export type ChatStatus = 'ativo' | 'encerrado' | 'resolvido' | 'nao_resolvido' | 'chamou_operador'
export type PriorityLevel = 'baixa' | 'media' | 'alta' | 'urgente'
export type ChannelType = 'whatsapp' | 'telegram' | 'webchat' | 'email' | 'sms'

// 🔥 NOVA: Interface Message (compatível com a sua)
export interface Message {
  id: string
  sender: 'operador' | 'client' | 'IA'
  content: string
  timestamp: Date
}

// 🔥 NOVO: Tipos de notificação visual
export type NotificationType =
  | 'operator_call' // Vermelho piscando - chamada do operador
  | 'unresolved' // Amarelo - chat fechado sem resolução
  | 'operator_control' // Azul claro - operador assumiu controle
  | 'no_response' // Laranja - sem resposta do cliente
  | 'normal' // Estado normal - sem notificação

// 🔥 NOVO: Configuração de cores (compatível com MUI)
export const NOTIFICATION_CONFIG = {
  operator_call: {
    color: '#f44336', // Vermelho
    borderColor: '#f44336',
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
    animate: true, // Vai piscar
    severity: 'high' as const,
    label: 'Chamada do Operador'
  },
  unresolved: {
    color: '#ff9800', // Amarelo/Orange
    borderColor: '#ff9800',
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
    animate: false,
    severity: 'medium' as const,
    label: 'Não Resolvido'
  },
  operator_control: {
    color: '#2196f3', // Azul
    borderColor: '#2196f3',
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
    animate: false,
    severity: 'low' as const,
    label: 'Em Controle'
  },
  no_response: {
    color: '#ff5722', // Laranja escuro
    borderColor: '#ff5722',
    backgroundColor: 'rgba(255, 87, 34, 0.05)',
    animate: false,
    severity: 'medium' as const,
    label: 'Sem Resposta'
  },
  normal: {
    color: 'transparent',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    animate: false,
    severity: 'none' as const,
    label: ''
  }
} as const

// 🔥 ADAPTADO: Props para o CardMonitor (suas props + nossas novas)
export interface CardMonitorPropsExtended {
  clientId: string
  buttonName: string
  channel?: 'web' | 'whatsapp' | 'telegram' | 'email' | string
  messages: Message[]
  operatorName?: string

  // Props novas (sistema de notificação)
  notificationType?: NotificationType
  isSelected?: boolean
  isHovered?: boolean
  onClick?: (clientId: string) => void
  onHover?: (clientId: string, isHovered: boolean) => void
}

// 🔥 ADAPTADO: Estender seus dados existentes
export interface ClientDataExtended {
  clientId: string
  channel: string
  messages: Message[]
  operatorName?: string
  priority: PriorityLevel
  status: ChatStatus
  channelType: ChannelType
  tags: string[]

  // Novos campos para notificação
  notificationType?: NotificationType
  lastActivity?: Date
  isSelected?: boolean
  responseTimeout?: number // minutos para considerar "sem resposta"
}

// 🔥 FUNÇÕES HELPER: Para determinar notificações
export const getNotificationFromStatus = (status: ChatStatus): NotificationType => {
  switch (status) {
    case 'chamou_operador':
      return 'operator_call'
    case 'nao_resolvido':
      return 'unresolved'
    case 'ativo':
      // Aqui você pode adicionar lógica para detectar se operador assumiu controle
      return 'normal'
    case 'encerrado':
    case 'resolvido':
    default:
      return 'normal'
  }
}

export const shouldShowNoResponse = (lastActivity: Date | undefined, timeoutMinutes: number = 30): boolean => {
  if (!lastActivity) return false

  const now = new Date()
  const diffInMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60)

  return diffInMinutes > timeoutMinutes
}

export const getNotificationPriority = (type: NotificationType): number => {
  // Prioridade para ordenação (maior número = maior prioridade)
  switch (type) {
    case 'operator_call':
      return 4
    case 'no_response':
      return 3
    case 'unresolved':
      return 2
    case 'operator_control':
      return 1
    case 'normal':
      return 0
    default:
      return 0
  }
}
