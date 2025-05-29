export function currencyFormatter(value?: number | string | null): string {
  if (value === '' || value === null || value === undefined) return 'R$ 0,00'

  const num = Number(value)

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(num)
}

export function CurrencyMaskView(value?: string | number | undefined | null): string {
  if (!value) return '0,00'

  // Converte para número float
  const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value

  if (isNaN(num)) return '0,00'

  // Formata o número diretamente (sem multiplicar por 100)
  return currencyMask((num * 100).toString())
}

export function currencyMask(value: string): string {
  // Remove tudo que não é número
  let numeric = value.replace(/\D/g, '')

  if (!numeric) return ''

  // Limita a 12 dígitos (bilhões)
  numeric = numeric.slice(0, 12)

  // Insere vírgula antes dos dois últimos dígitos
  numeric = numeric.replace(/(\d{1,})(\d{2})$/, '$1,$2')

  // Insere os pontos de milhar
  numeric = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  // Remove ponto à esquerda, se tiver
  numeric = numeric.replace(/^\.*/, '')

  return numeric
}

export function currencyUnMask(maskedValue: string): number {
  if (!maskedValue) return 0

  // Remove tudo que não é número
  const onlyNumbers = maskedValue.replace(/\D/g, '')

  // Divide por 100 para voltar o valor original
  return Number(onlyNumbers) / 100
}
