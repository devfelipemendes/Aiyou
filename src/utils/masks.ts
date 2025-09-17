import { mask } from 'remask'
import { startsWith } from 'valibot'

function formatPhoneNumber(phone: string): string {
  if (phone.length === 13 && startsWith('55')) return phone.replace(/^55/, '') // Remove "55" apenas se estiver no início

  return phone // Default return if no conditions are met
}

export const maskCnpj = (value: any) => (!!value ? mask(value, ['99.999.999/9999-99']) : '')
export const maskCpf = (value: any) => (!!value ? mask(value, ['999.999.999-99']) : '')

export const maskCnpjCpf = (value: any) => {
  if (!value) return ''
  const cleanedValue = value.replace(/\D/g, '') // Remove non-numeric characters

  if (cleanedValue.length === 11) {
    return mask(cleanedValue, ['999.999.999-99']) // Apply CPF mask
  } else if (cleanedValue.length === 14) {
    return mask(cleanedValue, ['99.999.999/9999-99']) // Apply CNPJ mask
  }

  return value // Return original value if it doesn't match CPF or CNPJ length
}

export const maskCelular = (value: any) => {
  if (!value) return ''
  const formattedValue = formatPhoneNumber(value) // Remove o "55" se existir

  return mask(formattedValue, ['(99) 99999-9999']) // Aplica a máscara
}

export const maskTelefone = (value: any) => (!!value ? mask(value, ['(99) 9999-9999']) : '')
export const maskCep = (value: any) => (!!value ? mask(value, ['99999-999']) : '')
export const maskUF = (value: any) => (!!value ? mask(value, ['AA']) : '')

// Nova máscara para data no formato dd/mm/yyyy
export const maskDate = (value: any) => {
  if (!value) return ''

  return mask(value, ['99/99/9999'])
}

// Função para validar se a data está no formato correto
export const isValidDate = (dateString: string): boolean => {
  if (!dateString || dateString.length !== 10) return false

  const [day, month, year] = dateString.split('/').map(Number)

  if (!day || !month || !year) return false
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false
  if (year < 1900 || year > new Date().getFullYear()) return false

  // Verificação mais específica para dias do mês
  const daysInMonth = new Date(year, month, 0).getDate()

  if (day > daysInMonth) return false

  return true
}

// Função para converter string de data para Date object
export const stringToDate = (dateString: string): Date | null => {
  if (!isValidDate(dateString)) return null

  const [day, month, year] = dateString.split('/').map(Number)

  return new Date(year, month - 1, day) // month é 0-indexed no Date
}

// Função para converter Date object para string formatada
export const dateToString = (date: Date): string => {
  if (!date || !(date instanceof Date)) return ''

  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear().toString()

  return `${day}/${month}/${year}`
}

export const maskNumeroInteiro = (value: string) => {
  // Remove qualquer coisa que não seja número
  const cleanedValue = value.replace(/\D/g, '')

  // Adiciona o ponto a cada 3 dígitos, começando da direita
  const formattedValue = cleanedValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return formattedValue
}

export const unmaskValue = (value: string) => {
  // Remove todos os caracteres não numéricos (removendo pontos)
  const cleanedValue = value.replace(/\D/g, '')

  return cleanedValue
}

export function formatNumberBR(number: number): string {
  return new Intl.NumberFormat('pt-BR').format(number)
}

export const maskCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}
