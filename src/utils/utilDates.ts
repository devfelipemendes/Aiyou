export const months = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' }
]

export function getCurrentMonth(): string {
  const now = new Date()

  return (now.getMonth() + 1).toString().padStart(2, '0')
}

export function getCurrentYear(): string {
  return new Date().getFullYear().toString()
}

/**
 * Retorna o label do mês baseado no valor ('01' a '12')
 */
export function getNameMonth(monthValue: string): string {
  const monthObj = months.find(m => m.value === monthValue)

  return monthObj ? monthObj.label : ''
}
