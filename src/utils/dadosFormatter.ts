export function dadosFormatter(dados: string | number, tamanho?: 'B' | 'KB' | 'MB') {
  if (!dados) return '0 KB'

  const dadosFloat = parseFloat(dados.toString())

  const tam = tamanho || 'MB'

  if (
    dadosFloat
      .toString()
      .split('')
      .some(letra => letra === '.')
  ) {
    const dado = parseFloat(dadosFloat.toString().split('.')[0])

    if (dado < 1000) {
      return dado.toString() + ' MB'
    }

    return (dado / 1000).toFixed(2).toString() + ' GB'
  }

  if (tam === 'B') {
    if (dadosFloat < 1000000) {
      return (dadosFloat / 1000).toFixed(2).toString() + ' KB'
    }

    if (dadosFloat < 1000000000) {
      return (dadosFloat / 1000000).toFixed(2).toString() + ' MB'
    }

    return (dadosFloat / 1000000000).toFixed(2).toString() + ' GB'
  }

  if (tam === 'KB') {
    if (dadosFloat < 1000) {
      return dadosFloat.toString() + ' KB'
    }

    if (dadosFloat < 1000000) {
      return (dadosFloat / 1000).toFixed(2).toString() + ' MB'
    }

    return (dadosFloat / 1000000).toFixed(2).toString() + ' GB'
  }

  if (tam === 'MB') {
    if (dadosFloat < 1000) {
      return dadosFloat.toString() + ' MB'
    }

    return (dadosFloat / 1000).toFixed(2).toString() + ' GB'
  }
}
