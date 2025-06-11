// 🔥 CORRIGIDO: Utilitários para trabalhar com timestamps serializáveis

/**
 * Verifica se um timestamp corresponde ao dia de hoje
 * @param timestamp - Timestamp em milissegundos (number) ou Date/string (compatibilidade)
 * @returns boolean
 */
const isToday = (timestamp: number | Date | string): boolean => {
  const today = new Date()
  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp)

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * 🔥 FUNÇÃO CORRIGIDA: Formata timestamp para exibição em lista de chats
 * @param value - Timestamp em milissegundos (number) ou Date/string (compatibilidade)
 * @param toTimeForCurrentDay - Se true, mostra hora para mensagens de hoje
 * @returns String formatada (ex: "14:30" para hoje, "Dec 13" para outras datas)
 */
export const formatDateToMonthShort = (value: number | Date | string, toTimeForCurrentDay = true): string => {
  // 🔥 CORREÇÃO: Suporte para timestamp (number) e backwards compatibility
  const timestamp = typeof value === 'number' ? value : new Date(value).getTime()
  const date = new Date(timestamp)

  // Validação de timestamp válido
  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }

  let formatting: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }

  if (toTimeForCurrentDay && isToday(timestamp)) {
    formatting = { hour: 'numeric', minute: 'numeric' }
  }

  return new Intl.DateTimeFormat('en-US', formatting).format(date)
}

// 🔥 NOVA: Classe DateUtils centralizada (pode ser usada em qualquer lugar)
export class DateUtils {
  /**
   * Converte timestamp para string legível
   * @param timestamp - Timestamp em milissegundos
   * @returns String formatada (ex: "14:30")
   */
  static formatTime(timestamp: number): string {
    if (!timestamp || isNaN(timestamp)) return 'Invalid Time'

    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Converte timestamp para data completa
   * @param timestamp - Timestamp em milissegundos
   * @returns String formatada (ex: "10/06/2025 14:30")
   */
  static formatDateTime(timestamp: number): string {
    if (!timestamp || isNaN(timestamp)) return 'Invalid DateTime'

    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Converte timestamp para data relativa
   * @param timestamp - Timestamp em milissegundos
   * @returns String como "há 2 minutos", "ontem", etc.
   */
  static formatRelativeTime(timestamp: number): string {
    if (!timestamp || isNaN(timestamp)) return 'Invalid Time'

    const now = Date.now()
    const diff = now - timestamp

    // Menos de 1 minuto
    if (diff < 60000) {
      return 'agora mesmo'
    }

    // Menos de 1 hora
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)

      return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`
    }

    // Menos de 1 dia
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)

      return `há ${hours} hora${hours > 1 ? 's' : ''}`
    }

    // Mais de 1 dia - mostrar data
    const date = new Date(timestamp)
    const today = new Date()

    if (date.toDateString() === today.toDateString()) {
      return 'hoje'
    }

    const yesterday = new Date(today)

    yesterday.setDate(today.getDate() - 1)

    if (date.toDateString() === yesterday.toDateString()) {
      return 'ontem'
    }

    return date.toLocaleDateString('pt-BR')
  }

  /**
   * Formata para chat (usado no ChatLog)
   * @param timestamp - Timestamp em milissegundos
   * @returns String formatada para exibição em chat
   */
  static formatForChat(timestamp: number): string {
    if (!timestamp || isNaN(timestamp)) return ''

    return new Date(timestamp).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
  }

  /**
   * Cria timestamp atual
   * @returns Timestamp atual em milissegundos
   */
  static now(): number {
    return Date.now()
  }

  /**
   * Converte string de data para timestamp
   * @param dateString - String no formato ISO ou formato brasileiro
   * @returns Timestamp em milissegundos
   */
  static parseToTimestamp(dateString: string): number {
    return new Date(dateString).getTime()
  }

  /**
   * Verifica se um timestamp é válido
   * @param timestamp - Timestamp para validar
   * @returns boolean
   */
  static isValidTimestamp(timestamp: number): boolean {
    return Number.isInteger(timestamp) && timestamp > 0 && !isNaN(new Date(timestamp).getTime())
  }

  /**
   * Converte diferentes formatos para timestamp
   * @param value - Date, string ou timestamp
   * @returns Timestamp válido ou Date.now() como fallback
   */
  static toTimestamp(value: number | Date | string): number {
    if (typeof value === 'number') {
      return DateUtils.isValidTimestamp(value) ? value : Date.now()
    }

    const timestamp = new Date(value).getTime()

    return DateUtils.isValidTimestamp(timestamp) ? timestamp : Date.now()
  }
}

// 🔥 EXPORT ADICIONAL: Para compatibilidade com código existente
export { isToday, DateUtils as default }
