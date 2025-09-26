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

/**
 * Retorna os labels dos últimos 6 meses, incluindo o mês atual
 */
export const getLastSixMonths = () => {
  const months: { value: string; label: string }[] = []
  const today = new Date()

  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const label = d.toLocaleString('pt-BR', { month: 'short' }) // Jan, Fev...

    months.push({ value: month, label })
  }

  return months
}
